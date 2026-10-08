import type { Og2Define, Og2Hold, Og2Reps } from "@/data/og2Skills";
import type { Skill } from "@/types/skill";

// The workbook levels and cells are attached centrally in overcomingGravity.ts.
export function getOneArmPushSkills(
  define: Og2Define,
  hold: Og2Hold,
  reps: Og2Reps,
): Skill[] {
  return [
    define(
      "one-arm-handstand",
      "Freestanding One-Arm Handstand",
      "push",
      "handstand",
      10,
      "static",
      ["freestanding-handstand"],
      ["floor"],
      "Balance inverted on one straight arm with the other hand completely clear of the floor. Transfer the body over the supporting hand while keeping the shoulder elevated; a finger-assisted or wall-assisted balance is a preparation drill rather than this freestanding milestone.",
      "5-second freestanding hold on each arm with the free hand clear",
      [
        hold(
          "Handstand lateral weight shifts",
          "5–10 sec per side",
          "From a stable two-hand balance, shift toward one arm while keeping the supporting shoulder tall; retain the other fingertips for preparation.",
        ),
        hold(
          "Freestanding one-arm handstand",
          "1–5 sec per side",
          "Release the free hand only after the hips are balanced over the supporting palm; use a practiced sideways exit.",
        ),
      ],
    ),
    define(
      "elevated-one-arm-push-up",
      "Hand-Elevated One-Arm Push-up",
      "push",
      "push-up",
      5,
      "dynamic",
      ["archer-push-up"],
      ["gym"],
      "Place the working hand on a secure raised bench or fixed support, with both feet on the floor and the free hand released. Lower the chest toward the support and press back without rotating the trunk. The hand elevation reduces the load; the feet are not elevated.",
      "5 controlled repetitions on each arm at a recorded support height",
      [
        reps(
          "Hand-elevated one-arm push-up",
          "3–5 per side",
          "Use a stable bench or securely fixed raised handle, brace the hips, and reduce the hand height only when the full repetition stays controlled.",
        ),
      ],
    ),
    define(
      "ring-straddle-one-arm-push-up",
      "Ring Straddle One-Arm Push-up",
      "push",
      "push-up",
      7,
      "dynamic",
      ["straddle-one-arm-push-up", "ring-push-up"],
      ["rings"],
      "Perform a one-arm push-up with the working hand gripping one low ring and both feet grounded in a wide straddle. Keep the free hand and unused ring clear, resist torso rotation, and control the independent handle through the descent and press.",
      "3 controlled repetitions on each arm with a wide foot stance",
      [
        reps(
          "Ring straddle one-arm push-up",
          "1–3 per side",
          "Set the working ring low, keep both legs straight and spread, and press without bracing the arm against its strap.",
        ),
      ],
    ),
    define(
      "ring-one-arm-push-up",
      "Ring Straight-Body One-Arm Push-up",
      "push",
      "push-up",
      9,
      "dynamic",
      ["ring-straddle-one-arm-push-up", "one-arm-push-up"],
      ["rings"],
      "Lower and press with one hand on a low ring while both grounded feet stay together and the body remains straight. Release the free hand, control the ring, and resist trunk rotation; this narrower straight-body milestone is separate from the ring straddle version.",
      "3 controlled repetitions on each arm with legs together",
      [
        reps(
          "Ring straight-body one-arm push-up",
          "1–3 per side",
          "Keep the legs together, the working ring below the shoulder, and the hips steady through the full descent and press.",
        ),
      ],
    ),
    define(
      "bent-body-one-arm-dip",
      "Side Bent-Body One-Arm Dip",
      "push",
      "one-arm-dip",
      7,
      "dynamic",
      ["dip", "l-sit"],
      ["dip-bars"],
      "Support the body sideways on one hand gripping a secure horizontal rail, with the free hand and feet clear. Use the workbook's bent-body shape by flexing at the hips, then bend and straighten the supporting elbow through a controlled range. This is a lateral one-hand dip, rather than a front-facing two-hand straight-bar dip.",
      "3 controlled bent-body side dips on each arm with feet clear",
      [
        hold(
          "Assisted lateral support preparation",
          "5–10 sec per side",
          "Use a secure rail that permits a sideways grip; keep foot assistance while learning the lateral support and bent-body balance.",
        ),
        reps(
          "Bent-body one-arm side dip",
          "1–3 per side",
          "Keep the hip bend and the free limbs clear, lower only as far as the supporting shoulder remains controlled, and press without leg drive.",
        ),
      ],
    ),
    define(
      "straight-body-one-arm-dip",
      "Side Straight-Body One-Arm Dip",
      "push",
      "one-arm-dip",
      9,
      "dynamic",
      ["bent-body-one-arm-dip"],
      ["dip-bars"],
      "Perform a lateral dip on one hand gripping a secure horizontal rail while keeping the hips and knees extended in a straight body line. Keep the free hand and feet clear throughout the controlled lowering and press; flexing at the hips returns to the bent-body progression.",
      "3 controlled straight-body side dips on each arm with feet clear",
      [
        reps(
          "Straight-body one-arm side dip",
          "1–3 per side",
          "Maintain the straight hip and knee position, keep the shoulder active, and use a controlled elbow range without twisting or pushing from the feet.",
        ),
      ],
    ),
    define(
      "straddle-one-arm-elbow-lever",
      "Straddle One-Arm Elbow Lever",
      "push",
      "handstand",
      7,
      "static",
      ["elbow-lever"],
      ["floor"],
      "Balance a horizontal body on one bent arm with the supporting elbow braced against the abdomen and both straight legs spread in a straddle. Keep the free hand and both feet clear. The elbow-to-torso contact distinguishes this balance from a straight-arm planche.",
      "5-second horizontal straddle hold on each arm",
      [
        hold(
          "Straddle one-arm elbow lever",
          "1–5 sec per side",
          "Establish the elbow brace, shift the trunk over the working hand, and lift both feet gradually while keeping the knees straight and legs spread.",
        ),
      ],
    ),
    define(
      "one-arm-elbow-lever",
      "Straight-Body One-Arm Elbow Lever",
      "push",
      "handstand",
      8,
      "static",
      ["straddle-one-arm-elbow-lever"],
      ["floor"],
      "Balance horizontally on one bent arm with the supporting elbow braced against the abdomen, hips extended, and straight legs together. Keep the free hand and feet clear; retaining the elbow brace makes this a one-arm elbow lever rather than a one-arm planche.",
      "5-second horizontal hold on each arm with legs together",
      [
        hold(
          "Straight-body one-arm elbow lever",
          "1–5 sec per side",
          "Bring the straight legs together from a controlled straddle balance without losing the elbow contact or letting the hips sag.",
        ),
      ],
    ),
    define(
      "one-arm-planche",
      "One-Arm Planche",
      "push",
      "planche",
      16,
      "static",
      ["full-planche", "one-arm-front-lever"],
      ["floor"],
      "Hold a horizontal straight-body planche on one straight arm with both feet and the free hand clear. Lean the supporting shoulder forward and control the trunk against rotation. The supporting elbow stays straight and does not brace against the abdomen, distinguishing this rare advanced milestone from an elbow lever.",
      "3-second horizontal straight-arm hold on each arm",
      [
        hold(
          "Assisted one-arm planche weight transfer",
          "3–5 sec per side",
          "From a controlled planche preparation, retain light free-hand support while learning unilateral loading; the assisted drill does not meet the milestone.",
        ),
        hold(
          "One-arm planche",
          "1–3 sec per side",
          "Release the free hand only with the working elbow straight and the body horizontal, keeping both legs straight and together.",
        ),
      ],
    ),
  ];
}
