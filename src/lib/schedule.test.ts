import { describe, expect, it } from "vitest";
import { skillById, skills } from "@/data/skills";
import { createDemoProfile, parseProfile, STORAGE_KEY } from "@/lib/profile";
import { getSkillState, updateSkillProgress } from "@/lib/progression";
import {
  addScheduledSkill,
  canScheduleSkill,
  getSchedulableSkills,
  removeScheduledSkill,
  sanitizeWeeklySchedule,
  WEEKDAYS,
  WEEKDAY_LABELS,
} from "@/lib/schedule";
import type { UserProfile, Weekday } from "@/types/skill";

describe("weekly schedule eligibility", () => {
  it("includes available, training, and mastered skills while excluding locked skills", () => {
    const profile = createDemoProfile();
    for (const [id, state] of [
      ["chin-up", "available"],
      ["planche-lean", "training"],
      ["push-up", "mastered"],
    ]) {
      expect(getSkillState(skillById[id], profile.progress)).toBe(state);
      expect(canScheduleSkill(id, profile)).toBe(true);
    }
    expect(canScheduleSkill("full-planche", profile)).toBe(false);
    expect(
      canScheduleSkill("full-planche", {
        ...profile,
        progress: { ...profile.progress, "full-planche": "mastered" },
      }),
    ).toBe(false);
    for (const id of ["fake", "constructor", "one-leg-front-lever"])
      expect(canScheduleSkill(id, profile)).toBe(false);
    const selected = getSchedulableSkills(profile);
    expect(selected.map((skill) => skill.id)).toContain("chin-up");
    expect(selected.map((skill) => skill.id)).toContain("planche-lean");
    expect(selected.map((skill) => skill.id)).toContain("push-up");
    expect(selected.map((skill) => skill.id)).not.toContain("full-planche");
    expect(selected.every((skill) => canScheduleSkill(skill.id, profile))).toBe(
      true,
    );
    expect(selected).toEqual(
      skills.filter((skill) => selected.includes(skill)),
    );
  });

  it("requires usable equipment and accepts only exercise-specific substitutions", () => {
    const profile = createDemoProfile();
    const floorOnly = {
      ...profile,
      equipment: ["floor"] as UserProfile["equipment"],
    };
    expect(canScheduleSkill("push-up", floorOnly)).toBe(true);
    expect(canScheduleSkill("pull-up", floorOnly)).toBe(false);
    expect(canScheduleSkill("chest-to-bar-pull-up", floorOnly)).toBe(false);
    const ringsOnly = {
      ...profile,
      equipment: ["rings"] as UserProfile["equipment"],
    };
    expect(canScheduleSkill("pull-up", ringsOnly)).toBe(true);
    expect(canScheduleSkill("chest-to-bar-pull-up", ringsOnly)).toBe(false);
    const gym = { ...profile, equipment: ["gym"] as UserProfile["equipment"] };
    expect(canScheduleSkill("chest-to-bar-pull-up", gym)).toBe(true);
    expect(canScheduleSkill("inverted-row", gym)).toBe(true);
  });

  it("accepts a complete alternative prerequisite route without requiring the standard route", () => {
    const profile = createDemoProfile();
    delete profile.progress["pull-up"];
    profile.progress["chin-up"] = "mastered";
    expect(canScheduleSkill("tuck-front-lever", profile)).toBe(true);
    profile.progress["chin-up"] = "training";
    expect(canScheduleSkill("tuck-front-lever", profile)).toBe(false);
  });
});

