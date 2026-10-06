export const MAX_DIFFICULTY = 10;

export const DIFFICULTY_EXPLANATION =
  "Estimated overall demands of strength, balance, control, and mobility. Scores are relative, and your own order may differ.";

const tierLabels = [
  "Foundation",
  "Developing",
  "Intermediate",
  "Advanced",
  "Elite",
];

export function getDifficultyTier(level: number): string {
  return tierLabels[Math.ceil(level / 2) - 1];
}
