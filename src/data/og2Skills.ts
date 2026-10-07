import type {
  Branch,
  Category,
  DifficultyLevel,
  Equipment,
  MovementType,
  Skill,
} from "@/types/skill";

// Inject the catalog's definition helpers so this file never imports skills.ts.
// Workbook names and levels are attached centrally by references.ts.
export type Og2Define = (
  id: string,
  name: string,
  category: Category,
  branch: Branch,
  difficulty: DifficultyLevel,
  movementType: MovementType,
  prerequisites: string[],
  equipment: Equipment[],
  description: string,
  target: string,
  drills: Skill["exercises"],
) => Skill;
export type Og2Hold = (
  name: string,
  duration: string,
  description: string,
) => Skill["exercises"][number];
export type Og2Reps = (
  name: string,
  count: string,
  description: string,
) => Skill["exercises"][number];

interface PlancheStage {
  id: string;
  name: string;
  level: DifficultyLevel;
  prerequisites: string[];
  shape: string;
}

const ringPlancheStages: PlancheStage[] = [
  {
    id: "ring-frog-stand",
    name: "Ring Frog Stand",
    level: 4,
    prerequisites: ["ring-support-hold", "frog-stand"],
    shape: "knees resting on bent arms and both feet clear",
  },
  {
    id: "ring-straight-arm-frog-stand",
    name: "Ring Straight-Arm Frog Stand",
    level: 5,
    prerequisites: ["ring-frog-stand", "straight-arm-frog-stand"],
    shape: "knees resting on the upper arms with both elbows straight",
  },
  {
    id: "ring-tuck-planche",
    name: "Ring Tuck Planche",
    level: 6,
    prerequisites: [
      "ring-straight-arm-frog-stand",
      "tuck-planche",
      "rings-turned-out-support",
    ],
    shape: "both knees tucked clear of the arms and elbows straight",
  },
  {
    id: "ring-advanced-tuck-planche",
    name: "Ring Advanced Tuck Planche",
    level: 8,
    prerequisites: ["ring-tuck-planche", "advanced-tuck-planche"],
    shape: "open hips, both knees bent, and a horizontal back",
  },
  {
    id: "ring-straddle-planche",
    name: "Ring Straddle Planche",
    level: 10,
    prerequisites: ["ring-advanced-tuck-planche", "straddle-planche"],
    shape: "both legs straight in a wide straddle and hips horizontal",
  },
  {
    id: "ring-half-lay-planche",
    name: "Ring Half-Lay Planche",
    level: 12,
    prerequisites: ["ring-straddle-planche", "half-lay-planche"],
    shape:
      "hips open, thighs together in line with the torso, and both knees equally bent",
  },
  {
    id: "ring-full-planche",
    name: "Ring Full Planche",
    level: 14,
    prerequisites: ["ring-half-lay-planche", "full-planche"],
    shape: "both legs straight and together in a horizontal body line",
  },
];

const floorPlanchePushStages: PlancheStage[] = [
  {
    id: "advanced-tuck-planche-push-up",
    name: "Advanced Tuck Planche Push-up",
    level: 8,
    prerequisites: ["tuck-planche-push-up", "advanced-tuck-planche"],
    shape: "open hips, both knees bent, and a horizontal back",
  },
  {
    id: "straddle-planche-push-up",
    name: "Straddle Planche Push-up",
    level: 10,
    prerequisites: ["advanced-tuck-planche-push-up", "straddle-planche"],
    shape: "both legs straight in a straddle and hips level",
  },
  {
    id: "half-lay-planche-push-up",
    name: "Half-Lay Planche Push-up",
    level: 12,
    prerequisites: ["straddle-planche-push-up", "half-lay-planche"],
    shape:
      "hips open, thighs together in line with the torso, and both knees equally bent",
  },
  {
    id: "full-planche-push-up",
    name: "Full Planche Push-up",
    level: 14,
    prerequisites: ["half-lay-planche-push-up", "full-planche"],
    shape: "both legs straight and together in a horizontal body line",
  },
];

