import { OG2_REFERENCE_URL, og2Levels } from "@/data/overcomingGravity";

/** The uploaded OG2 workbook was reviewed on 2026-10-07.
 * Earlier pinned community references remain supplementary movement references.
 * See docs/progressions.md for source scope, exact cells, and custom routes.
 */
export const researchSources: Record<string, { title: string; url: string }> = {
  og2: {
    title: "Overcoming Gravity 2nd Edition · uploaded exercise chart",
    url: OG2_REFERENCE_URL,
  },
  routine: {
    title: "Recommended Routine · archived exercise levels",
    url: "https://github.com/mazurio/bodyweight-fitness-android/blob/19806813ff36b6c52d1b59e2731f731f05913a54/app/src/main/res/raw/bodyweight_fitness_recommended_routine.json",
  },
  chart: {
    title: "Start Bodyweight · community-adapted chart",
    url: "https://github.com/AlexSchwamle/CustomizedCalisthenicsChart/blob/eb52b4b3030a97c96fcee995a51d742004ec57d5/CurrentRoutine.png",
  },
  levers: {
    title: "Strong Journal · community progression catalog",
    url: "https://github.com/mmaksi/overcoming-gravity/blob/a4cbf1ba12af8df956e8b267f344cd1f97fc5abf/src/lib/data/seed.ts",
  },
  statics: {
    title: "Training catalog · advanced static skills",
    url: "https://github.com/nobody-qwert/training/blob/234166a762f0a3d474be55e1d3c6013b4f1cb2a8/all_exercises_data.js",
  },
  pelican: {
    title: "Community skill catalog · Pelican transition",
    url: "https://github.com/G0RB-SMG/Calisthenics-Skill-Tree/blob/0217535ccb58ec5ee897e3c852afef99724f3282/skills.js",
  },
  sat: {
    title: "Community skill catalog · Straight Arm Touch",
    url: "https://github.com/G0RB-SMG/Calisthenics-Skill-Tree/blob/0217535ccb58ec5ee897e3c852afef99724f3282/skills.js",
  },
};

export const skillReferences: Record<
  string,
  { sources: string[]; level?: string }
> = {};
function reference(ids: string[], sources: string[]) {
  for (const id of ids) skillReferences[id] = { sources };
}
reference(
  [
    "dead-hang",
    "scapular-pull-up",
    "scapular-push-up",
    "hollow-body-hold",
    "arch-body-hold",
    "push-up",
    "dip",
    "inverted-row",
    "pull-up",
    "ring-support-hold",
    "rings-turned-out-support",
    "ring-push-up",
    "ring-dip",
    "bodyweight-squat",
    "pull-up-negative",
    "l-sit-pull-up",
    "pull-over",
    "diamond-push-up",
    "rings-turned-out-push-up",
    "ring-l-sit-dip",
    "deep-step-up",
    "tuck-l-sit",
    "l-sit",
    "tuck-front-lever-row",
    "advanced-tuck-front-lever-row",
    "tuck-ice-cream-maker",
  ],
  ["routine"],
);
reference(
  [
    "pike-push-up",
    "pike-hold",
    "frog-stand",
    "freestanding-handstand",
    "handstand-push-up",
    "chest-to-bar-pull-up",
    "high-pull-up",
    "muscle-up",
    "hanging-knee-raise",
    "hanging-leg-raise",
    "pistol-squat",
    "chin-up",
    "archer-pull-up",
    "one-arm-pull-up-negative",
    "one-arm-pull-up",
    "archer-row",
    "archer-push-up",
    "one-arm-push-up",
    "decline-pike-push-up",
    "elbow-lever",
    "frog-stand-to-handstand",
    "shrimp-squat",
    "advanced-shrimp-squat",
    "toes-to-bar",
    "hanging-windshield-wiper",
    "dragon-flag",
    "full-front-lever-row",
  ],
  ["chart"],
);
reference(
  [
    "planche-lean",
    "tuck-planche",
    "advanced-tuck-planche",
    "straddle-planche",
    "tuck-front-lever",
    "advanced-tuck-front-lever",
    "straddle-front-lever",
    "full-front-lever",
    "german-hang",
    "tuck-back-lever",
    "advanced-tuck-back-lever",
    "straddle-back-lever",
    "back-lever",
    "one-arm-row",
    "glute-bridge",
    "nordic-curl-negative",
    "nordic-curl",
  ],
  ["levers"],
);
reference(["full-planche", "iron-cross", "maltese", "v-sit"], ["statics"]);
reference(["pelican-planche"], ["pelican"]);
reference(["straight-arm-touch"], ["sat"]);

// Chart levels now drive the main level score. Unlisted skills remain estimates.
for (const [id, entry] of Object.entries(og2Levels)) {
  const existing = skillReferences[id]?.sources ?? [];
  const label =
    entry.kind === "book" ? "OG2 book chart" : "Community extension";
  skillReferences[id] = {
    sources: [...new Set(["og2", ...existing])],
    level: `${label} · Level ${entry.level} · ${entry.cell} (${entry.name})${entry.variant ? ` · ${entry.variant}` : ""}`,
  };
}
