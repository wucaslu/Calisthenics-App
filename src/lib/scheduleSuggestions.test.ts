import { describe, expect, it } from "vitest";
import { skillById, skills } from "@/data/skills";
import { createDemoProfile } from "@/lib/profile";
import { getSkillState } from "@/lib/progression";
import { canScheduleSkill } from "@/lib/schedule";
import {
  applyWeeklyScheduleSuggestion,
  generateWeeklyScheduleSuggestion,
} from "@/lib/scheduleSuggestions";
import type { UserProfile, Weekday, WeeklySchedule } from "@/types/skill";

function floorProfile(): UserProfile {
  return {
    version: 2,
    progress: {
      "push-up": "mastered",
      "scapular-push-up": "mastered",
      "planche-lean": "training",
    },
    personalRecords: { "push-up": "13 clean reps" },
    goals: ["full-planche"],
    equipment: ["floor"],
    archivedSkills: {},
    practiceLog: [
      {
        id: "existing-practice",
        skillId: "push-up",
        date: "2026-09-20",
        sets: 2,
        repetitions: 10,
        notes: "Keep this log",
      },
    ],
  };
}

describe("weekly schedule suggestions", () => {
  it("prioritizes the unlocked next goal step and explains its goal connection", () => {
    const profile = floorProfile();
    const suggestion = generateWeeklyScheduleSuggestion(profile, {
      days: ["monday"],
      skillsPerDay: 1,
    });
    expect(suggestion.schedule).toEqual({ monday: ["planche-lean"] });
    expect(suggestion.days.monday?.[0]).toMatchObject({
      skill: skillById["planche-lean"],
      goalIds: ["full-planche"],
    });
    expect(suggestion.days.monday?.[0].reason).toContain("Full Planche");
    expect(suggestion.days.monday?.[0].reason).toContain("current training");
    expect(suggestion.goalIds).toEqual(["full-planche"]);
    expect(suggestion.unavailableGoalIds).toEqual([]);
  });

  it("covers two different goals even in a single two-slot day", () => {
    const profile = floorProfile();
    profile.goals = ["full-planche", "dragon-squat"];
    const suggestion = generateWeeklyScheduleSuggestion(profile, {
      days: ["monday"],
      skillsPerDay: 2,
    });
    expect(suggestion.schedule.monday).toHaveLength(2);
    expect(suggestion.schedule.monday?.[0]).toBe("planche-lean");
    expect(suggestion.days.monday?.[1].skill.category).toBe("legs");
    expect(canScheduleSkill(suggestion.schedule.monday![1], profile)).toBe(
      true,
    );
    expect(suggestion.days.monday?.flatMap((choice) => choice.goalIds)).toEqual(
      ["full-planche", "dragon-squat"],
    );
  });

  it("rotates goal focus across one-slot sessions instead of repeating the first goal", () => {
    const profile = createDemoProfile();
    profile.goals = ["full-planche", "dragon-squat", "tuck-front-lever"];
    const suggestion = generateWeeklyScheduleSuggestion(profile, {
      days: ["monday", "wednesday", "friday"],
      skillsPerDay: 1,
    });
    expect(suggestion.days.monday?.[0].goalIds).toContain("full-planche");
    expect(suggestion.days.wednesday?.[0].goalIds).toContain("dragon-squat");
    expect(suggestion.days.friday?.[0].goalIds).toContain("tuck-front-lever");
    expect(suggestion.schedule.monday).not.toEqual(
      suggestion.schedule.wednesday,
    );
  });

  it("counts a shared next step for both goals and gives another goal its own slot", () => {
    const profile = floorProfile();
    profile.goals = ["tuck-planche", "full-planche", "dragon-squat"];
    const suggestion = generateWeeklyScheduleSuggestion(profile, {
      days: ["monday"],
      skillsPerDay: 2,
    });
    expect(suggestion.days.monday?.[0].goalIds).toEqual([
      "tuck-planche",
      "full-planche",
    ]);
    expect(suggestion.days.monday?.[1].goalIds).toEqual(["dragon-squat"]);
  });

  it("uses a completed alternative route and equipment substitution without inventing optional supporters", () => {
    const profile = createDemoProfile();
    delete profile.progress["pull-up"];
    profile.progress["chin-up"] = "mastered";
    profile.equipment = ["rings"];
    profile.goals = ["tuck-front-lever"];
    const suggestion = generateWeeklyScheduleSuggestion(profile, {
      days: ["monday", "wednesday", "friday"],
      skillsPerDay: 6,
    });
    expect(suggestion.schedule.monday?.[0]).toBe("tuck-front-lever");
    expect(suggestion.unavailableGoalIds).toEqual([]);
    const choices = Object.values(suggestion.days).flat();
    expect(
      choices.every((choice) => canScheduleSkill(choice.skill.id, profile)),
    ).toBe(true);
    expect(
      choices.some(
        (choice) =>
          choice.skill.id === "chin-up" &&
          choice.goalIds.includes("tuck-front-lever"),
      ),
    ).toBe(true);
    expect(
      choices
        .filter((choice) => choice.skill.id === "pull-up")
        .every((choice) => !choice.goalIds.includes("tuck-front-lever")),
    ).toBe(true);
    expect(choices.map((choice) => choice.skill.id)).not.toContain(
      "chest-to-bar-pull-up",
    );
  });

  it("reports blocked active goals and excludes unknown, inherited-name, duplicate, and mastered goals", () => {
    const profile = createDemoProfile();
    profile.equipment = ["floor"];
    profile.goals = [
      "chest-to-bar-pull-up",
      "fake",
      "constructor",
      "one-leg-front-lever",
      "push-up",
      "chest-to-bar-pull-up",
    ];
    const suggestion = generateWeeklyScheduleSuggestion(profile, {
      days: ["monday"],
      skillsPerDay: 3,
    });
    expect(suggestion.goalIds).toEqual(["chest-to-bar-pull-up"]);
    expect(suggestion.unavailableGoalIds).toEqual(["chest-to-bar-pull-up"]);
    expect(suggestion.schedule.monday).toHaveLength(3);
    expect(suggestion.schedule.monday).not.toContain("chest-to-bar-pull-up");
    expect(suggestion.schedule.monday).not.toContain("pull-up");
  });

  it("balances available groups without goals and gives current training priority", () => {
    const profile: UserProfile = {
      ...floorProfile(),
      goals: [],
      progress: {},
      equipment: ["pull-up-bar"],
    };
    const suggestion = generateWeeklyScheduleSuggestion(profile, {
      days: ["monday"],
      skillsPerDay: 4,
    });
    expect(
      new Set(suggestion.days.monday?.map((choice) => choice.skill.category)),
    ).toEqual(new Set(["pull", "push", "legs", "core"]));
    expect(suggestion.goalIds).toEqual([]);
    const training = generateWeeklyScheduleSuggestion(
      { ...floorProfile(), goals: [] },
      { days: ["monday"], skillsPerDay: 3 },
    );
    expect(training.schedule.monday?.[0]).toBe("planche-lean");
    expect(training.days.monday?.[0].reason).toContain("already training");
  });

  it("provides mastered maintenance and rotates choices when no advancement goals remain", () => {
    const profile = createDemoProfile();
    profile.goals = [];
    profile.equipment = ["gym", "rings"];
    profile.progress = Object.fromEntries(
      skills.map((skill) => [skill.id, "mastered" as const]),
    );
    const suggestion = generateWeeklyScheduleSuggestion(profile, {
      days: ["monday", "wednesday", "friday"],
      skillsPerDay: 4,
    });
    const choices = Object.values(suggestion.days).flat();
    expect(choices).toHaveLength(12);
    expect(
      choices.every((choice) => choice.reason.includes("Maintain a mastered")),
    ).toBe(true);
    expect(
      choices.every(
        (choice) =>
          getSkillState(choice.skill, profile.progress) === "mastered",
      ),
    ).toBe(true);
    expect(suggestion.schedule.monday).not.toEqual(
      suggestion.schedule.wednesday,
    );
    for (const day of ["monday", "wednesday", "friday"] as const)
      expect(
        new Set(suggestion.days[day]?.map((choice) => choice.skill.category))
          .size,
      ).toBe(4);
  });

  it("is deterministic, normalizes chronological days, and bounds session sizes", () => {
    const profile = floorProfile();
    const options = {
      days: ["friday", "monday", "friday", "fake"] as Weekday[],
      skillsPerDay: 100,
    };
    const suggestion = generateWeeklyScheduleSuggestion(profile, options);
    expect(Object.keys(suggestion.schedule)).toEqual(["monday", "friday"]);
    expect(suggestion.schedule.monday).toHaveLength(6);
    expect(generateWeeklyScheduleSuggestion(profile, options)).toEqual(
      suggestion,
    );
    for (const skillsPerDay of [0, -4, 1.9])
      expect(
        generateWeeklyScheduleSuggestion(profile, {
          days: ["monday"],
          skillsPerDay,
        }).schedule.monday,
      ).toHaveLength(1);
    for (const skillsPerDay of [Number.NaN, Number.POSITIVE_INFINITY])
      expect(
        generateWeeklyScheduleSuggestion(profile, {
          days: ["monday"],
          skillsPerDay,
        }).schedule.monday,
      ).toHaveLength(3);
    expect(
      generateWeeklyScheduleSuggestion(profile, { days: [], skillsPerDay: 3 })
        .schedule,
    ).toEqual({});
  });

  it("never mutates the profile or suggests locked, missing-equipment, or duplicate daily skills", () => {
    const profile = floorProfile();
    profile.weeklySchedule = { sunday: ["push-up"] };
    const before = structuredClone(profile);
    const suggestion = generateWeeklyScheduleSuggestion(profile, {
      days: [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
      ],
      skillsPerDay: 6,
    });
    for (const [day, ids] of Object.entries(suggestion.schedule)) {
      expect(new Set(ids).size).toBe(ids.length);
      expect(ids.every((id) => canScheduleSkill(id, profile))).toBe(true);
      expect(
        suggestion.days[day as Weekday]?.map((choice) => choice.skill.id),
      ).toEqual(ids);
      expect(ids).not.toContain("full-planche");
      expect(ids).not.toContain("dead-hang");
    }
    expect(profile).toEqual(before);
  });
});

