# Calisthenics Skill Tree

Explore **139 calisthenics skills** in Pull (46), Push (57), Legs (13), and Core (23). Track progress, personal records, practice, and weekly training plans. Built with Next.js, TypeScript, React, Tailwind CSS, and React Flow.

The app stores data locally. No account, database, API key, or backend is required.

## Run locally

Install Node.js **22.12 or later**, then run these commands in a terminal inside the project folder:

```sh
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Keep the terminal open while using the app; press `Ctrl+C` to stop it.

For a production build:

```sh
npm run build
npm start
```

Fonts are bundled locally. The app makes no external application requests. If the cloud workspace cannot write npm's default cache, use `npm ci --cache /workspace/.cache/npm`.

## Windows app

1. Sign in to GitHub and open the latest successful [Windows desktop app workflow](https://github.com/wucaslu/Calisthenics-App/actions/workflows/windows-desktop.yml).
2. Download the **Calisthenics-Skill-Tree-Windows** artifact and unzip it.
3. Double-click **Calisthenics-Skill-Tree-0.2.1-Windows.exe**.

The portable Windows 64-bit app requires no Node.js, terminal, server, or administrator access. Its tree, records, practice log, and analytics work offline; reference links open in your browser.

**Desktop updates require a separate request.** Web changes do not rebuild the executable. Light mode, availability filtering, automatic practice records, record history, weekly schedules and suggestions, technique guidance, accessibility preferences, and saved graph views await a desktop update. Version 0.2.1 does not preserve weekly schedules or saved graph views from newer backups; keep the original JSON file when transferring to it.

Desktop data lives in `%APPDATA%\Calisthenics Skill Tree`. Replacing the executable preserves that data. Browser and desktop profiles are separate; use **Overview → Profile backup** to transfer them. The executable is not code-signed.

## Use the app

### Explore skills

- Filter the tree by group, progression, search, and **Max level** (1–17).
- Enable **Available only** to show available, training, and mastered skills. Locked skills stay hidden.
- Click a skill for its description, Dynamic/Static badge, target/primary/secondary muscles, prerequisites, equipment substitutions, drills, mastery examples, and **Technique & form** guidance.
- Start training or mark mastery manually. Complete every prerequisite in any one route to unlock a skill. Dashed edges show alternative routes.
- Set goals to highlight a preparation path and get equipment-compatible recommendations.
- Drag the graph or use zoom and Fit View controls. Mobile uses a skill list. Open or close the sidebar with the top-bar navigation button.

Levels use the **Overcoming Gravity 2nd Edition** workbook where matched: 83 **OG2 book**, 13 **Community chart**, and 43 **App estimate** entries. Hefesto uses an adjusted app rating of 11 and retains its chart reference at 9. Details show exact workbook cells. Assisted, weighted, and one-leg intermediate progressions are excluded; Pistol, Shrimp, and Dragon Squat remain.

See [progression references](docs/progressions.md) for source mappings, route decisions, exclusions, and migration rules. Mastery examples are practice guides; logs do not assess mastery automatically.

### Customize the view

Use the sun/moon button for light or dark mode. In **Preferences**, choose reduced motion, higher contrast, larger text, or a desktop skill list. System reduced-motion settings are always respected. Theme and accessibility choices save on this device and synchronize across tabs; accessibility settings are excluded from profile backups.

Use **Saved graph views** above the tree to save up to 20 named views. Load, rename, or delete them there. Views store filters, goal highlighting, visible selection, and graph pan/zoom, and are included in profile backups. Loading checks your current progress and closes a selection hidden by the saved filters.

### Record practice and review analytics

Edit a skill's **Personal Record**, or choose **Log practice** to record dated sets, repetitions per set, hold seconds per set, and notes.

Saving or editing practice replaces manual record text with the best logged repetitions and hold duration. Editing or deleting a best entry recalculates the record; deleting the final entry clears it. **Use logged best** restores logged values after a manual edit.

**Analytics** shows calendar-week and calendar-month practice days, consistency, entries, sets, repetition/hold volume, group totals, and per-skill bests. Volume multiplies per-set values by sets. Personal record history charts dated improvements, carries earlier bests forward, and rebuilds after edits or deletions. Manual record text has no timeline date.

### Plan a week

In **Weekly schedule**, choose a day and add available, training, or mastered skills with compatible equipment. A skill can appear on several days. Assignments that become unavailable remain visible with a reason.

Choose weekdays and skills per day, then **Generate suggestions**. The preview prioritizes ready steps toward your goals, then training, supporting skills, and foundations. **Add suggestions to schedule** keeps existing assignments and avoids duplicates. Regenerate after changing goals, progress, equipment, or generator settings. Scheduling does not create practice entries or change progress.

## Save and back up data

Progress, goals, equipment, records, practice, schedules, and saved views persist in localStorage and synchronize across tabs. If storage is blocked, the app reports that changes last for the current session. Clearing browser site data deletes that browser's copy; there is no automatic device synchronization.

Use **Overview → Profile backup → Export JSON** to keep a copy. **Import JSON** validates version 1 or 2 backups and asks before replacing the current profile. Invalid files and cancelled imports preserve existing data. Retired or relocked skill records remain in **Overview → Previous skill records**.

The demo starts with nine mastered fundamentals, two training skills, and goals for Tuck Planche, Tuck Front Lever, and Freestanding Handstand. Floor, pull-up bar, and parallettes are selected. **Gym** supplies a bar, dip bars, parallettes, and a secure dragon-flag bench; select rings separately.

## Develop and validate

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm run format:check
```

