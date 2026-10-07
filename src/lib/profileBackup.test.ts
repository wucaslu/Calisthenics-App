import { describe, expect, it } from "vitest";
import { createDemoProfile, savePracticeToProfile } from "@/lib/profile";
import {
  createProfileBackup,
  PROFILE_BACKUP_MAX_BYTES,
  readProfileBackup,
} from "@/lib/profileBackup";

describe("profile backups", () => {
  it("round-trips all profile data for transfer between browser and desktop", () => {
    const profile = createDemoProfile();
    profile.personalRecords = { "pull-up": "12 reps + 5 kg" };
    profile.archivedSkills = {
      "wall-handstand": {
        name: "Wall Handstand",
        progress: "mastered",
        personalRecord: "40 sec",
      },
    };
    profile.practiceLog = [
      {
        id: "backup-practice",
        skillId: "pull-up",
        date: "2026-01-02",
        sets: 3,
        repetitions: 8,
        holdSeconds: 2.5,
        notes: "Transferred session",
      },
    ];
    const original = structuredClone(profile);
    const exported = createProfileBackup(profile);
    expect(JSON.parse(exported)).toEqual(profile);
    expect(readProfileBackup(exported)).toEqual(profile);
    expect(profile).toEqual(original);
  });

  it("migrates an old version 1 profile and archives retired milestones", () => {
    const backup = {
      version: 1,
      progress: { "push-up": "mastered", "wall-handstand": "mastered" },
      personalRecords: { "push-up": "20 reps", "wall-handstand": "30 sec" },
      goals: ["full-planche"],
      equipment: ["floor", "rings", "resistance-bands"],
    };
    expect(readProfileBackup(JSON.stringify(backup))).toEqual({
      version: 2,
      progress: { "push-up": "mastered" },
      personalRecords: { "push-up": "20 reps" },
      goals: ["full-planche"],
      equipment: ["floor", "rings"],
      practiceLog: [],
      archivedSkills: {
        "wall-handstand": {
          name: "Wall Handstand",
          progress: "mastered",
          personalRecord: "30 sec",
        },
      },
    });
  });

  it("transfers synchronized personal records and their source log without changing the backup format", () => {
    const profile = savePracticeToProfile(createDemoProfile(), {
      id: "synced-backup-practice",
      skillId: "pull-up",
      date: "2026-01-02",
      sets: 5,
      repetitions: 9,
      holdSeconds: 1.75,
      notes: "Logged personal record",
    });
    const restored = readProfileBackup(createProfileBackup(profile));
    expect(restored).toEqual(profile);
    expect(restored.personalRecords["pull-up"]).toBe("9 reps · 1.75 sec hold");
    expect(restored.version).toBe(2);
    expect(Object.keys(restored).sort()).toEqual(
      Object.keys(createDemoProfile()).sort(),
    );
  });

  it("backfills missing historical records during import while preserving saved manual text", () => {
    const profile = createDemoProfile();
    profile.personalRecords["push-up"] = "25 weighted reps";
    const entry = {
      id: "legacy-backup-practice",
      skillId: "pull-up",
      date: "2026-01-02",
      sets: 4,
      repetitions: 10,
      notes: "Before records were synchronized",
    };
    profile.practiceLog = [
      entry,
      {
        ...entry,
        id: "legacy-manual-record",
        skillId: "push-up",
        repetitions: 30,
      },
    ];
    const restored = readProfileBackup(createProfileBackup(profile));
    expect(restored.personalRecords).toEqual({
      "pull-up": "10 reps",
      "push-up": "25 weighted reps",
    });
    expect(restored.practiceLog).toEqual(profile.practiceLog);
    expect(profile.personalRecords).toEqual({ "push-up": "25 weighted reps" });
  });

  it("allows an intentionally empty profile and a UTF-8 BOM from a text editor", () => {
    const empty = {
      version: 2,
      progress: {},
      personalRecords: {},
      goals: [],
      equipment: ["floor"],
      archivedSkills: {},
      practiceLog: [],
    };
    expect(readProfileBackup("\uFEFF" + JSON.stringify(empty))).toEqual(empty);
  });

  it("rejects malformed JSON, unsupported versions, and unrelated files", () => {
    for (const raw of ["{", "null", "[]", '"text"', "{}", '{"version":2}'])
      expect(() => readProfileBackup(raw)).toThrow();
    for (const changes of [
      { version: 3 },
      { goals: [42] },
      { goals: ["made-up-skill"] },
      { equipment: [null] },
      { equipment: ["made-up-equipment"] },
      { progress: [] },
      { progress: { "push-up": "available" } },
      { progress: { "made-up-skill": "mastered" } },
    ])
      expect(() =>
        readProfileBackup(
          JSON.stringify({ ...createDemoProfile(), ...changes }),
        ),
      ).toThrow("not a supported");
  });

  it("rejects malformed records and archive data instead of silently dropping them", () => {
    for (const changes of [
      { personalRecords: null },
      { personalRecords: { "pull-up": 12 } },
      { personalRecords: { unknown: "12 reps" } },
      { archivedSkills: [] },
      { archivedSkills: { "wall-handstand": "40 sec" } },
      { archivedSkills: { "wall-handstand": { progress: "fake" } } },
    ])
      expect(() =>
        readProfileBackup(
          JSON.stringify({ ...createDemoProfile(), ...changes }),
        ),
      ).toThrow("not a supported");
  });

  it("rejects damaged practice history and duplicate IDs as a whole", () => {
    const valid = {
      id: "entry",
      skillId: "pull-up",
      date: "2026-01-02",
      sets: 3,
      repetitions: 8,
      notes: "Session",
    };
    for (const practiceLog of [
      null,
      [valid, { ...valid, id: "bad", sets: 0 }],
      [valid, valid],
      [valid, { ...valid, id: "bad-date", date: "2026-02-30" }],
      [valid, { ...valid, id: "bad-skill", skillId: "constructor" }],
    ])
      expect(() =>
        readProfileBackup(
          JSON.stringify({ ...createDemoProfile(), practiceLog }),
        ),
      ).toThrow("not a supported");
  });

  it("preserves valid practice dates even when a device clock moved backward", () => {
    const profile = createDemoProfile();
    profile.practiceLog = [
      {
        id: "future-device-clock",
        skillId: "pull-up",
        date: "9999-12-30",
        sets: 3,
        repetitions: 8,
        notes: "Keep stored calendar history",
      },
    ];
    expect(readProfileBackup(createProfileBackup(profile))).toEqual(profile);
  });

  it("bounds the UTF-8 byte size before parsing a backup", () => {
    expect(() =>
      readProfileBackup("x".repeat(PROFILE_BACKUP_MAX_BYTES + 1)),
    ).toThrow("smaller than 5 MB");
    expect(() =>
      readProfileBackup("é".repeat(PROFILE_BACKUP_MAX_BYTES / 2 + 1)),
    ).toThrow("smaller than 5 MB");
  });
});
