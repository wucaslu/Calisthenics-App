import { skillById, skills } from "@/data/skills";
import { getGoalPath } from "@/lib/graph";
import { getSkillState, hasEquipment } from "@/lib/progression";
import type { Skill, UserProfile } from "@/types/skill";

export interface Recommendation {
  skill: Skill;
  reason: string;
  goalId?: string;
}

export function getRecommendations(
  profile: UserProfile,
  limit = 4,
): Recommendation[] {
  const goalPaths = profile.goals.map((id) => ({
    id,
    path: getGoalPath(id, profile.progress, profile.equipment),
  }));
  return skills
    .filter((skill) => {
      const state = getSkillState(skill, profile.progress);
      return (
        (state === "available" || state === "training") &&
        hasEquipment(skill, profile.equipment)
      );
    })
    .map((skill) => {
      const goal = goalPaths.find((item) =>
        item.path.some((step) => step.id === skill.id),
      );
      const training = profile.progress[skill.id] === "training";
      const supporting =
        !goal &&
        goalPaths.some((item) =>
          item.path.some((step) => step.branch === skill.branch),
        );
      return {
        skill,
        goalId: goal?.id,
        score:
          (goal ? 100 : 0) +
          (training ? 30 : 0) +
          (supporting ? 15 : 0) -
          skill.difficulty,
        reason: goal
          ? `${training ? "Keep building consistency" : "Your prerequisites are complete"}. ${skill.id === goal.id ? "This is your target skill" : `This moves you toward ${skillById[goal.id].name}`}.`
          : `${training ? "Continue your current training" : supporting ? "Build supporting strength for your goal branch" : "Build a stronger foundation"}. You have the equipment to practice.`,
      };
    })
    .sort(
      (a, b) => b.score - a.score || a.skill.name.localeCompare(b.skill.name),
    )
    .slice(0, limit)
    .map(({ skill, reason, goalId }) => ({ skill, reason, goalId }));
}
