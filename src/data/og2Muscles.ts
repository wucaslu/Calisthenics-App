import type { MuscleProfile } from "@/types/skill";

// Muscle roles describe the app's technique, rather than a muscle-by-muscle
// claim made by the workbook. Apparatus changes stabilisation demands.
const straightArmSupport: MuscleProfile = {
  target: "Front shoulders and straight-arm support",
  primary: [
    "Anterior deltoids (front shoulders)",
    "Pectoralis major (chest)",
    "Serratus anterior",
  ],
  secondary: [
    "Triceps",
    "Rotator cuff",
    "Forearm wrist flexors",
    "Rectus abdominis (abs)",
    "Gluteus maximus (glutes)",
  ],
};

const ringStraightArmSupport: MuscleProfile = {
  target: "Front shoulders and stable straight-arm ring support",
  primary: [
    "Anterior deltoids (front shoulders)",
    "Pectoralis major (chest)",
    "Serratus anterior",
  ],
  secondary: [
    "Triceps",
    "Biceps and brachialis",
    "Rotator cuff",
    "Forearm finger flexors",
    "Rectus abdominis (abs)",
    "Gluteus maximus (glutes)",
  ],
};

const ringFrog: MuscleProfile = {
  target: "Shoulder support and ring balance",
  primary: ["Anterior deltoids (front shoulders)", "Triceps"],
  secondary: [
    "Pectoralis major (chest)",
    "Serratus anterior",
    "Rotator cuff",
    "Forearm finger flexors",
    "Rectus abdominis (abs)",
  ],
};

const planchePress: MuscleProfile = {
  target: "Front shoulders, chest, and elbow extensors",
  primary: [
    "Anterior deltoids (front shoulders)",
    "Pectoralis major (chest)",
    "Triceps",
  ],
  secondary: [
    "Serratus anterior",
    "Rotator cuff",
    "Forearm wrist flexors",
    "Rectus abdominis (abs)",
    "Gluteus maximus (glutes)",
  ],
};

const ringPlanchePress: MuscleProfile = {
  ...planchePress,
  target: "Front shoulders, chest, and controlled pressing on rings",
  secondary: [
    "Serratus anterior",
    "Rotator cuff",
    "Biceps and brachialis",
    "Forearm finger flexors",
    "Rectus abdominis (abs)",
    "Gluteus maximus (glutes)",
  ],
};

const frontLever: MuscleProfile = {
  target: "Lats and horizontal straight-arm pulling",
  primary: ["Latissimus dorsi (lats)", "Teres major", "Lower trapezius"],
  secondary: [
    "Posterior deltoids (rear shoulders)",
    "Triceps",
    "Rotator cuff",
    "Rectus abdominis (abs)",
    "Gluteus maximus (glutes)",
    "Forearm finger flexors",
  ],
};

const backLever: MuscleProfile = {
  target: "Straight-arm shoulder support behind the body",
  primary: [
    "Anterior deltoids (front shoulders)",
    "Pectoralis major (chest)",
    "Biceps and brachialis",
  ],
  secondary: [
    "Latissimus dorsi (lats)",
    "Rotator cuff",
    "Rectus abdominis (abs)",
    "Gluteus maximus (glutes)",
    "Forearm finger flexors",
  ],
};

const compression: MuscleProfile = {
  target: "Hip flexors, abdominal compression, and straight-arm support",
  primary: ["Hip flexors", "Rectus abdominis (abs)", "Quadriceps"],
  secondary: [
    "Triceps",
    "Lower trapezius",
    "Posterior deltoids (rear shoulders)",
    "Forearm wrist flexors",
  ],
};

const highCompression: MuscleProfile = {
  target: "High compression and shoulder extension support",
  primary: [
    "Hip flexors",
    "Rectus abdominis (abs)",
    "Posterior deltoids (rear shoulders)",
    "Triceps",
  ],
  secondary: [
    "Lower trapezius",
    "Latissimus dorsi (lats)",
    "Quadriceps",
    "Rotator cuff",
    "Forearm wrist flexors",
  ],
};

const oneArmRow: MuscleProfile = {
  target: "Upper back, elbow flexors, and resistance to torso rotation",
  primary: [
    "Latissimus dorsi (lats)",
    "Rhomboids",
    "Middle trapezius",
    "Biceps and brachialis",
  ],
  secondary: [
    "Posterior deltoids (rear shoulders)",
    "Obliques",
    "Rotator cuff",
    "Forearm finger flexors",
    "Gluteus maximus (glutes)",
  ],
};

const oneArmPush: MuscleProfile = {
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

const oneArmChin: MuscleProfile = {
  target: "Lats and unilateral elbow flexion",
  primary: ["Latissimus dorsi (lats)", "Biceps and brachialis"],
  secondary: [
    "Lower trapezius",
    "Rhomboids",
    "Rotator cuff",
    "Forearm finger flexors",
    "Obliques",
  ],
};

const overheadPress: MuscleProfile = {
  target: "Shoulders and full-range overhead pressing",
  primary: ["Anterior deltoids (front shoulders)", "Triceps"],
  secondary: [
    "Serratus anterior",
    "Upper trapezius",
    "Pectoralis major (chest)",
    "Rotator cuff",
    "Rectus abdominis (abs)",
    "Forearm finger flexors",
  ],
};

const dragonFlag: MuscleProfile = {
  target: "Abdominal anti-extension and whole-body tension",
  primary: ["Rectus abdominis (abs)", "Obliques"],
  secondary: [
    "Latissimus dorsi (lats)",
    "Triceps",
    "Gluteus maximus (glutes)",
    "Hip flexors",
    "Forearm finger flexors",
  ],
};

export const og2Muscles: Record<string, MuscleProfile> = {
  "straight-arm-frog-stand": straightArmSupport,
  "half-lay-planche": straightArmSupport,
  "half-lay-front-lever": frontLever,
  "half-lay-back-lever": backLever,
  "ring-frog-stand": ringFrog,
  "ring-straight-arm-frog-stand": ringStraightArmSupport,
  "ring-tuck-planche": ringStraightArmSupport,
  "ring-advanced-tuck-planche": ringStraightArmSupport,
  "ring-straddle-planche": ringStraightArmSupport,
  "ring-half-lay-planche": ringStraightArmSupport,
  "ring-full-planche": ringStraightArmSupport,
  "advanced-tuck-planche-push-up": planchePress,
  "straddle-planche-push-up": planchePress,
  "half-lay-planche-push-up": planchePress,
  "full-planche-push-up": planchePress,
  "ring-tuck-planche-push-up": ringPlanchePress,
  "ring-advanced-tuck-planche-push-up": ringPlanchePress,
  "ring-straddle-planche-push-up": ringPlanchePress,
  "ring-half-lay-planche-push-up": ringPlanchePress,
  "ring-full-planche-push-up": ringPlanchePress,
  "straddle-l-sit": compression,
  "v-sit-45": compression,
  "v-sit-75": compression,
  "v-sit-100": highCompression,
  "v-sit-120": highCompression,
  "v-sit-140": highCompression,
  "v-sit-155": highCompression,
  "v-sit-170": highCompression,
  manna: highCompression,
  "straddle-one-arm-row": oneArmRow,
  "straddle-one-arm-push-up": oneArmPush,
  "ring-archer-pull-up": oneArmChin,
  "one-arm-chin-up-negative": oneArmChin,
  "one-arm-chin-up": oneArmChin,
  "full-range-handstand-push-up": overheadPress,
  "tuck-dragon-flag-negative": dragonFlag,
  "advanced-tuck-dragon-flag": dragonFlag,
  "straddle-dragon-flag": dragonFlag,
};