const ringPlanchePushStages: PlancheStage[] = [
  {
    id: "ring-tuck-planche-push-up",
    name: "Ring Tuck Planche Push-up",
    level: 8,
    prerequisites: ["ring-tuck-planche", "tuck-planche-push-up"],
    shape: "both knees tucked clear of the arms and the torso horizontal",
  },
  {
    id: "ring-advanced-tuck-planche-push-up",
    name: "Ring Advanced Tuck Planche Push-up",
    level: 10,
    prerequisites: ["ring-tuck-planche-push-up", "ring-advanced-tuck-planche"],
    shape: "open hips, both knees bent, and a horizontal back",
  },
  {
    id: "ring-straddle-planche-push-up",
    name: "Ring Straddle Planche Push-up",
    level: 12,
    prerequisites: [
      "ring-advanced-tuck-planche-push-up",
      "ring-straddle-planche",
    ],
    shape: "both legs straight in a straddle and hips level",
  },
  {
    id: "ring-half-lay-planche-push-up",
    name: "Ring Half-Lay Planche Push-up",
    level: 14,
    prerequisites: ["ring-straddle-planche-push-up", "ring-half-lay-planche"],
    shape:
      "hips open, thighs together in line with the torso, and both knees equally bent",
  },
  {
    id: "ring-full-planche-push-up",
    name: "Ring Full Planche Push-up",
    level: 16,
    prerequisites: ["ring-half-lay-planche-push-up", "ring-full-planche"],
    shape: "both legs straight and together in a horizontal body line",
  },
];

const vSitStages: { angle: number; level: DifficultyLevel }[] = [
  { angle: 45, level: 6 },
  { angle: 75, level: 7 },
  { angle: 100, level: 8 },
  { angle: 120, level: 9 },
  { angle: 140, level: 10 },
  { angle: 155, level: 11 },
  { angle: 170, level: 12 },
];

