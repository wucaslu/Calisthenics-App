# Calisthenics Skill Tree

A local-first application for personal use built with Next.js, TypeScript, React, Tailwind CSS, and React Flow. Explore **139 skills grouped into Pull, Push, Legs, and Core**: Pull 46, Push 57, Legs 13, and Core 23. No account, external database, API key, or backend service is needed.

## Windows desktop app

The app can run as a portable **Windows 64-bit `.exe`**. Download the **Calisthenics-Skill-Tree-Windows** artifact from the latest successful [Windows desktop app workflow](https://github.com/wucaslu/Calisthenics-App/actions/workflows/windows-desktop.yml), unzip it, and double-click **Calisthenics-Skill-Tree-0.2.1-Windows.exe**. No Node.js installation, terminal, local server, or administrator access is required to use it. GitHub requires you to sign in to download workflow artifacts.

Desktop builds run manually through **Run workflow** and only when a desktop update is requested. Pushing web changes does not rebuild the executable. Light mode, the Available only filter, automatic practice records, record history, and the weekly schedule are currently web/source features awaiting a requested desktop update. Desktop v0.2.1 does not preserve weekly schedules from newer profile backups; keep the original JSON backup when transferring to that version.

The skill tree, records, practice log, and analytics work offline. Reference links open in your usual browser. Desktop progress saves in `%APPDATA%\Calisthenics Skill Tree`, independently of the executable's location, so replacing the executable keeps your profile. Browser and desktop storage are separate.

To transfer existing records, open **Overview → Profile backup → Export JSON** in the browser app. In the desktop app, open the same panel and choose **Import JSON**. Import validates the backup and asks before replacing that app's current profile. Export also provides a backup of your practice history and archived records.

For developers, build the executable on Windows with Node.js 22.12 or later:

```sh
npm ci
npm run desktop:package
```

The executable appears in `dist-desktop/`. Use `npm run desktop:start` to build and open the desktop app during development. `npm run desktop:build` generates static files in `out/`; normal web development and production commands remain available. The GitHub workflow builds the executable on Windows, runs the desktop checks against its unpacked executable, and uploads the portable download.

The executable is not code-signed. Signing requires a Windows signing certificate; the repository does not include one. Linux cross-builds skip Windows executable resource editing; Windows CI enables it to apply the app's icon and version metadata.

## Run locally

Use Node.js 22.12 or later (the cloud workspace uses Node 24) and npm.

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
- Switch between dark and **Light mode** with the sun/moon button in the top bar. Light mode keeps the blue accents with pale backgrounds and dark text across the tree, skill details, practice log, and analytics. The choice saves separately from training data, applies before the page paints, and synchronizes across browser tabs. When storage is unavailable, the toggle still works for the current window.
- Enable **Available only** in the tree toolbar to show available, training, and mastered skills and hide locked skills. This combines with group, progression, search, and Max level; counts, graph edges, goal highlights, and the mobile list follow the same filtered set. Starting training or marking mastery keeps the skill and its details visible, and mastery reveals newly unlocked skills immediately. Resetting a prerequisite hides descendants that become locked while keeping the ready prerequisite visible. The filter stays active across workspace navigation and resets on reload; it does not change saved records or progress.
- Choose **Max level** in the tree toolbar to show only skills at or below a difficulty from 1 to 17. Higher-level skills and prerequisite nodes are hidden on desktop and mobile; group, branch, search, and goal highlights respect the cutoff. **All levels (1–17)** restores the full view. The filter stays active while navigating the workspace, and a page reload restores the default full view.
- Open or close the left menu with the navigation button in the top bar. Closing it on desktop gives the workspace more room. Mobile also has an in-menu close button, backdrop dismissal, and Escape support.
- Skill details with prerequisites, difficulty, drills, example mastery criteria, equipment, unlock links, and reviewed reference links. Matched levels include the workbook's exact source cell; unmatched skills are labeled app estimates.
- Every skill description includes its target muscle groups, primary muscles, and secondary muscles. Primary muscles drive or hold the movement; secondary muscles assist and stabilize. These are qualitative movement-based descriptions, and roles can vary with technique or grip.
- Difficulty levels from 1 to 17 with four tiers: Beginner (1–5), Intermediate (6–9), Advanced (10–13), and Elite (14–17). Of the 139 skills, 97 match workbook levels: 83 are labeled **OG2 book** and 14 **Community chart**. The remaining 42 show **App estimate**.
- Dynamic/Static badges on every tree node, mobile skill card, and details panel. Static skills hold a position; dynamic skills move through repetitions.
- Click a skill to read its description and edit its Personal Record (for example, `25 seconds` or `12 reps + 10 kg`). Records save automatically and stay intact when resetting skill progress. **Use logged best** restores the best practice values after a manual edit; skills without logged records have a Clear button.
- A **Practice log** workspace for dated entries with sets, repetitions per set, hold seconds per set, and notes. Use **Log practice** in skill details to preselect that skill. Saving or editing an entry replaces its skill's Personal Record with the best logged repetitions and hold duration, tracked independently per set (for example, `12 reps · 5 sec hold`). Lower performances do not reduce a record while its best entry remains. Editing or deleting the best entry recalculates the record from the remaining history; deleting the final entry clears it. Changing an entry's skill updates both skills. Logging leaves mastery unchanged.
- **Weekly schedule** adds a repeating Monday–Sunday training plan. Choose a day, find a skill, and select **Add to schedule**. Choices include available, training, and mastered skills with a compatible equipment setup; locked skills and missing equipment are excluded. Each day can hold several skills, the same skill can appear on different days, and empty days display Rest day. Remove individual assignments, open skill details, or use a practice shortcut to preselect that skill without creating a log entry. Planned skills stay visible with an unavailable reason if prerequisites or equipment change. The plan saves across reloads and browser tabs and is included in JSON profile backups.
- **Schedule suggestions** use your goals, unlocked skills, and compatible equipment to propose training days. Choose weekdays and the number of suggested skills per day, then select **Generate suggestions** to preview the choices and their reasons. Ready steps toward your goals take priority, with current training, supporting skills, and foundations filling the remaining choices. With no active goals, the generator suggests a mix of foundations and maintenance. **Add suggestions to schedule** keeps existing assignments and adds eligible suggestions without duplicates. Changes to goals, progress, equipment, or generator settings require a new preview. Generating or applying a plan does not create practice entries or change progress and records.
- An eight-week consistency chart counts distinct practice days in rolling seven-day windows. The latest seven days are compared with the previous seven days; multiple entries on one day count once. Dates follow the user's local calendar, including daylight-saving boundaries.
- **Analytics** adds calendar-week (Monday–Sunday) and calendar-month summaries, previous/next period navigation, and an all-skills or individual-skill filter. Open it from the menu or **Weekly & monthly analytics** in the practice log. It shows practice days and consistency, logged entries, sets, total repetitions, total hold time, daily volume charts, group totals, and per-skill bests. Repetition and hold-time volume multiply the per-set values by the number of sets; bests remain per set.
- **Personal record history** in Analytics shows each skill's best repetitions or hold duration over the selected week/month, with a chart and dated improvement history. Earlier bests carry into later periods; ties and lower performances are not new records. Same-day improvements share one date, and backdated entries, edits, and deletions rebuild the history. Records stay separate by skill and metric. Manual text has no practice date and is excluded from the timeline.
- Analytics compares a current partial period with the same elapsed days in the previous period, capped at the previous month's length. Completed historical periods compare with the full previous period. Both comparison ranges and day counts are shown; months retain their actual lengths, including leap years. Viewing analytics leaves stored data unchanged.
- Locked, available, training, and mastered states with labels and icons. Master every prerequisite in any one complete route to unlock a skill. Where alternatives exist, skill details show each route and its readiness; dashed tree edges indicate alternative prerequisites.
- Start training, mark mastery, and reset progress. Resetting a prerequisite clears dependent progress only when no complete alternative route remains.
- Multiple goals with highlighted, ordered prerequisite paths. Each step chooses one preparation route, includes its supporting prerequisites, deduplicates shared dependencies, and stops at mastered skills.
- Deterministic recommendations ranked by goal relevance, current training, supporting strength, and difficulty. Only available/training skills with compatible equipment are recommended.
- Exercise-specific equipment substitutions appear in skill details, with notes about grip, stability, clearance, and execution. Any complete listed setup qualifies for equipment filtering and recommendations. Bar-contact and ring-specific movements retain their required apparatus.
- Equipment filtering, completion statistics, category progress, training lists, and mastered-skill lists.
- A responsive mobile skill list and a keyboard-accessible details dialog. Desktop nodes are also keyboard accessible; use the zoom and fit controls or drag the canvas to explore.
- Progress, personal records, practice history, weekly schedule, goals, and equipment stored under the existing `calisthenics-skill-tree:v1` localStorage key, with validation, recovery from corrupt data, and cross-tab updates. The profile schema remains version 2; the schedule is an optional field, so old profiles open with an empty week. Version 1 profiles migrate automatically with an empty practice log while keeping their other data. Existing valid logs fill missing Personal Records on load; nonempty stored records remain until a practice entry is saved or edited. Invalid log rows are discarded individually. If storage is blocked, the UI reports that data lasts for the current session.
- **Overview → Profile backup** exports the complete profile as JSON and imports supported version 1 or 2 backups with validation and replacement confirmation. Invalid files, cancelled imports, and failed saves preserve the existing profile.

The demo starts with nine mastered fundamentals, two skills in training, and goals for Tuck Planche, Tuck Front Lever, and Freestanding Handstand. Available equipment is floor, a fixed pull-up bar, and parallettes. Equipment changes do not erase historical mastery. Floor is always available; the Gym equipment option supplies a bar, dip bars, and parallettes, plus a secure bench for the dragon flag. Rings must be selected separately for ring skills.

The bar pulling progression is Pull-up → Chest-to-Bar Pull-up → Explosive Pull-up → High Pull-up → Muscle-up → Strict Muscle-up. Muscle-up also requires Straight-Bar Dip. Ring Muscle-up has an independent route through False-Grip Hang, Ring Pull-up, and Ring Dip.

The uploaded workbook adds **38 milestones**, including separate ring planche and ring planche push-up routes, both-knees-bent half-lay levers/planches, straight-arm frog stands, angle-specific V-sits leading to Manna, one-arm chin-ups, full-range handstand push-ups, and dragon flag preparation. Floor Full Planche is level 11, Ring Full Planche 14, Iron Cross 10, and Maltese 17. The workbook's explicit Maltese L17 annotation takes precedence over its row position.

Book entries and the workbook's proposed community additions have distinct source labels. Existing generic V-Sit, pronated One-Arm Pull-up, 90 Degree Hold (estimate 8), and the user's Pelican Planche transition (estimate 16) retain their meanings and are labeled app estimates. The existing floor Handstand Push-up is the head-to-floor level-6 movement; the added Full-Range Handstand Push-up is level 7 and requires raised supports. One-arm chin-ups remain distinct from pronated pull-ups. The stable `advanced-shrimp-squat` ID now displays Two-Hand Shrimp Squat at level 6, matching its existing two-hands-behind-the-body form.

Assisted, one-leg intermediate, and weighted progressions are excluded. Intrinsic unilateral exercises such as Pistol, Shrimp, and the requested Dragon Squat remain. Mixed chart cells contribute only the eligible half-lay or straddle option. Editable Personal Records may still describe added weight; excluding weighted progression nodes does not alter saved record values.

See [the reviewed workbook mappings and route decisions](docs/progressions.md) for exact source cells, the source distinction, exclusions, and migration behavior. The app's prerequisite edges, drill prescriptions, and hold/repetition benchmarks remain preparation suggestions, while sourced numeric levels match the workbook. Existing records and practice logs keep their IDs. Additional preparation steps can relock older mastery/training and preserve those states in **Overview → Previous skill records**. The app does not invent mastery for new steps or automatically restore archived progress; the skill becomes eligible for manual training/mastery once a route is complete.

Earlier removed One-Leg Front Lever, One-Leg Back Lever, One-Leg L-Sit, and Single-Leg Glute Bridge records remain in **Overview → Previous skill records**. The old generic Front Lever Row described a tuck variation; its records remain archived, and Full Front Lever Row has a separate ID so tuck records are not mislabeled. Retired goals leave the active list; archived progress does not count toward tree completion.

Prerequisites within a route are all required; different complete routes are alternatives. Goal planning chooses one route at each step and includes all of that route's outstanding supporting dependencies. Standard routes win otherwise equal choices. On a filtered desktop tree, the initial viewport focuses on the goal path; pan or use Fit View to explore the rest of the progression. The graph includes every alternative route, while goal highlights show the planned route.

## Architecture

```text
src/
  app/                    Next.js entry points and Tailwind/global styles
  types/skill.ts          Skill, equipment, progress, and profile models
  data/skills.ts          Definitions, group labels, and derived reverse unlock links
  data/references.ts      Reviewed sources and exact workbook-cell references
  data/overcomingGravity.ts Selected chart levels, cells, provenance, and source hash
  data/og2Skills.ts       Additional workbook milestones
  data/og2Muscles.ts      Muscle profiles for additional milestones
  data/muscles.ts         Target, primary, and secondary muscles for each skill
  data/trainingOptions.ts Alternative preparation routes and equipment setups
  data/retiredSkills.ts   Names used to preserve removed milestone records
  lib/progression.ts      Skill states, equipment checks, and cascading resets
  lib/difficulty.ts       Shared 1–17 scale, chart tiers, and source labels
  lib/graph.ts            Dependency paths, filtering, and graph layout
  lib/recommendations.ts  Pure deterministic recommendation rules
  lib/profile.ts          Demo profile and stored-data validation
  lib/practice.ts         Log validation, calendar dates, records, and trends
  lib/records.ts          Best logged records and dated improvement history
  lib/schedule.ts         Weekday assignments, eligibility, and plan validation
  lib/scheduleSuggestions.ts Goal-aware suggestions and safe plan merging
  lib/analytics.ts        Calendar-week/month volume, comparisons, and breakdowns
  hooks/useProgress.ts    React state and localStorage persistence
  hooks/useTheme.ts       Saved theme preference and cross-tab synchronization
  lib/theme.ts            Theme storage key and pre-paint preference script
  components/             App shell and focused feature components
e2e/                      Browser interaction tests
```

The data and algorithms are independent of the React components. The UI derives availability and recommendations from the same rules tested by Vitest. React Flow renders the graph; custom layout logic separates the four groups into progression lanes and positions prerequisites above dependent skills.

`desktop/` contains a minimal Electron main process and secure static-file protocol. The renderer uses a fixed `app://calisthenics/` origin, sandboxing, context isolation, and no Node integration. The packaged app bundles the static export and Electron runtime, without Next.js or production npm dependencies. The desktop executable uses the same React application and stored profile format as the browser version.

## Add a skill

Add one `define(...)` entry to `src/data/skills.ts`. Use a unique, stable ID; choose `pull`, `push`, `legs`, or `core`; give the skill an individually estimated integer difficulty from 1 to 17 and a movement type (`dynamic` or `static`); and reference existing prerequisite IDs. For a matched chart skill, add its exact cell, level, and book/community origin to `src/data/overcomingGravity.ts`; the definition helper uses that source level. For an unmatched skill, calibrate its estimate against [the chart anchors](docs/progressions.md#difficulty-and-progression-levels). Apparatus and execution range must match the source entry. Add a description, required equipment, a mastery benchmark, and practice exercises. For example:

```ts
define(
  "new-push-up-variation",
  "New Push-up Variation",
  "push",
  "fundamentals",
  2,
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

Vitest covers workbook-level provenance, excluded variants, apparatus distinctions, prerequisite gating, alternative routes, unlock propagation, cascading resets, complete goal planning, exercise-specific equipment compatibility, recommendations, profile migration, practice validation, local-calendar arithmetic, consistency trends, weekly/monthly analytics, group membership, and graph/data consistency.

To run the browser tests:

```sh
npx playwright install chromium
npm run test:e2e
```

The suite starts and stops its own dev server on port 3001, then checks source labels and 1–17 level filtering, skill unlocking and persistence, practice logging and trends, cross-tab updates, profile migration, alternative routes, equipment substitutions, goals, the dashboard, search, responsive navigation, dialogs, and corrupt-storage recovery. To use an existing server or a system Chromium installation:

```sh
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3000 \
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium \
npm run test:e2e
```

`npm run format` formats source and docs; `npm run format:check` checks formatting.

After `npm run desktop:build`, validate desktop URL boundaries and the desktop runtime with:

```sh
npm run test:desktop:unit
npm run test:desktop
```

The runtime check opens Electron, exercises the skill filter, Personal Record, practice logging and analytics, restarts the app to verify saved data, and checks renderer isolation. Set `CALISTHENICS_DESKTOP_EXECUTABLE` to an unpacked desktop executable to test the packaged app. Headless Linux runners need a display such as Xvfb; the production app keeps the renderer sandbox enabled.

## Future improvements

1. Short technique videos, entry/exit demonstrations, and coaching cues.
2. Optional account-based synchronization.
3. Richer leg progressions, accessibility preferences, and saved graph views.

Progress stays in the current browser or desktop profile and does not synchronize between devices. Use profile backups to transfer or preserve it; clearing browser site data removes that browser's copy. Mastery benchmarks are illustrative guides, not automatic assessments.
