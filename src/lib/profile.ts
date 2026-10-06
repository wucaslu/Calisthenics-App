import { equipmentLabels, skillById } from "@/data/skills";
import { normalizeProgress } from "@/lib/progression";
import type { Equipment, Progress, UserProfile } from "@/types/skill";

export const STORAGE_KEY = "calisthenics-skill-tree:v1";
export function createDemoProfile(): UserProfile {
  return {
    version: 1,
    equipment: ["floor", "pull-up-bar", "parallettes", "resistance-bands"],
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
    return {
      version: 1,
      progress: normalizeProgress(progress),
      goals,
      equipment,
    };
  } catch {
    return null;
  }
}
