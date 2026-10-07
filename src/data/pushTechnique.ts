import type { TechniqueGuidance, TechniqueSource } from "@/types/skill";

const wikiRoot =
  "https://raw.githubusercontent.com/asdjflk/r/da02f88bc4534b50f12895465a87748d62a34425/bodyweightfitness/wiki";

export const pushTechniqueSources: Record<string, TechniqueSource> = {
  "push-pushup": {
    title: "Bodyweight Fitness wiki: Push-up progression (archived mirror)",
    url: `${wikiRoot}/exercises/pushup.md`,
  },
  "push-dip": {
    title: "Bodyweight Fitness wiki: Dipping progression (archived mirror)",
    url: `${wikiRoot}/exercises/dip.md`,
  },
  "push-hspu": {
    title: "Bodyweight Fitness wiki: Handstand push-up (archived mirror)",
    url: `${wikiRoot}/exercises/hspu.md`,
  },
  "push-support": {
    title: "Bodyweight Fitness wiki: Support progression (archived mirror)",
    url: `${wikiRoot}/exercises/support.md`,
  },
  "push-positioning": {
    title:
      "Bodyweight Fitness wiki: Shoulder and body positioning (archived mirror)",
    url: `${wikiRoot}/kb/positioning.md`,
  },
  "push-gb-curriculum": {
    title:
      "GymnasticBodies: Planche and handstand coaching notes (archived curriculum)",
    url: "https://raw.githubusercontent.com/tlchatt/gymnasticbodies.com/e932443104bbe86f6bf7acb1e710baad5398bfe3/data/workout/programCurricula.json",
  },
};

function adapted(family: string): string {
  return `Adapted from ${family} mechanics; the linked guides do not demonstrate this exact variant.`;
}

function pushing(
  setup: string,
  variation: string,
  mistake: string,
  sources = ["push-pushup"],
  sourceScope?: string,
): TechniqueGuidance {
  return {
    setup: [setup],
    cues: [
      variation,
      "Brace your abdomen and glutes so your chest and hips move together.",
      "Lower under control with elbows tracking back, then press through the whole hand to straight arms.",
      "At the top, push the support away and spread the shoulder blades without rounding the lower back.",
    ],
    mistakes: [
      mistake,
      "Sagging at the hips or reaching the chin down instead of lowering the chest.",
    ],
    sources,
    ...(sourceScope ? { sourceScope } : {}),
  };
}

const shapes = {
  tuck: {
    cue: "Keep both knees tucked toward the chest and clear of the arms; hold the hips near shoulder height.",
    mistake:
      "Resting the knees on the arms or leaving either foot on the floor.",
  },
  "advanced-tuck": {
    cue: "Open the hip angle while keeping both knees bent and the back horizontal; the knees do not rest on the arms.",
    mistake:
      "Closing back into a tight tuck or raising the hips to shorten the lever.",
  },
  straddle: {
    cue: "Open the hips and extend both knees in a wide straddle; keep the hips level with the shoulders.",
    mistake:
      "Piking the hips or bending the knees to imitate a horizontal straddle.",
  },
  "half-lay": {
    cue: "Keep the hips open and thighs together in line with the torso, with both knees bent equally.",
    mistake:
      "Folding at the hips or straightening only one leg instead of keeping a symmetric half-lay.",
  },
  full: {
    cue: "Extend both hips and knees with the legs together in one horizontal line from shoulders to toes.",
    mistake:
      "Sagging the hips, separating the legs, or bending the knees to shorten the lever.",
  },
} satisfies Record<string, { cue: string; mistake: string }>;

type PlancheShape = keyof typeof shapes;