export function getOg2Skills(
  define: Og2Define,
  hold: Og2Hold,
  reps: Og2Reps,
): Skill[] {
  const definitions = [
    define(
      "straight-arm-frog-stand",
      "Straight-Arm Frog Stand",
      "push",
      "planche",
      4,
      "static",
      ["frog-stand", "planche-lean"],
      ["floor"],
      "Balance with both knees resting on your upper arms while the elbows stay straight. Lean the shoulders forward and keep both feet clear; the knee contact makes this distinct from an unsupported tuck planche.",
      "15-second balance with straight elbows and both feet clear",
      [
        hold(
          "Straight-arm frog stand",
          "5–15 sec",
          "Keep the knees on the upper arms, lean gradually, and maintain straight elbows without forcing the joints.",
        ),
      ],
    ),
    define(
      "half-lay-planche",
      "Half-Lay Planche",
      "push",
      "planche",
      9,
      "static",
      ["straddle-planche"],
      ["floor"],
      "Hold a horizontal planche with open hips, thighs together in line with the torso, and both knees equally bent. Keep the elbows straight and shoulders forward. This is the two-leg half-lay variation from the chart's combined half-lay entry.",
      "5-second horizontal hold with both knees equally bent",
      [
        hold(
          "Half-lay planche",
          "3–5 sec",
          "Keep the thighs together and hips fully open; bend both knees by the same amount instead of tucking at the hips.",
        ),
      ],
    ),
    define(
      "half-lay-front-lever",
      "Half-Lay Front Lever",
      "pull",
      "front-lever",
      7,
      "static",
      ["straddle-front-lever"],
      ["pull-up-bar"],
      "Suspend a horizontal torso and thighs beneath the bar with open hips, legs together, and both knees equally bent. Maintain straight elbows and active shoulder tension; the shorter lower-leg lever bridges the straddle and full front lever.",
      "8-second horizontal hold with open hips and both knees bent",
      [
        hold(
          "Half-lay front lever",
          "4–8 sec",
          "Keep the thighs in line with the torso and bend both knees equally without dropping the hips or bending the elbows.",
        ),
      ],
    ),
    define(
      "half-lay-back-lever",
      "Half-Lay Back Lever",
      "pull",
      "back-lever",
      6,
      "static",
      ["straddle-back-lever"],
      ["rings"],
      "Hold the torso and thighs horizontally with the arms behind the body, hips open, and both knees equally bent. Keep the legs together, elbows straight, and a controlled shoulder position throughout the entry and exit.",
      "8-second horizontal hold with both knees equally bent",
      [
        hold(
          "Half-lay back lever",
          "4–8 sec",
          "Lower from an inverted position with both knees bent equally. Keep the thighs in line with the torso and return before shoulder control changes.",
        ),
      ],
    ),
    ...ringPlancheStages.map((stage) =>
      define(
        stage.id,
        stage.name,
        "push",
        "ring-planche",
        stage.level,
        "static",
        stage.prerequisites,
        ["rings"],
        `Balance on independently suspended rings with ${stage.shape}. Keep the rings close to your body and control their rotation without contacting the straps. The ring apparatus has its own chart level and progression, separate from the floor version.`,
        stage.id.includes("frog")
          ? "10-second stable ring balance with both feet clear"
          : "5-second controlled horizontal ring hold",
        [
          hold(
            stage.name,
            stage.id.includes("frog") ? "5–10 sec" : "3–5 sec",
            `Maintain ${stage.shape}. Keep the handles steady, use a controlled exit, and stop before the body shape or elbow position changes.`,
          ),
        ],
      ),
    ),
    ...floorPlanchePushStages.map((stage) =>
      define(
        stage.id,
        stage.name,
        "push",
        "planche",
        stage.level,
        "dynamic",
        stage.prerequisites,
        ["parallettes"],
        `Lower and press from a suspended planche with ${stage.shape}. Keep both feet clear and shoulders forward throughout the bent-arm movement. Use stable parallettes for hand clearance; the chart's fixed-support progression is distinct from ring planche push-ups.`,
        "3 controlled repetitions with both feet suspended",
        [
          reps(
            stage.name,
            "1–3",
            `Preserve ${stage.shape} while lowering and pressing. Return to straight elbows without placing the feet down or losing the forward lean.`,
          ),
        ],
      ),
    ),
    ...ringPlanchePushStages.map((stage) =>
      define(
        stage.id,
        stage.name,
        "push",
        "ring-planche",
        stage.level,
        "dynamic",
        stage.prerequisites,
        ["rings"],
        `Lower and press on independently suspended rings with ${stage.shape}. Keep both feet clear, preserve the forward shoulder lean, and control the handles through the full bent-arm cycle. This has its own ring-specific chart level.`,
        "3 controlled ring repetitions with both feet suspended",
        [
          reps(
            stage.name,
            "1–3",
            `Maintain ${stage.shape}. Keep the rings close and stable while bending the elbows, then press back to the straight-arm planche without touching the straps.`,
          ),
        ],
      ),
    ),
    define(
      "straddle-l-sit",
      "Straddle L-Sit",
      "core",
      "l-sit",
      4,
      "static",
      ["l-sit"],
      ["parallettes"],
      "Support your body on straight arms with both straight legs spread into a horizontal straddle. Keep the hips lifted and heels clear while developing active compression and straddle mobility.",
      "15-second straight-leg horizontal straddle hold",
      [
        hold(
          "Straddle L-sit",
          "5–15 sec",
          "Press the shoulders down, keep both knees straight, and lift both heels without resting the legs on the handles or floor.",
        ),
        reps(
          "Seated straddle compression lifts",
          "8–10",
          "From a seated straddle, actively lift both heels together while keeping the knees straight.",
        ),
      ],
    ),
    ...vSitStages.map((stage, index) => {
      const name = `${stage.angle}° V-Sit`;
      const highAngle = stage.angle > 90;
      return define(
        `v-sit-${stage.angle}`,
        name,
        "core",
        "l-sit",
        stage.level,
        "static",
        [
          index === 0
            ? "straddle-l-sit"
            : `v-sit-${vSitStages[index - 1].angle}`,
        ],
        ["parallettes"],
        `Hold the chart's ${stage.angle}-degree V-sit milestone with both straight legs together and the entire body suspended on straight arms. ${highAngle ? "Progress beyond the vertical leg position by lifting the hips and developing controlled shoulder extension behind the body toward Manna." : "Raise both legs above the horizontal L-sit position while pressing the shoulders down and maintaining active compression."} The named angle distinguishes this milestone from a generic V-sit.`,
        `5-second controlled ${stage.angle}-degree hold with straight knees`,
        [
          hold(
            name,
            "3–5 sec",
            "Keep both knees straight and legs together. Build the named position without bouncing, bending the elbows, or resting the feet.",
          ),
          hold(
            index === 0
              ? "Straddle L-sit"
              : `${vSitStages[index - 1].angle}° V-sit`,
            "5–10 sec",
            "Accumulate controlled holds in the preceding milestone while preserving straight-arm support and active compression.",
          ),
        ],
      );
    }),
    define(
      "manna",
      "Manna",
      "core",
      "l-sit",
      13,
      "static",
      ["v-sit-170"],
      ["parallettes"],
      "Support the body on straight arms with the hands behind the hips, hips elevated, and both straight legs together in the horizontal Manna position. Combine deep compression with shoulder-extension strength and keep the full body clear of the floor.",
      "5-second horizontal Manna with straight knees and elbows",
      [
        hold(
          "Manna attempts",
          "2–5 sec",
          "Progress from the high V-sit, lifting the hips and opening the shoulders only while maintaining control and straight elbows.",
        ),
        hold(
          "170° V-sit",
          "3–5 sec",
          "Use controlled holds in the preceding milestone to build the compression and posterior support needed for Manna.",
        ),
      ],
    ),
    define(
      "straddle-one-arm-row",
      "Straddle One-Arm Row",
      "pull",
      "rows",
      6,
      "dynamic",
      ["archer-row"],
      ["rings"],
      "Row from one ring with the free hand released and both feet grounded in a wide straddle. Keep a straight trunk and resist rotation; the straddle stance is the chart milestone before a narrower straight-body one-arm row.",
      "5 controlled repetitions on each side with both feet grounded",
      [
        reps(
          "Straddle one-arm row",
          "3–5 per side",
          "Keep both legs straight in a wide stance, hips and shoulders square, and the free arm clear throughout the row.",
        ),
      ],
    ),
    define(
      "straddle-one-arm-push-up",
      "Straddle One-Arm Push-up",
      "push",
      "push-up",
      6,
      "dynamic",
      ["archer-push-up"],
      ["floor"],
      "Lower and press with one hand while both feet remain grounded in a wide straddle. Maintain a straight trunk and controlled hips. This chart milestone precedes the straight-body version with legs together.",
      "3 full-range repetitions on each side with both feet grounded",
      [
        reps(
          "Straddle one-arm push-up",
          "1–3 per side",
          "Keep the free hand off the floor, both feet planted, and the torso level through the complete descent and press.",
        ),
      ],
    ),
    define(
      "ring-archer-pull-up",
      "Ring Archer Pull-up",
      "pull",
      "one-arm-pull-up",
      7,
      "dynamic",
      ["ring-pull-up", "archer-pull-up"],
      ["rings"],
      "Pull toward one ring while extending the opposite elbow, keeping both hands on their independently suspended handles. Alternate sides without swinging. The chart separates this ring-specific archer from the fixed-bar version.",
      "3 controlled repetitions on each side",
      [
        reps(
          "Ring archer pull-up",
          "1–3 per side",
          "Pull one handle toward the shoulder while keeping the opposite elbow straight and the rings controlled; return to a full hang.",
        ),
      ],
    ),
    define(
      "one-arm-chin-up-negative",
      "One-Arm Chin-up Negative",
      "pull",
      "one-arm-pull-up",
      8,
      "dynamic",
      ["ring-archer-pull-up", "chin-up"],
      ["rings"],
      "Lower from the top of a one-arm chin-up using a supinated grip, with the free hand released. Control the complete eccentric to a straight elbow. The chart's one-arm chin-up is distinct from a pronated one-arm pull-up.",
      "3 descents lasting 3–5 seconds on each side",
      [
        reps(
          "One-arm chin-up negative",
          "1–3 per side",
          "Start at the top, release the free hand, and lower under control with the palm facing toward you. Keep the free hand off the working arm and handle.",
        ),
      ],
    ),
    define(
      "one-arm-chin-up",
      "One-Arm Chin-up",
      "pull",
      "one-arm-pull-up",
      9,
      "dynamic",
      ["one-arm-chin-up-negative"],
      ["rings"],
      "Pull from a straight-arm hang to chin above the hand using one arm and a supinated grip. Keep the free arm released and control the return without kicking or swinging. Record this underhand milestone separately from the pronated one-arm pull-up.",
      "1 strict repetition on each side from a straight elbow",
      [
        reps(
          "One-arm chin-up",
          "1 per side",
          "Keep the palm facing toward you, initiate with controlled shoulder movement, and complete the pull and descent with the free hand clear.",
        ),
      ],
    ),
    define(
      "full-range-handstand-push-up",
      "Full-Range Handstand Push-up",
      "push",
      "handstand",
      7,
      "dynamic",
      ["handstand-push-up"],
      ["parallettes"],
      "Perform a freestanding handstand push-up on raised handles, lowering the shoulders toward hand height before pressing back to a stacked handstand. The clearance permits the full pressing range; the separate head-to-floor milestone stops when the head reaches the floor.",
      "3 freestanding repetitions through the full handle-height range",
      [
        reps(
          "Full-range handstand push-up",
          "1–3",
          "Use stable load-rated handles with clear space below the head. Lower through the available shoulder-to-hand range and press without touching the head or feet down.",
        ),
      ],
    ),
    define(
      "tuck-dragon-flag-negative",
      "Tuck Dragon Flag Negative",
      "core",
      "dragon-flag",
      3,
      "dynamic",
      ["hollow-body-hold", "arch-body-hold"],
      ["gym"],
      "Lower a tucked body slowly from shoulder support while gripping a secure bench anchor. Keep both knees tucked and move the hips and torso together. This lowering-only milestone comes from the workbook's community-added core chart.",
      "3 tuck descents lasting 3–5 seconds",
      [
        reps(
          "Tuck dragon flag negative",
          "1–3",
          "Enter the raised tuck, lower slowly as one unit, and keep pressure on the shoulders rather than the neck.",
        ),
      ],
    ),
    define(
      "advanced-tuck-dragon-flag",
      "Advanced Tuck Dragon Flag",
      "core",
      "dragon-flag",
      4,
      "dynamic",
      ["tuck-dragon-flag-negative"],
      ["gym"],
      "Raise and lower from shoulder support with the hip angle opened beyond a compact tuck and both knees bent. Keep the trunk rigid while gripping a secure bench anchor. This is a community-added chart milestone.",
      "3 controlled open-tuck repetitions",
      [
        reps(
          "Advanced tuck dragon flag",
          "1–3",
          "Hold both knees away from the chest, preserve the open hip angle, and raise and lower without bending through the lower back or loading the neck.",
        ),
      ],
    ),
    define(
      "straddle-dragon-flag",
      "Straddle Dragon Flag",
      "core",
      "dragon-flag",
      5,
      "dynamic",
      ["advanced-tuck-dragon-flag"],
      ["gym"],
      "Raise and lower a rigid body from shoulder support with both legs straight in a straddle, gripping a secure bench anchor. Use the two-leg straddle form from the community chart's combined entry before progressing to legs together.",
      "3 controlled repetitions with both legs straight in a straddle",
      [
        reps(
          "Straddle dragon flag",
          "1–3",
          "Keep both knees straight, hips open, and the torso rigid throughout the movement. Keep the shoulders supported and the neck unloaded.",
        ),
      ],
    ),
  ];
  return definitions;
}
