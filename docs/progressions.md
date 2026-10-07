# Workbook reference and progression decisions

Reviewed on 7 October 2026. The catalog contains **139 skills**: Pull 46, Push 57, Legs 13, and Core 23. This revision adds 38 milestones and maps 97 skills to the supplied workbook: **83 book-chart entries and 14 community additions**. The remaining 42 skills retain individually calibrated app estimates.

## Source and provenance

The primary reference is the user-uploaded **Overcoming Gravity 2nd Edition Exercise Charts.xlsx**, supplied after the [linked Google spreadsheet](https://docs.google.com/spreadsheets/d/19l4tVfdTJLheLMwZBYqcw1oeEBPRh8mxngqrCz2YnVg/edit?gid=2032740838#gid=2032740838) could not be fetched through the cloud network proxy. The uploaded file was inspected directly; the live spreadsheet was not verified. Its SHA-256 is:

```text
caa52901db09d338b3fc9f911b42c6d72a9dd5eb52f6e5beb636aa4d2904e980
```

The workbook has one sheet, `Overcoming Gravity 2nd Edition `, including a trailing space. Columns **E:AY** contain the book charts. Columns **BA:BM** are explicitly marked as proposed progressions not in the book, so their app label is **Community chart**. The app label **OG2 book** identifies entries in the book-chart portion of this supplied file.

The selected mappings in `src/data/overcomingGravity.ts` preserve each skill's source cell, text, family, numeric level, book/community origin, and any selected variant. `src/data/references.ts` uses those mappings to show the exact cell in skill details. The source file is identified by name and hash rather than redistributed in the repository.

Levels usually equal the sheet row minus four, from rows 5–20. These exceptions and selection rules are explicit:

- **Maltese, AM20**, says **L17**; that annotation takes precedence over its level-16 row. Although the cell sits under the Weighted Dips family, the selected exercise is the unweighted Maltese. Weighted dip entries are excluded.
- **Free HS** appears at both **E8, level 4**, and **E9, level 5**. Freestanding Handstand uses the first listed stage, level 4, and notes the duplicate.
- Cells listing **Half Lay / 1 Leg** contribute only the half-lay variant, with both knees bent. **BF9, One Leg / Straddle**, contributes only the straddle Dragon Flag, with both legs straight.
- **BC5, Lunges**, supports the app's reverse-lunge form, with that variant identified in its reference.
- Apparatus and range must match: floor/parallel-bar planches differ from ring planches; head-to-floor handstand pressing differs from full-range pressing; a supinated one-arm chin-up differs from a pronated one-arm pull-up.

Earlier pinned community references remain supplementary movement descriptions in `src/data/references.ts`: the archived Recommended Routine, community-adapted Start Bodyweight chart, Strong Journal lever catalog, advanced static catalog, and Pelican transition catalog. Their earlier progression numbers no longer supply a second difficulty rating. They do not validate the workbook's levels or the app's preparation routes.

## Difficulty and progression levels

The shared scale is now **1–17**. Matched skills use the workbook's numeric level directly. The UI distinguishes **OG2 book**, **Community chart**, and **App estimate**; skill details include the matched cell when available. Unlisted movements keep an estimated level and do not acquire a published chart level by analogy.

| Levels | Tier         | Example anchors                                                |
| ------ | ------------ | -------------------------------------------------------------- |
| 1–5    | Beginner     | Push-up 1, Pull-up 3, Pistol Squat 4, Ring Muscle-up 5         |
| 6–9    | Intermediate | Straddle Front Lever 6, Full Front Lever 8, One-Arm Chin-up 9  |
| 10–13  | Advanced     | Iron Cross 10, Floor Full Planche 11, Manna 13                 |
| 14–17  | Elite        | Ring Full Planche 14, Ring Full Planche Push-up 16, Maltese 17 |

These tier labels group chart levels for display. A difference of one level does not promise an equal increase in effort or predict training time. Technique, body proportions, apparatus, mobility, and individual strengths affect the practical ordering. App estimates use the same numeric range for comparison, with their source label visible. Prerequisite depth does not determine a skill's level, and successive preparation milestones may share a level.

Important source anchors and retained estimates include:

| Skill                        | Level | Origin          | Cell / reason                                                   |
| ---------------------------- | ----- | --------------- | --------------------------------------------------------------- |
| Floor Full Planche           | 11    | OG2 book        | AE15, Full PL                                                   |
| Ring Full Planche            | 14    | OG2 book        | AF18, Full PL                                                   |
| Iron Cross                   | 10    | OG2 book        | Z14, Iron Cross Hold                                            |
| Maltese                      | 17    | OG2 book        | AM20, explicit Maltese (L17)                                    |
| Handstand Push-up            | 6     | OG2 book        | G10, Free HeSPU; head-to-floor range                            |
| Full-Range Handstand Push-up | 7     | OG2 book        | G11, Free HSPU; raised supports                                 |
| Ring Archer Pull-up          | 7     | OG2 book        | W11, R Archer Pull-ups                                          |
| One-Arm Chin-up              | 9     | OG2 book        | W13, OAC; supinated grip                                        |
| Two-Hand Shrimp Squat        | 6     | Community chart | BC10, 2 Hand Shrimp                                             |
| Hefesto                      | 9     | Community chart | BI13, Hefesto (GH pullout)                                      |
| Dragon Flag                  | 6     | Community chart | BF10, Full Dragon Flag                                          |
| Bar Archer Pull-up           | 6     | App estimate    | Distinct fixed-bar movement                                     |
| Pronated One-Arm Pull-up     | 10    | App estimate    | Kept separate from the chart's supinated OAC                    |
| Generic V-Sit                | 8     | App estimate    | Existing execution does not specify a chart angle               |
| 90 Degree Hold               | 8     | App estimate    | Existing static bent-arm planche                                |
| Pelican Planche              | 16    | App estimate    | User-defined planche → back lever → planche transition on rings |

Iron Cross Negative is an app estimate at 9; Maltese Negative and Straddle Maltese are estimates at 15 and 16. These preparation steps are distinct from the sourced full skills. The scale, tiers, and source labels are centralized in `src/lib/difficulty.ts`.

## Route organization

The four groups remain Pull, Push, Legs, and Core. Named progression lanes, branch filters, search, and the mobile list share the same catalog. The **Max level** filter can hide all skills above any cutoff from 1 to 17, including otherwise relevant prerequisites; it does not change saved progress or unlock rules. **Available only** additionally keeps skills whose prerequisite route is complete and whose state is Available. Training, mastered, and locked states are excluded before search expansion, so hidden matches cannot pull unrelated prerequisites into the result. The graph and mobile list share the same filtered catalog.

The workbook supplies progression ordering and numeric levels. The application's prerequisite edges, alternative routes, drills, and hold/repetition benchmarks remain **app preparation choices**. They are not claimed as exact workbook requirements or universal physiological prerequisites. Mastery stays a manual action; logged repetitions and holds do not automatically assess it.

| Family                   | Route decisions                                                                                                                                                                                                                  |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Bar muscle-up            | Preserve the user's sequence: Pull-up → Chest-to-Bar → Explosive → High → Muscle-up → Strict Muscle-up. Pull-up Negative now prepares Pull-up; Straight-Bar Dip remains a pressing requirement.                                  |
| Ring muscle-up           | False-Grip Hang + Ring Pull-up + Ring Dip → Ring Muscle-up. Bar muscle-up remains independent.                                                                                                                                   |
| Rows                     | Archer Row → Straddle One-Arm Row → One-Arm Row. Front-lever rows retain separate tuck, advanced-tuck, and full-body milestones.                                                                                                 |
| Front/back lever         | Tuck → Advanced Tuck → Straddle → Half-Lay → Full. Half-lay uses both bent knees; one-leg variants remain excluded. German Hang now precedes Skin the Cat in the back-lever preparation.                                         |
| Floor and ring planche   | Separate apparatus-specific routes through Frog Stand → Straight-Arm Frog Stand → Tuck → Advanced Tuck → Straddle → Half-Lay → Full. The ring route also requires corresponding floor preparation.                               |
| Planche push-ups         | Separate floor and ring routes through Tuck → Advanced Tuck → Straddle → Half-Lay → Full. Supporting static positions remain prerequisites; ring versions require rings.                                                         |
| One-arm pulling/pressing | Ring Archer Pull-up → One-Arm Chin-up Negative → One-Arm Chin-up is separate from the pronated pull-up route. Straddle One-Arm Push-up prepares the straight-body, legs-together One-Arm Push-up.                                |
| Handstand pressing       | Pike → Decline Pike prepares independent head-to-floor pressing. Full-Range Handstand Push-up adds raised supports and a distinct level. Wall milestones remain excluded.                                                        |
| 90 Degree Hold           | Advanced Tuck Planche + Tuck Planche Push-up → static bent-arm planche with a straight horizontal body and no abdominal elbow brace. Floor or suitable parallettes are valid.                                                    |
| Pelican Planche          | Ring Full Planche + Back Lever + Pelican Press → the user's dynamic planche → back lever → planche transition, with controlled endpoints.                                                                                        |
| L-sit, V-sit, Manna      | Tuck L-Sit → L-Sit → Straddle L-Sit → 45° → 75° → 100° → 120° → 140° → 155° → 170° V-Sit → Manna. The existing generic V-Sit remains a separate retained skill.                                                                  |
| Legs                     | Split Squat → Deep Step-up → Pistol Negative → Pistol. Shrimp → Two-Hand Shrimp remains a separate branch. Dragon Squat retains the user's requested progression from pistol strength and reverse-lunge balance.                 |
| Posterior chain          | Glute Bridge → Nordic Negative → Nordic Curl; no single-leg bridge intermediate.                                                                                                                                                 |
| Hanging core/Dragon Flag | Hanging Knee Raise → Hanging Leg Raise → Toes-to-Bar → Hanging Windshield Wiper. Tuck Dragon Flag Negative → Advanced Tuck → Straddle → Full follows eligible community-chart stages; existing dynamic Tuck Dragon Flag remains. |

## Alternative routes, equipment, and practice

A preparation route is a complete set of requirements: **all** its prerequisites must be mastered, and **any one** complete route unlocks the target. Alternative routes supplement Tuck Front Lever, Bar Archer Pull-up, Tuck Ice Cream Maker, Handstand Push-up, Ring Dip, Pistol Squat Negative, and Advanced Tuck Dragon Flag. They use unassisted preparation such as chin-ups, ring pulling, freestanding pressing, shrimp squat strength, and dynamic tuck Dragon Flag practice.

Goal planning chooses a single route per step, includes its supporting dependencies, and stops at mastered skills. With equipment preferences supplied, it first favors fewer steps requiring unavailable equipment, then fewer outstanding requirements; the standard route wins ties. The tree shows the union of routes; dashed edges identify alternatives. Resetting a prerequisite preserves dependent progress when another complete route remains.

Equipment substitutions apply to specific exercises, with notes about grip, stability, clearance, and range. Suitable floor holds may use parallettes; L-sit/V-sit positions may use appropriate floor or raised supports; eligible levers may use a bar or rings. The Full-Range Handstand Push-up needs raised supports, whereas head-to-floor pressing can use the floor. Bar Archer Pull-up retains a fixed bar; Ring Archer Pull-up has its own level and entry. Ring planches, Pelican Planche, ring muscle-ups, Iron Cross, and Maltese retain rings. Bar-contact skills such as bar muscle-ups and Hefesto retain their required apparatus. The Gym option does not imply rings.

Practice entries record repetitions and hold durations per set, independently of manual mastery and Personal Records. Consistency counts distinct local calendar dates. Weekly/monthly analytics multiply per-set volume by the number of sets and preserve bests per set. Catalog expansion and level changes do not reinterpret existing practice entries.

## Excluded progressions

Assisted, one-leg intermediate, and weighted progression nodes are excluded. This includes band, wall, spotter, handrail, and foot-supported suspended-skill milestones. The exclusion of one-leg variants applies to intermediate lever/L-sit/bridge shapes; intrinsic unilateral exercises such as **Pistol, Shrimp, and Dragon Squat** remain.

Tucks, straddles, half-lays with both knees bent, and controlled negatives remain because they change leverage or isolate the eccentric phase while carrying the prescribed bodyweight. Normal foot contact in push-ups, rows/curls, pike positions, and squats is part of the movement. A decline pike uses a box to increase shoulder load. A Nordic's ankle anchor fixes the feet; the negative permits a hand catch after the working descent, and the full curl does not use a hand push to return.

Weighted values in editable Personal Records, such as `12 reps + 10 kg`, remain valid. Excluding weighted progression nodes does not remove or rewrite those saved values.

## Existing records and migration

Retained skill IDs keep their movement meanings. The existing `advanced-shrimp-squat` ID is displayed as **Two-Hand Shrimp Squat**, matching its established both-hands-behind-the-body execution and BC10 rather than silently assigning the chart's differently named advanced stage. Generic V-Sit, pronated One-Arm Pull-up, and floor Handstand Push-up are not relabeled as their new angle-, grip-, or range-specific counterparts. The new milestones have separate IDs.

Personal Records, valid practice entries, equipment, and retained goals stay attached to their existing IDs. New preparation requirements can relock earlier training/mastery states. The parser preserves those states in `archivedSkills`, accessible under **Overview → Previous skill records**, rather than inventing mastery for new prerequisites. Once the required route is complete, a retained skill becomes eligible for manual training/mastery again; archived state is historical and is not automatically restored.

Earlier retired IDs remain archived: `one-leg-front-lever`, `one-leg-back-lever`, `one-leg-l-sit`, `single-leg-glute-bridge`, removed assisted milestones, and the old `front-lever-row` that described a tuck row. Their saved records are not reassigned to a full-body or other new skill. Retired goals leave the active list. Archives persist across reload, cross-tab synchronization, and profile backup, and do not count toward active completion or recommendations.

The profile remains **version 2** under the existing `calisthenics-skill-tree:v1` localStorage key. Version 1 profiles migrate with an empty practice log. Browser and desktop profiles remain separate unless transferred with **Overview → Profile backup**. Desktop version **0.2.1** keeps the same storage origin and user-data directory, so replacing the executable preserves its profile.

## Maintaining the catalog

For a source-matched skill, add its exact apparatus/range-specific cell, text, level, origin, and selected variant to `src/data/overcomingGravity.ts`. Its mapped level overrides the definition's fallback estimate. Keep reference generation in `src/data/references.ts`; unmatched estimates must not acquire a chart level or source label.

Add stable definitions in `src/data/skills.ts` or `src/data/og2Skills.ts`, muscle profiles in `src/data/muscles.ts` or `src/data/og2Muscles.ts`, and exercise-specific options in `src/data/trainingOptions.ts`. Calibrate unmatched integer estimates from 1 to 17 against the anchors above. Keep numeric range, tiers, and source wording centralized in `src/lib/difficulty.ts`.

Check source cells, excluded variants, apparatus/range distinctions, duplicate IDs, dependency reachability and cycles, alternative routes, graph layout, equipment requirements, and record migration before release. Never rename a persisted ID to represent a different movement.