function planche(
  shape: PlancheShape,
  rings = false,
  dynamic = false,
): TechniqueGuidance {
  const variant = shapes[shape];
  return {
    setup: [
      rings
        ? "Set equally high rings on secure anchors with space for the whole body to remain clear of the floor. Establish a controlled support first."
        : dynamic
          ? "Use firm floor or stable parallel supports with room to lower the chest; the floor limits depth. Establish the suspended planche shape before bending the elbows."
          : "Place the hands about shoulder-width on firm ground or stable parallettes; choose a hand angle that lets the wrists tolerate the forward lean.",
    ],
    cues: [
      variant.cue,
      "Lean the shoulders ahead of the hands and actively push the support away to keep the shoulder blades spread.",
      dynamic
        ? "Bend and straighten the elbows while keeping the feet suspended and the same leg shape throughout; finish each press with straight arms."
        : "Keep both elbows straight throughout the hold; enter and leave without jumping or dropping into the shoulder load.",
      rings
        ? "Keep the rings close and steady; control their rotation without resting on the straps or forcing more turnout than you can hold."
        : "Maintain the forward lean rather than rocking the shoulders back to unload the arms.",
    ],
    mistakes: [
      variant.mistake,
      dynamic
        ? "Touching down the feet between repetitions or losing the forward lean as the elbows bend."
        : "Bending the elbows or letting the shoulder blades collapse as the hold becomes difficult.",
      ...(rings
        ? [
            "Using the straps to brace the arms or letting the handles spread unpredictably.",
          ]
        : []),
    ],
    sources: [
      "push-gb-curriculum",
      "push-positioning",
      ...(rings ? ["push-support"] : []),
    ],
    ...(rings || dynamic || (shape !== "tuck" && shape !== "straddle")
      ? { sourceScope: adapted(`${rings ? "ring support and " : ""}planche`) }
      : {}),
  };
}

function frog(straight: boolean, rings = false): TechniqueGuidance {
  return {
    setup: [
      rings
        ? "Use securely anchored, equally high rings with a clear landing area; bring the knees onto the upper arms from a controlled low position."
        : "Start crouched with hands about shoulder-width on firm ground and a clear space to place the feet down.",
    ],
    cues: [
      straight
        ? "Keep the elbows straight and both knees resting on the upper arms throughout the balance."
        : "Bend the elbows enough to make a stable shelf for both knees on the upper arms.",
      "Lean the shoulders forward gradually until both feet float, rather than jumping onto the hands.",
      "Push the support away and keep the shoulder blades spread while making small balance corrections.",
      rings
        ? "Hold the rings close and control each handle independently without leaning on the straps."
        : "Use fingertip pressure to check a forward tip and put the feet down before balance is lost.",
    ],
    mistakes: [
      straight
        ? "Bending the elbows to turn this into a bent-arm frog stand."
        : "Dropping into the elbows or jumping before finding a stable knee contact.",
      "Letting the knees slip off the arms or tilting the head far back to compensate for balance.",
    ],
    sources: ["push-gb-curriculum", ...(rings ? ["push-support"] : [])],
    ...(rings
      ? { sourceScope: adapted("floor frog stand and ring support") }
      : {}),
  };
}

function pike(elevated: boolean): TechniqueGuidance {
  return {
    setup: [
      elevated
        ? "Put both feet on a stable box and hands shoulder-width on firm ground; raise the hips before beginning the press."
        : "Place hands shoulder-width and walk the feet in until the hips are high; soften the knees if needed to keep the shoulders loaded.",
    ],
    cues: [
      "Keep the hips high so the movement is an overhead press rather than a forward push-up.",
      "Lower the head slightly ahead of the hands with elbows tracking back, forming a triangle between hands and head.",
      "Control the descent and stop at a gentle head-to-floor touch; keep pressing through the hands rather than resting weight on the head.",
      "Press to straight elbows and actively reach tall through the shoulders at the top.",
    ],
    mistakes: [
      "Letting the hips fall until the exercise becomes a normal push-up.",
      "Flaring the elbows sideways or bouncing the head off the floor.",
    ],
    sources: ["push-hspu", "push-positioning"],
  };
}

function handstandPushup(fullRange: boolean): TechniqueGuidance {
  return {
    setup: [
      fullRange
        ? "Use secure raised bars or parallettes with clearance for the shoulders to descend to hand height; establish a balanced freestanding handstand and a clear exit."
        : "Establish a freestanding handstand on firm ground with a practiced sideways exit and enough space around you.",
    ],
    cues: [
      "Brace the trunk, keep the legs together, and lower by bending the elbows rather than arching the back.",
      "Let the shoulders and head travel slightly forward as the elbows track back; keep pressure through both hands.",
      fullRange
        ? "Lower under control until the shoulders approach hand height; the raised supports provide the extra range below a head-to-floor push-up."
        : "Lower until the head gently reaches the floor ahead of the hands; keep supporting yourself through the arms.",
      "Reverse the movement without a leg kick, then finish stacked with straight elbows and shoulders reaching tall.",
    ],
    mistakes: [
      fullRange
        ? "Using head-to-floor depth and counting it as the full shoulders-to-hands range."
        : "Dropping onto the head or using a forceful leg kick to press up.",
      "Flaring the elbows and arching the lower back instead of controlling the forward shoulder travel.",
    ],
    sources: ["push-hspu", "push-gb-curriculum"],
  };
}

