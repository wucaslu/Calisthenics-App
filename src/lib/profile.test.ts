import { describe, expect, it } from "vitest";
import { getGoalPath } from "@/lib/graph";
import { updateSkillProgress } from "@/lib/progression";
import { retiredSkillNames } from "@/data/retiredSkills";
import {
  createDemoProfile,
  parseProfile,
  PERSONAL_RECORD_MAX_LENGTH,
  updatePersonalRecord,
  savePracticeEntry,
  savePracticeToProfile,
  deletePracticeFromProfile,
} from "@/lib/profile";
import type { PracticeEntry } from "@/types/skill";

describe("removed saved graph views", () => {
  it("discards legacy view data from local storage without altering the current profile", () => {
    const profile = createDemoProfile();
    profile.personalRecords = { "push-up": "13 reps" };
    profile.weeklySchedule = { monday: ["push-up"] };
    for (const savedGraphViews of [
      [{ id: "old-view", name: "My graph", viewport: { x: 0, y: 0, zoom: 1 } }],
      null,
      "broken",
    ]) {
      expect(
        parseProfile(JSON.stringify({ ...profile, savedGraphViews })),
      ).toEqual(profile);
    }
  });
});

describe("personal records", () => {
  it("archives one-leg records and retains downstream mastery through the shorter routes", () => {
    const profile = createDemoProfile();
    const removed = [
      "one-leg-front-lever",
      "one-leg-back-lever",
      "one-leg-l-sit",
      "single-leg-glute-bridge",
    ];
    const successors = [
      "straddle-front-lever",
      "straddle-back-lever",
      "l-sit",
      "nordic-curl-negative",
    ];
    for (const goal of successors)
      for (const skill of getGoalPath(goal, profile.progress))
        profile.progress = updateSkillProgress(
          profile.progress,
          skill.id,
          "mastered",
        );
    for (const id of removed) {
      profile.progress[id] = "mastered";
      profile.personalRecords[id] = `${id} record`;
    }
    profile.personalRecords["straddle-front-lever"] = "10 seconds";
    profile.goals = [...removed, "full-front-lever", "v-sit"];
    const parsed = parseProfile(JSON.stringify(profile))!;
    for (const id of removed) {
      expect(parsed.progress[id]).toBeUndefined();
      expect(parsed.personalRecords[id]).toBeUndefined();
      expect(parsed.archivedSkills[id]).toEqual({
        name: retiredSkillNames[id],
        progress: "mastered",
        personalRecord: `${id} record`,
      });
    }
    for (const id of successors) expect(parsed.progress[id]).toBe("mastered");
    expect(parsed.personalRecords["straddle-front-lever"]).toBe("10 seconds");
    expect(parsed.goals).toEqual(["full-front-lever", "v-sit"]);
    expect(parsed.equipment).toEqual(profile.equipment);
    expect(parseProfile(JSON.stringify(parsed))).toEqual(parsed);
  });
  it("retains existing advanced mastery and records when ratings change and new skills are added", () => {
    const profile = createDemoProfile();
    for (const goal of ["full-planche", "pelican-press"])
      for (const skill of getGoalPath(goal, profile.progress))
        profile.progress = updateSkillProgress(
          profile.progress,
          skill.id,
          "mastered",
        );
    profile.personalRecords = {
      "full-planche": "5 seconds",
      "pelican-press": "2 reps",
      "90-degree-hold": "3 seconds",
      "pelican-planche": "1 cycle",
    };
    profile.goals = ["90-degree-hold", "pelican-planche"];
    const parsed = parseProfile(JSON.stringify(profile))!;
    expect(parsed).toEqual(profile);
    expect(parsed.progress["full-planche"]).toBe("mastered");
    expect(parsed.progress["90-degree-hold"]).toBeUndefined();
    expect(parsed.progress["pelican-planche"]).toBeUndefined();
    expect(parsed.archivedSkills).toEqual({});
  });
  it("preserves records, practice, goals, and archived mastery when workbook routes add missing prerequisites", () => {
    const profile = createDemoProfile();
    for (const skill of getGoalPath("full-planche", profile.progress))
      profile.progress = updateSkillProgress(
        profile.progress,
        skill.id,
        "mastered",
      );
    // An older profile can have full-planche mastery without this newly added step.
    delete profile.progress["half-lay-planche"];
    profile.personalRecords = {
      "full-planche": "5 seconds",
      "pull-up": "12 reps + 10 kg",
    };
    profile.practiceLog = [
      {
        id: "pre-workbook-planche",
        skillId: "full-planche",
        date: "2026-01-02",
        sets: 3,
        holdSeconds: 5,
        notes: "Before the updated progression chart",
      },
    ];
    profile.archivedSkills["one-leg-front-lever"] = {
      name: retiredSkillNames["one-leg-front-lever"],
      progress: "mastered",
      personalRecord: "8 seconds",
    };
    profile.goals = ["full-planche", "manna"];

    const parsed = parseProfile(JSON.stringify(profile))!;
    expect(parsed.progress["half-lay-planche"]).toBeUndefined();
    expect(parsed.progress["full-planche"]).toBeUndefined();
    expect(parsed.archivedSkills["full-planche"]).toEqual({
      name: "Full Planche",
      progress: "mastered",
    });
    expect(parsed.archivedSkills["one-leg-front-lever"]).toEqual(
      profile.archivedSkills["one-leg-front-lever"],
    );
    expect(parsed.personalRecords).toEqual(profile.personalRecords);
    expect(parsed.practiceLog).toEqual(profile.practiceLog);
    expect(parsed.goals).toEqual(profile.goals);
    expect(parsed.equipment).toEqual(profile.equipment);
    expect(parseProfile(JSON.stringify(parsed))).toEqual(parsed);
  });
  it("removes retired band entries while preserving records through revised prerequisites", () => {
    const parsed = parseProfile(
      JSON.stringify({
        ...createDemoProfile(),
        progress: {
          ...createDemoProfile().progress,
          "high-pull-up": "mastered",
          "band-muscle-up": "mastered",
        },
        goals: ["band-muscle-up", "muscle-up", "back-lever"],
        equipment: ["floor", "pull-up-bar", "rings", "resistance-bands"],
        personalRecords: {
          "high-pull-up": "3 reps",
          "band-muscle-up": "5 reps",
          "back-lever": "6 seconds",
          "front-lever-row": "5 tuck rows",
        },
      }),
    );
    expect(parsed?.goals).toEqual(["muscle-up", "back-lever"]);
    expect(parsed?.equipment).toEqual(["floor", "pull-up-bar", "rings"]);
    expect(parsed?.progress["band-muscle-up"]).toBeUndefined();
    expect(parsed?.progress["high-pull-up"]).toBeUndefined();
    expect(parsed?.personalRecords).toEqual({
      "high-pull-up": "3 reps",
      "back-lever": "6 seconds",
    });
    expect(parsed?.progress["pull-up"]).toBe("mastered");
    expect(parsed?.personalRecords["full-front-lever-row"]).toBeUndefined();
    expect(parsed?.archivedSkills["front-lever-row"]).toEqual({
      name: "Front Lever Row (tuck variation)",
      personalRecord: "5 tuck rows",
    });
    expect(parsed?.archivedSkills["band-muscle-up"]).toEqual({
      name: "Band-Assisted Muscle-up",
      progress: "mastered",
      personalRecord: "5 reps",
    });
  });
  it("archives retired records and relocked progress without granting new mastery", () => {
    const parsed = parseProfile(
      JSON.stringify({
        ...createDemoProfile(),
        progress: {
          ...createDemoProfile().progress,
          "assisted-pistol-squat": "mastered",
          "pistol-squat": "mastered",
        },
        personalRecords: {
          "assisted-pistol-squat": "10 reps",
          "pistol-squat": "5 reps",
        },
        goals: ["assisted-pistol-squat", "pistol-squat"],
      }),
    )!;
    expect(parsed.progress["pistol-squat"]).toBeUndefined();
    expect(parsed.progress["pistol-squat-negative"]).toBeUndefined();
    expect(parsed.personalRecords["pistol-squat"]).toBe("5 reps");
    expect(parsed.archivedSkills["assisted-pistol-squat"]).toEqual({
      name: "Assisted Pistol Squat",
      progress: "mastered",
      personalRecord: "10 reps",
    });
    expect(parsed.archivedSkills["pistol-squat"]).toEqual({
      name: "Pistol Squat",
      progress: "mastered",
    });
    expect(parsed.goals).toEqual(["pistol-squat"]);
    expect(parseProfile(JSON.stringify(parsed))).toEqual(parsed);
  });
  it("validates archived entries and never accepts stored display names or unknown IDs", () => {
    const parsed = parseProfile(
      JSON.stringify({
        ...createDemoProfile(),
        archivedSkills: {
          "wall-handstand": {
            name: "wrong name",
            personalRecord: "x".repeat(300),
            progress: "mastered",
          },
          "assisted-pistol-squat": { personalRecord: 10, progress: "fake" },
          constructor: { personalRecord: "100" },
          fake: { personalRecord: "100" },
        },
      }),
    )!;
    expect(Object.keys(parsed.archivedSkills)).toEqual(["wall-handstand"]);
    expect(parsed.archivedSkills["wall-handstand"].name).toBe("Wall Handstand");
    expect(parsed.archivedSkills["wall-handstand"].personalRecord).toHaveLength(
      PERSONAL_RECORD_MAX_LENGTH,
    );
  });
  it("upgrades an existing profile without losing progress, goals, or equipment", () => {
    const { personalRecords, ...oldProfile } = createDemoProfile();
    expect(personalRecords).toEqual({});
    expect(parseProfile(JSON.stringify(oldProfile))).toEqual(
      createDemoProfile(),
    );
  });

  it("round-trips time, repetitions, and weighted records independently of mastery", () => {
    const profile = {
      ...createDemoProfile(),
      personalRecords: {
        "tuck-planche": "25 seconds",
        "pull-up": "12 reps + 10 kg",
      },
    };
    expect(parseProfile(JSON.stringify(profile))).toEqual(profile);
  });

  it("ignores unknown skill IDs, blank records, and non-string values", () => {
    const profile = parseProfile(
      JSON.stringify({
        ...createDemoProfile(),
        personalRecords: {
          "push-up": "20 reps",
          "dead-hang": "   ",
          "pull-up": 10,
          "tuck-planche": { value: 25 },
          fake: "100 reps",
          constructor: "100 reps",
        },
      }),
    );
    expect(profile?.personalRecords).toEqual({ "push-up": "20 reps" });
    expect(profile?.progress).toEqual(createDemoProfile().progress);
  });

  it("recovers malformed records without discarding the rest of the profile", () => {
    for (const personalRecords of [null, [], "bad data", 42]) {
      expect(
        parseProfile(
          JSON.stringify({ ...createDemoProfile(), personalRecords }),
        ),
      ).toEqual(createDemoProfile());
    }
  });

  it("edits and clears only the selected skill without mutating existing records", () => {
    const original = { "push-up": "20 reps", "dead-hang": "30 seconds" };
    const edited = updatePersonalRecord(original, "push-up", "12 reps + 10 kg");
    expect(edited).toEqual({
      "push-up": "12 reps + 10 kg",
      "dead-hang": "30 seconds",
    });
    expect(original["push-up"]).toBe("20 reps");
    expect(updatePersonalRecord(edited, "push-up", " ")).toEqual({
      "dead-hang": "30 seconds",
    });
    expect(updatePersonalRecord(edited, "fake", "12 reps")).toBe(edited);
  });

  it("bounds record length in edits and persisted data", () => {
    const longRecord = "x".repeat(PERSONAL_RECORD_MAX_LENGTH + 50);
    const profile = {
      ...createDemoProfile(),
      personalRecords: { "push-up": longRecord },
    };
    expect(
      updatePersonalRecord({}, "push-up", longRecord)["push-up"],
    ).toHaveLength(PERSONAL_RECORD_MAX_LENGTH);
    expect(
      parseProfile(JSON.stringify(profile))?.personalRecords["push-up"],
    ).toHaveLength(PERSONAL_RECORD_MAX_LENGTH);
  });
});

