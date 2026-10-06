import { describe, expect, it } from "vitest";
import {
  getLocalToday,
  getPracticeRecords,
  getPracticeSkillName,
  getPracticeTrends,
  PRACTICE_LIMITS,
  sanitizePracticeEntries,
  shiftCalendarDate,
  validatePracticeEntry,
} from "@/lib/practice";
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

describe("practice history validation", () => {
  it("accepts repetition-only, hold-only, and mixed practice independently of skill mastery", () => {
    expect(validatePracticeEntry(entry(), TODAY)).toBeNull();
    expect(
      validatePracticeEntry(
        entry({
          skillId: "full-planche",
          repetitions: undefined,
          holdSeconds: 2.5,
        }),
        TODAY,
      ),
    ).toBeNull();
    expect(validatePracticeEntry(entry({ holdSeconds: 10 }), TODAY)).toBeNull();
  });

  it("rejects missing metrics, non-finite values, fractions of repetitions, and implausible bounds", () => {
    for (const changes of [
      { repetitions: undefined, holdSeconds: undefined },
      { sets: 0 },
      { sets: 2.5 },
      { sets: PRACTICE_LIMITS.sets + 1 },
      { repetitions: 0 },
      { repetitions: 2.5 },
      { repetitions: PRACTICE_LIMITS.repetitions + 1 },
      { repetitions: Infinity },
      { holdSeconds: 0 },
      { holdSeconds: -5 },
      { holdSeconds: Infinity },
      { holdSeconds: NaN },
      { holdSeconds: PRACTICE_LIMITS.holdSeconds + 1 },
      { notes: "x".repeat(PRACTICE_LIMITS.notes + 1) },
    ])
      expect(validatePracticeEntry(entry(changes), TODAY)).not.toBeNull();
  });

  it("requires strict real calendar dates and refuses future practice", () => {
    for (const date of [
      "2026-2-01",
      "2026-02-30",
      "2026-02-29",
      "2026-13-01",
      "2026-00-01",
      "2026-10-00",
      "2026-10-07T00:00:00Z",
      "1899-12-31",
      "not a date",
      "2026-10-08",
    ])
      expect(validatePracticeEntry(entry({ date }), TODAY)).not.toBeNull();
    expect(
      validatePracticeEntry(entry({ date: "2024-02-29" }), TODAY),
    ).toBeNull();
    expect(validatePracticeEntry(entry({ date: TODAY }), TODAY)).toBeNull();
  });

  it("recovers valid entries without trusting unknown IDs, prototype names, or malformed payloads", () => {
    const valid = entry();
    const old = entry({
      id: "older",
      skillId: "one-leg-front-lever",
      date: "2025-01-10",
    });
    const result = sanitizePracticeEntries(
      [
        null,
        [],
        "invalid",
        { ...valid, id: "bad id" },
        { ...valid, id: "wrong-skill", skillId: "constructor" },
        { ...valid, id: "wrong-skill-two", skillId: "fake" },
        { ...valid, id: "numeric-notes", notes: 5 },
        { ...valid, id: "string-sets", sets: "3" },
        { ...valid, id: "null-metric", holdSeconds: null },
        { ...valid, injected: "untrusted" },
        { ...valid, repetitions: 99 },
        old,
      ],
      TODAY,
    );
    expect(result).toEqual([valid, old]);
    expect(result[0]).not.toBe(valid);
    expect(getPracticeSkillName("one-leg-front-lever")).toBe(
      "One-Leg Front Lever",
    );
    expect(getPracticeSkillName("constructor")).toBeNull();
    expect(valid.repetitions).toBe(5);
    for (const value of [null, {}, 42, "bad history"])
      expect(sanitizePracticeEntries(value, TODAY)).toEqual([]);
  });

  it("keeps all valid history rather than evicting older entries at an arbitrary limit", () => {
    const many = Array.from({ length: 1_200 }, (_, index) =>
      entry({ id: `practice-${index}` }),
    );
    expect(sanitizePracticeEntries(many, TODAY)).toHaveLength(1_200);
  });

  it("preserves stored calendar dates across timezone or clock changes while rejecting future new practice", () => {
    const tomorrow = entry({ id: "travel", date: "2026-10-08" });
    const later = entry({ id: "later-clock", date: "2100-01-01" });
    expect(sanitizePracticeEntries([tomorrow, later])).toEqual([
      tomorrow,
      later,
    ]);
    expect(validatePracticeEntry(tomorrow, TODAY)).toMatch(/future/);
    expect(validatePracticeEntry(later, TODAY)).toMatch(/future/);
    expect(sanitizePracticeEntries([tomorrow, later], TODAY)).toEqual([]);
    expect(getPracticeTrends([tomorrow, later], TODAY).totalEntries).toBe(0);
  });
});

