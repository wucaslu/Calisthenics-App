import type { MuscleProfile } from "@/types/skill";
import { og2Muscles } from "@/data/og2Muscles";

// Major muscle roles are practical estimates for the technique described in each
// skill. Grip, joint angle, range of motion, and individual form affect the load.
// Shared profiles cover variations with the same main movement, not equal effort.
const deadHang: MuscleProfile = {
  target: "Grip and forearms",
  primary: ["Forearm finger flexors"],
  secondary: ["Forearm wrist flexors", "Rotator cuff"],
};

const scapularPull: MuscleProfile = {
  target: "Shoulder-blade depressors and back",
  primary: ["Lower trapezius", "Latissimus dorsi (lats)"],
  secondary: ["Rhomboids", "Rotator cuff", "Forearm finger flexors"],
};

const scapularPush: MuscleProfile = {
  target: "Shoulder-blade protractors",
  primary: ["Serratus anterior"],
  secondary: ["Pectoralis major (chest)", "Triceps", "Rectus abdominis (abs)"],
};

const hollowBody: MuscleProfile = {
  target: "Abdominals and front-body tension",
  primary: ["Rectus abdominis (abs)", "Obliques"],
  secondary: ["Hip flexors", "Quadriceps", "Serratus anterior"],
};

const archBody: MuscleProfile = {
  target: "Back extensors and posterior chain",
  primary: ["Erector spinae (back extensors)", "Gluteus maximus (glutes)"],
  secondary: [
    "Hamstrings",
    "Middle trapezius",
    "Posterior deltoids (rear shoulders)",
  ],
};

const pushUp: MuscleProfile = {
  target: "Chest, triceps, and front shoulders",
  primary: [
    "Pectoralis major (chest)",
    "Triceps",
    "Anterior deltoids (front shoulders)",
  ],
  secondary: [
    "Serratus anterior",
    "Rotator cuff",
    "Rectus abdominis (abs)",
    "Gluteus maximus (glutes)",
  ],
};

const dip: MuscleProfile = {
  target: "Chest and elbow extensors",
  primary: [
    "Triceps",
    "Pectoralis major (chest)",
    "Anterior deltoids (front shoulders)",
  ],
  secondary: [
    "Lower trapezius",
    "Serratus anterior",
    "Rotator cuff",
    "Rectus abdominis (abs)",
  ],
};

const row: MuscleProfile = {
  target: "Upper back and elbow flexors",
  primary: [
    "Latissimus dorsi (lats)",
    "Rhomboids",
    "Middle trapezius",
    "Biceps and brachialis",
  ],
  secondary: [
    "Posterior deltoids (rear shoulders)",
    "Rotator cuff",
    "Forearm finger flexors",
    "Rectus abdominis (abs)",
  ],
};

const pullUp: MuscleProfile = {
  target: "Back and elbow flexors",
  primary: ["Latissimus dorsi (lats)", "Biceps and brachialis"],
  secondary: [
    "Lower trapezius",
    "Rhomboids",
    "Rotator cuff",
    "Forearm finger flexors",
    "Rectus abdominis (abs)",
  ],
};

const pikePush: MuscleProfile = {
  target: "Shoulders and triceps",
  primary: ["Anterior deltoids (front shoulders)", "Triceps"],
  secondary: [
    "Serratus anterior",
    "Upper trapezius",
    "Rotator cuff",
    "Pectoralis major (chest)",
    "Rectus abdominis (abs)",
  ],
};

