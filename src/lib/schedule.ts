import { skillById, skills } from "@/data/skills";
import { getSkillState, hasEquipment } from "@/lib/progression";
import type {
  Skill,
  UserProfile,
  Weekday,
  WeeklySchedule,
} from "@/types/skill";

export const WEEKDAYS: Weekday[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export const WEEKDAY_LABELS: Record<Weekday, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

type TrainingProfile = Pick<UserProfile, "progress" | "equipment">;

export function canScheduleSkill(
  id: string,
  profile: TrainingProfile,
): boolean {
  if (!Object.hasOwn(skillById, id)) return false;
  const skill = skillById[id];
  return (
    getSkillState(skill, profile.progress) !== "locked" &&
    hasEquipment(skill, profile.equipment)
  );
}

export function getSchedulableSkills(profile: TrainingProfile): Skill[] {
  return skills.filter((skill) => canScheduleSkill(skill.id, profile));
}

/** Recover saved plans independently of current mastery and equipment. */
export function sanitizeWeeklySchedule(value: unknown): WeeklySchedule {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const candidate = value as Record<string, unknown>;
  const schedule: WeeklySchedule = {};
  for (const day of WEEKDAYS) {
    if (!Object.hasOwn(candidate, day)) continue;
    const ids = candidate[day];
    if (!Array.isArray(ids)) continue;
    const validIds = [
      ...new Set(
        ids.filter(
          (id): id is string =>
            typeof id === "string" && Object.hasOwn(skillById, id),
        ),
      ),
    ];
    if (validIds.length) schedule[day] = validIds;
  }
  return schedule;
}

export function addScheduledSkill(
  profile: UserProfile,
  day: Weekday,
  skillId: string,
): UserProfile {
  if (!WEEKDAYS.includes(day) || !canScheduleSkill(skillId, profile))
    return profile;
  const previous = profile.weeklySchedule?.[day] ?? [];
  if (previous.includes(skillId)) return profile;
  return {
    ...profile,
    weeklySchedule: {
      ...profile.weeklySchedule,
      [day]: [...previous, skillId],
    },
  };
}

export function removeScheduledSkill(
  profile: UserProfile,
  day: Weekday,
  skillId: string,
): UserProfile {
  if (!WEEKDAYS.includes(day) || !Object.hasOwn(skillById, skillId))
    return profile;
  const previous = profile.weeklySchedule?.[day];
  if (!previous?.includes(skillId)) return profile;
  const weeklySchedule = { ...profile.weeklySchedule };
  const remaining = previous.filter((id) => id !== skillId);
  if (remaining.length) weeklySchedule[day] = remaining;
  else delete weeklySchedule[day];
  const next = { ...profile };
  if (Object.keys(weeklySchedule).length) next.weeklySchedule = weeklySchedule;
  else delete next.weeklySchedule;
  return next;
}
