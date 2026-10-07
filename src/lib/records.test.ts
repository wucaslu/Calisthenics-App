import { describe, expect, it, vi } from "vitest";
import {
  formatLoggedPersonalRecord,
  getLoggedPersonalRecords,
  getPracticeRecordHistory,
} from "@/lib/records";
import type { PracticeEntry } from "@/types/skill";

const TODAY = "2026-10-07";

function entry(
  id: string,
  overrides: Partial<PracticeEntry> = {},
): PracticeEntry {
  return {
    id,
    skillId: "pull-up",
    date: TODAY,
    sets: 3,
    repetitions: 5,
    notes: "",
    ...overrides,
  };
}

describe("logged personal records", () => {
  it("keeps each skill's best single-set metrics independently of set volume", () => {
    const history = [
      entry("many-sets", { sets: 100, repetitions: 5, holdSeconds: 3 }),
      entry("most-reps", { sets: 1, repetitions: 12, holdSeconds: 1 }),
      entry("longest-hold", {
        repetitions: undefined,
        holdSeconds: 5.25,
      }),
      entry("other-skill", {
        skillId: "tuck-planche",
        repetitions: 99,
        holdSeconds: 100,
      }),
    ];
    const snapshot = structuredClone(history);
    expect(getLoggedPersonalRecords(history, "pull-up", TODAY)).toEqual({
      repetitions: 12,
      holdSeconds: 5.25,
    });
    expect(getLoggedPersonalRecords(history, "tuck-planche", TODAY)).toEqual({
      repetitions: 99,
      holdSeconds: 100,
    });
    expect(getLoggedPersonalRecords(history, "dead-hang", TODAY)).toEqual({
      repetitions: null,
      holdSeconds: null,
    });
    expect(history).toEqual(snapshot);
  });

  it("aggregates same-day maxima in chronological order without depending on insertion order", () => {
    const history = [
      entry("late", { date: "2026-10-06", repetitions: 12 }),
      entry("first-hold", {
        date: "2026-10-01",
        repetitions: undefined,
        holdSeconds: 2.5,
      }),
      entry("first-reps", { date: "2026-10-01", repetitions: 5 }),
      entry("same-day-better", { date: "2026-10-01", repetitions: 8 }),
      entry("middle", {
        date: "2026-10-03",
        repetitions: 7,
        holdSeconds: 4.25,
      }),
      entry("other-skill", {
        date: "2026-09-01",
        skillId: "chin-up",
        repetitions: 50,
      }),
    ];
    const expected = [
      {
        date: "2026-10-01",
        repetitions: 8,
        holdSeconds: 2.5,
        newRepetitions: true,
        newHold: true,
      },
      {
        date: "2026-10-03",
        repetitions: 8,
        holdSeconds: 4.25,
        newRepetitions: false,
        newHold: true,
      },
      {
        date: "2026-10-06",
        repetitions: 12,
        holdSeconds: 4.25,
        newRepetitions: true,
        newHold: false,
      },
    ];
    expect(getPracticeRecordHistory(history, "pull-up", TODAY)).toEqual(
      expected,
    );
    expect(
      getPracticeRecordHistory([...history].reverse(), "pull-up", TODAY),
    ).toEqual(expected);
  });

  it("omits ties and lower performances while carrying forward independent records", () => {
    expect(
      getPracticeRecordHistory(
        [
          entry("first", { date: "2026-10-01", repetitions: 10 }),
          entry("tie", { date: "2026-10-02", repetitions: 10 }),
          entry("lower", { date: "2026-10-03", repetitions: 8 }),
          entry("first-hold", {
            date: "2026-10-04",
            repetitions: undefined,
            holdSeconds: 0.125,
          }),
          entry("both-tie", {
            date: "2026-10-05",
            repetitions: 10,
            holdSeconds: 0.125,
          }),
          entry("both-improve", {
            date: "2026-10-06",
            repetitions: 11,
            holdSeconds: 0.25,
          }),
        ],
        "pull-up",
        TODAY,
      ),
    ).toEqual([
      {
        date: "2026-10-01",
        repetitions: 10,
        holdSeconds: null,
        newRepetitions: true,
        newHold: false,
      },
      {
        date: "2026-10-04",
        repetitions: 10,
        holdSeconds: 0.125,
        newRepetitions: false,
        newHold: true,
      },
      {
        date: "2026-10-06",
        repetitions: 11,
        holdSeconds: 0.25,
        newRepetitions: true,
        newHold: true,
      },
    ]);
  });

  it("reconstructs records and dates after editing, deleting, or backdating the best entry", () => {
    const history = [
      entry("first", { date: "2026-10-01", repetitions: 5 }),
      entry("best", { date: "2026-10-04", repetitions: 10 }),
      entry("last", { date: "2026-10-06", repetitions: 8 }),
    ];
    expect(
      getPracticeRecordHistory(history, "pull-up", TODAY).map((point) => [
        point.date,
        point.repetitions,
      ]),
    ).toEqual([
      ["2026-10-01", 5],
      ["2026-10-04", 10],
    ]);
    const edited = history.map((item) =>
      item.id === "best" ? { ...item, repetitions: 6 } : item,
    );
    expect(
      getPracticeRecordHistory(edited, "pull-up", TODAY).map((point) => [
        point.date,
        point.repetitions,
      ]),
    ).toEqual([
      ["2026-10-01", 5],
      ["2026-10-04", 6],
      ["2026-10-06", 8],
    ]);
    expect(getLoggedPersonalRecords(edited, "pull-up", TODAY).repetitions).toBe(
      8,
    );
    const deleted = history.filter((item) => item.id !== "best");
    expect(
      getPracticeRecordHistory(deleted, "pull-up", TODAY).map((point) => [
        point.date,
        point.repetitions,
      ]),
    ).toEqual([
      ["2026-10-01", 5],
      ["2026-10-06", 8],
    ]);
    expect(
      getLoggedPersonalRecords(deleted, "pull-up", TODAY).repetitions,
    ).toBe(8);
    const backdated = history.map((item) =>
      item.id === "best" ? { ...item, date: "2026-09-30" } : item,
    );
    expect(getPracticeRecordHistory(backdated, "pull-up", TODAY)).toEqual([
      {
        date: "2026-09-30",
        repetitions: 10,
        holdSeconds: null,
        newRepetitions: true,
        newHold: false,
      },
    ]);
    expect(getLoggedPersonalRecords(backdated, "pull-up", TODAY)).toEqual({
      repetitions: 10,
      holdSeconds: null,
    });
  });

  it("ignores invalid or future entries and deduplicates identifiers consistently with the practice log", () => {
    const history = [
      entry("valid", { repetitions: 7 }),
      entry("valid", { repetitions: 99 }),
      entry("future", { date: "2026-10-08", repetitions: 100 }),
      entry("invalid-date", { date: "2026-02-30", repetitions: 100 }),
      entry("invalid-value", { repetitions: 1.5 }),
      entry("invalid-hold", { holdSeconds: Infinity }),
      entry("invalid-sets", { sets: 0, repetitions: 100 }),
      entry("unknown-skill", { skillId: "fake", repetitions: 100 }),
    ];
    expect(getLoggedPersonalRecords(history, "pull-up", TODAY)).toEqual({
      repetitions: 7,
      holdSeconds: null,
    });
    expect(getPracticeRecordHistory(history, "pull-up", TODAY)).toEqual([
      {
        date: TODAY,
        repetitions: 7,
        holdSeconds: null,
        newRepetitions: true,
        newHold: false,
      },
    ]);
    expect(getPracticeRecordHistory(history, "fake", TODAY)).toEqual([]);
  });

  it("retains named retired skills and fractional holds without rounding them away", () => {
    const history = [
      entry("retired", {
        skillId: "one-leg-front-lever",
        repetitions: undefined,
        holdSeconds: 0.125,
      }),
    ];
    expect(
      getLoggedPersonalRecords(history, "one-leg-front-lever", TODAY),
    ).toEqual({ repetitions: null, holdSeconds: 0.125 });
    expect(
      getPracticeRecordHistory(history, "one-leg-front-lever", TODAY),
    ).toEqual([
      {
        date: TODAY,
        repetitions: null,
        holdSeconds: 0.125,
        newRepetitions: false,
        newHold: true,
      },
    ]);
  });

  it("uses an inclusive calendar cutoff across leap days and the accepted date range", () => {
    const history = [
      entry("lower-bound", { date: "1900-01-01", repetitions: 1 }),
      entry("leap", { date: "2024-02-29", repetitions: 2 }),
      entry("after-leap", { date: "2024-03-01", repetitions: 3 }),
      entry("upper-bound", { date: "9999-12-31", repetitions: 4 }),
    ];
    expect(
      getPracticeRecordHistory(history, "pull-up", "2024-02-29").map(
        (point) => point.date,
      ),
    ).toEqual(["1900-01-01", "2024-02-29"]);
    expect(
      getLoggedPersonalRecords(history, "pull-up", "2024-02-29").repetitions,
    ).toBe(2);
    expect(
      getLoggedPersonalRecords(history, "pull-up", "9999-12-31").repetitions,
    ).toBe(4);
    expect(getPracticeRecordHistory(history, "pull-up", "invalid")).toEqual([]);
    expect(getLoggedPersonalRecords(history, "pull-up", "invalid")).toEqual({
      repetitions: null,
      holdSeconds: null,
    });
  });

  it("defaults to the user's local date rather than admitting future stored history", () => {
    vi.useFakeTimers();
    try {
      vi.setSystemTime(new Date(2026, 9, 7, 0, 15));
      const history = [
        entry("today", { repetitions: 5 }),
        entry("tomorrow", { date: "2026-10-08", repetitions: 6 }),
      ];
      expect(getLoggedPersonalRecords(history, "pull-up").repetitions).toBe(5);
      expect(
        getPracticeRecordHistory(history, "pull-up").map((point) => point.date),
      ).toEqual([TODAY]);
    } finally {
      vi.useRealTimers();
    }
  });

  it("formats each available metric and leaves an absent record blank", () => {
    expect(
      formatLoggedPersonalRecord({ repetitions: null, holdSeconds: null }),
    ).toBe("");
    expect(
      formatLoggedPersonalRecord({ repetitions: 12, holdSeconds: null }),
    ).toBe("12 reps");
    expect(
      formatLoggedPersonalRecord({ repetitions: null, holdSeconds: 0.125 }),
    ).toBe("0.125 sec hold");
    expect(
      formatLoggedPersonalRecord({ repetitions: 12, holdSeconds: 5 }),
    ).toBe("12 reps · 5 sec hold");
  });
});
