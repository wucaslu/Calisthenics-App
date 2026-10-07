import { describe, expect, it } from "vitest";
import {
  getTrainingAnalytics,
  getTrainingPeriodRange,
  shiftTrainingPeriod,
} from "@/lib/analytics";
import type { PracticeEntry } from "@/types/skill";

const TODAY = "2026-10-07";

function entry(overrides: Partial<PracticeEntry> = {}): PracticeEntry {
  return {
    id: "practice-one",
    skillId: "pull-up",
    date: TODAY,
    sets: 3,
    repetitions: 5,
    notes: "Clean repetitions",
    ...overrides,
  };
}

describe("training calendar periods", () => {
  it("uses Monday–Sunday weeks across month and year boundaries", () => {
    expect(getTrainingPeriodRange("2026-01-01", "week")).toEqual({
      start: "2025-12-29",
      end: "2026-01-04",
    });
    expect(getTrainingPeriodRange("2026-10-04", "week")).toEqual({
      start: "2026-09-28",
      end: "2026-10-04",
    });
    expect(getTrainingPeriodRange("2026-10-05", "week")).toEqual({
      start: "2026-10-05",
      end: "2026-10-11",
    });
    expect(shiftTrainingPeriod("2026-01-01", "week", -1)).toBe("2025-12-22");
    expect(shiftTrainingPeriod("2025-12-31", "week", 1)).toBe("2026-01-05");
  });

  it("uses actual month lengths and navigates calendar starts from end-of-month dates", () => {
    expect(getTrainingPeriodRange("2024-02-20", "month")).toEqual({
      start: "2024-02-01",
      end: "2024-02-29",
    });
    expect(getTrainingPeriodRange("2026-02-20", "month").end).toBe(
      "2026-02-28",
    );
    expect(getTrainingPeriodRange("2026-04-30", "month").end).toBe(
      "2026-04-30",
    );
    expect(shiftTrainingPeriod("2024-01-31", "month", 1)).toBe("2024-02-01");
    expect(shiftTrainingPeriod("2026-12-31", "month", 1)).toBe("2027-01-01");
    expect(shiftTrainingPeriod("2026-01-31", "month", -1)).toBe("2025-12-01");
  });

  it("does not lose calendar days when weeks span DST changes", () => {
    const spring = getTrainingAnalytics([], "week", "2026-03-29", "2026-04-01");
    expect(spring.current.start).toBe("2026-03-23");
    expect(spring.current.end).toBe("2026-03-29");
    expect(spring.current.days).toBe(7);
    expect(spring.daily.map((day) => day.date)).toEqual([
      "2026-03-23",
      "2026-03-24",
      "2026-03-25",
      "2026-03-26",
      "2026-03-27",
      "2026-03-28",
      "2026-03-29",
    ]);
    const autumn = getTrainingAnalytics([], "week", "2026-10-25", "2026-10-27");
    expect(autumn.current.days).toBe(7);
    expect(autumn.current.end).toBe("2026-10-25");
    expect(shiftTrainingPeriod("2026-10-25", "week", 1)).toBe("2026-10-26");
  });

  it("rejects malformed dates and handles the oldest supported practice date", () => {
    for (const date of ["2026-02-29", "2026-2-01", "invalid", "2026-04-31"])
      expect(() => getTrainingPeriodRange(date, "month")).toThrow();
    expect(() => getTrainingAnalytics([], "week", TODAY, "invalid")).toThrow();
    const oldest = getTrainingAnalytics(
      [entry({ date: "1900-01-01" })],
      "month",
      "1900-01-01",
      "1900-01-01",
    );
    expect(oldest.current.totals.entries).toBe(1);
    expect(oldest.previous.start).toBe("1899-12-01");
    expect(oldest.previous.days).toBe(1);
  });
});