describe("weekly schedule edits", () => {
  it("adds immutably, rejects duplicates in a day, and permits the same skill on separate days", () => {
    const original = createDemoProfile();
    original.personalRecords = { "push-up": "20 weighted reps" };
    original.practiceLog = [
      {
        id: "untouched-practice",
        skillId: "push-up",
        date: "2026-01-02",
        sets: 3,
        repetitions: 10,
        notes: "Practice already completed",
      },
    ];
    const snapshot = structuredClone(original);
    const monday = addScheduledSkill(original, "monday", "push-up");
    expect(monday.weeklySchedule).toEqual({ monday: ["push-up"] });
    expect(addScheduledSkill(monday, "monday", "push-up")).toBe(monday);
    const expanded = addScheduledSkill(
      addScheduledSkill(monday, "monday", "planche-lean"),
      "wednesday",
      "push-up",
    );
    expect(expanded.weeklySchedule).toEqual({
      monday: ["push-up", "planche-lean"],
      wednesday: ["push-up"],
    });
    expect(monday.weeklySchedule).toEqual({ monday: ["push-up"] });
    expect(original).toEqual(snapshot);
    for (const key of [
      "progress",
      "personalRecords",
      "goals",
      "equipment",
      "archivedSkills",
      "practiceLog",
    ] as const)
      expect(expanded[key]).toBe(original[key]);
  });

  it("leaves the profile unchanged for invalid days, unknown skills, locked skills, or missing equipment", () => {
    const profile = createDemoProfile();
    expect(addScheduledSkill(profile, "fake" as Weekday, "push-up")).toBe(
      profile,
    );
    for (const id of [
      "full-planche",
      "fake",
      "constructor",
      "one-leg-front-lever",
    ])
      expect(addScheduledSkill(profile, "monday", id)).toBe(profile);
    const floorOnly: UserProfile = { ...profile, equipment: ["floor"] };
    expect(addScheduledSkill(floorOnly, "monday", "pull-up")).toBe(floorOnly);
  });

  it("removes only the chosen assignment and omits the field after its final removal", () => {
    const original = addScheduledSkill(
      addScheduledSkill(
        addScheduledSkill(createDemoProfile(), "monday", "push-up"),
        "monday",
        "planche-lean",
      ),
      "wednesday",
      "push-up",
    );
    const removed = removeScheduledSkill(original, "monday", "push-up");
    expect(removed.weeklySchedule).toEqual({
      monday: ["planche-lean"],
      wednesday: ["push-up"],
    });
    expect(original.weeklySchedule?.monday).toEqual([
      "push-up",
      "planche-lean",
    ]);
    expect(removeScheduledSkill(removed, "monday", "push-up")).toBe(removed);
    expect(removeScheduledSkill(removed, "friday", "push-up")).toBe(removed);
    expect(removeScheduledSkill(removed, "fake" as Weekday, "push-up")).toBe(
      removed,
    );
    expect(removeScheduledSkill(removed, "monday", "constructor")).toBe(
      removed,
    );
    const last = removeScheduledSkill(
      removeScheduledSkill(removed, "monday", "planche-lean"),
      "wednesday",
      "push-up",
    );
    expect(last).toEqual(createDemoProfile());
    expect(Object.hasOwn(last, "weeklySchedule")).toBe(false);
  });

  it("keeps existing plans after progress resets or equipment changes and still allows their removal", () => {
    const scheduled = addScheduledSkill(
      createDemoProfile(),
      "friday",
      "chest-to-bar-pull-up",
    );
    const changed: UserProfile = {
      ...scheduled,
      progress: updateSkillProgress(scheduled.progress, "pull-up", "reset"),
      equipment: ["floor"],
    };
    expect(canScheduleSkill("chest-to-bar-pull-up", changed)).toBe(false);
    expect(changed.weeklySchedule).toEqual({
      friday: ["chest-to-bar-pull-up"],
    });
    expect(parseProfile(JSON.stringify(changed))?.weeklySchedule).toEqual(
      changed.weeklySchedule,
    );
    expect(
      removeScheduledSkill(changed, "friday", "chest-to-bar-pull-up")
        .weeklySchedule,
    ).toBeUndefined();
  });
});

describe("weekly schedule persistence", () => {
  it("uses Monday to Sunday labels and preserves order within each day while recovering valid active IDs", () => {
    expect(WEEKDAYS.map((day) => WEEKDAY_LABELS[day])).toEqual([
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ]);
    const raw = {
      sunday: [
        "pull-up",
        "push-up",
        "pull-up",
        "one-leg-front-lever",
        "fake",
        "constructor",
        null,
      ],
      monday: ["full-planche"],
      tuesday: "push-up",
      wednesday: [],
      fake: ["push-up"],
    };
    const original = structuredClone(raw);
    expect(sanitizeWeeklySchedule(raw)).toEqual({
      monday: ["full-planche"],
      sunday: ["pull-up", "push-up"],
    });
    expect(raw).toEqual(original);
    for (const value of [undefined, null, 42, "bad", [], {}])
      expect(sanitizeWeeklySchedule(value)).toEqual({});
  });

  it("loads old profiles without adding a schedule field or changing the profile storage version/key", () => {
    const demo = createDemoProfile();
    expect(Object.hasOwn(demo, "weeklySchedule")).toBe(false);
    expect(parseProfile(JSON.stringify(demo))).toEqual(demo);
    expect(parseProfile(JSON.stringify({ ...demo, version: 1 }))).toEqual(demo);
    expect(STORAGE_KEY).toBe("calisthenics-skill-tree:v1");
    expect(
      parseProfile(JSON.stringify({ ...demo, weeklySchedule: {} })),
    ).toEqual(demo);
  });

  it("recovers corrupted local schedules without discarding valid profile data or assigning retired skills to replacements", () => {
    const profile = createDemoProfile();
    profile.personalRecords = { "push-up": "20 weighted reps" };
    profile.practiceLog = [
      {
        id: "preserved-log",
        skillId: "push-up",
        date: "2026-01-02",
        sets: 3,
        repetitions: 10,
        notes: "Keep this log",
      },
    ];
    for (const weeklySchedule of [null, [], "bad", 42])
      expect(
        parseProfile(JSON.stringify({ ...profile, weeklySchedule })),
      ).toEqual(profile);
    const recovered = parseProfile(
      JSON.stringify({
        ...profile,
        weeklySchedule: {
          monday: ["push-up", "one-leg-front-lever", "fake", "push-up"],
          friday: ["full-planche"],
          sunday: ["one-leg-front-lever"],
          bad: ["pull-up"],
        },
      }),
    )!;
    expect(recovered).toEqual({
      ...profile,
      weeklySchedule: { monday: ["push-up"], friday: ["full-planche"] },
    });
    expect(parseProfile(JSON.stringify(recovered))).toEqual(recovered);
    expect(recovered.progress["full-planche"]).toBeUndefined();
    expect(recovered.weeklySchedule?.sunday).toBeUndefined();
  });
});
