# Calisthenics Skill Tree

A local-first application for personal use built with Next.js, TypeScript, React, Tailwind CSS, and React Flow. Explore **101 skills grouped into Pull, Push, Legs, and Core**: Pull 40, Push 37, Legs 13, and Core 11. No account, external database, API key, or backend service is needed.

## Run locally

Use Node.js 22 or later (the cloud workspace uses Node 24) and npm.

```sh
npm ci
npm run dev
```

The development server uses port 3000. To run a production build:

```sh
npm run build
npm start
```

All fonts are bundled locally; the app makes no external application requests. In the managed cloud workspace, if npm cannot write its default cache, append `--cache /workspace/.cache/npm` to installation commands.

## Features

- Pannable, zoomable dependency graph with four skill groups, named progression lanes, and optional progression filters. Mobile lists use the same families.
- Open or close the left menu with the navigation button in the top bar. Closing it on desktop gives the workspace more room. Mobile also has an in-menu close button, backdrop dismissal, and Escape support.
- Skill details with prerequisites, estimated difficulty, drills, example mastery criteria, equipment, unlock links, and reviewed reference links. Published source levels appear separately from app difficulty.
- Every skill description includes its target muscle groups, primary muscles, and secondary muscles. Primary muscles drive or hold the movement; secondary muscles assist and stabilize. These are qualitative movement-based descriptions, and roles can vary with technique or grip.
- Individually calibrated difficulty scores from 1 to 10, shown with five shared tiers: Foundation, Developing, Intermediate, Advanced, and Elite. Scores reflect the overall strength, balance, control, and mobility demands of each skill's benchmark.
- Dynamic/Static badges on every tree node, mobile skill card, and details panel. Static skills hold a position; dynamic skills move through repetitions.
- Click a skill to read its description and edit its Personal Record (for example, `25 seconds` or `12 reps + 10 kg`). Records save automatically, can be cleared, and stay intact when resetting skill progress.
- A **Practice log** workspace for dated entries with sets, repetitions per set, hold seconds per set, and notes. Use **Log practice** in skill details to preselect that skill. Edit or delete entries, filter history by skill, and see the best logged hold and repetition values. Logging remains independent of mastery and the editable Personal Record.
- An eight-week consistency chart counts distinct practice days in rolling seven-day windows. The latest seven days are compared with the previous seven days; multiple entries on one day count once. Dates follow the user's local calendar, including daylight-saving boundaries.
- Locked, available, training, and mastered states with labels and icons. Master every prerequisite in any one complete route to unlock a skill. Where alternatives exist, skill details show each route and its readiness; dashed tree edges indicate alternative prerequisites.
- Start training, mark mastery, and reset progress. Resetting a prerequisite clears dependent progress only when no complete alternative route remains.
- Multiple goals with highlighted, ordered prerequisite paths. Each step chooses one preparation route, includes its supporting prerequisites, deduplicates shared dependencies, and stops at mastered skills.
- Deterministic recommendations ranked by goal relevance, current training, supporting strength, and difficulty. Only available/training skills with compatible equipment are recommended.
- Exercise-specific equipment substitutions appear in skill details, with notes about grip, stability, clearance, and execution. Any complete listed setup qualifies for equipment filtering and recommendations. Bar-contact and ring-specific movements retain their required apparatus.
- Equipment filtering, completion statistics, category progress, training lists, and mastered-skill lists.
- A responsive mobile skill list and a keyboard-accessible details dialog. Desktop nodes are also keyboard accessible; use the zoom and fit controls or drag the canvas to explore.
- Progress, personal records, practice history, goals, and equipment stored under the existing `calisthenics-skill-tree:v1` localStorage key, with validation, recovery from corrupt data, and cross-tab updates. The profile schema is now version 2; version 1 profiles migrate automatically with an empty practice log while keeping their other data. Invalid log rows are discarded individually. If storage is blocked, the UI reports that data lasts for the current session.

