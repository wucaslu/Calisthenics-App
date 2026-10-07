import type { Skill } from "@/types/skill";

export const MAX_DIFFICULTY = 17;

export const DIFFICULTY_EXPLANATION =
  "Levels follow the uploaded Overcoming Gravity 2nd Edition charts for matched skills. Community chart entries and app estimates are labeled separately. Equipment, technique, and individual strengths can affect difficulty.";

export function getDifficultyTier(level: number): string {
  if (level <= 5) return "Beginner";
  if (level <= 9) return "Intermediate";
  if (level <= 13) return "Advanced";
  return "Elite";
}

export function getLevelSourceLabel(source?: Skill["levelSource"]): string {
  if (source === "book") return "OG2 book";
  if (source === "community") return "Community chart";
  return "App estimate";
}