describe("training volume and consistency", () => {
  it("multiplies per-set metrics by sets, counts distinct days, and keeps per-set bests", () => {
    const analytics = getTrainingAnalytics(
      [
        entry({ id: "first", date: "2026-10-05" }),
        entry({
          id: "mixed",
          sets: 2,
          repetitions: 8,
          holdSeconds: 0.25,
        }),
        entry({
          id: "hold",
          skillId: "tuck-planche",
          sets: 4,
          repetitions: undefined,
          holdSeconds: 10.5,
        }),
      ],
      "week",
      TODAY,
      TODAY,
    );
    expect(analytics.current.totals).toEqual({
      practiceDays: 2,
      entries: 3,
      sets: 9,
      repetitions: 31,
      holdSeconds: 42.5,
      skills: 2,
    });
    expect(analytics.current.days).toBe(3);
    expect(analytics.current.consistency).toBeCloseTo((2 / 3) * 100);
    expect(analytics.skills).toEqual([
      {
        id: "pull-up",
        name: "Pull-up",
        category: "pull",
        entries: 2,
        sets: 5,
        repetitions: 31,
        holdSeconds: 0.5,
        bestRepetitions: 8,
        bestHoldSeconds: 0.25,
      },
      {
        id: "tuck-planche",
        name: "Tuck Planche",
        category: "push",
        entries: 1,
        sets: 4,
        repetitions: 0,
        holdSeconds: 42,
        bestRepetitions: null,
        bestHoldSeconds: 10.5,
      },
    ]);
    expect(analytics.daily.find((day) => day.date === TODAY)).toEqual({
      date: TODAY,
      entries: 2,
      sets: 6,
      repetitions: 16,
      holdSeconds: 42.5,
    });
    expect(analytics.groups[0]).toMatchObject({
      category: "pull",
      entries: 2,
      practiceDays: 2,
      sets: 5,
    });
    expect(analytics.groups[1]).toMatchObject({
      category: "push",
      entries: 1,
      practiceDays: 1,
      sets: 4,
    });
  });

  it("compares an ongoing week with the same elapsed weekdays of the preceding week", () => {
    const analytics = getTrainingAnalytics(
      [
        entry({ id: "monday", date: "2026-10-05" }),
        entry({ id: "wednesday", date: TODAY }),
        entry({ id: "previous-monday", date: "2026-09-28" }),
        entry({ id: "previous-wednesday", date: "2026-09-30" }),
        entry({ id: "previous-thursday", date: "2026-10-01" }),
        entry({ id: "older", date: "2026-09-27" }),
      ],
      "week",
      TODAY,
      TODAY,
    );
    expect(analytics.current).toMatchObject({
      start: "2026-10-05",
      end: "2026-10-11",
      through: TODAY,
      days: 3,
      totals: { practiceDays: 2, entries: 2 },
    });
    expect(analytics.previous).toMatchObject({
      start: "2026-09-28",
      end: "2026-10-04",
      through: "2026-09-30",
      days: 3,
      totals: { practiceDays: 2, entries: 2 },
    });
    expect(analytics.current.consistency).toBe(analytics.previous.consistency);
    expect(analytics.daily).toHaveLength(7);
    expect(analytics.daily.slice(3).every((day) => day.entries === 0)).toBe(
      true,
    );
  });

  it("compares an ongoing month to equal elapsed days and caps a shorter prior month", () => {
    const firstWeek = getTrainingAnalytics(
      [
        entry({ id: "current", date: "2024-03-07" }),
        entry({ id: "previous", date: "2024-02-07" }),
        entry({ id: "outside-comparison", date: "2024-02-08" }),
      ],
      "month",
      "2024-03-01",
      "2024-03-07",
    );
    expect(firstWeek.current.days).toBe(7);
    expect(firstWeek.previous.days).toBe(7);
    expect(firstWeek.previous.through).toBe("2024-02-07");
    expect(firstWeek.previous.totals.entries).toBe(1);
    const lateMonth = getTrainingAnalytics(
      [
        entry({ id: "leap", date: "2024-02-29" }),
        entry({ id: "current", date: "2024-03-30" }),
      ],
      "month",
      "2024-03-30",
      "2024-03-30",
    );
    expect(lateMonth.current.days).toBe(30);
    expect(lateMonth.previous.days).toBe(29);
    expect(lateMonth.previous.through).toBe("2024-02-29");
    expect(lateMonth.previous.totals.entries).toBe(1);
    expect(lateMonth.previous.consistency).toBeCloseTo((1 / 29) * 100);
  });

  it("compares completed historical periods at their full independent lengths", () => {
    const analytics = getTrainingAnalytics(
      [
        entry({ id: "january-last", date: "2024-01-31" }),
        entry({ id: "february-last", date: "2024-02-29" }),
        entry({ id: "outside", date: "2024-03-01" }),
      ],
      "month",
      "2024-02-15",
      "2024-03-07",
    );
    expect(analytics.current.days).toBe(29);
    expect(analytics.current.through).toBe("2024-02-29");
    expect(analytics.current.totals.entries).toBe(1);
    expect(analytics.previous.days).toBe(31);
    expect(analytics.previous.through).toBe("2024-01-31");
    expect(analytics.previous.totals.entries).toBe(1);
    expect(analytics.daily).toHaveLength(29);
    expect(analytics.daily.at(-1)?.entries).toBe(1);
  });

  it("keeps empty windows explicit rather than inventing trends or records", () => {
    const analytics = getTrainingAnalytics([], "month", TODAY, TODAY);
    expect(analytics.current.totals).toEqual({
      practiceDays: 0,
      entries: 0,
      sets: 0,
      repetitions: 0,
      holdSeconds: 0,
      skills: 0,
    });
    expect(analytics.current.consistency).toBe(0);
    expect(analytics.previous.consistency).toBe(0);
    expect(analytics.skills).toEqual([]);
    expect(analytics.daily).toHaveLength(31);
    expect(analytics.groups.map((group) => group.category)).toEqual([
      "pull",
      "push",
      "legs",
      "core",
      "previous",
    ]);
    expect(analytics.groups.every((group) => group.entries === 0)).toBe(true);
  });

  it("avoids floating-point hold noise while preserving very short positive holds", () => {
    const fractional = getTrainingAnalytics(
      Array.from({ length: 1_000 }, (_, index) =>
        entry({
          id: `fractional-${index}`,
          repetitions: undefined,
          holdSeconds: 0.1,
          sets: 3,
        }),
      ),
      "week",
      TODAY,
      TODAY,
    );
    expect(fractional.current.totals.holdSeconds).toBe(300);
    const short = getTrainingAnalytics(
      [entry({ repetitions: undefined, holdSeconds: 0.00000001, sets: 3 })],
      "week",
      TODAY,
      TODAY,
    );
    expect(short.current.totals.holdSeconds).toBe(0.00000003);
    expect(short.skills[0].bestHoldSeconds).toBe(0.00000001);
  });
});

