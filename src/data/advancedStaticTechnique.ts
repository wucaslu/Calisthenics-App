import type { TechniqueGuidance, TechniqueSource } from "@/types/skill";

export const advancedStaticTechniqueSources: Record<string, TechniqueSource> = {
  "advanced-statics-catalog": {
    title:
      "Community skill catalog · Straight Arm Touch and Victorian definitions",
    url: "https://raw.githubusercontent.com/G0RB-SMG/Calisthenics-Skill-Tree/0217535ccb58ec5ee897e3c852afef99724f3282/skills.js",
  },
};

const horizontalBody =
  "Keep the body face up with hips and knees extended, legs together, and the torso and legs approximately horizontal.";
const suspendedBody =
  "Keep the upper back, hips, and both feet clear; upper-back contact changes this support into a Dragon Press.";
const barScope =
  "The workbook names the bar variant but does not demonstrate its contacts. Forearms resting on the rails and the shoulder-position cues are the app's interpretation, adapted from the linked Victorian definition, front-lever tension, and body-position instructions. The catalog demonstrates the ring definition rather than this bar variation.";

function barVictorian(protracted: boolean, wide = false): TechniqueGuidance {
  return {
    setup: [
      wide
        ? "Use securely fixed parallel rails spaced wider than your standard Victorian setup; record their spacing and retain foot assistance while testing the wider shoulder position."
        : "Use secure parallel rails with enough length for both forearms to rest along them and room for the body to extend face up; establish the contacts with the feet supported.",
      "Grip each rail with its own hand, settle both forearms on the rails, and keep the torso free of the supports.",
    ],
    cues: [
      horizontalBody,
      protracted
        ? "Actively spread the shoulder blades while maintaining the forearm contacts; protraction is the distinguishing shoulder shape for this entry."
        : "Control the shoulder blades toward each other without shrugging or using a large back arch to lift the body.",
      suspendedBody,
      "Maintain stable forearm support and steady pressure through both rails; return to foot support deliberately before the body line or shoulder control fails.",
    ],
    mistakes: [
      protracted
        ? "Pulling the shoulder blades together and losing the specified protracted shape."
        : "Letting the shoulders roll forward into the separate protracted variation.",
      "Resting the upper back or hips on a rail, bending the knees, or touching the feet down during the claimed hold.",
      wide
        ? "Using standard rail spacing or forcing a width beyond active shoulder control."
        : "Swinging into the position or dropping abruptly onto the forearms.",
    ],
    sources: ["advanced-statics-catalog", "pull-rr-row", "core-positioning"],
    sourceScope: barScope,
  };
}

function floorVictorian(mixed: boolean, straight = false): TechniqueGuidance {
  return {
    setup: [
      straight
        ? "Use a firm non-slip floor and begin with foot assistance; position both palms alongside the torso at a hand angle that permits straight elbows and controlled shoulders."
        : mixed
          ? "On a firm non-slip floor, set one forearm alongside the torso and the opposite palm on the floor; begin with foot assistance and keep the opposite elbow straight."
          : "On a firm non-slip floor, set both forearms alongside the torso with the elbows bent; retain foot assistance while establishing active shoulder support.",
    ],
    cues: [
      horizontalBody,
      straight
        ? "Press through both palms and keep both elbows straight; the forearms do not take weight on the floor."
        : mixed
          ? "Press through the working forearm and opposite palm together; both arms participate, so this is not an unsupported one-arm Victorian."
          : "Press through both forearms and maintain their contacts without rocking the torso onto the shoulders.",
      suspendedBody,
      mixed
        ? "Resist rotation through the shoulders and pelvis, then lower deliberately and practice the opposite forearm-and-palm arrangement."
        : "Brace the abdomen and glutes and lower deliberately before the shoulders or body line lose control.",
    ],
    mistakes: [
      "Leaving the upper back, hips, or feet resting on the floor while counting a suspended hold.",
      straight
        ? "Bending either elbow or letting a forearm take weight to return to the forearm variant."
        : mixed
          ? "Removing the opposite palm, changing the support arrangement, or twisting the pelvis to gain height."
          : "Lifting a forearm or rolling onto the upper back instead of maintaining both forearm contacts.",
      "Piking the hips, spreading or bending the legs, or forcing shoulder positions that cannot be actively maintained.",
    ],
    sources: ["advanced-statics-catalog", "pull-rr-row", "core-positioning"],
    sourceScope: mixed
      ? "The workbook's 'floor VC one forearm' label does not specify the opposite contact. The app interprets it as one forearm plus the opposite palm, not a one-arm hold. Setup and cues adapt the linked Victorian definition and body-position instructions; the sources do not demonstrate this mixed-support floor form."
      : "The workbook names this floor variant without demonstrating its setup. The contact, entry, and bracing cues adapt the linked Victorian definition and body-position instructions; the catalog defines a ring Victorian rather than this exact floor form.",
  };
}

export const advancedStaticTechnique: Record<string, TechniqueGuidance> = {
  "protracted-victorian-on-bars": barVictorian(true),
  "victorian-on-bars": barVictorian(false),
  "wide-victorian-on-bars": barVictorian(false, true),
  "floor-victorian-one-forearm": floorVictorian(true),
  "floor-victorian-forearms": floorVictorian(false),
  "floor-victorian-straight-arms": floorVictorian(false, true),
  "straight-arm-touch": {
    setup: [
      "Use a securely mounted fixed bar long enough for an ultra-wide grip, with a clear entry and exit area; establish controlled wide-grip front-lever loading before seeking hip contact.",
    ],
    cues: [
      "Place the hands well beyond shoulder width at a grip you have gradually prepared and can actively control.",
      "Keep both elbows straight and hold the body face up and horizontal, with hips and knees extended and legs together.",
      "Lift the hips to actual contact with the bar while keeping the body horizontal; do not replace the hold with a bent-arm front-lever pull-up.",
      "Maintain steady shoulder and trunk tension, then leave the hip-to-bar position under control before the elbows bend or the hips fall away.",
    ],
    mistakes: [
      "Using a narrow grip, bending the elbows, or counting a normal front-lever hip touch as the ultra-wide Straight Arm Touch.",
      "Holding the body at an upward angle, folding at the hips, or stopping short of hip-to-bar contact.",
      "Swinging into contact or abruptly widening the grip beyond controlled shoulder loading.",
    ],
    sources: ["advanced-statics-catalog", "pull-rr-row", "core-positioning"],
    sourceScope:
      "The pinned community catalog directly defines SAT as a face-up horizontal ultra-wide-grip fixed-bar hold with straight arms and hips touching the bar. Entry, exit, and preparation cues adapt the linked front-lever and body-position instructions. The app's level 16 and route from wide bar Victorian plus full front lever are estimates, rather than workbook mappings or the catalog's ring-Victorian prerequisite.",
  },
};
