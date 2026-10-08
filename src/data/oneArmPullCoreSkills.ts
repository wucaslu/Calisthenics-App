import type { Og2Define, Og2Hold, Og2Reps } from "@/data/og2Skills";
import type { Skill } from "@/types/skill";

// Workbook levels and source cells are attached centrally by overcomingGravity.ts.
export function getOneArmPullCoreSkills(
  define: Og2Define,
  hold: Og2Hold,
  reps: Og2Reps,
): Skill[] {
  return [
    define(
      "one-arm-front-lever",
      "One-Arm Front Lever",
      "pull",
      "front-lever",
      12,
      "static",
      ["full-front-lever", "one-arm-pull-up"],
      ["pull-up-bar"],
      "Suspend the straight body horizontally face up beneath a secure bar using one straight gripping arm. Keep both legs together, hips level with the shoulders, and the free hand off the bar and working arm.",
      "3-second horizontal hold on each arm with a straight working elbow",
      [
        hold(
          "One-arm front lever",
          "1–3 sec per side",
          "Establish the horizontal shape under control, release the free hand, and hold the same body line without rotating or bending the working elbow.",
        ),
      ],
    ),
    define(
      "one-arm-straight-muscle-up",
      "One-Arm-Straight Muscle-up",
      "pull",
      "muscle-up",
      9,
      "dynamic",
      ["ring-muscle-up", "ring-archer-pull-up"],
      ["rings"],
      "Perform an archer ring muscle-up while one arm stays straight and the other pulls, transitions, and presses. Both hands retain their own ring throughout; the straight arm provides support and this is not an unsupported single-arm muscle-up.",
      "2 controlled repetitions on each side with both ring contacts retained",
      [
        reps(
          "One-arm-straight muscle-up",
          "1–2 per side",
          "Pull toward the working ring, keep the opposite elbow straight with its hand on the other ring, then turn the working shoulder over its handle and press into controlled support.",
        ),
      ],
    ),
    define(
      "one-arm-one-leg-plank",
      "One-Arm One-Leg Plank",
      "core",
      "ab-wheel",
      4,
      "static",
      ["hollow-body-hold"],
      ["floor"],
      "Hold a straight-arm plank supported by one hand and the opposite foot. Lift the other hand and leg clear of the floor while keeping the chest and pelvis square and the trunk in one firm line.",
      "15-second square plank on each opposite hand-and-foot pairing",
      [
        hold(
          "One-arm one-leg plank",
          "5–15 sec per side",
          "From a stable plank lift one hand and the opposite leg, leaving the other hand and foot grounded; keep the supporting elbow straight and stop before the hips sag or rotate.",
        ),
      ],
    ),
    define(
      "full-ab-wheel",
      "Full Ab Wheel",
      "core",
      "ab-wheel",
      8,
      "dynamic",
      ["hollow-body-hold", "one-arm-one-leg-plank"],
      ["ab-wheel"],
      "Roll an ab wheel forward from standing until the body extends into a long, near-horizontal line, then return to standing. Both hands stay on the wheel, the knees stay clear of the floor, and the trunk remains braced through the full rollout and return.",
      "3 controlled full standing rollouts and returns with knees clear",
      [
        reps(
          "Full standing ab-wheel rollout",
          "1–3",
          "Start standing with both hands on the wheel, roll forward while keeping the ribs down and pelvis tucked, and pull back to standing without resting the knees or letting the lower back arch.",
        ),
      ],
    ),
    define(
      "one-arm-ab-wheel",
      "One-Arm Ab Wheel",
      "core",
      "ab-wheel",
      10,
      "dynamic",
      ["full-ab-wheel", "one-arm-one-leg-plank"],
      ["ab-wheel"],
      "Perform a full standing ab-wheel rollout and return with one hand firmly gripping a wheel designed for one-hand use. Keep the free hand clear, both feet grounded, knees off the floor, and shoulders and pelvis square throughout the movement.",
      "2 controlled full standing rollouts on each arm with the free hand clear",
      [
        reps(
          "One-arm standing ab-wheel rollout",
          "1–2 per side",
          "Use an appropriate one-hand wheel, maintain a straight supporting elbow and firm trunk, and complete the rollout and return without twisting, using the free hand, or lowering the knees.",
        ),
      ],
    ),
    define(
      "dragon-press",
      "Dragon Press",
      "core",
      "dragon-flag",
      10,
      "static",
      ["hollow-body-hold", "full-front-lever"],
      ["floor"],
      "Lie face up and press both palms into the floor beside the hips with straight elbows to hold the hips and straight legs clear. Keep contact through the shoulders and upper back with the neck unloaded; the hands press into the floor rather than gripping an anchor behind the head.",
      "5-second low straight-body hold with both palms beside the hips",
      [
        hold(
          "Dragon press",
          "2–5 sec",
          "Press both palms down beside the hips, brace the abdomen and glutes, and suspend the hips and straight legs without arching or rolling onto the neck.",
        ),
      ],
    ),
    define(
      "one-arm-dragon-press",
      "One-Arm Dragon Press",
      "core",
      "dragon-flag",
      13,
      "static",
      ["dragon-press", "one-arm-front-lever"],
      ["floor"],
      "Hold a face-up dragon press with one straight arm pressing its palm into the floor beside the hip. The free hand stays clear, the shoulders and upper back remain supported, and the hips and straight legs stay lifted without an overhead anchor.",
      "3-second controlled hold on each arm with the free hand clear",
      [
        hold(
          "One-arm dragon press",
          "1–3 sec per side",
          "Transfer support from two palms to one while maintaining a firm body line and upper-back contact; release the free hand fully and lower before the pelvis twists or shoulder position fails.",
        ),
      ],
    ),
  ];
}