describe("analytics history recovery", () => {
  it("deduplicates entry IDs, drops invalid data, preserves retired history, and never mutates storage", () => {
    const valid = entry();
    const retired = entry({
      id: "retired",
      skillId: "one-leg-front-lever",
      sets: 2,
      repetitions: undefined,
      holdSeconds: 4,
    });
    const input = [
      valid,
      entry({ repetitions: 99 }),
      retired,
      entry({ id: "future", date: "2026-10-08" }),
      entry({ id: "unknown", skillId: "unknown-skill" }),
      entry({ id: "prototype", skillId: "constructor" }),
      entry({ id: "invalid-date", date: "2026-02-30" }),
      entry({ id: "negative", sets: -3 }),
      entry({ id: "fractional-reps", repetitions: 2.5 }),
      entry({ id: "nonfinite", holdSeconds: Infinity }),
      entry({ id: "missing", repetitions: undefined }),
    ];
    const before = structuredClone(input);
    const analytics = getTrainingAnalytics(input, "week", TODAY, TODAY);
    expect(analytics.current.totals).toMatchObject({
      entries: 2,
      practiceDays: 1,
      sets: 5,
      repetitions: 15,
      holdSeconds: 8,
      skills: 2,
    });
    expect(
      analytics.skills.find((skill) => skill.id === retired.skillId),
    ).toMatchObject({
      name: "One-Leg Front Lever",
      category: "previous",
      bestHoldSeconds: 4,
    });
    expect(analytics.groups.at(-1)).toMatchObject({
      category: "previous",
      entries: 1,
      practiceDays: 1,
      holdSeconds: 8,
    });
    expect(input).toEqual(before);
    expect(input[0]).toBe(valid);
    expect(input.find((item) => item.id === "future")).toBeDefined();
    expect(
      analytics.daily.find((day) => day.date === "2026-10-08")?.entries,
    ).toBe(0);
  });

  it("clamps future navigation to the current calendar period without analyzing future records", () => {
    const history = [
      entry(),
      entry({ id: "travel", date: "2026-10-08" }),
      entry({ id: "later-clock", date: "2100-01-01" }),
    ];
    const analytics = getTrainingAnalytics(
      history,
      "month",
      "2100-01-01",
      TODAY,
    );
    expect(analytics.current.start).toBe("2026-10-01");
    expect(analytics.current.through).toBe(TODAY);
    expect(analytics.current.totals.entries).toBe(1);
    expect(history).toHaveLength(3);
  });

  it("sorts skill breakdowns by sets, then name, independently of storage ordering", () => {
    const history = [
      entry({ id: "push", skillId: "push-up", sets: 3 }),
      entry({ id: "pull", skillId: "pull-up", sets: 3 }),
      entry({ id: "squat", skillId: "bodyweight-squat", sets: 5 }),
    ];
    const analytics = getTrainingAnalytics(history, "week", TODAY, TODAY);
    expect(analytics.skills.map((skill) => skill.id)).toEqual([
      "bodyweight-squat",
      "pull-up",
      "push-up",
    ]);
    expect(
      getTrainingAnalytics([...history].reverse(), "week", TODAY, TODAY).skills,
    ).toEqual(analytics.skills);
  });
});
