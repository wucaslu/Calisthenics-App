import { describe, expect, it } from "vitest";
import {
  createDemoProfile,
  parseProfile,
  PERSONAL_RECORD_MAX_LENGTH,
  updatePersonalRecord,
} from "@/lib/profile";

describe("personal records", () => {
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