function ringSupport(turnedOut: boolean): TechniqueGuidance {
  return {
    setup: [
      "Set equally high rings on secure anchors; enter support with both feet suspended and the handles beside the hips.",
    ],
    cues: [
      "Straighten both elbows and press down into the rings so the shoulders stay away from the ears.",
      "Keep the trunk straight or slightly hollow with the rings close to the hips.",
      turnedOut
        ? "From a steady support, rotate the rings outward so the thumbs point away from the body; hold only the turnout you can control."
        : "Keep the handles steady in a comfortable orientation before adding any turnout.",
      "Maintain the position using the hands, without leaning the forearms on the rings or straps.",
    ],
    mistakes: [
      "Shrugging into the shoulders or holding with bent elbows.",
      turnedOut
        ? "Forcing the rings farther outward than you can stabilize."
        : "Clamping the rings against the arms to hide instability.",
    ],
    sources: ["push-support", "push-positioning"],
  };
}

function dip(rings: boolean, lSit = false): TechniqueGuidance {
  return {
    setup: [
      rings
        ? "Set secure rings evenly and begin in a stable straight-arm support with feet clear."
        : "Begin above stable parallel bars with straight arms and both feet clear of the floor.",
    ],
    cues: [
      lSit
        ? "Keep both knees straight and the legs together at about hip height throughout the dip."
        : "Keep the body straight or slightly hollow rather than swinging or folding at the hips.",
      "Bend the elbows back and lower slowly through the range your shoulders can control comfortably.",
      "Press back to straight elbows and shoulders held down, without bouncing out of the bottom.",
      rings
        ? "Allow a controlled ring orientation during the descent, then return to a steady turned-out support at the top."
        : "Keep pressure through both hands and a consistent torso angle on the fixed bars.",
    ],
    mistakes: [
      lSit
        ? "Dropping the legs or bending the knees to complete the press."
        : "Swinging the legs or diving into a shoulder depth you cannot control.",
      "Letting the elbows flare or stopping in an unstable bent-arm support.",
    ],
    sources: ["push-dip", "push-support"],
    ...(lSit ? { sourceScope: adapted("ring dip and L-sit positioning") } : {}),
  };
}

function maltese(variant: "negative" | "straddle" | "full"): TechniqueGuidance {
  return {
    setup: [
      "Use secure, evenly set rings with full-body floor clearance; enter from a stable support only after developing control of the horizontal wide-arm position.",
    ],
    cues: [
      variant === "negative"
        ? "Lower gradually from support toward a face-down horizontal Maltese, resisting the entire descent with straight elbows."
        : "Hold the torso face down and horizontal, with the shoulders close to the height of the hands.",
      "Open the straight arms wide, angled toward the hips, rather than forming the upright lateral-arm shape of an iron cross.",
      variant === "straddle"
        ? "Keep the hips open and both knees straight in a wide straddle."
        : "Keep both legs straight and together, with the hips aligned to the torso.",
      "Control both rings evenly and keep the feet suspended; end the attempt while you can still leave the position deliberately.",
    ],
    mistakes: [
      "Bending the elbows or dropping suddenly into the wide-arm load.",
      variant === "straddle"
        ? "Piking the hips or bending the knees to shorten the horizontal lever."
        : "Lifting the chest into an upright cross or sagging the hips below the body line.",
    ],
    sources: ["push-support", "push-positioning", "push-gb-curriculum"],
    sourceScope: adapted("ring support and horizontal straight-arm strength"),
  };
}

function cross(negative: boolean): TechniqueGuidance {
  return {
    setup: [
      "Start in controlled support on secure, evenly set rings with both feet clear of the floor and enough space for the arms to open sideways.",
    ],
    cues: [
      negative
        ? "Lower slowly from support by opening both arms sideways, resisting the whole descent."
        : "Hold the body upright with the straight arms extended horizontally to either side.",
      "Keep the elbows straight and both hands at the same height rather than rotating the torso toward one arm.",
      "Keep the trunk and legs together below the shoulders; stabilize the rings without using the straps for support.",
      "Control the position actively and leave it deliberately before the elbows or shoulders lose alignment.",
    ],
    mistakes: [
      "Bending the elbows or dropping through the lowering phase.",
      "Tipping the torso into a horizontal Maltese shape or letting one ring sit higher than the other.",
    ],
    sources: ["push-support", "push-positioning"],
    sourceScope: adapted("ring support and shoulder positioning"),
  };
}