The demo starts with eight mastered fundamentals, two skills in training, and goals for Tuck Planche, Tuck Front Lever, and Freestanding Handstand. Available equipment is floor, a fixed pull-up bar, and parallettes. Equipment changes do not erase historical mastery. Floor is always available; the Gym equipment option supplies a bar, dip bars, and parallettes, plus a secure bench for the dragon flag. Rings must be selected separately for ring skills.

The bar pulling progression is Pull-up → Chest-to-Bar Pull-up → Explosive Pull-up → High Pull-up → Muscle-up → Strict Muscle-up. Muscle-up also requires Straight-Bar Dip. Ring Muscle-up has an independent route through False-Grip Hang, Ring Pull-up, and Ring Dip.

The earlier researched reorganization added 34 movements and removed 10 assisted milestones plus one duplicate tuck-row entry. Highlights include L-Sit Pull-up, Pull Over, Archer/One-Arm Row, Tuck Front Lever Row, Diamond/Archer/One-Arm Push-up, Elbow Lever, Frog Stand to Handstand, Ring L-Sit Dip, Shrimp Squat, Nordic Curl, Tuck L-Sit, Toes-to-Bar, and Hanging Windshield Wiper. Back Lever, Maltese, Pelican Press, Hefesto, Iron Cross, and Dragon Squat remain in the catalog.

The latest additions are **90 Degree Hold**, a static bent-arm planche with the elbows unbraced against the abdomen, and **Pelican Planche**, a dynamic ring transition from planche to back lever and back to planche. Their estimated difficulties are 7/10 and 10/10 respectively. Existing skills are scored individually rather than multiplying their old ratings: Back Lever is 6/10, Full Front Lever 8/10, Full Planche 9/10, and Maltese 10/10.

Assisted, band, and wall milestones are excluded. Tuck/straddle shapes and unassisted eccentric negatives remain. Legs now has Pistol, Shrimp, Dragon Squat, and posterior-chain routes. The Dragon route uses unassisted pistol strength and reverse-lunge balance. Ring muscle-ups and floor L-sits no longer require unrelated bar skills.

See [progression research and route decisions](docs/progressions.md) for the reviewed sources, full route table, difficulty scale, and research limits. Research used accessible archived/community references; direct coaching sites were blocked by the cloud network proxy. App difficulty scores are estimates rather than universal grades, and published levels apply within their source's named progression. Body proportions and execution standards can change an athlete's personal ordering. Custom routes without published ratings are identified in skill details.

One-leg progression steps have been removed: One-Leg Front Lever, One-Leg Back Lever, One-Leg L-Sit, and Single-Leg Glute Bridge. Front/back levers now progress from advanced tuck directly to straddle; Tuck L-Sit leads directly to L-Sit, and Glute Bridge leads directly to Nordic Curl Negative. Saved progress and Personal Records for removed steps appear under **Overview → Previous skill records**. Their goals leave the active list; retained skills keep their saved progress and records.

Retained skill IDs and Personal Records stay intact. The old generic Front Lever Row described a tuck variation; its records are archived, and Full Front Lever Row has a new ID so old tuck records are not mislabeled. Removed milestone records and prior progress relocked by new prerequisites appear under **Overview → Previous skill records** and persist in the profile archive. The app does not grant mastery for new prerequisites automatically. Retired goals leave the active list; archived progress does not count toward tree completion.

Prerequisites within a route are all required; different complete routes are alternatives. Goal planning chooses one route at each step and includes all of that route's outstanding supporting dependencies. Standard routes win otherwise equal choices. On a filtered desktop tree, the initial viewport focuses on the goal path; pan or use Fit View to explore the rest of the progression. The graph includes every alternative route, while goal highlights show the planned route.

## Architecture

