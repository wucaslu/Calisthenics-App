import type { MuscleProfile } from "@/types/skill";

// Roles describe the app's movement instructions, rather than claims in the chart.
const oneArmPress: MuscleProfile = {
  target: "Chest, triceps, and resistance to torso rotation",
  primary: [
    "Pectoralis major (chest)",
    "Triceps",
    "Anterior deltoids (front shoulders)",
  ],
  secondary: [
    "Serratus anterior",
    "Obliques",
    "Rotator cuff",
    "Gluteus maximus (glutes)",
    "Forearm wrist flexors",
  ],
};

const oneArmRingPress: MuscleProfile = {
  ...oneArmPress,
  target: "Unilateral pressing and control of an independent ring",
  secondary: [
    "Serratus anterior",
    "Obliques",
    "Rotator cuff",
    "Gluteus maximus (glutes)",
    "Forearm finger flexors",
  ],
};

const oneArmDip: MuscleProfile = {
  target: "Unilateral elbow extension and lateral shoulder support",
  primary: [
    "Triceps",
    "Pectoralis major (chest)",
    "Anterior deltoids (front shoulders)",
  ],
  secondary: [
    "Latissimus dorsi (lats)",
    "Lower trapezius",
    "Rotator cuff",
    "Obliques",
    "Forearm finger flexors",
    "Gluteus maximus (glutes)",
  ],
};

const oneArmElbowLever: MuscleProfile = {
  target: "Bent-arm balance and horizontal trunk control",
  primary: ["Anterior deltoids (front shoulders)", "Triceps", "Obliques"],
  secondary: [
    "Pectoralis major (chest)",
    "Rotator cuff",
    "Forearm wrist flexors",
    "Rectus abdominis (abs)",
    "Gluteus maximus (glutes)",
  ],
};

export const oneArmPushMuscles: Record<string, MuscleProfile> = {
  "one-arm-handstand": {
    target: "Unilateral overhead support and inverted balance",
    primary: [
      "Anterior deltoids (front shoulders)",
      "Triceps",
      "Serratus anterior",
    ],
    secondary: [
      "Upper trapezius",
      "Rotator cuff",
      "Obliques",
      "Forearm wrist flexors",
      "Gluteus maximus (glutes)",
    ],
  },
  "elevated-one-arm-push-up": oneArmPress,
  "ring-straddle-one-arm-push-up": oneArmRingPress,
  "ring-one-arm-push-up": oneArmRingPress,
  "bent-body-one-arm-dip": oneArmDip,
  "straight-body-one-arm-dip": oneArmDip,
  "straddle-one-arm-elbow-lever": oneArmElbowLever,
  "one-arm-elbow-lever": oneArmElbowLever,
  "one-arm-planche": {
    target:
      "Unilateral straight-arm shoulder support and resistance to rotation",
    primary: [
      "Anterior deltoids (front shoulders)",
      "Pectoralis major (chest)",
      "Serratus anterior",
    ],
    secondary: [
      "Triceps",
      "Rotator cuff",
      "Obliques",
      "Forearm wrist flexors",
      "Rectus abdominis (abs)",
      "Gluteus maximus (glutes)",
    ],
  },
};
