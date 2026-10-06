# Progression research and catalog decisions

Reviewed online on 6 October 2026. The catalog contains 103 skills: Pull 42, Push 35, Legs 14, Core 12. This revision adds 34 movements and removes 10 assisted preparation milestones plus one ambiguous tuck-row entry from the previous 80-skill tree.

## Sources and their limits

Direct requests to Steven Low, GMB, FitnessFAQs, and general search engines were blocked by the cloud network proxy. GitHub search and public GitHub repositories were accessible. The references below were downloaded and inspected; links pin the exact versions reviewed. No inaccessible coaching page or official Overcoming Gravity difficulty chart is presented as verified research.

| Reference                                                                                                                                                                                                           | Material used                                                                                                                                                           | Limits                                                                                                                                                               |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Bodyweight Fitness Recommended Routine data](https://github.com/mazurio/bodyweight-fitness-android/blob/19806813ff36b6c52d1b59e2731f731f05913a54/app/src/main/res/raw/bodyweight_fitness_recommended_routine.json) | Published levels within pull-ups, rows, pushing, dips, support practice, squats, L-sits, and handstands                                                                 | Archived community implementation of the Recommended Routine; its levels apply within each progression. It also contains assisted variants, which this app excludes. |
| [Recommended Routine summary](https://github.com/NearHuscarl/recommended-routine/blob/16dcd8736d535d98f8a4e9a253783b4b4cbfc31c/README.md)                                                                           | Separate push, row, squat, dip, pull-up, L-sit, and bodyline foundations                                                                                                | An older community summary, rather than the current official routine.                                                                                                |
| [Start Bodyweight chart, adapted by Alex Schwamle](https://github.com/AlexSchwamle/CustomizedCalisthenicsChart/blob/eb52b4b3030a97c96fcee995a51d742004ec57d5/CurrentRoutine.png)                                    | Archer rows/pulls/push-ups, eccentric one-arm pulls, one-arm push-ups, pike pressing, frog-to-handstand, elbow lever, pistol and shrimp squats, hanging core variations | A community adaptation with personal modifications. Only progression concepts and movement names are used; images are not copied into the app.                       |
| [Strong Journal community catalog](https://github.com/mmaksi/overcoming-gravity/blob/a4cbf1ba12af8df956e8b267f344cd1f97fc5abf/src/lib/data/seed.ts)                                                                 | Tuck → advanced tuck → one-leg/straddle → full lever shapes, L-sit shapes, rows, bridges, Nordic curls                                                                  | Community exercise descriptions. The repository name does not establish endorsement by Steven Low or official Overcoming Gravity ratings.                            |
| [Advanced static exercise catalog](https://github.com/nobody-qwert/training/blob/234166a762f0a3d474be55e1d3c6013b4f1cb2a8/all_exercises_data.js)                                                                    | Identification of front/back lever, planche, iron cross, Maltese, V-sit/Manna as static movements                                                                       | Supports movement identification, not numerical difficulty or a validated training sequence.                                                                         |

## Difficulty and progression levels

The app's five difficulty bands are **estimates**, not a universal calisthenics grading system or a conversion from gymnastics competition scores. Strength, balance, mobility, body proportions, and execution standards affect difficulty.

| App band         | Intended meaning                                                    | Examples                                                             |
| ---------------- | ------------------------------------------------------------------- | -------------------------------------------------------------------- |
| 1 · Foundation   | Basic bodyweight control                                            | Push-up, bodyweight squat, dead hang, hollow hold                    |
| 2 · Beginner     | Basic repetitions or short supported-on-the-hands bodyweight shapes | Pull-up, dip, diamond push-up, ring support, tuck L-sit              |
| 3 · Intermediate | More demanding leverage, compression, or independent balance        | Tuck front lever, tuck planche, freestanding handstand, pistol squat |
| 4 · Advanced     | Long lever shapes or demanding unilateral/dynamic strength          | Back lever, one-arm push-up, Nordic curl, V-sit, muscle-up           |
| 5 · Elite        | Highest strength demands represented in this catalog                | Full planche, full front lever, one-arm pull-up, iron cross, Maltese |

Published source levels appear separately in skill details when the archived Recommended Routine provides them. For example, Diamond Push-up is **Pushing progression Level 4** in that source, while its app difficulty is **2 · Beginner**. Neither number replaces the other. Within-source levels are not comparable across progression families.

## Route organization

The four primary groups remain Pull, Push, Legs, and Core. Each progression has a named lane; prerequisites appear above dependent skills. Branch filters and global search include supporting prerequisites. Mobile lists use the same named progression families and show difficulty alongside Dynamic/Static labels.

| Family           | Route decisions                                                                                                                                                                                                                                            |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Bar muscle-up    | Preserve the user's sequence: Pull-up → Chest-to-Bar → Explosive → High → Muscle-up → Strict Muscle-up. Straight-Bar Dip remains a pressing prerequisite. The exact ordering is the user's requested route, not a claim that every source uses this chain. |
| Ring muscle-up   | False-Grip Hang + Ring Pull-up + Ring Dip → Ring Muscle-up. A bar muscle-up is no longer required.                                                                                                                                                         |
| Rows             | Inverted Row → Archer Row → One-Arm Row. Front-lever rows have separate tuck, advanced-tuck, and full-body milestones.                                                                                                                                     |
| Front/back lever | Use increasing body leverage from tuck through longer shapes to full holds. One-leg and straddle shapes form a preferred app route; athletes can train them in a different order.                                                                          |
| Push-up strength | Add Diamond, Archer, One-Arm Negative, and One-Arm Push-up. Archer movements are distinct two-handed exercises, rather than assisted one-arm milestones.                                                                                                   |
| Handstand        | Exclude wall milestones. Floor Pike Hold and bodyline control prepare for independent handstand practice; Pike → Decline Pike strengthens pressing. Removing wall nodes does not mean walls are ineffective teaching tools.                                |
| L-sit            | Hollow Body → Tuck L-Sit → One-Leg L-Sit → L-Sit → V-Sit. Hanging exercises are not required to unlock the floor/parallette L-sit route.                                                                                                                   |
| Legs             | Split Squat → Deep Step-up → Pistol Negative → Pistol. Shrimp → Advanced Shrimp forms a separate branch. Dragon Squat builds on pistol strength and reverse-lunge balance.                                                                                 |
| Posterior chain  | Glute Bridge → Single-Leg Bridge → Nordic Negative → Nordic Curl.                                                                                                                                                                                          |
| Core             | Hanging Knee Raise → Hanging Leg Raise to horizontal → strict Toes-to-Bar → Hanging Windshield Wiper. Tuck Dragon Flag precedes full Dragon Flag.                                                                                                          |

All edges are **required app unlock criteria**, not claims of universal physiological prerequisites. An athlete can use a different training route outside the app. Repetition/hold benchmarks remain illustrative and do not automatically assess mastery.

Dragon Squat, Pelican, Hefesto, and the detailed Maltese/Iron Cross preparation routes retain **custom app sequencing**. The accessible sources did not establish published levels for these routes. Their difficulty is estimated, and details without a reviewed movement reference explicitly say that no published level is assigned. The community static catalog supports the names Maltese/Iron Cross, but not their intermediate route. Unassisted cross/Maltese negatives are rated Elite; they are not beginner preparation steps.

## What counts as unassisted

Excluded milestones use a band, wall, spotter, handrail, or foot support to reduce the load of a suspended skill. Removed entries include assisted pistols/dragons, wall handstands/toe pulls, and foot-supported cross, Maltese, Pelican, and German-hang preparation variants. There are no assisted skill names in the active catalog.

Tucks, straddles, one-leg lever shapes, and controlled negatives remain: they change leverage or isolate the eccentric phase while carrying their own prescribed bodyweight. Standard foot contact in push-ups, ring rows/curls, pike positions, and squats is part of the exercise. A decline pike uses a secure box to increase shoulder load. A Nordic's ankle anchor fixes the feet rather than lifting the trunk; its negative allows a hand catch only after the working descent, and the full curl uses no hand push on return.

## Existing progress and personal records

Stable IDs are preserved for retained skills. The legacy `front-lever-row` described a tuck variant and is retired into the archive; the full-body row has a new `full-front-lever-row` ID. Old tuck-row records are not reassigned to the new full-body skill. Their Personal Records remain editable independently of unlock state. New prerequisite routes can relock old mastery/training until the new route is completed; the app does not invent mastery for new prerequisites.

Removed milestone records and relocked training/mastery are preserved in `archivedSkills` within the existing version-1 profile. Open **Overview → Previous skill records** to review that history. Archived entries do not count toward completion, recommendations, or goals. Retired goals are removed from the active goal list. Archive contents survive reload and cross-tab synchronization, and stored names/records are validated before display.

## Maintaining the catalog

Keep reviewed source URLs and per-progression published levels in `src/data/references.ts`. Assign a reference only when it actually supports the movement or progression described. Leave `referenceLevel` absent for app estimates. Add new stable IDs in `src/data/skills.ts`, choose a group/branch, and check dependency reachability, duplicate IDs, cycles, equipment, lane overlap, and record migration before release.