describe("version 2 profiles", () => {
  const entry = {
    id: "practice-test-1",
    skillId: "tuck-planche",
    date: "2026-01-02",
    sets: 3,
    holdSeconds: 12.5,
    notes: "Clean tuck holds",
  };

  it("migrates version 1 without losing records or preferences and keeps the storage format reusable", () => {
    const { practiceLog, ...profile } = createDemoProfile();
    expect(practiceLog).toEqual([]);
    const old = {
      ...profile,
      version: 1,
      personalRecords: { "pull-up": "12 reps" },
    };
    const parsed = parseProfile(JSON.stringify(old))!;
    expect(parsed).toEqual({ ...old, version: 2, practiceLog: [] });
    expect(parseProfile(JSON.stringify(parsed))).toEqual(parsed);
  });

  it("backfills a missing personal record from practice without changing mastery", () => {
    const profile = createDemoProfile();
    profile.practiceLog = savePracticeEntry([], entry);
    const parsed = parseProfile(JSON.stringify(profile))!;
    expect(parsed).toEqual({
      ...profile,
      personalRecords: { "tuck-planche": "12.5 sec hold" },
    });
    expect(parsed.progress["tuck-planche"]).toBeUndefined();
    expect(parsed.personalRecords).toEqual({ "tuck-planche": "12.5 sec hold" });
    expect(parseProfile(JSON.stringify(parsed))).toEqual(parsed);
  });

  it("recovers valid history entries without discarding the rest of a profile", () => {
    const profile = createDemoProfile();
    const parsed = parseProfile(
      JSON.stringify({
        ...profile,
        practiceLog: [
          entry,
          null,
          { ...entry, id: "unknown", skillId: "fake" },
          { ...entry, id: "bad-date", date: "2026-02-30" },
          entry,
        ],
      }),
    )!;
    expect(parsed).toEqual({
      ...profile,
      practiceLog: [entry],
      personalRecords: { "tuck-planche": "12.5 sec hold" },
    });
    for (const value of [null, {}, "wrong", 5]) {
      expect(
        parseProfile(JSON.stringify({ ...profile, practiceLog: value })),
      ).toEqual(profile);
    }
    expect(parseProfile(JSON.stringify({ ...profile, version: 3 }))).toBeNull();
  });

  it("replaces an edited entry by ID and rejects invalid changes", () => {
    const original = [entry];
    const changed = { ...entry, holdSeconds: 20, notes: "Longer hold" };
    expect(savePracticeEntry(original, changed)).toEqual([changed]);
    expect(original).toEqual([entry]);
    expect(savePracticeEntry(original, { ...entry, sets: 0 })).toBe(original);
    expect(
      savePracticeEntry(original, { ...entry, holdSeconds: Number.NaN }),
    ).toBe(original);
  });

  it("keeps stored calendar history when the device clock or timezone moves backward", () => {
    const profile = createDemoProfile();
    const stored = { ...entry, date: "9999-12-30" };
    expect(
      parseProfile(JSON.stringify({ ...profile, practiceLog: [stored] }))
        ?.practiceLog,
    ).toEqual([stored]);
    expect(savePracticeEntry([], stored)).toEqual([]);
  });
});

