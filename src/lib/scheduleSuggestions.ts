import { categoryLabels, skillById } from "@/data/skills";
import { getPrerequisiteRoutes } from "@/data/trainingOptions";
import { getGoalPlan } from "@/lib/graph";
import { getSkillState } from "@/lib/progression";
import {
  canScheduleSkill,
  getSchedulableSkills,
  WEEKDAYS,
} from "@/lib/schedule";
import type {
  Category,
  Skill,
  SkillState,
  UserProfile,
  Weekday,
  WeeklySchedule,
} from "@/types/skill";

export interface ScheduleSuggestionOptions {
  days: Weekday[];
  skillsPerDay: number;
}

export interface SuggestedScheduleSkill {
  skill: Skill;
  reason: string;
  goalIds: string[];
}

export interface WeeklyScheduleSuggestion {
  schedule: WeeklySchedule;
  days: Partial<Record<Weekday, SuggestedScheduleSkill[]>>;
  goalIds: string[];
  unavailableGoalIds: string[];
}

interface Candidate {
  skill: Skill;
  state: SkillState;
  nextGoalIds: string[];
  supportingGoalIds: string[];
}

function explainCandidate(candidate: Candidate): SuggestedScheduleSkill {
  const { skill, state, nextGoalIds, supportingGoalIds } = candidate;
  const goalIds = nextGoalIds.length ? nextGoalIds : supportingGoalIds;
  const goalNames = goalIds.map((id) => skillById[id].name).join(", ");
  const reason = nextGoalIds.length
    ? `${state === "training" ? "Continue your current training" : "Your prerequisites are complete"}. ${nextGoalIds.includes(skill.id) ? "Practice your goal skill" : "An unlocked next step"} toward ${goalNames}.`
    : supportingGoalIds.length
      ? `Maintain a mastered foundation for ${goalNames}.`
      : state === "training"
        ? "Continue a skill you are already training."
        : state === "mastered"
          ? `Maintain a mastered ${categoryLabels[skill.category]} skill.`
          : `Practice an unlocked ${categoryLabels[skill.category]} skill with your available equipment.`;
  return { skill, reason, goalIds };
}

