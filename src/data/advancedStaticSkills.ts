import type { Og2Define, Og2Hold, Og2Reps } from "@/data/og2Skills";
import type { Skill } from "@/types/skill";

export function getAdvancedStaticSkills(
  define: Og2Define,
  hold: Og2Hold,
  reps: Og2Reps,
): Skill[] {
  return [
    define(
      "protracted-victorian-on-bars",
      "Protracted Victorian on Bars",
      "pull",
      "victorian",
      9,
      "static",
      ["full-front-lever", "dip"],
      ["dip-bars"],
      "Hold a face-up horizontal Victorian on secure parallel bars with the shoulder blades spread. The app represents the chart's bar variant with the forearms resting along the rails and hands gripping them; keep the upper back, hips, and feet clear. These contact details are an interpretation of the workbook's abbreviated label.",
      "3-second face-up horizontal hold with protracted shoulders and the body clear of the rails",
      [
        reps(
          "Foot-assisted Victorian entries",
          "1–3",
          "Begin with the feet supported and forearms settled on secure rails; gradually load the shoulders, then return to foot support without dropping into the arms.",
        ),
        hold(
          "Protracted Victorian on bars",
          "1–3 sec",
          "Keep the forearm support stable and shoulder blades spread while lifting the upper back, hips, and straight legs clear in one horizontal line.",
        ),
      ],
    ),
    define(
      "victorian-on-bars",
      "Victorian on Bars",
      "pull",
      "victorian",
      11,
      "static",
      ["protracted-victorian-on-bars", "dragon-press"],
      ["dip-bars"],
      "Hold a face-up horizontal body with forearms supported along secure parallel rails and the hands gripping them. Keep the shoulder blades controlled toward each other, rather than in the separate protracted variation, and suspend the upper back, hips, and feet. The app's forearm contact and shoulder-position details adapt the chart label rather than reproduce a demonstrated workbook technique.",
      "3-second face-up horizontal hold with controlled shoulders and the upper back clear",
      [
        hold(
          "Victorian on bars",
          "1–3 sec",
          "Settle both forearms on the rails, control the shoulder blades toward each other, and keep the hips and straight legs level without resting the torso on the bars.",
        ),
      ],
    ),
    define(
      "wide-victorian-on-bars",
      "Wide Victorian on Bars",
      "pull",
      "victorian",
      13,
      "static",
      ["victorian-on-bars"],
      ["dip-bars"],
      "Hold a face-up horizontal Victorian on parallel rails spaced wider than the standard bar setup. The app keeps both forearms supported and hands gripping the rails while the upper back, hips, and feet remain clear. Increase support width only within active shoulder control; the workbook supplies no exact width or detailed contact instructions.",
      "3-second horizontal hold at a recorded wider rail spacing",
      [
        hold(
          "Wide Victorian on bars",
          "1–3 sec",
          "Use securely fixed wider rails, record their spacing, and keep the same straight body line and controlled shoulder position as the standard bar hold.",
        ),
      ],
    ),
    define(
      "floor-victorian-one-forearm",
      "Floor Victorian on One Forearm",
      "pull",
      "victorian",
      14,
      "static",
      ["wide-victorian-on-bars"],
      ["floor"],
      "Hold a face-up horizontal body clear of the floor using one forearm and the opposite palm for support. This mixed forearm-and-palm contact is the app's explicit interpretation of the workbook's ambiguous 'floor VC one forearm' label; it is not an unsupported one-arm hold. Keep the upper back, hips, and feet lifted and train both contact arrangements.",
      "3-second horizontal mixed-support hold on each side with the upper back clear",
      [
        hold(
          "Mixed-support floor Victorian preparation",
          "3–5 sec per side",
          "Keep foot assistance while setting one forearm and the opposite palm alongside the torso; load both contacts gradually without twisting the shoulders or pelvis.",
        ),
        hold(
          "Floor Victorian on one forearm",
          "1–3 sec per side",
          "Press through the working forearm and opposite palm, keep the opposite elbow straight, and lift the upper back, hips, and both straight legs together.",
        ),
      ],
    ),
    define(
      "floor-victorian-forearms",
      "Floor Victorian on Forearms",
      "pull",
      "victorian",
      16,
      "static",
      ["wide-victorian-on-bars"],
      ["floor"],
      "Support a face-up horizontal body through both forearms on the floor while keeping the upper back, hips, and feet clear. Maintain straight hips and knees with the legs together. The contact arrangement is an app adaptation of the workbook label, and this two-forearm milestone has its own route rather than requiring the ambiguous one-forearm variant.",
      "3-second horizontal hold with only both forearms supporting the body",
      [
        hold(
          "Floor Victorian on forearms",
          "1–3 sec",
          "Set both forearms alongside the torso, press into the floor, and lift the upper back, hips, and straight legs clear without rocking onto the shoulders.",
        ),
      ],
    ),
    define(
      "floor-victorian-straight-arms",
      "Straight-Arm Floor Victorian",
      "pull",
      "victorian",
      17,
      "static",
      ["floor-victorian-forearms"],
      ["floor"],
      "Hold a face-up horizontal body above the floor with both palms supporting the body and both elbows straight. Keep the forearms, upper back, hips, and feet clear; upper-back contact belongs to the separate Dragon Press. Hand placement and entry cues are app adaptations because the workbook names the straight-arm form without demonstrating its setup.",
      "2-second horizontal hold on both palms with straight elbows and the body clear",
      [
        hold(
          "Foot-assisted straight-arm floor support",
          "3–5 sec",
          "With the feet supported, choose palm positions alongside the torso that permit straight elbows and active shoulder support; gradually reduce assistance without forcing the shoulder angle.",
        ),
        hold(
          "Straight-arm floor Victorian",
          "1–2 sec",
          "Press through both palms with the elbows straight, hold the upper back and legs clear, and lower deliberately before shoulder control or the horizontal line fails.",
        ),
      ],
    ),
    define(
      "wide-grip-front-lever",
      "Wide-Grip Front Lever",
      "pull",
      "front-lever",
      12,
      "static",
      ["full-front-lever"],
      ["pull-up-bar"],
      "Hold a full face-up front lever on one fixed bar with both hands well beyond shoulder width. Keep both elbows straight, the legs together, and the shoulders, hips, and feet in a horizontal line. Record the grip width and preserve the full body shape as you widen the hands.",
      "5-second full horizontal hold at a recorded wide grip with straight elbows",
      [
        hold(
          "Gradual front-lever grip-width increases",
          "3–5 sec",
          "Begin at a width where a full front lever stays controlled, widen the hands gradually, and keep the same horizontal body line with the hips clear of the bar.",
        ),
        hold(
          "Wide-grip front lever",
          "3–5 sec",
          "Hold with the hands well beyond shoulder width, legs straight and together, and elbows straight; return to a controlled hang before the hips drop.",
        ),
      ],
    ),
    define(
      "straight-arm-touch",
      "Straight Arm Touch (SAT)",
      "pull",
      "front-lever",
      16,
      "static",
      ["wide-grip-front-lever"],
      ["pull-up-bar"],
      "Hold a face-up horizontal straight body on one fixed bar with an ultra-wide grip, both elbows straight, and the hips touching the bar. Keep the legs straight and together and maintain actual hip-to-bar contact without turning the hold into a bent-arm row or an angled lever. Prepare through a strict Wide-Grip Front Lever.",
      "3-second horizontal hip-to-bar hold with an ultra-wide grip and straight elbows",
      [
        hold(
          "Wide-grip full front-lever preparation",
          "3–5 sec",
          "Build a controlled wide-grip horizontal lever on the fixed bar with straight elbows; increase grip width gradually while keeping the hips and legs in line.",
        ),
        hold(
          "Straight Arm Touch",
          "1–3 sec",
          "Use a secure bar with room for the ultra-wide grip, lift the hips to actual bar contact, and keep both elbows straight and the body horizontal throughout.",
        ),
      ],
    ),
  ];
}
