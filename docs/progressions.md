# Progression reference

Workbook levels rechecked **8 October 2026**; technique sources reviewed **8 October 2026**. The catalog has **167 skills**: Pull 60, Push 66, Legs 13, and Core 28. It includes six bar/floor Victorian variants and Straight Arm Touch alongside the one-arm, Pelican/Hefesto, and OG2 additions. Levels match 96 book-chart entries and 30 community additions; 41 skills use app estimates.

## Workbook source

The reference is the uploaded **Overcoming Gravity 2nd Edition Exercise Charts.xlsx**. The [linked Google spreadsheet](https://docs.google.com/spreadsheets/d/19l4tVfdTJLheLMwZBYqcw1oeEBPRh8mxngqrCz2YnVg/edit?gid=2032740838#gid=2032740838) could not be fetched through the cloud proxy; the live sheet was not verified. The uploaded file was inspected directly and has SHA-256:

```text
caa52901db09d338b3fc9f911b42c6d72a9dd5eb52f6e5beb636aa4d2904e980
```

The sheet is named `Overcoming Gravity 2nd Edition `, including the trailing space.

| Columns | Content                                                  | App label       |
| ------- | -------------------------------------------------------- | --------------- |
| E:AY    | Book charts                                              | OG2 book        |
| BA:BM   | Proposed additions explicitly marked as outside the book | Community chart |

`src/data/overcomingGravity.ts` records each matched cell, text, family, level, origin, and selected variant. `src/data/references.ts` exposes those cells in skill details. The workbook is identified by name and hash and is not redistributed.

Levels normally equal the row minus four (rows 5–20). Apply these exceptions:

- **Maltese, AM20:** its explicit **L17** annotation overrides the level-16 row. The cell's Weighted Dips heading does not make this selected movement weighted.
- **Free HS, E8/E9:** Freestanding Handstand uses the first listed stage, E8 at level 4; E9 repeats it at level 5.
- **Half Lay / 1 Leg:** select only half-lay with both knees bent. **BF9, One Leg / Straddle:** select only the straight-legged straddle Dragon Flag.
- **BC5, Lunges:** the app uses the reverse-lunge variant and identifies it in the reference.
- Match apparatus, grip, and range: floor and ring planches, head-to-floor and full-range pressing, and supinated chin-ups and pronated pull-ups remain separate.

Pinned community movement descriptions remain in `src/data/references.ts`: the Recommended Routine, adapted Start Bodyweight chart, Strong Journal lever catalog, advanced static catalog, and Pelican transition catalog. They do not supply a second difficulty scale or verify app prerequisite routes.

## Difficulty levels

Matched skills use workbook levels **1–17**. Unmatched skills show **App estimate**. Prerequisite depth does not determine difficulty; adjacent steps can share a level. Tier labels group levels for display and do not predict training time or equal increments of effort.

| Levels | Tier         | Anchors                                                        |
| ------ | ------------ | -------------------------------------------------------------- |
| 1–5    | Beginner     | Push-up 1, Pull-up 3, Pistol Squat 4, Ring Muscle-up 5         |
| 6–9    | Intermediate | Straddle Front Lever 6, Full Front Lever 8, One-Arm Chin-up 9  |
| 10–13  | Advanced     | Iron Cross 10, Floor Full Planche 11, Manna 13                 |
| 14–17  | Elite        | Ring Full Planche 14, Ring Full Planche Push-up 16, Maltese 17 |

| Skill                        | Level | Origin          | Cell or reason                                      |
| ---------------------------- | ----- | --------------- | --------------------------------------------------- |
| Floor Full Planche           | 11    | OG2 book        | AE15, Full PL                                       |
| Ring Full Planche            | 14    | OG2 book        | AF18, Full PL                                       |
| Iron Cross                   | 10    | OG2 book        | Z14, Iron Cross Hold                                |
| Maltese                      | 17    | OG2 book        | AM20, explicit Maltese (L17)                        |
| Handstand Push-up            | 6     | OG2 book        | G10, Free HeSPU; head-to-floor range                |
| Full-Range Handstand Push-up | 7     | OG2 book        | G11, Free HSPU; raised supports                     |
| Ring Archer Pull-up          | 7     | OG2 book        | W11, R Archer Pull-ups                              |
| One-Arm Chin-up              | 9     | OG2 book        | W13, OAC; supinated grip                            |
| Two-Hand Shrimp Squat        | 6     | Community chart | BC10, 2 Hand Shrimp                                 |
| Hefesto                      | 9     | Community chart | BI13, Hefesto (GH pullout)                          |
| Dragon Flag                  | 6     | Community chart | BF10, Full Dragon Flag                              |
| Bar Archer Pull-up           | 6     | App estimate    | Fixed-bar movement                                  |
| Pronated One-Arm Pull-up     | 10    | App estimate    | Different grip from the chart's OAC                 |
| Generic V-Sit                | 8     | App estimate    | No specified chart angle                            |
| 90 Degree Hold               | 8     | App estimate    | Static bent-arm planche                             |
| Pelican Push Up              | 16    | App estimate    | Planche → back lever → planche transition on rings  |
| Straight Arm Touch (SAT)     | 16    | App estimate    | Wide-grip fixed-bar hold with hips touching the bar |

Iron Cross Negative is estimated at 9, Maltese Negative at 15, and Straddle Maltese at 16. These preparation steps remain distinct from the sourced full skills. `src/lib/difficulty.ts` defines the shared scale, tiers, and labels.

### Pelican and Hefesto workbook progression

All eight entries in BI9–BI16 are now mapped at their exact row levels. The first three use rings with supported feet; the later entries distinguish the starting position and how the second arm contributes.

| Level | Cell | Skill                      | App setup                                               |
| ----- | ---- | -------------------------- | ------------------------------------------------------- |
| 5     | BI9  | Incline Pelican Curl       | Rings, grounded feet, upright incline                   |
| 6     | BI10 | Pelican Curl               | Rings, grounded feet                                    |
| 7     | BI11 | Feet-Elevated Pelican Curl | Rings + gym bench, both feet supported                  |
| 8     | BI12 | Hefesto Negative           | Fixed bar, controlled descent behind the body           |
| 9     | BI13 | Hefesto                    | Fixed bar, underhand pull from a German hang            |
| 10    | BI14 | Back Lever Hefesto         | Fixed bar, full horizontal back-lever start             |
| 11    | BI15 | Archer Hefesto             | Rings, opposite elbow straight with both grips retained |
| 12    | BI16 | Hand-on-Wrist Hefesto      | Fixed bar, second hand supporting the working wrist     |

The chart supplies names and levels; these apparatus and form details are app choices. Technique links for rare variants are explicitly labeled as adaptations. BI13’s level 9 replaces the former app override of 11. The book’s R13 **GH Pullout** is not added as a duplicate fixed-bar skill.

Ring Rows at U6 also maps the app’s Inverted Row to book level 2. After these additions, the 167-skill catalog has 126 exact chart matches: 96 book and 30 community. The other 41 retain labeled estimates because their grip, apparatus, range, or movement is absent or ambiguous in this workbook.

### One-arm workbook additions

These 14 milestones retain the chart’s exact levels and separate grip, apparatus, and body shape. Full Ab Wheel (AU12, level 8) and Dragon Press (BJ14, level 10) are included as foundations for their one-arm forms. Existing one-arm rows, floor push-ups, and chin-ups retain their IDs and records.

| Cell | Level | Added milestone                |
| ---- | ----- | ------------------------------ |
| AU8  | 4     | One-Arm One-Leg Plank          |
| AJ9  | 5     | Hand-Elevated One-Arm Push-up  |
| AJ11 | 7     | Ring Straddle One-Arm Push-up  |
| AK11 | 7     | Side Bent-Body One-Arm Dip     |
| AS11 | 7     | Straddle One-Arm Elbow Lever   |
| AS12 | 8     | One-Arm Elbow Lever            |
| AJ13 | 9     | Ring One-Arm Push-up           |
| AK13 | 9     | Side Straight-Body One-Arm Dip |
| AR13 | 9     | One-Arm-Straight Muscle-up     |
| E14  | 10    | Freestanding One-Arm Handstand |
| AU14 | 10    | One-Arm Ab Wheel               |
| BL16 | 12    | One-Arm Front Lever            |
| BL17 | 13    | One-Arm Dragon Press           |
| BL20 | 16    | One-Arm Planche                |

`OA Straight MU` is represented as an archer-style ring muscle-up: one arm stays straight and **both grips remain attached**. The workbook’s short label does not establish an unsupported single-arm muscle-up; the app labels its interpretation and technique as adaptations. Dragon Press is a supine floor press with shoulder/upper-back contact and palms beside the hips; it is distinct from an anchored Dragon Flag. Its prerequisites are Hollow Body Hold and Full Front Lever. The one-arm variant releases one supporting hand and requires Dragon Press plus One-Arm Front Lever. One-Arm Back Lever is retired from the tree and goals; its existing records remain readable in Overview → Previous skill records.

Wall-assisted one-arm dips (AK10 and AK12), weighted chin-ups, and the unspecific E10 handstand-progressions header remain excluded. AU8 is an explicit exception to the generic one-leg-intermediate exclusion: one hand and the opposite foot support the plank while the other arm and leg are raised. The one-forearm Victorian entry is not relabeled as a straight-arm one-arm skill.

Ab Wheel is a separate equipment selection. Gym does not imply access to it, and a one-arm rollout needs a roller designed for a secure single-hand grip. Full and one-arm rollouts use standing starts and returns, with knees clear; a shortened kneeling rollout is preparation, rather than the full chart milestone.

### Victorian and Straight Arm Touch

The **Victorian & SAT** branch includes the requested bar and floor progressions from the workbook’s community section:

| Cell | Level | Milestone                      |
| ---- | ----- | ------------------------------ |
| BJ13 | 9     | Protracted Victorian on Bars   |
| BJ15 | 11    | Victorian on Bars              |
| BJ17 | 13    | Wide Victorian on Bars         |
| BJ18 | 14    | Floor Victorian on One Forearm |
| BJ20 | 16    | Floor Victorian on Forearms    |
| BJ21 | 17    | Straight-Arm Floor Victorian   |

The chart supplies labels and levels, but does not detail the contact positions. The app defines the bar variants with hands gripping parallel rails and forearms supported on them; the floor variants keep the hips, feet, and upper back clear. BJ18 uses one forearm and the opposite palm in the app’s explicit mixed-contact interpretation. It is not relabeled as an unsupported one-arm hold. Technique guidance marks these contact choices as adaptations. The two forearm variants use independent routes from Wide Victorian on Bars because chart levels alone do not establish a prerequisite chain.

**Straight Arm Touch (SAT)** follows the existing [community skill catalog](https://github.com/G0RB-SMG/Calisthenics-Skill-Tree/blob/0217535ccb58ec5ee897e3c852afef99724f3282/skills.js): face-up horizontal hold on a single bar, ultra-wide grip, straight elbows, and hips touching the bar. Its level **16 is an app estimate**, calibrated above Wide Victorian on Bars (13) and below Straight-Arm Floor Victorian (17); the catalog’s separate difficulty scale is not treated as a workbook level. Its app preparation route uses Wide Victorian on Bars and Full Front Lever. The ring Victorian entry at BJ19 is outside the requested bar/floor selection.

## Routes

Workbook ordering and levels inform the catalog. Prerequisite edges, alternatives, drills, and repetition/hold benchmarks are **app preparation choices**, not exact workbook requirements. Mastery remains manual.

| Family                   | Route                                                                                                                                                                                                                                                                                                                                   |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Bar muscle-up            | Pull-up Negative → Pull-up → Chest-to-Bar → Explosive → High → Muscle-up → Strict Muscle-up. Muscle-up also requires Straight-Bar Dip.                                                                                                                                                                                                  |
| Ring muscle-up           | False-Grip Hang + Ring Pull-up + Ring Dip → Ring Muscle-up; independent of bar muscle-up.                                                                                                                                                                                                                                               |
| Rows                     | Archer Row → Straddle One-Arm Row → One-Arm Row. Front-lever rows have separate tuck, advanced-tuck, and full-body entries.                                                                                                                                                                                                             |
| Front/back lever         | Tuck → Advanced Tuck → Straddle → Half-Lay → Full. Half-lay bends both knees. German Hang precedes Skin the Cat.                                                                                                                                                                                                                        |
| Floor/ring planche       | Separate routes: Frog Stand → Straight-Arm Frog Stand → Tuck → Advanced Tuck → Straddle → Half-Lay → Full. Ring stages also require corresponding floor preparation.                                                                                                                                                                    |
| Planche push-ups         | Separate floor/ring routes: Tuck → Advanced Tuck → Straddle → Half-Lay → Full, with supporting static positions.                                                                                                                                                                                                                        |
| One-arm pulling/pressing | Ring Archer Pull-up → One-Arm Chin-up Negative → One-Arm Chin-up stays separate from pronated pulling. Straddle One-Arm Push-up prepares the legs-together version.                                                                                                                                                                     |
| Handstand pressing       | Pike → Decline Pike → head-to-floor pressing. Full-Range Handstand Push-up requires raised supports.                                                                                                                                                                                                                                    |
| 90 Degree Hold           | Advanced Tuck Planche + Tuck Planche Push-up → horizontal straight-body bent-arm hold, without an abdominal elbow brace; floor or suitable parallettes.                                                                                                                                                                                 |
| Pelican/Hefesto          | Incline Pelican Curl → Pelican Curl → Feet-Elevated Pelican Curl provides optional extra preparation for Hefesto Negative alongside Straight-Bar Dip. The original German Hang + Straight-Bar Dip route still unlocks the negative without the ring preparation. Hefesto → Back Lever Hefesto → Archer Hefesto → Hand-on-Wrist Hefesto. |
| Pelican Push Up          | Ring Full Planche + Back Lever + Pelican Press → dynamic planche → back lever → planche, with controlled endpoints.                                                                                                                                                                                                                     |
| L-sit/V-sit/Manna        | Tuck L-Sit → L-Sit → Straddle L-Sit → 45° → 75° → 100° → 120° → 140° → 155° → 170° V-Sit → Manna. Generic V-Sit remains separate.                                                                                                                                                                                                       |
| Legs                     | Split Squat → Deep Step-up → Pistol Negative → Pistol. Shrimp → Two-Hand Shrimp is separate. Dragon Squat uses pistol strength and reverse-lunge balance.                                                                                                                                                                               |
| Posterior chain          | Glute Bridge → Nordic Negative → Nordic Curl.                                                                                                                                                                                                                                                                                           |
| Hanging core/Dragon Flag | Hanging Knee Raise → Hanging Leg Raise → Toes-to-Bar → Hanging Windshield Wiper. Tuck Dragon Flag Negative → Advanced Tuck → Straddle → Full; dynamic Tuck Dragon Flag remains separate.                                                                                                                                                |

Every prerequisite within a route must be mastered; any one complete route unlocks the target. Alternatives exist for Tuck Front Lever, Bar Archer Pull-up, Tuck Ice Cream Maker, Handstand Push-up, Ring Dip, Pistol Squat Negative, Advanced Tuck Dragon Flag, and Hefesto Negative. Resetting a prerequisite preserves dependent progress if another route remains complete.

Goal planning selects one route at each step, includes supporting dependencies, and stops at mastered skills. It favors fewer steps requiring unavailable equipment, then fewer outstanding requirements; the standard route wins ties. The tree shows all routes, with alternatives dashed; goal highlights show the selected route.

### Filters and equipment

Group, progression, search, **Max level**, and **Available only** filter both graph and list. Max level hides higher-level nodes, including prerequisites. Available only keeps available, training, and mastered skills; locked search matches cannot expand the result. Filters do not alter progress. Mastery reveals unlocked children; resets hide relocked descendants.

Each equipment substitution specifies a complete setup and execution notes. Eligible floor holds may use parallettes, L-sit/V-sit may use suitable supports, and levers may use a bar or rings. Full-range handstand pressing needs raised supports. Ring planches, Pelican Push Up, ring muscle-ups, Iron Cross, and Maltese require rings. Fixed-bar archer pull-ups, bar muscle-ups, and Hefesto retain their apparatus. One-arm front/back levers use the app’s fixed-bar setup. **Gym** does not include rings or an ab wheel.

## Exclusions

Exclude generic assisted, weighted, and one-leg intermediate nodes: bands, walls, spotters, handrails, and foot-supported suspended skills. Keep intrinsic unilateral exercises such as **Pistol, Shrimp, and Dragon Squat**, and the requested chart’s **One-Arm One-Leg Plank**.

Keep tucks, straddles, half-lays with both knees bent, and controlled negatives. Normal foot contact in push-ups, rows/curls, pike positions, and squats is part of the movement. The requested Hefesto progression includes the workbook’s feet-elevated Pelican Curl and hand-on-wrist variant; keep their foot/wrist support explicit rather than labeling them as fully suspended or unsupported one-arm skills. A decline-pike box increases shoulder load; a Nordic ankle anchor fixes the feet. Nordic Negative allows a hand catch after descent; full Nordic Curl excludes a hand push on return.

Manual record text may contain weight, such as `12 reps + 10 kg`. The practice log has no weight metric, and saving practice replaces that text with the logged best.

## Practice and scheduling rules

- **Weekly schedule:** repeating Monday–Sunday assignments; available/training/mastered skills with a complete equipment setup; no duplicate skill within a day. Unavailable assignments stay visible with a reason, and their practice shortcuts are disabled.
- **Suggestions:** prioritize eligible goal steps, then current training, supporting skills, and foundations; mastered skills may be maintenance. Without goals, use a mix of eligible groups. Preview reasons before applying. Applying rechecks eligibility, retains existing assignments, and avoids duplicates. Changed goals, progress, equipment, or generator settings require a new preview.
- **Practice records:** repetitions and holds are independent bests per set. Saving/editing replaces manual text. Editing/deleting a best falls back to remaining history; deleting the final entry clears it. Moving an entry updates both skills. Older valid logs fill missing records on load but preserve nonempty text until practice is saved or edited.
- **Analytics:** consistency counts distinct local dates. Volume multiplies per-set values by sets. Calendar weeks run Monday–Sunday. Current partial periods compare with the same elapsed days in the previous period, capped at that month's length; completed periods compare with the full previous period.
- **Record history:** dated improvements carry forward across periods. Same-day improvements share a date; ties and lower values are not new records. Backdated entries, edits, and deletions rebuild history. Manual text has no practice date.

Schedules and suggestions do not create logs or change mastery. Catalog and level changes do not reinterpret practice entries.

## Storage and migration

The profile remains **version 2** at `calisthenics-skill-tree:v1`. Version 1 profiles migrate with an empty practice log. Optional `weeklySchedule` defaults to empty. The removed `savedGraphViews` field is ignored in local profiles and older backups; other valid profile data is retained. Local recovery drops invalid entries individually; JSON import validates before replacing the profile. Browser and desktop profiles transfer through **Overview → Profile backup**.

Retain movement meanings and persisted IDs:

- `advanced-shrimp-squat` displays **Two-Hand Shrimp Squat**, matching its established form and BC10.
- `pelican-planche` displays **Pelican Push Up**, retaining the ring planche/back-lever transition and existing records.
- Generic V-Sit, pronated One-Arm Pull-up, and head-to-floor Handstand Push-up remain separate from angle-, grip-, and range-specific additions.

New prerequisites can relock old training/mastery. Preserve those states in `archivedSkills` under **Overview → Previous skill records**; do not infer mastery or automatically restore archived states. The skill becomes eligible for manual training/mastery when a route is complete.

Retired IDs remain archived: `one-leg-front-lever`, `one-leg-back-lever`, `one-leg-l-sit`, `single-leg-glute-bridge`, removed assisted milestones, and the old tuck `front-lever-row`. Keep their records and valid logs attached to those IDs. Remove retired goals from the active list. Archives persist in backups and do not count toward active completion or recommendations.

### Device preferences

Theme uses `calisthenics-skill-tree:theme`; accessibility uses `calisthenics-skill-tree:accessibility`. They synchronize across tabs and apply before paint. Accessibility settings stay outside profile backups. Invalid preference fields recover to defaults; blocked storage permits session use. Reduced motion always respects the system preference. Resetting accessibility leaves theme and training data intact.

Desktop **0.2.1** keeps its storage origin and `%APPDATA%\Calisthenics Skill Tree` directory. Replacing the executable preserves its profile. It does not preserve newer weekly schedules; keep the original backup when transferring to it. Desktop updates require a separate request.

## Technique sources

All skills have setup, form cues, common mistakes, and technique links. Sources reviewed on **7 October 2026** are pinned to these versions:

- [Bodyweight Fitness instructional wiki mirror](https://github.com/asdjflk/r/tree/da02f88bc4534b50f12895465a87748d62a34425/bodyweightfitness/wiki): pulling, pressing, support, squat, Nordic, core, and body positioning.
- [Public GymnasticBodies curriculum](https://raw.githubusercontent.com/tlchatt/gymnasticbodies.com/e932443104bbe86f6bf7acb1e710baad5398bfe3/data/workout/programCurricula.json): hollow/arch, L-sit/Manna, levers, ring hangs, planche, and handstand.
- [Free Exercise DB](https://github.com/yuhonas/free-exercise-db/tree/f00c92c7dcf1216a928a52c3706c7ce8e2f71ed5/exercises): ring muscle-up, lunge, glute bridge, and calf raise.

Guidance uses reachable written instructions and archived text. Several coaching sites and video pages were inaccessible. Rare skills, custom variants, V-sit angles, and apparatus changes are labeled as adaptations when a source does not demonstrate the exact movement. Technique sources describe form; workbook references determine matched levels.

`src/data/technique.ts` combines category maps and technique-only sources. Each skill requires guidance matching its shape, grip, apparatus, and range. Technique changes do not alter stored profiles.

## Maintain the catalog

1. Add exact source cells, text, levels, origin, and variants to `src/data/overcomingGravity.ts`; generate links in `src/data/references.ts`. A mapped level always overrides the fallback estimate; app ratings cannot override the workbook.
2. Add stable definitions to `src/data/skills.ts`, `src/data/og2Skills.ts`, `src/data/advancedStaticSkills.ts`, or the `src/data/oneArm*` modules; muscles to their muscle maps; setup/form/mistakes to the category technique map; routes and equipment to `src/data/trainingOptions.ts`.
3. Calibrate unmatched integer estimates from 1–17 against the anchors above. Keep tiers and source wording in `src/lib/difficulty.ts`.
4. Check source matches, exclusions, apparatus/range, duplicate IDs, dependency reachability/cycles, alternatives, graph layout, equipment, and migration. Never reuse a persisted ID for a different movement.
