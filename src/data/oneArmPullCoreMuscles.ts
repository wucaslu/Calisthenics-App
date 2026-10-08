import type { MuscleProfile } from "@/types/skill";

// These roles describe the app's chosen technique, not claims made by the chart.
const oneArmFrontLever: MuscleProfile = {
  target: "Unilateral straight-arm pulling and horizontal body control",
  primary: ["Latissimus dorsi (lats)", "Teres major", "Lower trapezius"],
  secondary: [
    "Posterior deltoids (rear shoulders)",
    "Triceps",
    "Rotator cuff",
    "Obliques",
    "Rectus abdominis (abs)",
    "Gluteus maximus (glutes)",
    "Forearm finger flexors",
  ],
};

const archerMuscleUp: MuscleProfile = {
  target: "Asymmetric ring pulling, transition, and pressing",
  primary: [
    "Latissimus dorsi (lats)",
    "Biceps and brachialis",
    "Pectoralis major (chest)",
    "Triceps",
  ],
  secondary: [
    "Anterior deltoids (front shoulders)",
    "Lower trapezius",
    "Serratus anterior",
    "Rotator cuff",
    "Forearm finger flexors",
    "Obliques",
  ],
};

const diagonalPlank: MuscleProfile = {
  target: "Abdominal bracing and resistance to torso rotation",
  primary: ["Rectus abdominis (abs)", "Obliques", "Serratus anterior"],
  secondary: [
    "Anterior deltoids (front shoulders)",
    "Triceps",
    "Gluteus maximus (glutes)",
    "Quadriceps",
    "Rotator cuff",
    "Forearm wrist flexors",
  ],
};

const abWheel: MuscleProfile = {
  target: "Abdominal anti-extension through a full standing rollout",
  primary: ["Rectus abdominis (abs)", "Obliques", "Latissimus dorsi (lats)"],
  secondary: [
    "Serratus anterior",
    "Anterior deltoids (front shoulders)",
    "Triceps",
    "Rotator cuff",
    "Gluteus maximus (glutes)",
    "Hip flexors",
    "Forearm finger flexors",
  ],
};

const dragonPress: MuscleProfile = {
  target: "Straight-arm floor pressing and suspended body tension",
  primary: [
    "Latissimus dorsi (lats)",
    "Posterior deltoids (rear shoulders)",
    "Rectus abdominis (abs)",
  ],
  secondary: [
    "Triceps",
    "Obliques",
    "Rotator cuff",
    "Gluteus maximus (glutes)",
    "Hip flexors",
    "Forearm wrist flexors",
  ],
};

export const oneArmPullCoreMuscles: Record<string, MuscleProfile> = {
  "one-arm-front-lever": oneArmFrontLever,
  "one-arm-straight-muscle-up": archerMuscleUp,
  "one-arm-one-leg-plank": diagonalPlank,
  "full-ab-wheel": abWheel,
  "one-arm-ab-wheel": {
    ...abWheel,
    target: "Unilateral rollout strength and resistance to trunk rotation",
  },
  "dragon-press": dragonPress,
  "one-arm-dragon-press": {
    ...dragonPress,
    target: "Unilateral floor pressing and suspended body control",
  },
};