/** Suggest skill choices only; sets, repetitions, and holds remain user decisions. */
export function generateWeeklyScheduleSuggestion(
  profile: UserProfile,
  options: ScheduleSuggestionOptions,
): WeeklyScheduleSuggestion {
  const chosenDays = WEEKDAYS.filter(
    (day) => Array.isArray(options.days) && options.days.includes(day),
  );
  const skillsPerDay = Number.isFinite(options.skillsPerDay)
    ? Math.min(6, Math.max(1, Math.trunc(options.skillsPerDay)))
    : 3;
  const eligible = getSchedulableSkills(profile);
  const eligibleIds = new Set(eligible.map((skill) => skill.id));
  const goalIds = [...new Set(profile.goals)].filter(
    (id) => Object.hasOwn(skillById, id) && profile.progress[id] !== "mastered",
  );
  const goals = goalIds.map((id) => {
    const plan = getGoalPlan(id, profile.progress, profile.equipment);
    return {
      id,
      nextIds: new Set(
        plan.skills
          .filter((skill) => eligibleIds.has(skill.id))
          .map((skill) => skill.id),
      ),
      // Mastered prerequisites at the boundary of the selected route are
      // useful maintenance choices without adding unused alternative routes.
      supportingIds: new Set(
        plan.skills.flatMap(
          (skill) =>
            getPrerequisiteRoutes(skill).find(
              (route) => route.id === plan.routeIds[skill.id],
            )?.prerequisites ?? [],
        ),
      ),
    };
  });
  const readyGoals = goals.filter((goal) => goal.nextIds.size);
  const candidates: Candidate[] = eligible.map((skill) => {
    const state = getSkillState(skill, profile.progress);
    return {
      skill,
      state,
      nextGoalIds: goals
        .filter((goal) => goal.nextIds.has(skill.id))
        .map((goal) => goal.id),
      supportingGoalIds:
        state === "mastered"
          ? goals
              .filter((goal) => goal.supportingIds.has(skill.id))
              .map((goal) => goal.id)
          : [],
    };
  });
  const result: WeeklyScheduleSuggestion = {
    schedule: {},
    days: {},
    goalIds,
    unavailableGoalIds: goals
      .filter((goal) => !goal.nextIds.size)
      .map((goal) => goal.id),
  };
  const uses = new Map<string, number>();
  const servedGoals = new Set<string>();
  let goalCursor = 0;

  for (const day of chosenDays) {
    const selected: Candidate[] = [];
    const selectedIds = new Set<string>();
    const selectedCategories = new Set<Category>();
    const choose = (pool: Candidate[], focused: boolean) =>
      pool
        .filter((candidate) => !selectedIds.has(candidate.skill.id))
        .map((candidate) => ({
          candidate,
          score:
            (selectedCategories.has(candidate.skill.category)
              ? 0
              : focused
                ? 30
                : 400) +
            (candidate.state === "training" ? 120 : 0) +
            (!focused && candidate.supportingGoalIds.length ? 40 : 0) +
            (!focused && candidate.state === "mastered" ? 20 : 0) -
            (uses.get(candidate.skill.id) ?? 0) * (focused ? 40 : 30) -
            candidate.skill.difficulty * 2,
        }))
        .sort(
          (a, b) =>
            b.score - a.score ||
            a.candidate.skill.name.localeCompare(b.candidate.skill.name) ||
            a.candidate.skill.id.localeCompare(b.candidate.skill.id),
        )[0]?.candidate;
    const add = (candidate: Candidate) => {
      selected.push(candidate);
      selectedIds.add(candidate.skill.id);
      selectedCategories.add(candidate.skill.category);
      uses.set(candidate.skill.id, (uses.get(candidate.skill.id) ?? 0) + 1);
      candidate.nextGoalIds.forEach((id) => servedGoals.add(id));
    };

    // Carry the cursor across days so a one-skill session can still rotate goals.
    const uncoveredGoals = readyGoals.filter(
      (goal) => !servedGoals.has(goal.id),
    ).length;
    const goalSlots = readyGoals.length
      ? Math.min(
          skillsPerDay,
          Math.max(Math.ceil(skillsPerDay / 2), uncoveredGoals),
        )
      : 0;
    for (let slot = 0; slot < goalSlots; slot++) {
      let chosen: Candidate | undefined;
      const needsCoverage = readyGoals.some(
        (goal) => !servedGoals.has(goal.id),
      );
      for (let tried = 0; tried < readyGoals.length; tried++) {
        const goal = readyGoals[goalCursor % readyGoals.length];
        goalCursor++;
        if (needsCoverage && servedGoals.has(goal.id)) continue;
        chosen = choose(
          candidates.filter((candidate) =>
            goal.nextIds.has(candidate.skill.id),
          ),
          true,
        );
        if (chosen) break;
      }
      if (!chosen) break;
      add(chosen);
    }
    while (selected.length < skillsPerDay) {
      const candidate = choose(candidates, false);
      if (!candidate) break;
      add(candidate);
    }
    if (selected.length) {
      result.schedule[day] = selected.map((candidate) => candidate.skill.id);
      result.days[day] = selected.map(explainCandidate);
    }
  }
  return result;
}

/** Merge a reviewed suggestion, checking availability against the latest profile. */
export function applyWeeklyScheduleSuggestion(
  profile: UserProfile,
  schedule: WeeklySchedule,
): UserProfile {
  if (!schedule || typeof schedule !== "object" || Array.isArray(schedule))
    return profile;
  let weeklySchedule: WeeklySchedule | undefined;
  for (const day of WEEKDAYS) {
    if (!Object.hasOwn(schedule, day)) continue;
    const suggestions = schedule[day];
    if (!Array.isArray(suggestions)) continue;
    const previous = profile.weeklySchedule?.[day] ?? [];
    const seen = new Set(previous);
    const additions = suggestions.filter((id) => {
      if (
        typeof id !== "string" ||
        seen.has(id) ||
        !canScheduleSkill(id, profile)
      )
        return false;
      seen.add(id);
      return true;
    });
    if (!additions.length) continue;
    weeklySchedule ??= { ...profile.weeklySchedule };
    weeklySchedule[day] = [...previous, ...additions];
  }
  return weeklySchedule ? { ...profile, weeklySchedule } : profile;
}
