import { equipmentLabels, skillById } from "@/data/skills";
import { retiredSkillNames } from "@/data/retiredSkills";
import { validatePracticeEntry } from "@/lib/practice";
import { parseProfile } from "@/lib/profile";
import type { UserProfile } from "@/types/skill";

export const PROFILE_BACKUP_MAX_BYTES = 5 * 1024 * 1024;

function isObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function isSkillId(value: unknown): value is string {
  return (
    typeof value === "string" &&
    (Object.hasOwn(skillById, value) || Object.hasOwn(retiredSkillNames, value))
  );
}

const isProgress = (value: unknown) =>
  value === "training" || value === "mastered";

/** Validate a chosen backup before the storage parser performs catalog migration. */
export function readProfileBackup(raw: string): UserProfile {
  if (new TextEncoder().encode(raw).byteLength > PROFILE_BACKUP_MAX_BYTES)
    throw new Error("Choose a profile backup smaller than 5 MB.");

  let candidate: unknown;
  try {
    candidate = JSON.parse(raw.replace(/^\uFEFF/, ""));
  } catch {
    throw new Error(
      "This file is not valid JSON. Choose an exported profile backup.",
    );
  }
  const invalid = () => {
    throw new Error(
      "This file is not a supported Calisthenics Skill Tree profile backup.",
    );
  };
  if (
    !isObject(candidate) ||
    (candidate.version !== 1 && candidate.version !== 2) ||
    !Array.isArray(candidate.goals) ||
    !candidate.goals.every(isSkillId) ||
    !Array.isArray(candidate.equipment) ||
    !candidate.equipment.every(
      (item) =>
        typeof item === "string" &&
        (Object.hasOwn(equipmentLabels, item) || item === "resistance-bands"),
    ) ||
    !isObject(candidate.progress) ||
    !Object.entries(candidate.progress).every(
      ([id, state]) => isSkillId(id) && isProgress(state),
    )
  )
    return invalid();

  if (
    candidate.personalRecords !== undefined &&
    (!isObject(candidate.personalRecords) ||
      !Object.entries(candidate.personalRecords).every(
        ([id, value]) => isSkillId(id) && typeof value === "string",
      ))
  )
    return invalid();
  if (
    candidate.archivedSkills !== undefined &&
    (!isObject(candidate.archivedSkills) ||
      !Object.entries(candidate.archivedSkills).every(
        ([id, entry]) =>
          isSkillId(id) &&
          isObject(entry) &&
          (entry.name === undefined || typeof entry.name === "string") &&
          (entry.progress === undefined || isProgress(entry.progress)) &&
          (entry.personalRecord === undefined ||
            typeof entry.personalRecord === "string"),
      ))
  )
    return invalid();
  if (candidate.practiceLog !== undefined) {
    if (!Array.isArray(candidate.practiceLog)) return invalid();
    const ids = new Set<string>();
    for (const entry of candidate.practiceLog) {
      if (
        validatePracticeEntry(entry, "9999-12-31") ||
        !isObject(entry) ||
        !isSkillId(entry.skillId)
      )
        return invalid();
      const id = entry.id as string;
      if (ids.has(id)) return invalid();
      ids.add(id);
    }
  }
  const profile = parseProfile(JSON.stringify(candidate));
  return profile ?? invalid();
}

export function createProfileBackup(profile: UserProfile): string {
  return JSON.stringify(profile, null, 2) + "\n";
}
