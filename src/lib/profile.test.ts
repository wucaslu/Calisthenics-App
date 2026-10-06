import { describe, expect, it } from "vitest";
import { getGoalPath } from "@/lib/graph";
import { updateSkillProgress } from "@/lib/progression";
import { retiredSkillNames } from "@/data/retiredSkills";
import {
  createDemoProfile,
  parseProfile,
  PERSONAL_RECORD_MAX_LENGTH,
  updatePersonalRecord,
} from "@/lib/profile";

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