const planche: MuscleProfile = {
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

const planchePush: MuscleProfile = {
  target: "Front shoulders, chest, and triceps",
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

const bentArmBalance: MuscleProfile = {
  target: "Shoulder support and hand balance",
  primary: ["Anterior deltoids (front shoulders)", "Triceps"],
  secondary: [
    "Forearm wrist flexors",
    "Serratus anterior",
    "Rectus abdominis (abs)",
    "Gluteus maximus (glutes)",
  ],
};

const ninetyDegreeHold: MuscleProfile = {
  target: "Front shoulders, chest, and bent-arm support",
  primary: [
    "Anterior deltoids (front shoulders)",
    "Triceps",
    "Pectoralis major (chest)",
  ],
  secondary: [
    "Serratus anterior",
    "Rotator cuff",
    "Forearm wrist flexors",
    "Rectus abdominis (abs)",
    "Gluteus maximus (glutes)",
  ],
};

const frontLever: MuscleProfile = {
  target: "Lats and straight-arm pulling strength",
  primary: ["Latissimus dorsi (lats)", "Teres major"],
  secondary: [
    "Lower trapezius",
    "Rotator cuff",
    "Rectus abdominis (abs)",
    "Gluteus maximus (glutes)",
    "Forearm finger flexors",
  ],
};

const frontLeverRow: MuscleProfile = {
  target: "Lats, upper back, and elbow flexors",
  primary: [
    "Latissimus dorsi (lats)",
    "Biceps and brachialis",
    "Middle trapezius",
    "Rhomboids",
  ],
  secondary: [
    "Posterior deltoids (rear shoulders)",
    "Rotator cuff",
    "Rectus abdominis (abs)",
    "Gluteus maximus (glutes)",
    "Forearm finger flexors",
  ],
};

const pikeHold: MuscleProfile = {
  target: "Overhead shoulder support",
  primary: [
    "Anterior deltoids (front shoulders)",
    "Serratus anterior",
    "Upper trapezius",
  ],
  secondary: [
    "Triceps",
    "Rotator cuff",
    "Forearm wrist flexors",
    "Rectus abdominis (abs)",
  ],
};

const handstand: MuscleProfile = {
  target: "Shoulders and overhead balance",
  primary: [
    "Anterior deltoids (front shoulders)",
    "Serratus anterior",
    "Upper trapezius",
  ],
  secondary: [
    "Triceps",
    "Forearm wrist flexors",
    "Rotator cuff",
    "Rectus abdominis (abs)",
    "Gluteus maximus (glutes)",
  ],
};

const highPull: MuscleProfile = {
  target: "Back, upper back, and elbow flexors",
  primary: [
    "Latissimus dorsi (lats)",
    "Biceps and brachialis",
    "Middle trapezius",
    "Rhomboids",
  ],
  secondary: [
    "Posterior deltoids (rear shoulders)",
    "Rotator cuff",
    "Forearm finger flexors",
    "Rectus abdominis (abs)",
  ],
};

const muscleUp: MuscleProfile = {
  target: "Back, chest, and arms through the pull and press",
  primary: [
    "Latissimus dorsi (lats)",
    "Biceps and brachialis",
    "Pectoralis major (chest)",
    "Triceps",
  ],
  secondary: [
    "Anterior deltoids (front shoulders)",
    "Trapezius and rhomboids",
    "Rotator cuff",
    "Forearm finger flexors",
    "Rectus abdominis (abs)",
  ],
};

const hangingKneeRaise: MuscleProfile = {
  target: "Hip flexors and abdominals",
  primary: ["Hip flexors", "Rectus abdominis (abs)"],
  secondary: [
    "Obliques",
    "Latissimus dorsi (lats)",
    "Lower trapezius",
    "Forearm finger flexors",
  ],
};

const hangingLegRaise: MuscleProfile = {
  target: "Hip flexors and abdominal control",
  primary: ["Hip flexors", "Rectus abdominis (abs)"],
  secondary: [
    "Quadriceps",
    "Obliques",
    "Latissimus dorsi (lats)",
    "Lower trapezius",
    "Forearm finger flexors",
  ],
};

const lSit: MuscleProfile = {
  target: "Hip flexors, abdominals, and support strength",
  primary: ["Hip flexors", "Rectus abdominis (abs)"],
  secondary: [
    "Triceps",
    "Quadriceps",
    "Lower trapezius",
    "Latissimus dorsi (lats)",
    "Serratus anterior",
  ],
};

const tuckLSit: MuscleProfile = {
  target: "Hip flexors, abdominals, and support strength",
  primary: ["Hip flexors", "Rectus abdominis (abs)"],
  secondary: [
    "Triceps",
    "Lower trapezius",
    "Latissimus dorsi (lats)",
    "Serratus anterior",
    "Forearm wrist flexors",
  ],
};

const dragonFlag: MuscleProfile = {
  target: "Abdominals and rigid trunk control",
  primary: ["Rectus abdominis (abs)", "Obliques"],
  secondary: [
    "Latissimus dorsi (lats)",
    "Gluteus maximus (glutes)",
    "Quadriceps",
    "Forearm finger flexors",
  ],
};

const tuckDragonFlag: MuscleProfile = {
  target: "Abdominals and rigid trunk control",
  primary: ["Rectus abdominis (abs)", "Obliques"],
  secondary: [
    "Latissimus dorsi (lats)",
    "Hip flexors",
    "Gluteus maximus (glutes)",
    "Forearm finger flexors",
  ],
};

const squat: MuscleProfile = {
  target: "Quadriceps and glutes",
  primary: ["Quadriceps", "Gluteus maximus (glutes)"],
  secondary: [
    "Adductors (inner thighs)",
    "Hamstrings",
    "Calves",
    "Erector spinae (back extensors)",
    "Abdominals",
  ],
};

const splitSquat: MuscleProfile = {
  target: "Quadriceps, glutes, and hip stability",
  primary: ["Quadriceps", "Gluteus maximus (glutes)"],
  secondary: [
    "Gluteus medius (side glutes)",
    "Adductors (inner thighs)",
    "Hamstrings",
    "Calves",
    "Abdominals",
  ],
};

const pistolSquat: MuscleProfile = {
  target: "Quadriceps, glutes, and single-leg balance",
  primary: ["Quadriceps", "Gluteus maximus (glutes)"],
  secondary: [
    "Gluteus medius (side glutes)",
    "Adductors (inner thighs)",
    "Calves",
    "Hip flexors of the raised leg",
    "Abdominals",
  ],
};

const calfRaise: MuscleProfile = {
  target: "Calves and ankle control",
  primary: ["Gastrocnemius", "Soleus"],
  secondary: [
    "Tibialis posterior",
    "Fibularis muscles",
    "Foot intrinsic muscles",
  ],
};

const dragonSquat: MuscleProfile = {
  target: "Quadriceps, glutes, and rotational hip control",
  primary: ["Quadriceps", "Gluteus maximus (glutes)"],
  secondary: [
    "Gluteus medius (side glutes)",
    "Adductors (inner thighs)",
    "Deep hip rotators",
    "Calves",
    "Obliques",
  ],
};

const ringSupport: MuscleProfile = {
  target: "Triceps and shoulder support",
  primary: ["Triceps", "Lower trapezius", "Pectoralis major (chest)"],
  secondary: [
    "Latissimus dorsi (lats)",
    "Rotator cuff",
    "Serratus anterior",
    "Forearm finger flexors",
    "Rectus abdominis (abs)",
  ],
};

const turnedOutSupport: MuscleProfile = {
  target: "Straight-arm ring support and shoulder stability",
  primary: ["Triceps", "Pectoralis major (chest)", "Lower trapezius"],
  secondary: [
    "Biceps",
    "Rotator cuff",
    "Serratus anterior",
    "Forearm finger flexors",
    "Rectus abdominis (abs)",
  ],
};

const ringPushUp: MuscleProfile = {
  target: "Chest, triceps, and ring stability",
  primary: [
    "Pectoralis major (chest)",
    "Triceps",
    "Anterior deltoids (front shoulders)",
  ],
  secondary: [
    "Rotator cuff",
    "Serratus anterior",
    "Forearm finger flexors",
    "Rectus abdominis (abs)",
    "Gluteus maximus (glutes)",
  ],
};

const ringDip: MuscleProfile = {
  target: "Chest, triceps, and ring support",
  primary: [
    "Triceps",
    "Pectoralis major (chest)",
    "Anterior deltoids (front shoulders)",
  ],
  secondary: [
    "Rotator cuff",
    "Lower trapezius",
    "Serratus anterior",
    "Forearm finger flexors",
    "Rectus abdominis (abs)",
  ],
};

const falseGripHang: MuscleProfile = {
  target: "Grip and wrist flexors",
  primary: ["Forearm finger flexors", "Forearm wrist flexors"],
  secondary: ["Rotator cuff", "Latissimus dorsi (lats)"],
};

const ringMuscleUp: MuscleProfile = {
  target: "Back, chest, and arms through the ring transition",
  primary: [
    "Latissimus dorsi (lats)",
    "Biceps and brachialis",
    "Pectoralis major (chest)",
    "Triceps",
  ],
  secondary: [
    "Anterior deltoids (front shoulders)",
    "Rotator cuff",
    "Trapezius and rhomboids",
    "Forearm finger and wrist flexors",
    "Rectus abdominis (abs)",
  ],
};

const skinTheCat: MuscleProfile = {
  target: "Shoulder control and abdominal compression",
  primary: ["Latissimus dorsi (lats)", "Rectus abdominis (abs)", "Hip flexors"],
  secondary: [
    "Anterior deltoids (front shoulders)",
    "Pectoralis major (chest)",
    "Biceps",
    "Rotator cuff",
    "Forearm finger flexors",
  ],
};

const germanHang: MuscleProfile = {
  target: "Grip and shoulder-extension tolerance",
  primary: ["Forearm finger flexors"],
  secondary: [
    "Rotator cuff",
    "Anterior deltoids (front shoulders)",
    "Pectoralis major (chest)",
    "Biceps",
  ],
};

const backLever: MuscleProfile = {
  target: "Front shoulders, chest, and straight-arm body tension",
  primary: ["Anterior deltoids (front shoulders)", "Pectoralis major (chest)"],
  secondary: [
    "Biceps",
    "Rotator cuff",
    "Rectus abdominis (abs)",
    "Gluteus maximus (glutes)",
    "Forearm finger flexors",
  ],
};

const pelicanCurl: MuscleProfile = {
  target: "Elbow flexors under shoulder extension",
  primary: ["Biceps", "Brachialis"],
  secondary: [
    "Anterior deltoids (front shoulders)",
    "Pectoralis major (chest)",
    "Rotator cuff",
    "Forearm finger flexors",
    "Rectus abdominis (abs)",
  ],
};

const pelicanPress: MuscleProfile = {
  target: "Elbow flexors, chest, and shoulder transition strength",
  primary: [
    "Biceps and brachialis",
    "Pectoralis major (chest)",
    "Anterior deltoids (front shoulders)",
  ],
  secondary: [
    "Triceps",
    "Rotator cuff",
    "Serratus anterior",
    "Rectus abdominis (abs)",
    "Forearm finger flexors",
  ],
};

const pelicanPlanche: MuscleProfile = {
  target: "Front shoulders, chest, and arm transition strength",
  primary: [
    "Anterior deltoids (front shoulders)",
    "Pectoralis major (chest)",
    "Biceps and brachialis",
    "Triceps",
  ],
  secondary: [
    "Serratus anterior",
    "Rotator cuff",
    "Rectus abdominis (abs)",
    "Gluteus maximus (glutes)",
    "Forearm finger flexors",
  ],
};

const hefesto: MuscleProfile = {
  target: "Elbow flexors and behind-the-body transition strength",
  primary: [
    "Biceps and brachialis",
    "Anterior deltoids (front shoulders)",
    "Pectoralis major (chest)",
  ],
  secondary: [
    "Triceps",
    "Rotator cuff",
    "Lower trapezius",
    "Forearm finger flexors",
    "Rectus abdominis (abs)",
  ],
};

const maltese: MuscleProfile = {
  target: "Chest and front shoulders in wide straight-arm support",
  primary: ["Pectoralis major (chest)", "Anterior deltoids (front shoulders)"],
  secondary: [
    "Biceps",
    "Rotator cuff",
    "Serratus anterior",
    "Rectus abdominis (abs)",
    "Gluteus maximus (glutes)",
  ],
};

const ironCross: MuscleProfile = {
  target: "Chest and lats for straight-arm shoulder adduction",
  primary: [
    "Pectoralis major (chest)",
    "Latissimus dorsi (lats)",
    "Teres major",
  ],
  secondary: [
    "Biceps",
    "Rotator cuff",
    "Lower trapezius",
    "Forearm finger flexors",
    "Rectus abdominis (abs)",
  ],
};

const oneArmPull: MuscleProfile = {
  target: "Back and elbow flexors with torso rotation control",
  primary: ["Latissimus dorsi (lats)", "Biceps and brachialis"],
  secondary: [
    "Lower trapezius",
    "Rhomboids",
    "Rotator cuff",
    "Forearm finger flexors",
    "Obliques",
  ],
};

const lSitPullUp: MuscleProfile = {
  target: "Back, elbow flexors, and hip compression",
  primary: ["Latissimus dorsi (lats)", "Biceps and brachialis", "Hip flexors"],
  secondary: [
    "Rectus abdominis (abs)",
    "Quadriceps",
    "Lower trapezius",
    "Rotator cuff",
    "Forearm finger flexors",
  ],
};

const pullOver: MuscleProfile = {
  target: "Back, elbow flexors, and abdominal compression",
  primary: [
    "Latissimus dorsi (lats)",
    "Biceps and brachialis",
    "Hip flexors",
    "Rectus abdominis (abs)",
  ],
  secondary: [
    "Triceps",
    "Pectoralis major (chest)",
    "Rotator cuff",
    "Forearm finger flexors",
    "Quadriceps",
  ],
};

const asymmetricRow: MuscleProfile = {
  target: "Upper back and elbow flexors with torso stability",
  primary: [
    "Latissimus dorsi (lats)",
    "Biceps and brachialis",
    "Rhomboids",
    "Middle trapezius",
  ],
  secondary: [
    "Posterior deltoids (rear shoulders)",
    "Rotator cuff",
    "Forearm finger flexors",
    "Obliques",
  ],
};

const iceCreamMaker: MuscleProfile = {
  target: "Lats, elbow flexors, and horizontal body control",
  primary: ["Latissimus dorsi (lats)", "Biceps and brachialis", "Teres major"],
  secondary: [
    "Trapezius and rhomboids",
    "Rotator cuff",
    "Rectus abdominis (abs)",
    "Gluteus maximus (glutes)",
    "Forearm finger flexors",
  ],
};

const asymmetricPush: MuscleProfile = {
  target: "Chest and triceps with torso rotation control",
  primary: [
    "Pectoralis major (chest)",
    "Triceps",
    "Anterior deltoids (front shoulders)",
  ],
  secondary: [
    "Serratus anterior",
    "Rotator cuff",
    "Obliques",
    "Gluteus maximus (glutes)",
    "Forearm wrist flexors",
  ],
};

const frogStandPress: MuscleProfile = {
  target: "Shoulders and triceps through an inverted press",
  primary: [
    "Anterior deltoids (front shoulders)",
    "Triceps",
    "Serratus anterior",
  ],
  secondary: [
    "Upper trapezius",
    "Pectoralis major (chest)",
    "Rotator cuff",
    "Rectus abdominis (abs)",
    "Forearm wrist flexors",
  ],
};

const turnedOutPushUp: MuscleProfile = {
  target: "Chest, triceps, and turned-out ring control",
  primary: [
    "Pectoralis major (chest)",
    "Triceps",
    "Anterior deltoids (front shoulders)",
  ],
  secondary: [
    "Biceps",
    "Rotator cuff",
    "Serratus anterior",
    "Forearm finger flexors",
    "Rectus abdominis (abs)",
  ],
};

const ringLSitDip: MuscleProfile = {
  target: "Chest, triceps, and hip compression",
  primary: [
    "Triceps",
    "Pectoralis major (chest)",
    "Anterior deltoids (front shoulders)",
    "Hip flexors",
  ],
  secondary: [
    "Rectus abdominis (abs)",
    "Quadriceps",
    "Rotator cuff",
    "Lower trapezius",
    "Forearm finger flexors",
  ],
};

const shrimpSquat: MuscleProfile = {
  target: "Quadriceps, glutes, and single-leg control",
  primary: ["Quadriceps", "Gluteus maximus (glutes)"],
  secondary: [
    "Gluteus medius (side glutes)",
    "Adductors (inner thighs)",
    "Hamstrings",
    "Calves",
    "Abdominals",
  ],
};

const gluteBridge: MuscleProfile = {
  target: "Glutes and hip extension",
  primary: ["Gluteus maximus (glutes)", "Hamstrings"],
  secondary: [
    "Gluteus medius (side glutes)",
    "Abdominals",
    "Erector spinae (back extensors)",
  ],
};

const nordicCurl: MuscleProfile = {
  target: "Hamstrings and knee flexion strength",
  primary: ["Hamstrings"],
  secondary: [
    "Gastrocnemius",
    "Gluteus maximus (glutes)",
    "Abdominals",
    "Erector spinae (back extensors)",
  ],
};

const windshieldWiper: MuscleProfile = {
  target: "Obliques and abdominal rotation control",
  primary: ["Obliques", "Rectus abdominis (abs)", "Hip flexors"],
  secondary: [
    "Latissimus dorsi (lats)",
    "Quadriceps",
    "Rotator cuff",
    "Forearm finger flexors",
  ],
};

export const skillMuscles: Record<string, MuscleProfile> = {
  ...og2Muscles,
  "dead-hang": deadHang,
  "scapular-pull-up": scapularPull,
  "scapular-push-up": scapularPush,
  "hollow-body-hold": hollowBody,
  "arch-body-hold": archBody,
  "push-up": pushUp,
  dip,
  "inverted-row": row,
  "pull-up": pullUp,
  "pike-push-up": pikePush,
  "planche-lean": planche,
  "pseudo-planche-push-up": planchePush,
  "frog-stand": bentArmBalance,
  "tuck-planche": planche,
  "advanced-tuck-planche": planche,
  "straddle-planche": planche,
  "full-planche": planche,
  "90-degree-hold": ninetyDegreeHold,
  "tuck-front-lever": frontLever,
  "advanced-tuck-front-lever": frontLever,
  "straddle-front-lever": frontLever,
  "full-front-lever": frontLever,
  "front-lever-raise": frontLever,
  "full-front-lever-row": frontLeverRow,
  "pike-hold": pikeHold,
  "freestanding-handstand": handstand,
  "handstand-push-up": pikePush,
  "chest-to-bar-pull-up": highPull,
  "explosive-pull-up": pullUp,
  "high-pull-up": highPull,
  "straight-bar-dip": dip,
  "muscle-up": muscleUp,
  "strict-muscle-up": muscleUp,
  "hanging-knee-raise": hangingKneeRaise,
  "hanging-leg-raise": hangingLegRaise,
  "l-sit": lSit,
  "v-sit": lSit,
  "dragon-flag": dragonFlag,
  "bodyweight-squat": squat,
  "split-squat": splitSquat,
  "reverse-lunge": splitSquat,
  "pistol-squat": pistolSquat,
  "calf-raise": calfRaise,
  "dragon-squat": dragonSquat,
  "ring-support-hold": ringSupport,
  "rings-turned-out-support": turnedOutSupport,
  "ring-push-up": ringPushUp,
  "ring-dip": ringDip,
  "false-grip-hang": falseGripHang,
  "ring-muscle-up": ringMuscleUp,
  "skin-the-cat": skinTheCat,
  "german-hang": germanHang,
  "tuck-back-lever": backLever,
  "advanced-tuck-back-lever": backLever,
  "straddle-back-lever": backLever,
  "back-lever": backLever,
  "pelican-curl": pelicanCurl,
  "pelican-press": pelicanPress,
  "pelican-planche": pelicanPlanche,
  "hefesto-negative": hefesto,
  hefesto,
  "maltese-negative": maltese,
  "straddle-maltese": maltese,
  maltese,
  "iron-cross-negative": ironCross,
  "iron-cross": ironCross,
  "archer-pull-up": oneArmPull,
  "typewriter-pull-up": oneArmPull,
  "one-arm-pull-up-negative": oneArmPull,
  "one-arm-pull-up": oneArmPull,
  "pull-up-negative": pullUp,
  "chin-up": pullUp,
  "l-sit-pull-up": lSitPullUp,
  "pull-over": pullOver,
  "archer-row": asymmetricRow,
  "one-arm-row": asymmetricRow,
  "tuck-front-lever-row": frontLeverRow,
  "advanced-tuck-front-lever-row": frontLeverRow,
  "tuck-ice-cream-maker": iceCreamMaker,
  "ring-pull-up": pullUp,
  "diamond-push-up": pushUp,
  "archer-push-up": asymmetricPush,
  "one-arm-push-up-negative": asymmetricPush,
  "one-arm-push-up": asymmetricPush,
  "decline-pike-push-up": pikePush,
  "elbow-lever": bentArmBalance,
  "frog-stand-to-handstand": frogStandPress,
  "rings-turned-out-push-up": turnedOutPushUp,
  "ring-l-sit-dip": ringLSitDip,
  "tuck-planche-push-up": planchePush,
  "deep-step-up": splitSquat,
  "pistol-squat-negative": pistolSquat,
  "shrimp-squat": shrimpSquat,
  "advanced-shrimp-squat": shrimpSquat,
  "glute-bridge": gluteBridge,
  "nordic-curl-negative": nordicCurl,
  "nordic-curl": nordicCurl,
  "tuck-l-sit": tuckLSit,
  "toes-to-bar": hangingLegRaise,
  "hanging-windshield-wiper": windshieldWiper,
  "tuck-dragon-flag": tuckDragonFlag,
};
