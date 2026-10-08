import type { TechniqueGuidance, TechniqueSource } from "@/types/skill";

export const oneArmPullCoreTechniqueSources: Record<string, TechniqueSource> = {
  "core-rollout": {
    title: "Bodyweight Fitness · standing ab-wheel rollout instructions",
    url: "https://raw.githubusercontent.com/asdjflk/r/da02f88bc4534b50f12895465a87748d62a34425/bodyweightfitness/wiki/exercises/core.md",
  },
};

const rolloutCues = [
  "Brace with the ribs down and pelvis tucked before rolling; keep the lower back from arching as the wheel moves forward.",
  "Roll into a long, near-horizontal body position with straight elbows and both knees clear of the floor.",
  "Pull the wheel back while maintaining trunk tension, then return to standing without resting the knees or collapsing at the waist.",
];

function dragonPress(oneArm: boolean): TechniqueGuidance {
  return {
    setup: [
      "Lie face up on a firm floor and place both palms beside the hips at a wrist angle you can control, keeping both elbows straight.",
      "Keep weight on the shoulders and upper back, leaving the neck unloaded; there is no anchor behind the head.",
    ],
    cues: [
      "Press the palms into the floor and brace the abdomen and glutes to lift the hips and straight legs clear.",
      oneArm
        ? "Transfer load to one palm and lift the free hand completely clear only while the supporting shoulder and pelvis stay controlled."
        : "Keep both palms pressing beside the hips and both elbows straight throughout the hold.",
      "Keep the legs together and the hips open in a low body line without arching the lower back or twisting the pelvis.",
      "Lower the hips and legs deliberately before the shoulder support or body line fails.",
    ],
    mistakes: [
      "Gripping an overhead anchor, which changes this floor press into a body-lever or dragon-flag exercise.",
      oneArm
        ? "Resting the free hand, rotating the pelvis, or rolling pressure onto the neck."
        : "Bending the elbows, dropping the hips, or rolling pressure onto the neck.",
    ],
    sources: ["core-curriculum", "core-positioning"],
    sourceScope:
      "These cues adapt the linked body-lever tension and support-position instructions to a floor-supported dragon press. The sources do not demonstrate this exact palm-supported variation or its one-arm form.",
  };
}

