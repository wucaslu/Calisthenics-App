import { skillById, skills } from "@/data/skills";
import {
  getEquipmentSetups,
  getPrerequisiteRoutes,
} from "@/data/trainingOptions";
import type {
  Equipment,
  EquipmentSetup,
  Progress,
  Skill,
  SkillState,
} from "@/types/skill";

export {
  getEquipmentSetups,
  getPrerequisiteIds,
  getPrerequisiteRoutes,
} from "@/data/trainingOptions";

export function getSkillState(skill: Skill, progress: Progress): SkillState {
  if (
    !getPrerequisiteRoutes(skill).some((route) =>
      route.prerequisites.every((id) => progress[id] === "mastered"),
    )
  )
    return "locked";
  return progress[skill.id] ?? "available";
}

export function normalizeProgress(progress: Progress): Progress {
  const normalized = { ...progress };
  for (const id of Object.keys(normalized))
    if (!skillById[id]) delete normalized[id];
  let changed = true;
  while (changed) {
    changed = false;
    for (const id of Object.keys(normalized)) {
      if (getSkillState(skillById[id], normalized) === "locked") {
        delete normalized[id];
        changed = true;
      }
    }
  }
  return normalized;
}

export function updateSkillProgress(
  progress: Progress,
  id: string,
  action: "training" | "mastered" | "reset",
): Progress {
  const skill = skillById[id];
  if (!skill) return progress;
  if (action !== "reset" && getSkillState(skill, progress) === "locked")
    return progress;
  const next = { ...progress };
  if (action === "reset") delete next[id];
  else next[id] = action;
  return normalizeProgress(next);
}

export function missingEquipmentForSetup(
  setup: EquipmentSetup,
  available: Equipment[],
): Equipment[] {
  // Floor is always available; a gym supplies the fixed apparatus used by these skills.
  return setup.equipment.filter(
    (item) =>
      item !== "floor" &&
      !available.includes(item) &&
      !(
        available.includes("gym") &&
        ["pull-up-bar", "dip-bars", "parallettes"].includes(item)
      ),
  );
}

export function missingEquipment(
  skill: Skill,
  available: Equipment[],
): Equipment[] {
  const options = getEquipmentSetups(skill).map((setup) =>
    missingEquipmentForSetup(setup, available),
  );
  return options.reduce(
    (best, option) => (option.length < best.length ? option : best),
    options[0],
  );
}

export function hasEquipment(skill: Skill, available: Equipment[]): boolean {
  return missingEquipment(skill, available).length === 0;
}

export function completion(progress: Progress): number {
  return Math.round(
    (skills.filter((skill) => getSkillState(skill, progress) === "mastered")
      .length /
      skills.length) *
      100,
  );
}
