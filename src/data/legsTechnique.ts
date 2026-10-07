import type { TechniqueGuidance, TechniqueSource } from "@/types/skill";

const rr =
  "https://raw.githubusercontent.com/asdjflk/r/da02f88bc4534b50f12895465a87748d62a34425/bodyweightfitness/wiki/exercises";
const db =
  "https://raw.githubusercontent.com/yuhonas/free-exercise-db/f00c92c7dcf1216a928a52c3706c7ce8e2f71ed5/exercises";

export const legsTechniqueSources: Record<string, TechniqueSource> = {
  "legs-squat": {
    title: "Bodyweight Fitness · squat, shrimp and pistol technique",
    url: `${rr}/squat.md`,
  },
  "legs-hinge": {
    title: "Bodyweight Fitness · Nordic curl technique",
    url: `${rr}/hinge.md`,
  },
  "legs-lunge": {
    title: "Free Exercise DB · lunge movement instructions",
    url: `${db}/Bodyweight_Walking_Lunge.json`,
  },
  "legs-bridge": {
    title: "Free Exercise DB · floor glute bridge",
    url: `${db}/Butt_Lift_Bridge.json`,
  },
  "legs-calf": {
    title: "Free Exercise DB · calf-raise ankle mechanics",
    url: `${db}/Standing_Calf_Raises.json`,
  },
};

function pistol(loweringOnly: boolean): TechniqueGuidance {
  return {
    setup: [
      "Stand on one foot with the free leg extended forward and both hands clear of support.",
    ],
    cues: [
      "Keep the whole standing foot grounded as the hip and knee bend together.",
      "Allow the standing knee to track in the direction of the toes; reach the arms forward for balance.",
      "Keep the free leg straight and clear while lowering into the deepest position you can control.",
      loweringOnly
        ? "Finish the controlled descent, then reset separately; this variation counts the lowering phase only."
        : "Press through the standing foot to rise, keeping the free leg off the floor until you finish.",
    ],
    mistakes: [
      "Lifting the standing heel or rolling onto the outer edge of the foot.",
      "Bouncing at the bottom or resting the free heel to help the movement.",
    ],
    sources: ["legs-squat"],
    ...(loweringOnly
      ? {
          sourceScope:
            "These cues apply the guide's pistol position to a lowering-only repetition.",
        }
      : {}),
  };
}

function shrimp(twoHands: boolean): TechniqueGuidance {
  return {
    setup: [
      `Stand on one foot and hold the rear foot behind you with ${twoHands ? "both hands" : "one hand, leaving the other arm forward for balance"}.`,
    ],
    cues: [
      "Keep the standing heel grounded and the knee tracking with that foot's toes.",
      "Lower the free knee toward the floor slowly while keeping the held foot off the ground.",
      "Let the torso lean enough to stay balanced without twisting the pelvis.",
      "Touch the free knee gently and rise through the standing leg, keeping your grip on the rear foot.",
    ],
    mistakes: [
      "Using the rear toes to push off the floor.",
      "Dropping onto the free knee or letting the standing knee collapse inward.",
    ],
    sources: ["legs-squat"],
    ...(twoHands
      ? {
          sourceScope:
            "These cues adapt the guide's held-foot shrimp squat to the chart's two-hand grip variation.",
        }
      : {}),
  };
}

function nordic(loweringOnly: boolean): TechniqueGuidance {
  return {
    setup: [
      "Kneel on padding with both ankles secured under an anchor that will not lift, roll or slide.",
    ],
    cues: [
      "Squeeze the glutes and brace the trunk so the shoulders, hips and knees stay in one line.",
      "Lean forward from the knees, resisting the descent with the hamstrings rather than hinging at the hips.",
      "Keep tension against the ankle anchor throughout the range you can control.",
      loweringOnly
        ? "Catch yourself with the hands before losing control, then kneel back into the start; only the descent counts."
        : "Reverse the movement with the hamstrings and return to kneeling without pushing off with the hands.",
    ],
    mistakes: [
      "Folding at the hips to shorten the lever.",
      "Using a loose ankle anchor or falling through the final part of the descent.",
    ],
    sources: ["legs-hinge"],
  };
}

