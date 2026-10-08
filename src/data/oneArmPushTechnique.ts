import type { TechniqueGuidance } from "@/types/skill";

function adapted(family: string): string {
  return `Adapted from ${family} mechanics; the linked guides do not demonstrate this exact one-arm variant.`;
}

function ringPushUp(straddle: boolean): TechniqueGuidance {
  return {
    setup: [
      "Use a securely anchored low ring with a clear landing area; grip the working ring, plant both feet, and keep the free hand and unused ring clear.",
    ],
    cues: [
      straddle
        ? "Keep both legs straight in a wide straddle with both feet grounded throughout."
        : "Keep both legs straight and together with both feet grounded throughout.",
      "Brace the abdomen and glutes to resist rotation; let the chest and hips descend together.",
      "Track the working elbow back and control the ring beneath the shoulder rather than allowing the handle to drift sideways.",
      "Press back to a straight elbow without bracing the arm against the strap or helping with the free hand.",
    ],
    mistakes: [
      straddle
        ? "Turning the shoulders or hips far open instead of maintaining the straddle plank."
        : "Spreading the feet into the straddle variation or twisting the hips to finish.",
      "Leaning on the strap or letting the handle slip away during the descent.",
      "Touching the free hand down or moving the chest without the hips.",
    ],
    sources: ["push-pushup", "push-support", "push-positioning"],
    sourceScope: adapted("push-up and ring support"),
  };
}

function sideDip(straight: boolean): TechniqueGuidance {
  return {
    setup: [
      "Use a secure horizontal dip rail that permits a sideways one-hand grip and leaves room for the free limbs; learn the lateral support with foot assistance before removing it.",
    ],
    cues: [
      "Support the body laterally beside the rail through one hand; keep the free hand and both feet clear during the milestone.",
      straight
        ? "Keep the hips and knees extended in a straight body line during the lowering and press."
        : "Maintain the bent-body shape with the hips flexed; do not unfold the body to gain momentum during the press.",
      "Lower slowly by bending the working elbow only through the range in which the shoulder remains active and controlled.",
      "Press the rail away to straighten the supporting elbow without bouncing, twisting, or driving the legs.",
    ],
    mistakes: [
      "Facing the rail as for a two-hand straight-bar dip instead of establishing lateral one-hand support.",
      straight
        ? "Bending at the hips and turning the movement into the bent-body progression."
        : "Changing the hip angle or swinging the legs to help the press.",
      "Dropping into an unsupported shoulder range or letting the free limbs take weight.",
    ],
    sources: ["push-dip", "push-support", "push-positioning"],
    sourceScope: adapted("dip and lateral support"),
  };
}

function elbowLever(straddle: boolean): TechniqueGuidance {
  return {
    setup: [
      "Place the supporting hand on firm ground with a wrist angle you can control; brace the bent supporting elbow against the abdomen before transferring weight from the free hand.",
    ],
    cues: [
      "Shift the torso over the supporting palm and maintain the elbow-to-abdomen brace as both feet lift.",
      straddle
        ? "Extend both knees and spread the legs in a straddle while keeping the torso and hips approximately horizontal."
        : "Extend the hips and knees with the legs together in a horizontal line.",
      "Keep the free hand clear and use small hand-pressure corrections rather than kicking or swinging the legs.",
      "Set the feet down deliberately before the elbow contact or balance is lost.",
    ],
    mistakes: [
      "Losing the elbow brace or straightening the arm into a different skill.",
      straddle
        ? "Bending the knees to shorten the lever or letting either foot take weight."
        : "Separating the legs into a straddle or folding at the hips.",
      "Pushing through the free hand or throwing the legs upward to find balance.",
    ],
    sources: ["push-gb-curriculum", "push-positioning"],
    sourceScope: adapted("bent-arm hand balance and body positioning"),
  };
}

export const oneArmPushTechnique: Record<string, TechniqueGuidance> = {
  "one-arm-handstand": {
    setup: [
      "Start from a controlled freestanding two-hand handstand on firm ground, with clear space and a practiced sideways exit.",
    ],
    cues: [
      "Keep the supporting elbow straight and actively reach tall through that shoulder as the hips shift over the working palm.",
      "Reduce pressure through the other fingertips gradually; release the free hand only when the body remains balanced over the working arm.",
      "Keep the trunk braced and control the legs rather than swinging them to compensate for a collapsing shoulder.",
      "Make small fingertip corrections and exit deliberately when the single-arm stack is lost.",
    ],
    mistakes: [
      "Counting a wall-supported or fingertip-assisted balance as a freestanding one-arm hold.",
      "Bending the supporting elbow or sinking into the shoulder during the transfer.",
      "Throwing the free hand away before moving the hips over the supporting palm.",
    ],
    sources: ["push-gb-curriculum", "push-positioning"],
    sourceScope: adapted("handstand balance and overhead support"),
  },
  "elevated-one-arm-push-up": {
    setup: [
      "Put the working hand on a stable raised bench or securely fixed handle, with both feet on the floor and the free hand clear; the working hand, not the feet, is elevated.",
    ],
    cues: [
      "Choose a support height and foot stance that allow a straight trunk and controlled hips; record the height to compare attempts.",
      "Lower the chest toward the support with the working elbow tracking back and the torso resisting rotation.",
      "Press through the working hand to a straight elbow while keeping chest and hips moving together.",
      "Reduce the hand height gradually as control improves without using the free hand to help.",
    ],
    mistakes: [
      "Elevating the feet instead of the working hand or using an unsecured support.",
      "Sagging at the hips, twisting the trunk, or shortening the descent to finish.",
      "Touching the free hand down to assist the repetition.",
    ],
    sources: ["push-pushup", "push-positioning"],
    sourceScope: adapted("incline push-up"),
  },
  "ring-straddle-one-arm-push-up": ringPushUp(true),
  "ring-one-arm-push-up": ringPushUp(false),
  "bent-body-one-arm-dip": sideDip(false),
  "straight-body-one-arm-dip": sideDip(true),
  "straddle-one-arm-elbow-lever": elbowLever(true),
  "one-arm-elbow-lever": elbowLever(false),
  "one-arm-planche": {
    setup: [
      "Use firm ground with a clear landing area; establish controlled two-arm planche loading and practice gradual weight transfer before releasing the free hand.",
    ],
    cues: [
      "Keep the supporting elbow straight and free of the abdomen; the hand and shoulder support the body without an elbow-lever brace.",
      "Lean the supporting shoulder ahead of the wrist and actively push the ground away to maintain shoulder-blade control.",
      "Hold the trunk and both straight legs together approximately horizontal, with both feet and the free hand clear.",
      "Resist trunk rotation and end the hold before the elbow bends or the shoulder loses control.",
    ],
    mistakes: [
      "Bracing a bent elbow against the abdomen and counting an elbow lever as a planche.",
      "Touching down the free hand or feet, separating the legs, or piking the hips to shorten the lever.",
      "Dropping abruptly onto the supporting arm or allowing the shoulder blade to collapse.",
    ],
    sources: ["push-gb-curriculum", "push-positioning"],
    sourceScope: adapted("planche and unilateral straight-arm support"),
  },
};