Browser tests start a dev server on port 3001:

```sh
npx playwright install chromium
npm run test:e2e
```

To test an existing server with system Chromium:

```sh
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3000 \
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium \
npm run test:e2e
```

`npm run format` formats source and documentation. Unit and browser tests cover catalog provenance, progression rules, persistence, practice, analytics, scheduling, filters, preferences, saved views, and responsive interactions.

### Project structure

| Location                      | Purpose                                                              |
| ----------------------------- | -------------------------------------------------------------------- |
| `src/app/`, `src/components/` | Pages, UI, and styles                                                |
| `src/types/skill.ts`          | Skill and profile models                                             |
| `src/data/`                   | Catalog, workbook mappings, muscles, technique, and training options |
| `src/lib/`                    | Progression, graph, records, analytics, scheduling, and validation   |
| `src/hooks/`                  | Profile, theme, and accessibility state                              |
| `e2e/`                        | Browser tests                                                        |
| `desktop/`                    | Electron runtime and static-file protocol                            |

Data rules are independent of React. Graph layout uses progression lanes with prerequisites above dependent skills. Electron bundles the static export and uses the fixed `app://calisthenics/` origin, sandboxing, context isolation, and no Node integration in the renderer.

### Add a skill

1. Add a stable ID and definition to `src/data/skills.ts` or `src/data/og2Skills.ts`: group, branch, level 1–17, Dynamic/Static type, prerequisites, equipment, description, mastery example, and drills.
2. Add target/primary/secondary muscles and category-specific technique guidance for the same ID. Label guidance adapted from a related movement.
3. For a workbook match, add the exact cell, level, origin, and variant to `src/data/overcomingGravity.ts`. Otherwise calibrate an **App estimate** against the [level anchors](docs/progressions.md#difficulty-levels).
4. Add complete alternative routes and equipment setups to `src/data/trainingOptions.ts` when needed. Keep all dependency routes acyclic.
5. Update catalog-count assertions and run validation. Reverse unlock links are generated automatically. Never reuse a persisted ID for a different movement.

### Build the Windows app

When a desktop update is requested, build on Windows with Node.js 22.12 or later:

```sh
npm ci
npm run desktop:package
```

The portable executable appears in `dist-desktop/`. `npm run desktop:build` creates `out/`; `npm run desktop:start` builds and opens Electron. The GitHub workflow runs manually through **Run workflow**, tests the unpacked executable, and uploads the artifact. Windows builds apply icon/version metadata; Linux cross-builds skip Windows resource editing.

After a desktop build, run:

```sh
npm run test:desktop:unit
npm run test:desktop
```

Set `CALISTHENICS_DESKTOP_EXECUTABLE` to test an unpacked executable. Headless Linux runners need a display such as Xvfb.