export const legsTechnique: Record<string, TechniqueGuidance> = {
  "bodyweight-squat": {
    setup: [
      "Stand with feet about shoulder width apart, toes turned out as needed for a comfortable stance.",
    ],
    cues: [
      "Keep the heel, base of the big toe and outer forefoot in contact with the floor.",
      "Bend the hips and knees together, letting the knees track with the toes.",
      "Lower the hips below knee height when you can keep balance and control; let the knees move forward naturally.",
      "Press through the whole foot and stand tall without snapping the knees or arching the back.",
    ],
    mistakes: [
      "Letting the heels lift or the knees collapse inward.",
      "Bouncing into a depth where the pelvis and trunk lose control.",
    ],
    sources: ["legs-squat"],
  },
  "split-squat": {
    setup: [
      "Take a staggered stance with the feet on separate tracks and the rear heel lifted.",
    ],
    cues: [
      "Keep the feet in the same split stance throughout the set.",
      "Lower the rear knee toward the floor while keeping most of your weight through the front foot.",
      "Keep the front knee tracking over the toes and the pelvis facing forward.",
      "Rise by extending both legs, keeping the front heel grounded.",
    ],
    mistakes: [
      "Moving the feet together between repetitions as if doing a lunge.",
      "Using a tightrope stance that makes the knees or pelvis twist.",
    ],
    sources: ["legs-squat"],
  },
  "reverse-lunge": {
    setup: [
      "Stand tall with feet about hip width apart and enough clear floor space behind you.",
    ],
    cues: [
      "Step one foot back onto a separate track, keeping the front foot planted.",
      "Lower the rear knee toward the floor as both knees bend.",
      "Keep the front knee aligned with the toes and the trunk controlled over the front leg.",
      "Push through the front foot to return to standing, bringing the rear foot forward without bouncing.",
    ],
    mistakes: [
      "Stepping directly behind the front foot and losing balance.",
      "Pushing mostly through the rear toes or letting the front heel lift.",
    ],
    sources: ["legs-lunge", "legs-squat"],
    sourceScope:
      "The source demonstrates a walking lunge. These cues adapt its stance and knee-control mechanics to a backward step.",
  },
  "pistol-squat": pistol(false),
  "pistol-squat-negative": pistol(true),
  "deep-step-up": {
    setup: [
      "Place one foot fully on a stable high platform that cannot tip or slide.",
    ],
    cues: [
      "Start with a deep bend in the working knee and shift your weight onto the elevated foot.",
      "Keep the elevated knee tracking with the toes as you stand up on that leg.",
      "Keep the trailing foot light; avoid pushing off the floor to start the ascent.",
      "Lower through the working leg deliberately and place the trailing foot down gently.",
    ],
    mistakes: [
      "Jumping off the trailing leg instead of loading the elevated leg.",
      "Using a platform so high that the working heel lifts or the knee twists.",
    ],
    sources: ["legs-squat"],
  },
  "shrimp-squat": shrimp(false),
  "advanced-shrimp-squat": shrimp(true),
  "dragon-squat": {
    setup: [
      "Stand on one foot with space for the free leg to pass behind and across the standing leg.",
    ],
    cues: [
      "Keep the standing heel grounded as you bend the standing hip and knee.",
      "Guide the free leg behind and across gradually, keeping it clear of the floor rather than using it for support.",
      "Allow controlled hip rotation while keeping the loaded knee tracking with its foot; do not twist against a stuck stance foot.",
      "Lower only as far as you can reverse the movement without a hand support, then rise through the standing leg.",
    ],
    mistakes: [
      "Forcing the crossing leg deeper by twisting the loaded knee.",
      "Lifting the standing heel or pushing off the free foot to get back up.",
    ],
    sources: ["legs-squat"],
    sourceScope:
      "These cues adapt the source's single-leg squat mechanics to the Dragon Squat. The guide does not demonstrate this exact crossing-leg variation.",
  },
  "calf-raise": {
    setup: [
      "Stand on a flat, firm surface with feet roughly hip width apart and weight balanced across both feet.",
    ],
    cues: [
      "Raise both heels by extending the ankles, keeping pressure across the balls of the feet.",
      "Keep the knees and hips quiet instead of bending them to create momentum.",
      "Pause at the top without rolling the ankles outward.",
      "Lower the heels slowly to the floor and begin the next repetition without bouncing.",
    ],
    mistakes: [
      "Rolling onto the little-toe edge or letting the ankles wobble.",
      "Bouncing through short repetitions by bending the knees.",
    ],
    sources: ["legs-calf"],
    sourceScope:
      "These cues use the source's ankle-motion instructions for an unweighted floor raise; its machine setup does not apply here.",
  },
  "glute-bridge": {
    setup: [
      "Lie on your back with both knees bent, feet planted about hip width apart and arms by your sides.",
    ],
    cues: [
      "Brace the abdomen gently and keep the ribs down before lifting.",
      "Press through both feet and squeeze the glutes to lift the hips.",
      "Stop at a shoulder-to-knee line rather than arching the lower back to go higher.",
      "Pause with the pelvis level, then lower it slowly to the floor.",
    ],
    mistakes: [
      "Flaring the ribs and overextending the lower back.",
      "Letting the knees spread or collapse while the pelvis tilts to one side.",
    ],
    sources: ["legs-bridge"],
  },
  "nordic-curl-negative": nordic(true),
  "nordic-curl": nordic(false),
};
