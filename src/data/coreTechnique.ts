import type { TechniqueGuidance, TechniqueSource } from "@/types/skill";

const rr =
  "https://raw.githubusercontent.com/asdjflk/r/da02f88bc4534b50f12895465a87748d62a34425/bodyweightfitness/wiki";

export const coreTechniqueSources: Record<string, TechniqueSource> = {
  "core-positioning": {
    title: "Bodyweight Fitness · hollow, arch and support positioning",
    url: `${rr}/kb/positioning.md`,
  },
  "core-hanging": {
    title: "Bodyweight Fitness · hanging core technique",
    url: `${rr}/exercises/core.md`,
  },
  "core-curriculum": {
    title: "GymnasticBodies · L-sit, Manna and body-lever instructions",
    url: "https://raw.githubusercontent.com/tlchatt/gymnasticbodies.com/e932443104bbe86f6bf7acb1e710baad5398bfe3/data/workout/programCurricula.json",
  },
};

function support(shape: string, mistake: string): TechniqueGuidance {
  return {
    setup: [
      "Place your hands beside your hips on the floor or stable supports, with room for both feet to clear.",
    ],
    cues: [
      "Straighten both elbows and press the supports down to keep your shoulders away from your ears.",
      "Lift your hips clear rather than resting your seat between your hands.",
      shape,
      "Keep breathing while holding the position still; lower both feet under control to finish.",
    ],
    mistakes: ["Shrugging or bending the elbows as the hips drop.", mistake],
    sources: ["core-curriculum", "core-positioning"],
  };
}

function vSit(angle?: number): TechniqueGuidance {
  const advanced = angle !== undefined && angle > 90;
  const guidance = support(
    advanced
      ? `Build the ${angle}° shape by lifting the hips and moving them forward away from the hands, keeping both knees straight and legs together.`
      : angle === undefined
        ? "Lift both straight legs together above the horizontal L-sit position through active hip compression."
        : `Lift both straight legs together into the chart's ${angle}° V-sit shape, keeping the heels clear and the legs above horizontal.`,
    "Claiming a higher leg position by bending the knees or letting the heels rest.",
  );
  if (advanced) {
    guidance.setup = [
      "Start in a stable straight-arm support with the hands slightly behind the hips and space to lift the pelvis.",
    ];
    guidance.cues[1] =
      "Move through shoulder extension gradually; keep pressing down and draw the shoulder blades back as the hips rise toward Manna.";
    guidance.mistakes.push(
      "Forcing the hips past your controlled shoulder-extension range.",
    );
  }
  guidance.sourceScope =
    angle === undefined
      ? "These cues adapt the linked L-sit and Manna instructions to the V-sit; the guides do not separately demonstrate this variation."
      : `The linked instructions cover L-sit and Manna mechanics. The ${angle}° chart milestone is an adaptation, not a separately demonstrated variation.`;
  return guidance;
}

function dragon(shape: string, loweringOnly = false): TechniqueGuidance {
  return {
    setup: [
      "Lie on a firm bench or floor and grip a fixed, secure anchor behind your head.",
      "Set your weight on the upper back and shoulders, with your neck free of pressure.",
    ],
    cues: [
      "Brace your abdomen and glutes so the pelvis and trunk move together.",
      shape,
      "Lower the body as one lever from shoulder support, stopping before the hips sag or lower back arches.",
      loweringOnly
        ? "Count the controlled descent only, then return to the starting position separately before the next repetition."
        : "Reverse the movement by lifting the hips and trunk together, keeping the same shape on the ascent.",
    ],
    mistakes: [
      "Rolling onto the neck or pulling against an anchor that can move.",
      "Piking at the hips or dropping the pelvis to make the lever shorter.",
    ],
    sources: ["core-curriculum"],
  };
}

const adaptedDragon =
  "These cues adapt the source's body-lever instructions to this leg shape; this exact variation is not separately demonstrated.";