export const oneArmPullCoreTechnique: Record<string, TechniqueGuidance> = {
  "one-arm-back-lever": {
    setup: [
      "Use a secure fixed bar and establish a controlled two-arm inverted position with room to return through a tuck.",
      "Settle the working grip before transferring load; release the other hand only within shoulder extension you can actively support.",
    ],
    cues: [
      "Keep the working elbow straight while lowering the face-down torso and both straight legs toward horizontal.",
      "Maintain abdominal and glute tension so the shoulders, hips, and feet remain in one line.",
      "Keep the free hand off the bar and working arm while resisting uncontrolled torso rotation.",
      "Return through a controlled shorter lever before the shoulder position breaks; practice both sides separately.",
    ],
    mistakes: [
      "Dropping suddenly into shoulder extension or bending the working elbow to prop up the hold.",
      "Using the free hand, sharply twisting the trunk, or letting the hips sag below the shoulders.",
    ],
    sources: ["pull-gym-rings", "core-positioning"],
    sourceScope:
      "These cues adapt the linked two-arm back-lever and body-position mechanics to a one-arm fixed-bar hold. The guides do not demonstrate this exact variant; a fixed bar also prevents the grip rotation available on rings.",
  },
  "one-arm-front-lever": {
    setup: [
      "Use a secure overhead bar with space beneath it and establish a controlled horizontal front-lever position before releasing the free hand.",
    ],
    cues: [
      "Keep the supporting elbow straight and actively pull through the bar with the working shoulder controlled.",
      "Hold the face-up torso, hips, and both straight legs in one horizontal line.",
      "Keep the legs together and the free hand clear of the bar and working arm; brace the trunk against rotation.",
      "Exit through a controlled shorter lever or hang before the hips drop; train both sides separately.",
    ],
    mistakes: [
      "Bending the working elbow or resting the free hand on the bar, wrist, or supporting arm.",
      "Swinging into the hold, twisting sharply, or allowing the hips to fall below shoulder height.",
    ],
    sources: ["pull-rr-row", "pull-rr-pullup"],
    sourceScope:
      "These cues adapt the linked front-lever and unilateral pulling mechanics. The sources do not separately demonstrate a one-arm front lever.",
  },
  "one-arm-straight-muscle-up": {
    setup: [
      "Set securely mounted rings to equal heights with clearance for the transition and support; grip one ring in each hand.",
      "Use a controlled muscle-up grip on the working side and retain the other ring with the arm that will stay straight.",
    ],
    cues: [
      "Pull the working ring toward the chest while keeping the opposite elbow straight and that hand gripping its own ring.",
      "Move the working shoulder over its handle without kicking, letting the straight arm continue to provide support through the other ring.",
      "Press through the working ring into stable support with both hands still on their own handles.",
      "Reverse the transition under control and reset before changing sides, preserving the straight opposite elbow.",
    ],
    mistakes: [
      "Releasing the opposite ring and treating this as an unsupported single-arm muscle-up.",
      "Bending the assisting elbow, kicking through the transition, or letting either ring move beyond control.",
    ],
    sources: ["pull-ring-muscle-up", "pull-rr-pullup"],
    sourceScope:
      "The workbook's OA Straight MU is represented here as an archer muscle-up: one arm stays straight while both ring contacts are retained. These cues adapt the linked ring muscle-up and asymmetric pulling mechanics; the sources do not demonstrate this exact variation.",
  },
  "one-arm-one-leg-plank": {
    setup: [
      "Start in a straight-arm plank on a firm floor with the hands beneath the shoulders and the toes grounded.",
    ],
    cues: [
      "Brace the abdomen with the ribs down and keep a firm line from head to supporting heel.",
      "Lift one hand and the opposite leg, leaving only the other hand and foot grounded.",
      "Press through the supporting palm with a straight elbow and keep the chest and pelvis square to the floor.",
      "Keep the lifted hand and foot clear while breathing; return them deliberately and repeat the opposite pairing.",
    ],
    mistakes: [
      "Letting the hips sag, arching the lower back, or rotating the pelvis toward the lifted leg.",
      "Leaving the free hand or foot resting on the floor or bending the supporting elbow.",
    ],
    sources: ["core-positioning"],
    sourceScope:
      "These cues adapt the linked bracing and body-position instructions to diagonal two-point plank support. The source does not separately demonstrate this one-arm one-leg variation.",
  },
  "full-ab-wheel": {
    setup: [
      "Use a stable ab wheel on a level, non-slip floor with a clear rollout path. Start standing, hinge down, and grip both handles firmly.",
    ],
    cues: [
      ...rolloutCues,
      "Keep both hands on the wheel and both feet grounded for the complete rollout and return.",
    ],
    mistakes: [
      "Letting the ribs flare or lower back arch as the arms reach forward.",
      "Touching the knees down, stopping at a short rollout, or using a sudden hip jerk to escape the return.",
    ],
    sources: ["core-rollout", "core-positioning"],
  },
  "one-arm-ab-wheel": {
    setup: [
      "Use a wheel specifically designed for a secure one-hand grip on a level, non-slip floor with a clear rollout path.",
      "Start standing with both feet grounded, hinge down, and grip the wheel firmly with the working hand while keeping the free hand clear.",
    ],
    cues: [
      ...rolloutCues,
      "Press through the straight working arm and keep the shoulders and pelvis square instead of turning toward the supporting hand.",
      "Complete the rollout and return on the same hand with the free hand clear, then reset before changing sides.",
    ],
    mistakes: [
      "Using a wheel that cannot be securely controlled with one hand or resting the free hand on the wheel or floor.",
      "Twisting the pelvis, arching the lower back, bending the working elbow, or lowering the knees to finish.",
    ],
    sources: ["core-rollout", "core-positioning"],
    sourceScope:
      "These cues adapt the linked standing two-arm rollout and body-position instructions to single-hand support. The sources do not demonstrate the one-arm variation.",
  },
  "dragon-press": dragonPress(false),
  "one-arm-dragon-press": dragonPress(true),
};
