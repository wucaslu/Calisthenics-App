import { equipmentLabels, skillById } from "@/data/skills";
import { retiredSkillNames } from "@/data/retiredSkills";
import { normalizeProgress } from "@/lib/progression";
import { sanitizePracticeEntries, validatePracticeEntry } from "@/lib/practice";
import type {
  Equipment,
  PersonalRecords,
  Progress,
  UserProfile,
  ArchivedSkill,
  PracticeEntry,
} from "@/types/skill";

export const STORAGE_KEY = "calisthenics-skill-tree:v1";
export const PERSONAL_RECORD_MAX_LENGTH = 160;

export function savePracticeEntry(
  entries: PracticeEntry[],
  entry: PracticeEntry,
): PracticeEntry[] {
  if (validatePracticeEntry(entry)) return entries;
  const validated = sanitizePracticeEntries([entry])[0];
  if (!validated) return entries;
  const index = entries.findIndex((item) => item.id === entry.id);
  if (index === -1) return [...entries, validated];
  return entries.map((item) => (item.id === entry.id ? validated : item));
}

export function updatePersonalRecord(
  records: PersonalRecords,
  id: string,
  value: string,
): PersonalRecords {
  if (!skillById[id]) return records;
  const next = { ...records };
  if (value.trim()) next[id] = value.slice(0, PERSONAL_RECORD_MAX_LENGTH);
  else delete next[id];
  return next;
}

export function createDemoProfile(): UserProfile {
  return {
    version: 2,
    practiceLog: [],
    personalRecords: {},
    archivedSkills: {},
    equipment: ["floor", "pull-up-bar", "parallettes"],
    goals: ["tuck-planche", "tuck-front-lever", "freestanding-handstand"],
    progress: {
      "push-up": "mastered",
      "scapular-push-up": "mastered",
      "hollow-body-hold": "mastered",
      "dead-hang": "mastered",
      "scapular-pull-up": "mastered",
      "inverted-row": "mastered",
      "pull-up": "mastered",
      "pike-hold": "mastered",
      "planche-lean": "training",
      "chest-to-bar-pull-up": "training",
    },
  };
}

export function parseProfile(raw: string): UserProfile | null {
  try {
    const data: unknown = JSON.parse(raw);
    if (!data || typeof data !== "object") return null;
    const candidate = data as Record<string, unknown>;
    if (
      (candidate.version !== 1 && candidate.version !== 2) ||
      !Array.isArray(candidate.goals) ||
      !Array.isArray(candidate.equipment) ||
      !candidate.progress ||
      typeof candidate.progress !== "object" ||
      Array.isArray(candidate.progress)
    )
      return null;
    const progress: Progress = {};
    for (const [id, state] of Object.entries(candidate.progress)) {
      if (skillById[id] && (state === "training" || state === "mastered"))
        progress[id] = state;
    }
    const goals = [
      ...new Set(
        candidate.goals.filter(
          (id): id is string => typeof id === "string" && !!skillById[id],
        ),
      ),
    ];
    const equipment = [
      ...new Set([
        "floor" as Equipment,
        ...candidate.equipment.filter(
          (id): id is Equipment =>
            typeof id === "string" && Object.hasOwn(equipmentLabels, id),
        ),
      ]),
    ];
    // Older profiles did not have records. Keep their progress and preferences.
    const personalRecords: PersonalRecords = {};
    if (
      candidate.personalRecords &&
      typeof candidate.personalRecords === "object" &&
      !Array.isArray(candidate.personalRecords)
    ) {
      for (const [id, value] of Object.entries(candidate.personalRecords)) {
        if (skillById[id] && typeof value === "string" && value.trim())
          personalRecords[id] = value.slice(0, PERSONAL_RECORD_MAX_LENGTH);
      }
    }
    const normalized = normalizeProgress(progress);
    const archivedSkills: Record<string, ArchivedSkill> = {};
    const archiveName = (id: string) =>
      skillById[id]?.name ??
      (Object.hasOwn(retiredSkillNames, id)
        ? retiredSkillNames[id]
        : undefined);
    const isObject = (value: unknown): value is Record<string, unknown> =>
      !!value && typeof value === "object" && !Array.isArray(value);
    const recordValue = (value: unknown) =>
      typeof value === "string" && value.trim()
        ? value.slice(0, PERSONAL_RECORD_MAX_LENGTH)
        : undefined;
    const progressValue = (value: unknown) =>
      value === "training" || value === "mastered" ? value : undefined;
    if (isObject(candidate.archivedSkills)) {
      for (const [id, entry] of Object.entries(candidate.archivedSkills)) {
        const name = archiveName(id);
        if (!name || !isObject(entry)) continue;
        const personalRecord = recordValue(entry.personalRecord);
        const state = progressValue(entry.progress);
        if (personalRecord || state)
          archivedSkills[id] = {
            name,
            ...(state ? { progress: state } : {}),
            ...(personalRecord ? { personalRecord } : {}),
          };
      }
    }
    // Preserve retired milestones and progress relocked by new prerequisites.
    for (const [id, value] of Object.entries(candidate.progress)) {
      const name = archiveName(id);
      const state = progressValue(value);
      if (name && state && !normalized[id])
        archivedSkills[id] = { ...archivedSkills[id], name, progress: state };
    }
    if (isObject(candidate.personalRecords)) {
      for (const [id, value] of Object.entries(candidate.personalRecords)) {
        const personalRecord = recordValue(value);
        if (Object.hasOwn(retiredSkillNames, id) && personalRecord) {
          archivedSkills[id] = {
            ...archivedSkills[id],
            name: retiredSkillNames[id],
            personalRecord,
          };
        }
      }
    }
    return {
      version: 2,
      practiceLog: sanitizePracticeEntries(candidate.practiceLog),
      progress: normalized,
      personalRecords,
      goals,
      equipment,
      archivedSkills,
    };
  } catch {
    return null;
  }
}