describe("calendar dates and consistency", () => {
  it("uses local calendar dates and walks date boundaries without DST hour arithmetic", () => {
    expect(getLocalToday(new Date(2026, 9, 7, 0, 15))).toBe(TODAY);
    expect(shiftCalendarDate("2026-03-29", -1)).toBe("2026-03-28");
    expect(shiftCalendarDate("2026-03-29", 1)).toBe("2026-03-30");
    expect(shiftCalendarDate("2026-10-25", 1)).toBe("2026-10-26");
    expect(shiftCalendarDate("2024-03-01", -1)).toBe("2024-02-29");
    expect(shiftCalendarDate("2026-01-01", -1)).toBe("2025-12-31");
    expect(() => shiftCalendarDate("2026-02-30", 1)).toThrow();
  });

  it("counts a calendar day once across multiple entries, skills, and sets", () => {
    const history = [
      entry({ id: "a", date: "2026-10-07" }),
      entry({
        id: "b",
        date: "2026-10-07",
        skillId: "tuck-planche",
        repetitions: undefined,
        holdSeconds: 12,
        sets: 5,
      }),
      entry({ id: "c", date: "2026-10-01" }),
      entry({ id: "d", date: "2026-09-30" }),
      entry({ id: "e", date: "2026-09-24" }),
      entry({ id: "f", date: "2026-09-25" }),
      entry({ id: "old", date: "2024-01-01" }),
      entry({ id: "future", date: "2026-10-08" }),
    ];
    const trends = getPracticeTrends(history, TODAY);
    expect(trends.current).toEqual({
      start: "2026-10-01",
      end: TODAY,
      practiceDays: 2,
      entries: 3,
    });
    expect(trends.previous).toEqual({
      start: "2026-09-24",
      end: "2026-09-30",
      practiceDays: 3,
      entries: 3,
    });
    expect(trends.difference).toBe(-1);
    expect(trends.totalDays).toBe(6);
    expect(trends.totalEntries).toBe(7);
  });

  it("creates eight complete, consecutive 7-day windows including leap day and a DST transition", () => {
    const trends = getPracticeTrends(
      [
        entry({ id: "leap", date: "2024-02-29" }),
        entry({ id: "dst", date: "2024-03-31" }),
        entry({ id: "first", date: "2024-02-06" }),
        entry({ id: "before", date: "2024-02-05" }),
      ],
      "2024-04-01",
    );
    expect(trends.weeks).toHaveLength(8);
    expect(trends.weeks[0].start).toBe("2024-02-06");
    expect(trends.weeks[7]).toEqual({
      start: "2024-03-26",
      end: "2024-04-01",
      practiceDays: 1,
      entries: 1,
    });
    for (let index = 0; index < trends.weeks.length; index++) {
      const week = trends.weeks[index];
      expect(shiftCalendarDate(week.start, 6)).toBe(week.end);
      if (index > 0)
        expect(shiftCalendarDate(trends.weeks[index - 1].end, 1)).toBe(
          week.start,
        );
    }
    expect(trends.weeks.reduce((sum, week) => sum + week.practiceDays, 0)).toBe(
      3,
    );
    expect(trends.totalDays).toBe(4);
  });

  it("returns honest empty trends and compares performance within a skill rather than multiplying by sets", () => {
    const empty = getPracticeTrends([], TODAY);
    expect(empty.current.practiceDays).toBe(0);
    expect(empty.difference).toBe(0);
    expect(empty.totalEntries).toBe(0);
    const history = [
      entry({ id: "a", sets: 10, repetitions: 5 }),
      entry({ id: "b", sets: 1, repetitions: 8 }),
      entry({
        id: "c",
        skillId: "tuck-planche",
        repetitions: undefined,
        holdSeconds: 12.5,
      }),
      entry({
        id: "d",
        skillId: "tuck-planche",
        repetitions: undefined,
        holdSeconds: 9,
      }),
    ];
    expect(getPracticeRecords(history, "pull-up")).toEqual({
      repetitions: 8,
      holdSeconds: null,
    });
    expect(getPracticeRecords(history, "tuck-planche")).toEqual({
      repetitions: null,
      holdSeconds: 12.5,
    });
    expect(getPracticeRecords(history, "dead-hang")).toEqual({
      repetitions: null,
      holdSeconds: null,
    });
  });
});
