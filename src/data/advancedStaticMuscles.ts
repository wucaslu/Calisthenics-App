import type { MuscleProfile } from "@/types/skill";

// These roles describe the app's supported movement interpretations. The chart
// provides names and levels, rather than muscle measurements or technique claims.
const victorian: MuscleProfile = {
  target: "Face-up shoulder support and horizontal body tension",
  primary: [
    "Latissimus dorsi (lats)",
    "Posterior deltoids (rear shoulders)",
    "Triceps",
  ],
  secondary: [
    "Biceps",
    "Rotator cuff",
    "Rectus abdominis (abs)",
    "Obliques",
    "Gluteus maximus (glutes)",
    "Forearm finger flexors",
  ],
};

const floorVictorian: MuscleProfile = {
  ...victorian,
  target: "Floor-supported shoulder strength and suspended body tension",
  secondary: [
    "Biceps",
    "Rotator cuff",
    "Rectus abdominis (abs)",
    "Obliques",
    "Gluteus maximus (glutes)",
    "Forearm wrist flexors",
  ],
};

export const advancedStaticMuscles: Record<string, MuscleProfile> = {
  "protracted-victorian-on-bars": {
    ...victorian,
    target: "Protracted face-up shoulder support and body tension",
    secondary: [...victorian.secondary, "Serratus anterior"],
  },
  "victorian-on-bars": victorian,
  "wide-victorian-on-bars": {
    ...victorian,
    target: "Wide face-up shoulder support and horizontal body tension",
  },
  "floor-victorian-one-forearm": {
    ...floorVictorian,
    target: "Mixed forearm-and-palm support and resistance to torso rotation",
  },
  "floor-victorian-forearms": floorVictorian,
  "floor-victorian-straight-arms": {
    ...floorVictorian,
    target: "Straight-arm face-up floor support and body tension",
  },
  "straight-arm-touch": {
    target: "Wide-grip straight-arm pulling and hip-to-bar body control",
    primary: ["Latissimus dorsi (lats)", "Biceps", "Teres major"],
    secondary: [
      "Posterior deltoids (rear shoulders)",
      "Rotator cuff",
      "Lower trapezius",
      "Rectus abdominis (abs)",
      "Gluteus maximus (glutes)",
      "Forearm finger flexors",
    ],
  },
  "wide-grip-front-lever": {
    target: "Wide-grip straight-arm pulling and horizontal lever control",
    primary: ["Latissimus dorsi (lats)", "Biceps", "Teres major"],
    secondary: [
      "Posterior deltoids (rear shoulders)",
      "Lower trapezius",
      "Rotator cuff",
      "Rectus abdominis (abs)",
      "Obliques",
      "Gluteus maximus (glutes)",
      "Forearm finger flexors",
    ],
  },
};