```text
src/
  app/                    Next.js entry points and Tailwind/global styles
  types/skill.ts          Skill, equipment, progress, and profile models
  data/skills.ts          Definitions, group labels, and derived reverse unlock links
  data/references.ts      Reviewed sources and published per-progression levels
  data/muscles.ts         Target, primary, and secondary muscles for each skill
  data/trainingOptions.ts Alternative preparation routes and equipment setups
  data/retiredSkills.ts   Names used to preserve removed milestone records
  lib/progression.ts      Skill states, equipment checks, and cascading resets
  lib/difficulty.ts       Shared 1–10 scale, tier labels, and explanatory text
  lib/graph.ts            Dependency paths, filtering, and graph layout
  lib/recommendations.ts  Pure deterministic recommendation rules
  lib/profile.ts          Demo profile and stored-data validation
  lib/practice.ts         Log validation, calendar dates, records, and trends
  hooks/useProgress.ts    React state and localStorage persistence
  components/             App shell and focused feature components
e2e/                      Browser interaction tests
```

The data and algorithms are independent of the React components. The UI derives availability and recommendations from the same rules tested by Vitest. React Flow renders the graph; custom layout logic separates the four groups into progression lanes and positions prerequisites above dependent skills.

## Add a skill

Add one `define(...)` entry to `src/data/skills.ts`. Use a unique, stable ID; choose `pull`, `push`, `legs`, or `core`; give the skill an individually estimated integer difficulty from 1 to 10 and a movement type (`dynamic` or `static`); and reference existing prerequisite IDs. Calibrate against the examples in [the difficulty scale](docs/progressions.md#difficulty-and-progression-levels), using the skill's actual execution standard rather than its prerequisite depth or a published family's level. Add a description, required equipment, a mastery benchmark, and practice exercises. For example:

```ts
define(
  "new-push-up-variation",
  "New Push-up Variation",
  "push",
  "fundamentals",
  3,
  "dynamic",
  ["push-up"],
  ["floor"],
  "Describe the unassisted movement and its execution standard.",
  "6 controlled repetitions on each side",
  [
    reps(
      "Archer push-ups",
      "4–6 per side",
      "Lower slowly and alternate sides.",
    ),
  ],
);
```

`progressionTo` is generated from prerequisites automatically. The new skill appears in the graph, search, goal selector, details, equipment checks, and completion metrics without UI changes. Add a new branch label/type only when the skill needs a new named progression. Update the intentional database-count assertion in the tests when expanding the catalog, and run tests to check missing references and cycles. Never rename a persisted skill ID casually: existing local progress and goals refer to it.

Add optional preparation routes and equipment setups by stable skill ID in `src/data/trainingOptions.ts`. Each route must list its full set of requirements, including shared foundations. Each setup must list its full equipment requirement and describe any execution differences. Reverse links and the tree include all routes; planning and unlocks use one complete route. Keep the union of alternative dependencies acyclic.

Add a matching entry in `src/data/muscles.ts` for every new skill ID, with a target muscle-group summary and nonempty primary and secondary muscle lists. Use the movement's actual form, including isometric support and stabilizers. The catalog rejects missing muscle profiles; keep retired skills out of the active muscle map.

## Validation

```sh
npm run lint
npm run typecheck
npm test
npm run build
```

Vitest covers prerequisite gating, alternative routes, unlock propagation, cascading resets, complete goal planning, exercise-specific equipment compatibility, recommendations, profile migration, practice validation, local-calendar arithmetic, consistency trends, group membership, and graph/data consistency.

To run the browser tests:

```sh
npx playwright install chromium
npm run test:e2e
```

The suite starts and stops its own dev server on port 3001, then checks skill unlocking and persistence, practice logging and trends, cross-tab updates, profile migration, alternative routes, equipment substitutions, goals, the dashboard, search, responsive navigation, dialogs, and corrupt-storage recovery. To use an existing server or a system Chromium installation:

```sh
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3000 \
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium \
npm run test:e2e
```

`npm run format` formats source and docs; `npm run format:check` checks formatting.

## Future improvements

1. Short technique videos, entry/exit demonstrations, and coaching cues.
2. Optional account-based synchronization and progress export/import.
3. Richer leg progressions, accessibility preferences, and saved graph views.

Progress currently stays in this browser and does not synchronize between devices. Clearing site data removes it. Mastery benchmarks are illustrative guides, not automatic assessments.
