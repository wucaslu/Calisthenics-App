import type { EquipmentSetup, PrerequisiteRoute, Skill } from "@/types/skill";

// These are app preparation routes, rather than universal strength standards.
// Each route is a complete AND group; separate routes are alternatives (OR).
export const alternativeRoutes: Record<string, PrerequisiteRoute[]> = {
  "tuck-front-lever": [
    {
      id: "chin-up-foundation",
      label: "Chin-up foundation",
      description:
        "Use strict underhand pulling as your strength preparation. Hollow-body tension and straight-arm scapular control remain required for the lever.",
      prerequisites: ["chin-up", "hollow-body-hold", "scapular-pull-up"],
    },
    {
      id: "ring-pulling-foundation",
      label: "Ring pulling foundation",
      description:
        "Prepare with controlled ring pull-ups, then practice the lever on suitable rings or a bar. Keep the same hollow-body and straight-arm shoulder foundations.",
      prerequisites: ["ring-pull-up", "hollow-body-hold", "scapular-pull-up"],
    },
  ],
  "archer-pull-up": [
    {
      id: "ring-pulling-foundation",
      label: "Ring pulling foundation",
      description:
        "Build full-range pulling on rings before introducing asymmetric archer pulls. This route changes the preparation, while the archer movement still uses both hands.",
      prerequisites: ["ring-pull-up"],
    },
  ],
  "tuck-ice-cream-maker": [
    {
      id: "chin-up-transition",
      label: "Chin-up transition",
      description:
        "Combine an established tuck front lever with strict chin-up strength. Practice the bent-arm-to-straight-arm transition without swinging or losing the tuck.",
      prerequisites: ["tuck-front-lever", "chin-up"],
    },
  ],
  "handstand-push-up": [
    {
      id: "freestanding-press",
      label: "Freestanding press preparation",
      description:
        "Use a controlled frog-stand press as a floor-based strength route. Independent handstand balance remains required; build the handstand push-up's own lowering and pressing range gradually.",
      prerequisites: ["freestanding-handstand", "frog-stand-to-handstand"],
    },
  ],
  "ring-dip": [
    {
      id: "ring-and-floor-pressing",
      label: "Ring and floor pressing",
      description:
        "Prepare with close-hand floor pressing and controlled ring push-ups when parallel bars are unavailable. Turned-out ring support remains required; develop the dip's distinct vertical pressing range on rings.",
      prerequisites: [
        "diamond-push-up",
        "ring-push-up",
        "rings-turned-out-support",
      ],
    },
  ],
  "pistol-squat-negative": [
    {
      id: "shrimp-squat-foundation",
      label: "Shrimp squat foundation",
      description:
        "Use an unassisted shrimp squat to build single-leg strength without an elevated step. Practice the pistol's forward free-leg position and controlled descent separately.",
      prerequisites: ["shrimp-squat"],
    },
  ],
};

export const equipmentSetups: Record<string, EquipmentSetup[]> = {};

function addSetup(ids: string[], setup: EquipmentSetup) {
  for (const id of ids) {
    equipmentSetups[id] ??= [];
    equipmentSetups[id].push({ ...setup, equipment: [...setup.equipment] });
  }
}

addSetup(
  [
    "planche-lean",
    "pseudo-planche-push-up",
    "frog-stand",
    "tuck-planche",
    "advanced-tuck-planche",
    "straddle-planche",
    "full-planche",
    "90-degree-hold",
    "pike-hold",
    "pike-push-up",
    "freestanding-handstand",
    "handstand-push-up",
    "elbow-lever",
    "frog-stand-to-handstand",
  ],
  {
    id: "parallettes",
    label: "Parallettes",
    equipment: ["parallettes"],
    description:
      "Use stable, load-rated parallettes with room for a controlled exit. The neutral grip changes wrist loading; preserve the skill's body position and controlled range rather than adding depth automatically.",
  },
);

addSetup(["tuck-planche-push-up"], {
  id: "floor",
  label: "Floor",
  equipment: ["floor"],
  description:
    "Use firm, level ground with room for a controlled exit. Keep both feet suspended and maintain the tuck and forward shoulder position through the bent-arm range; the floor limits depth compared with parallettes.",
});

addSetup(["tuck-l-sit", "l-sit", "v-sit"], {
  id: "floor",
  label: "Floor",
  equipment: ["floor"],
  description:
    "Use firm, level ground and keep both feet clear throughout the skill. Less hand clearance increases the compression and wrist demands; this is the full movement, without resting the legs on the floor.",
});

addSetup(["tuck-l-sit", "l-sit", "v-sit"], {
  id: "dip-bars",
  label: "Dip bars",
  equipment: ["dip-bars"],
  description:
    "Use stable parallel bars for straight-arm support, with enough space for both legs. Extra hand clearance changes the setup, while the suspended body position and leg-height target stay the same.",
});

addSetup(
  [
    "dead-hang",
    "scapular-pull-up",
    "pull-up",
    "pull-up-negative",
    "chin-up",
    "l-sit-pull-up",
    "archer-pull-up",
    "typewriter-pull-up",
    "one-arm-pull-up-negative",
    "one-arm-pull-up",
    "tuck-front-lever",
    "advanced-tuck-front-lever",
    "straddle-front-lever",
    "full-front-lever",
    "front-lever-raise",
    "full-front-lever-row",
    "tuck-front-lever-row",
    "advanced-tuck-front-lever-row",
    "tuck-ice-cream-maker",
    "hanging-knee-raise",
    "hanging-leg-raise",
  ],
  {
    id: "rings",
    label: "Rings",
    equipment: ["rings"],
    description:
      "Hang from securely mounted, load-rated rings with clear space underneath. Keep the named grip and body shape; independent handles add stability demands. This does not substitute for a bar-contact movement or a ring-specific milestone.",
  },
);

addSetup(
  [
    "skin-the-cat",
    "german-hang",
    "tuck-back-lever",
    "advanced-tuck-back-lever",
    "straddle-back-lever",
    "back-lever",
  ],
  {
    id: "fixed-bar",
    label: "Fixed bar",
    equipment: ["pull-up-bar"],
    description:
      "Use a securely fixed bar with clearance for the entire rotation and lever. A fixed grip cannot rotate like rings, so enter and exit under control and use only a comfortable shoulder-extension range.",
  },
);

addSetup(["inverted-row"], {
  id: "low-fixed-bar",
  label: "Low fixed bar",
  equipment: ["dip-bars"],
  description:
    "Use a fixed, load-rated parallel bar low enough to row underneath with feet grounded. Match the body angle and full pulling range; a high pull-up bar alone is not a suitable row setup.",
});

export function getPrerequisiteRoutes(skill: Skill): PrerequisiteRoute[] {
  return [
    {
      id: "standard",
      label: "Standard preparation",
      description:
        "Complete every skill in this preparation route. Routes suggest training foundations; mastery of the target skill is recorded separately.",
      prerequisites: skill.prerequisites,
    },
    ...(skill.alternativeRoutes ?? []),
  ];
}

export function getPrerequisiteIds(skill: Skill): string[] {
  return [
    ...new Set(
      getPrerequisiteRoutes(skill).flatMap((route) => route.prerequisites),
    ),
  ];
}

export function getEquipmentSetups(skill: Skill): EquipmentSetup[] {
  return [
    {
      id: "standard",
      label: "Standard setup",
      description: "Use the apparatus and execution described for this skill.",
      equipment: skill.equipment,
    },
    ...(skill.equipmentSetups ?? []),
  ];
}