export const pushTechnique: Record<string, TechniqueGuidance> = {
  "scapular-push-up": {
    setup: [
      "Begin in a high plank with hands beneath shoulders and a braced trunk.",
    ],
    cues: [
      "Keep both elbows straight throughout.",
      "Let the shoulder blades move gently toward one another, then push the floor away until they spread apart.",
      "Keep the hips and head steady so only the shoulder-blade motion changes the height of the chest.",
    ],
    mistakes: [
      "Bending the elbows to make this a small push-up.",
      "Arching the lower back or bobbing the head instead of moving the shoulder blades.",
    ],
    sources: ["push-positioning", "push-pushup"],
    sourceScope: adapted("scapular positioning and push-up"),
  },
  "push-up": pushing(
    "Start in a high plank with hands about shoulder-width and feet grounded.",
    "Lower the chest close to the floor while keeping a straight line from head to heels.",
    "Flaring the elbows sideways or shortening every repetition.",
  ),
  "diamond-push-up": pushing(
    "Start in a plank with hands close beneath the chest; use a narrow spacing your wrists tolerate.",
    "Keep the elbows tracking back beside the torso as the chest lowers toward the hands.",
    "Forcing the fingers to touch when that makes the wrists uncomfortable.",
  ),
  "archer-push-up": pushing(
    "Start in a wide-hand plank with both palms and both feet grounded.",
    "Shift the chest toward one hand while bending that elbow and keeping the opposite elbow straight; repeat evenly on both sides.",
    "Bending both elbows or rotating the hips instead of shifting toward the working hand.",
    ["push-pushup"],
    adapted("push-up"),
  ),
  "one-arm-push-up-negative": pushing(
    "Set one hand beneath the shoulder in a one-arm plank, free hand clear of the floor, and both feet grounded.",
    "Lower slowly with the working elbow tracking back while resisting trunk rotation; reset after the controlled descent.",
    "Collapsing the final part of the descent or using the free hand to assist.",
    ["push-pushup"],
    adapted("push-up"),
  ),
  "straddle-one-arm-push-up": pushing(
    "Begin a one-arm plank with both feet placed wide, the free hand off the floor, and the working hand beneath the shoulder.",
    "Lower and press on the working arm while holding the wide foot stance and keeping the shoulders and hips controlled.",
    "Twisting the hips far open or pushing with the free hand.",
    ["push-pushup"],
    adapted("push-up"),
  ),
  "one-arm-push-up": pushing(
    "Start in a one-arm plank with legs together and both feet grounded; keep the free hand off the floor.",
    "Lower and press while maintaining the narrow leg position and resisting rotation through the shoulders and hips.",
    "Widening the feet into the straddle variant or letting the free hand help.",
    ["push-pushup"],
    adapted("push-up"),
  ),
  "pseudo-planche-push-up": pushing(
    "Start in a plank with a comfortable outward hand angle, then lean the shoulders ahead of the wrists.",
    "Maintain the forward shoulder lean through both lowering and pressing, with the hands closer to the hips than in a regular push-up.",
    "Rocking backward over the hands on the ascent to remove the planche load.",
    ["push-pushup", "push-gb-curriculum"],
  ),
  "ring-push-up": pushing(
    "Set low rings evenly with the feet grounded; choose a height that permits a stable full plank.",
    "Keep the handles controlled beside the chest and turn the rings outward at the straight-arm top.",
    "Letting the rings drift wide or using the straps to stabilize the arms.",
    ["push-pushup", "push-positioning"],
  ),
  "rings-turned-out-push-up": pushing(
    "Start in a ring plank with both handles turned outward and the feet grounded.",
    "Maintain a controlled outward ring orientation through the repetition rather than only turning them out at the finish.",
    "Letting the rings turn inward on every descent or forcing turnout by twisting the wrists.",
    ["push-pushup", "push-positioning"],
  ),
  dip: dip(false),
  "ring-dip": dip(true),
  "ring-l-sit-dip": dip(true, true),
  "straight-bar-dip": {
    setup: [
      "Begin in straight-arm support over a secure single bar, with the bar near the waist and feet suspended.",
    ],
    cues: [
      "Lean the chest forward enough to clear the bar as the elbows bend.",
      "Lower under control with the bar staying close to the torso and the elbows tracking back.",
      "Press back over the bar to straight arms and a stable support without a leg swing.",
    ],
    mistakes: [
      "Dropping the chest onto the bar or drifting backward beneath it.",
      "Kicking the legs to complete the press or letting the shoulders collapse at the bottom.",
    ],
    sources: ["push-dip", "push-support"],
    sourceScope: adapted("dip and single-bar support"),
  },
  "ring-support-hold": ringSupport(false),
  "rings-turned-out-support": ringSupport(true),
  "pike-push-up": pike(false),
  "decline-pike-push-up": pike(true),
  "pike-hold": {
    setup: [
      "Place palms and toes on the floor with hips lifted high and hands about shoulder-width.",
    ],
    cues: [
      "Keep the elbows straight and press the floor away through the full hands.",
      "Shift enough weight into the arms to load the shoulders while the toes remain grounded.",
      "Reach through the shoulders toward the ears while keeping the ribs controlled and the head between the arms.",
    ],
    mistakes: [
      "Bending the elbows or lowering the hips into a plank.",
      "Lifting the feet and calling an unstable partial handstand a floor pike hold.",
    ],
    sources: ["push-hspu", "push-positioning"],
    sourceScope: adapted("pike pressing and overhead shoulder positioning"),
  },
  "freestanding-handstand": {
    setup: [
      "Plant hands shoulder-width on firm ground in a clear area with a practiced sideways exit.",
    ],
    cues: [
      "Enter with a controlled kick so the wrists, shoulders, hips, and feet settle into a vertical stack.",
      "Keep the elbows straight and reach tall through the shoulders; draw the ribs down instead of arching the back.",
      "Make small balance corrections with the fingers and shoulders while keeping the legs together and the head near neutral.",
    ],
    mistakes: [
      "Overkicking and compensating with a large back arch.",
      "Bending the elbows or looking far forward until the body line breaks.",
    ],
    sources: ["push-gb-curriculum", "push-positioning"],
  },
  "handstand-push-up": handstandPushup(false),
  "full-range-handstand-push-up": handstandPushup(true),
  "planche-lean": {
    setup: [
      "Begin in a straight-arm plank with hands about shoulder-width and a comfortable outward finger angle.",
    ],
    cues: [
      "Lean the shoulders ahead of the wrists gradually while keeping the feet grounded.",
      "Keep the elbows straight, actively spread the shoulder blades, and keep the shoulders controlled away from the ears.",
      "Brace the glutes and abdomen to keep the trunk and legs aligned; hold only a lean you can leave smoothly.",
    ],
    mistakes: [
      "Bending the elbows or letting the shoulder blades collapse.",
      "Piking or sagging the hips instead of moving the body forward as one unit.",
    ],
    sources: ["push-gb-curriculum", "push-positioning"],
  },
  "frog-stand": frog(false),
  "straight-arm-frog-stand": frog(true),
  "ring-frog-stand": frog(false, true),
  "ring-straight-arm-frog-stand": frog(true, true),
  "frog-stand-to-handstand": {
    setup: [
      "Find a stable bent-arm frog stand on firm ground with a clear handstand exit.",
    ],
    cues: [
      "Lift the hips over the hands as the knees leave their contact on the arms.",
      "Unfold both legs under control while pressing through the hands and straightening the elbows.",
      "Finish stacked in handstand with tall shoulders and a braced trunk; reverse or exit deliberately if the press stalls.",
    ],
    mistakes: [
      "Throwing the legs upward before the hips are over the hands.",
      "Finishing with bent elbows, a large back arch, or a head-supported balance.",
    ],
    sources: ["push-gb-curriculum", "push-positioning"],
    sourceScope: adapted("frog stand, bent-arm pressing, and handstand"),
  },
  "elbow-lever": {
    setup: [
      "Place hands on firm ground or stable handles and bend the elbows so they can brace against the torso.",
    ],
    cues: [
      "Set a steady elbow-to-torso contact before lifting the feet.",
      "Lean forward gradually, extend the legs, and balance the torso and legs around the hand support.",
      "Keep the body approximately horizontal and use small finger-pressure changes rather than swinging the legs.",
    ],
    mistakes: [
      "Trying to hold without the elbow brace and confusing the position with a 90 degree hold.",
      "Kicking the legs up or tipping forward before establishing stable elbow contact.",
    ],
    sources: ["push-gb-curriculum", "push-positioning"],
    sourceScope: adapted("bent-arm hand balance and body positioning"),
  },
  "90-degree-hold": {
    setup: [
      "Use firm ground or stable parallettes with space to hold a straight horizontal body clear of the floor.",
    ],
    cues: [
      "Bend the elbows to about 90 degrees and lean the shoulders ahead of the hands.",
      "Keep the elbows free of the abdomen: support the body through arm and shoulder strength rather than an elbow-lever brace.",
      "Hold the hips, knees, and legs straight together, with both feet suspended and the torso horizontal.",
      "Maintain active shoulder control and hand pressure; leave the hold before the body line or elbow position collapses.",
    ],
    mistakes: [
      "Resting the elbows against the torso to turn this into an elbow lever.",
      "Touching the feet down, arching the lower back, or straightening the elbows into a different planche position.",
    ],
    sources: ["push-gb-curriculum", "push-positioning"],
    sourceScope: adapted("bent-arm planche"),
  },
  "tuck-planche": planche("tuck"),
  "advanced-tuck-planche": planche("advanced-tuck"),
  "straddle-planche": planche("straddle"),
  "half-lay-planche": planche("half-lay"),
  "full-planche": planche("full"),
  "ring-tuck-planche": planche("tuck", true),
  "ring-advanced-tuck-planche": planche("advanced-tuck", true),
  "ring-straddle-planche": planche("straddle", true),
  "ring-half-lay-planche": planche("half-lay", true),
  "ring-full-planche": planche("full", true),
  "tuck-planche-push-up": planche("tuck", false, true),
  "advanced-tuck-planche-push-up": planche("advanced-tuck", false, true),
  "straddle-planche-push-up": planche("straddle", false, true),
  "half-lay-planche-push-up": planche("half-lay", false, true),
  "full-planche-push-up": planche("full", false, true),
  "ring-tuck-planche-push-up": planche("tuck", true, true),
  "ring-advanced-tuck-planche-push-up": planche("advanced-tuck", true, true),
  "ring-straddle-planche-push-up": planche("straddle", true, true),
  "ring-half-lay-planche-push-up": planche("half-lay", true, true),
  "ring-full-planche-push-up": planche("full", true, true),
  "pelican-press": {
    setup: [
      "Use secure, equally high rings with floor clearance for both feet; begin in a controlled suspended position with the arms behind the torso.",
    ],
    cues: [
      "Keep the feet clear and the body tension steady rather than starting from a foot-supported stretch.",
      "Coordinate elbow bending and shoulder movement to bring the rings back toward the torso without a swing.",
      "Press into a stable straight-arm ring support at the finish and reverse only through a range you can control.",
    ],
    mistakes: [
      "Dropping suddenly into shoulder extension or bouncing out of the bottom.",
      "Using a leg kick, floor push, or strap contact to complete the return.",
    ],
    sources: ["push-support", "push-gb-curriculum"],
    sourceScope: adapted("ring support and back-lever shoulder positioning"),
  },
  "pelican-planche": {
    setup: [
      "Use secure, equally high rings with full-body floor clearance; establish a controlled ring planche before attempting the transition.",
    ],
    cues: [
      "Move from planche to back lever and back again with the body face down and the feet suspended throughout.",
      "Coordinate elbow bending with the shoulders moving behind the torso through the transition; straighten the elbows in the established end positions.",
      "Keep the torso and legs connected as the hands change position, then show a controlled pause at each end.",
      "Control both rings independently and reverse without bouncing, swinging, or leaning on the straps.",
    ],
    mistakes: [
      "Holding only a static shape and counting it as the two-direction transition.",
      "Dropping into the behind-the-body shoulder position or using momentum to return to planche.",
    ],
    sources: ["push-support", "push-gb-curriculum", "push-positioning"],
    sourceScope:
      "Adapted from planche, ring support, and back-lever mechanics for your planche-to-back-lever-and-back definition; the linked guides do not demonstrate this exact transition.",
  },
  "maltese-negative": maltese("negative"),
  "straddle-maltese": maltese("straddle"),
  maltese: maltese("full"),
  "iron-cross-negative": cross(true),
  "iron-cross": cross(false),
};