describe("practice-linked personal records", () => {
  const today = "2026-01-10";
  const entry: PracticeEntry = {
    id: "record-practice",
    skillId: "pull-up",
    date: "2026-01-02",
    sets: 3,
    repetitions: 12,
    holdSeconds: 2.5,
    notes: "Controlled repetitions",
  };

  it("replaces manual record text with independent per-set bests while preserving the rest of the profile", () => {
    const original = createDemoProfile();
    original.personalRecords = {
      "pull-up": "10 reps + 15 kg",
      "dead-hang": "45 seconds",
    };
    const snapshot = structuredClone(original);
    const saved = savePracticeToProfile(original, entry, today);
    expect(saved.personalRecords).toEqual({
      "pull-up": "12 reps · 2.5 sec hold",
      "dead-hang": "45 seconds",
    });
    expect(saved.practiceLog).toEqual([entry]);
    expect(saved.progress).toBe(original.progress);
    expect(saved.goals).toBe(original.goals);
    expect(saved.equipment).toBe(original.equipment);
    expect(original).toEqual(snapshot);

    const lowerRepsLongerHold = {
      ...entry,
      id: "different-metric-bests",
      sets: 8,
      repetitions: 7,
      holdSeconds: 5.25,
    };
    const next = savePracticeToProfile(saved, lowerRepsLongerHold, today);
    expect(next.personalRecords["pull-up"]).toBe("12 reps · 5.25 sec hold");
    expect(saved.practiceLog).toEqual([entry]);
    expect(saved.personalRecords["pull-up"]).toBe("12 reps · 2.5 sec hold");
  });

  it("retains a best through weaker sessions and falls back after editing or deleting its source entry", () => {
    const profile = savePracticeToProfile(createDemoProfile(), entry, today);
    const lower: PracticeEntry = {
      ...entry,
      id: "lower-session",
      repetitions: 8,
      holdSeconds: 1.25,
    };
    const withLower = savePracticeToProfile(profile, lower, today);
    expect(withLower.personalRecords["pull-up"]).toBe("12 reps · 2.5 sec hold");
    const edited = savePracticeToProfile(
      withLower,
      { ...entry, repetitions: 6, holdSeconds: 0.5 },
      today,
    );
    expect(edited.personalRecords["pull-up"]).toBe("8 reps · 1.25 sec hold");
    const deleted = deletePracticeFromProfile(edited, lower.id, today);
    expect(deleted.personalRecords["pull-up"]).toBe("6 reps · 0.5 sec hold");
    expect(
      deletePracticeFromProfile(deleted, entry.id, today).personalRecords,
    ).toEqual({});
    expect(withLower.practiceLog).toEqual([entry, lower]);
  });

  it("clears only the automatic metric removed by an edit and clears a final entry's record", () => {
    const saved = savePracticeToProfile(createDemoProfile(), entry, today);
    const { repetitions, ...holdOnly } = entry;
    expect(repetitions).toBe(12);
    const edited = savePracticeToProfile(saved, holdOnly, today);
    expect(edited.personalRecords["pull-up"]).toBe("2.5 sec hold");
    const cleared = deletePracticeFromProfile(edited, entry.id, today);
    expect(cleared.personalRecords["pull-up"]).toBeUndefined();
    expect(cleared.practiceLog).toEqual([]);
    expect(edited.personalRecords["pull-up"]).toBe("2.5 sec hold");
  });

  it("recalculates both skill records when an entry is moved without touching unrelated manual records", () => {
    const profile = createDemoProfile();
    profile.personalRecords = {
      "push-up": "20 weighted reps",
      "dead-hang": "30 seconds",
    };
    const saved = savePracticeToProfile(profile, entry, today);
    const lower = savePracticeToProfile(
      saved,
      {
        ...entry,
        id: "remaining-pull-up",
        repetitions: 6,
        holdSeconds: 1,
      },
      today,
    );
    const moved = savePracticeToProfile(
      lower,
      { ...entry, skillId: "push-up" },
      today,
    );
    expect(moved.personalRecords).toEqual({
      "pull-up": "6 reps · 1 sec hold",
      "push-up": "12 reps · 2.5 sec hold",
      "dead-hang": "30 seconds",
    });
    expect(
      moved.practiceLog.find((item) => item.id === entry.id)?.skillId,
    ).toBe("push-up");
    expect(lower.personalRecords["push-up"]).toBe("20 weighted reps");
  });

  it("returns the original profile for invalid saves and nonexistent deletions", () => {
    const profile = createDemoProfile();
    for (const changes of [
      { skillId: "fake" },
      { skillId: "constructor" },
      { sets: 0 },
      { repetitions: 1.5 },
      { holdSeconds: Number.NaN },
      { holdSeconds: Number.POSITIVE_INFINITY },
      { date: "2026-02-30" },
      { date: "2026-01-11" },
    ])
      expect(
        savePracticeToProfile(profile, { ...entry, ...changes }, today),
      ).toBe(profile);
    expect(deletePracticeFromProfile(profile, "missing", today)).toBe(profile);
  });

  it("updates retired practice in its canonical archive without moving the record or mastery to a replacement skill", () => {
    const profile = createDemoProfile();
    profile.archivedSkills["front-lever-row"] = {
      name: "Stored display name",
      progress: "mastered",
      personalRecord: "5 tuck rows",
    };
    const retired = { ...entry, skillId: "front-lever-row" };
    const saved = savePracticeToProfile(profile, retired, today);
    expect(saved.archivedSkills[retired.skillId]).toEqual({
      name: retiredSkillNames[retired.skillId],
      progress: "mastered",
      personalRecord: "12 reps · 2.5 sec hold",
    });
    expect(saved.personalRecords[retired.skillId]).toBeUndefined();
    expect(saved.personalRecords["full-front-lever-row"]).toBeUndefined();
    expect(saved.progress["full-front-lever-row"]).toBeUndefined();
    const moved = savePracticeToProfile(saved, entry, today);
    expect(moved.archivedSkills[retired.skillId]).toEqual({
      name: retiredSkillNames[retired.skillId],
      progress: "mastered",
    });
    expect(moved.personalRecords["pull-up"]).toBe("12 reps · 2.5 sec hold");
    expect(profile.archivedSkills[retired.skillId].personalRecord).toBe(
      "5 tuck rows",
    );
  });

  it("removes a retired record-only archive when its final practice entry is deleted", () => {
    const retired = { ...entry, skillId: "one-leg-front-lever" };
    const saved = savePracticeToProfile(createDemoProfile(), retired, today);
    expect(saved.archivedSkills[retired.skillId]?.personalRecord).toBe(
      "12 reps · 2.5 sec hold",
    );
    expect(
      deletePracticeFromProfile(saved, retired.id, today).archivedSkills[
        retired.skillId
      ],
    ).toBeUndefined();
    expect(saved.archivedSkills[retired.skillId]?.personalRecord).toBe(
      "12 reps · 2.5 sec hold",
    );
  });

  it("backfills only missing records from valid past logs, including retired skills", () => {
    const profile = createDemoProfile();
    profile.personalRecords = { "pull-up": "   ", "push-up": "Manual 20 reps" };
    profile.archivedSkills["one-leg-front-lever"] = {
      name: "Untrusted display name",
      progress: "training",
    };
    profile.archivedSkills["one-leg-back-lever"] = {
      name: "One-Leg Back Lever",
      personalRecord: "Manual 10 seconds",
    };
    const parsed = parseProfile(
      JSON.stringify({
        ...profile,
        practiceLog: [
          entry,
          {
            ...entry,
            id: "push-up-history",
            skillId: "push-up",
            repetitions: 30,
          },
          {
            ...entry,
            id: "retired-history",
            skillId: "one-leg-front-lever",
            holdSeconds: 3.75,
          },
          { ...entry, id: "retired-manual", skillId: "one-leg-back-lever" },
          {
            ...entry,
            id: "future-history",
            repetitions: 100,
            date: "2026-01-11",
          },
          { ...entry, id: "invalid-history", repetitions: -1 },
          { ...entry, id: "unknown-history", skillId: "made-up-skill" },
        ],
      }),
      today,
    )!;
    expect(parsed.personalRecords).toEqual({
      "pull-up": "12 reps · 2.5 sec hold",
      "push-up": "Manual 20 reps",
    });
    expect(parsed.archivedSkills["one-leg-front-lever"]).toEqual({
      name: retiredSkillNames["one-leg-front-lever"],
      progress: "training",
      personalRecord: "12 reps · 3.75 sec hold",
    });
    expect(parsed.archivedSkills["one-leg-back-lever"]?.personalRecord).toBe(
      "Manual 10 seconds",
    );
    expect(parsed.practiceLog.map((row) => row.id)).toContain("future-history");
    expect(parsed.practiceLog).toHaveLength(5);
    expect(parsed.progress).toEqual(profile.progress);
    expect(parseProfile(JSON.stringify(parsed), today)).toEqual(parsed);
  });

  it("retains clock-shifted future history without backfilling its metrics or discarding it on the next save", () => {
    const future = { ...entry, date: "2026-01-11", repetitions: 100 };
    const parsed = parseProfile(
      JSON.stringify({ ...createDemoProfile(), practiceLog: [future] }),
      today,
    )!;
    expect(parsed.practiceLog).toEqual([future]);
    expect(parsed.personalRecords).toEqual({});
    const saved = savePracticeToProfile(
      parsed,
      { ...entry, id: "past-session" },
      today,
    );
    expect(saved.personalRecords["pull-up"]).toBe("12 reps · 2.5 sec hold");
    expect(saved.practiceLog).toEqual([
      future,
      { ...entry, id: "past-session" },
    ]);
    const tomorrow = parseProfile(
      JSON.stringify({ ...parsed, personalRecords: {} }),
      "2026-01-11",
    )!;
    expect(tomorrow.personalRecords["pull-up"]).toBe("100 reps · 2.5 sec hold");
  });

  it("preserves a manual edit on reload until the next practice save replaces it with the logged best", () => {
    const saved = savePracticeToProfile(createDemoProfile(), entry, today);
    const manual = {
      ...saved,
      personalRecords: updatePersonalRecord(
        saved.personalRecords,
        "pull-up",
        "8 reps + 20 kg",
      ),
    };
    const reloaded = parseProfile(JSON.stringify(manual), today)!;
    expect(reloaded.personalRecords["pull-up"]).toBe("8 reps + 20 kg");
    const next = savePracticeToProfile(
      reloaded,
      { ...entry, id: "weaker-session", repetitions: 5 },
      today,
    );
    expect(next.personalRecords["pull-up"]).toBe("12 reps · 2.5 sec hold");
    expect(reloaded.personalRecords["pull-up"]).toBe("8 reps + 20 kg");
  });
});
