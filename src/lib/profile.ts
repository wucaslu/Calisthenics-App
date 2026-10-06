import { equipmentLabels, skillById } from "@/data/skills";
import { normalizeProgress } from "@/lib/progression";
import type {
  Equipment,
  PersonalRecords,
  Progress,
  UserProfile,
} from "@/types/skill";

export const STORAGE_KEY = "calisthenics-skill-tree:v1";
export const PERSONAL_RECORD_MAX_LENGTH = 160;

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
    version: 1,
    personalRecords: {},
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
      "wall-handstand": "training",
    },
  };
}

export function parseProfile(raw: string): UserProfile | null {
  try {
    const data: unknown = JSON.parse(raw);
    if (!data || typeof data !== "object") return null;
    const candidate = data as Record<string, unknown>;
    if (
      candidate.version !== 1 ||
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
    return {
      version: 1,
      progress: normalizeProgress(progress),
      personalRecords,
      goals,
      equipment,
    };
  } catch {
    return null;
  }
}