describe("applying schedule suggestions", () => {
  it("merges atomically while preserving manual slots, unavailable saved skills, and all other profile data", () => {
    const profile = floorProfile();
    profile.weeklySchedule = {
      monday: ["push-up", "full-planche"],
      sunday: ["dead-hang"],
    };
    const before = structuredClone(profile);
    const applied = applyWeeklyScheduleSuggestion(profile, {
      monday: [
        "push-up",
        "planche-lean",
        "planche-lean",
        "fake",
        "full-planche",
      ],
      wednesday: ["push-up"],
    });
    expect(applied.weeklySchedule).toEqual({
      monday: ["push-up", "full-planche", "planche-lean"],
      wednesday: ["push-up"],
      sunday: ["dead-hang"],
    });
    expect(applied.weeklySchedule?.sunday).toBe(profile.weeklySchedule.sunday);
    expect(profile).toEqual(before);
    for (const key of [
      "progress",
      "personalRecords",
      "goals",
      "equipment",
      "archivedSkills",
      "practiceLog",
    ] as const)
      expect(applied[key]).toBe(profile[key]);
    expect(
      applyWeeklyScheduleSuggestion(applied, applied.weeklySchedule!),
    ).toBe(applied);
  });

  it("rechecks current prerequisites and equipment before applying an older preview", () => {
    const previous = createDemoProfile();
    const changed: UserProfile = {
      ...previous,
      equipment: ["floor"],
      progress: { ...previous.progress },
      weeklySchedule: { friday: ["pull-up"] },
    };
    delete changed.progress["scapular-push-up"];
    const applied = applyWeeklyScheduleSuggestion(changed, {
      monday: ["planche-lean", "pull-up", "push-up"],
    });
    expect(applied.weeklySchedule).toEqual({
      friday: ["pull-up"],
      monday: ["push-up"],
    });
    expect(changed.weeklySchedule).toEqual({ friday: ["pull-up"] });
  });

  it("returns the original profile for empty, invalid, inherited, and duplicate-only suggestions", () => {
    const profile = floorProfile();
    profile.weeklySchedule = { monday: ["push-up"] };
    expect(applyWeeklyScheduleSuggestion(profile, {})).toBe(profile);
    expect(
      applyWeeklyScheduleSuggestion(profile, {
        monday: [
          "push-up",
          "full-planche",
          "constructor",
          "one-leg-front-lever",
        ],
      }),
    ).toBe(profile);
    expect(
      applyWeeklyScheduleSuggestion(profile, {
        fake: ["planche-lean"],
      } as WeeklySchedule),
    ).toBe(profile);
    expect(
      applyWeeklyScheduleSuggestion(
        profile,
        Object.create({ monday: ["planche-lean"] }) as WeeklySchedule,
      ),
    ).toBe(profile);
    expect(
      applyWeeklyScheduleSuggestion(profile, {
        monday: "planche-lean",
      } as unknown as WeeklySchedule),
    ).toBe(profile);
  });
});