export const coreTechnique: Record<string, TechniqueGuidance> = {
  "hollow-body-hold": {
    setup: [
      "Lie on your back with both legs together and your arms reaching overhead.",
    ],
    cues: [
      "Tuck the pelvis and press your lower back into the floor before lifting.",
      "Lift the shoulder blades and both straight legs only as far as you can keep that lower-back contact.",
      "Reach through the fingers and toes while keeping the chin relaxed and the ribs drawn down.",
      "Maintain the same body shape while breathing; end the hold when the lower back lifts.",
    ],
    mistakes: [
      "Arching the lower back as the legs move closer to the floor.",
      "Pulling the chin into the chest or letting the ribs flare.",
    ],
    sources: ["core-curriculum", "core-positioning"],
  },
  "arch-body-hold": {
    setup: [
      "Lie face down with both legs together and straight arms reaching overhead.",
    ],
    cues: [
      "Engage your glutes and back to lift the chest and thighs gently off the floor.",
      "Keep both knees and elbows straight, reaching long rather than trying to make the biggest back bend.",
      "Lift the upper and lower body evenly and use a comfortable neck position.",
      "Hold the extension without rocking, then lower the chest and legs together.",
    ],
    mistakes: [
      "Throwing the head back or forcing all the extension into the lower back.",
      "Bending the knees and elbows instead of lifting a long body shape.",
    ],
    sources: ["core-curriculum", "core-positioning"],
  },
  "hanging-knee-raise": {
    setup: [
      "Take a full grip on a secure bar or rings and settle into a still, straight-arm hang.",
    ],
    cues: [
      "Keep the ribs down and feet slightly in front of the hips to limit swinging.",
      "Lift both bent knees together and curl the pelvis upward as they approach the chest.",
      "Pause at the top, then lower slowly without kicking the legs behind you.",
      "Let the shoulders remain comfortable overhead instead of turning the repetition into a pull-up.",
    ],
    mistakes: [
      "Using a backswing to throw the knees upward.",
      "Only flexing the hips while leaving the pelvis tipped forward and back arched.",
    ],
    sources: ["core-hanging", "core-curriculum"],
  },
  "hanging-leg-raise": {
    setup: [
      "Hang still from a secure bar or rings with a full grip and both legs together.",
    ],
    cues: [
      "Keep the knees straight and raise both legs to horizontal through the hips.",
      "Keep the ribs down and roll the pelvis back slightly instead of arching the lower back.",
      "Pause with the legs at hip height, then lower them with the same control.",
      "Keep the arms straight and reset the hang if swinging starts.",
    ],
    mistakes: [
      "Bending the knees as the legs approach horizontal.",
      "Swinging or dropping the legs through the bottom of the repetition.",
    ],
    sources: ["core-hanging", "core-curriculum"],
  },
  "toes-to-bar": {
    setup: [
      "Use a secure bar with room for the legs to rise; start with a still hang and straight elbows.",
    ],
    cues: [
      "Raise both straight legs together, combining hip compression with an upward curl of the pelvis.",
      "Bring the toes to the bar without pulling your chin over it or using a kip.",
      "Keep the knees straight through the top rather than touching the bar with bent shins.",
      "Lower through the full hanging range slowly enough to avoid a new swing.",
    ],
    mistakes: [
      "Throwing the feet upward with momentum.",
      "Bending the elbows or losing control of the return.",
    ],
    sources: ["core-curriculum", "core-hanging"],
    sourceScope:
      "The curriculum demonstrates this movement on stall bars. These cues adapt it to a free-hanging bar, where swing control needs extra attention.",
  },
  "hanging-windshield-wiper": {
    setup: [
      "Hang from a secure bar with a full grip and raise both straight legs into the high starting position.",
    ],
    cues: [
      "Keep the arms straight and the legs together while rotating the pelvis through a controlled side arc.",
      "Keep your chest facing forward as much as possible; move through the trunk rather than pulling with one arm.",
      "Use only the side range from which you can bring both legs back to the center without swinging.",
      "Pause in the high center position before changing sides.",
    ],
    mistakes: [
      "Dropping the legs sideways faster than you can stop them.",
      "Twisting the shoulders or bending one knee to escape the return.",
    ],
    sources: ["core-curriculum"],
    sourceScope:
      "The source demonstrates windshield wipers on stall bars. The free-hanging version uses the same leg arc with additional swing control.",
  },
  "tuck-l-sit": {
    ...support(
      "Keep both knees tucked toward the chest with both feet fully clear of the floor.",
      "Resting the toes on the floor or letting the knees drift down.",
    ),
    sourceScope:
      "These cues adapt the source's straight-arm L-sit support to a two-leg tuck.",
  },
  "l-sit": support(
    "Hold both straight legs together at horizontal, actively lifting the heels rather than letting them hang.",
    "Letting the heels fall below hip height or bending the knees.",
  ),
  "straddle-l-sit": {
    ...support(
      "Spread both straight legs into a horizontal straddle while keeping the hips lifted between the hands.",
      "Opening the legs wider than you can hold with straight knees and clear heels.",
    ),
    sourceScope:
      "These cues adapt the L-sit support mechanics to a two-leg straddle; the linked instructions do not separately demonstrate this variation.",
  },
  "v-sit": vSit(),
  "v-sit-45": vSit(45),
  "v-sit-75": vSit(75),
  "v-sit-100": vSit(100),
  "v-sit-120": vSit(120),
  "v-sit-140": vSit(140),
  "v-sit-155": vSit(155),
  "v-sit-170": vSit(170),
  manna: {
    setup: [
      "Place the hands behind the hips on a stable floor surface, using a hand direction that allows controlled shoulder extension.",
    ],
    cues: [
      "Keep the elbows straight, press down, and draw the shoulder blades back as the hips leave the floor.",
      "Push the hips forward away from the hands and raise them toward shoulder height.",
      "Keep both legs straight and together, folding them over the torso into the horizontal Manna position.",
      "Maintain active compression and lower the hips deliberately without dropping into the shoulders.",
    ],
    mistakes: [
      "Rounding into protracted shoulders as the hips rise.",
      "Keeping the hips low and calling a high V-sit a horizontal Manna.",
      "Forcing the hands into an angle that causes wrist or shoulder pain.",
    ],
    sources: ["core-curriculum"],
  },
  "dragon-flag": dragon(
    "Keep both knees straight and both legs together, with the hips open and the body in one firm line.",
  ),
  "tuck-dragon-flag": {
    ...dragon(
      "Keep both knees close to the chest while maintaining a firm line from the shoulders through the trunk.",
    ),
    sourceScope: adaptedDragon,
  },
  "tuck-dragon-flag-negative": {
    ...dragon(
      "Hold both knees in a compact tuck throughout the descent; do not unfold the legs as you lower.",
      true,
    ),
    sourceScope: adaptedDragon,
  },
  "advanced-tuck-dragon-flag": {
    ...dragon(
      "Open the hip angle beyond a compact tuck while keeping both knees bent and the same shape throughout each repetition.",
    ),
    sourceScope: adaptedDragon,
  },
  "straddle-dragon-flag": {
    ...dragon(
      "Keep both knees straight and spread both legs evenly into a straddle, with the hips open.",
    ),
    sourceScope:
      "The source demonstrates a straddle body-lever negative. These cues extend that shape to a controlled raise and lower.",
  },
};
