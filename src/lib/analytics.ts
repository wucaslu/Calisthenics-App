import { skillById } from "@/data/skills";
import {
  getPracticeSkillName,
  sanitizePracticeEntries,
  shiftCalendarDate,
} from "@/lib/practice";
import type { Category, PracticeEntry } from "@/types/skill";

export type AnalyticsPeriod = "week" | "month";
export type AnalyticsCategory = Category | "previous";

export interface TrainingTotals {
  practiceDays: number;
  entries: number;
  sets: number;
  repetitions: number;
  holdSeconds: number;
  skills: number;
}

export interface PeriodAnalytics {
  start: string;
  end: string;
  through: string;
  days: number;
  totals: TrainingTotals;
  /** Percentage of calendar days with at least one valid practice entry. */
  consistency: number;
}

export interface DailyTrainingAnalytics {
  date: string;
  entries: number;
  sets: number;
  repetitions: number;
  holdSeconds: number;
}

export interface SkillTrainingAnalytics {
  id: string;
  name: string;
  category: AnalyticsCategory;
  entries: number;
  sets: number;
  repetitions: number;
  holdSeconds: number;
  bestRepetitions: number | null;
  bestHoldSeconds: number | null;
}

export interface GroupTrainingAnalytics {
  category: AnalyticsCategory;
  label: string;
  entries: number;
  sets: number;
  repetitions: number;
  holdSeconds: number;
  practiceDays: number;
}

export interface TrainingAnalytics {
  current: PeriodAnalytics;
  previous: PeriodAnalytics;
  daily: DailyTrainingAnalytics[];
  skills: SkillTrainingAnalytics[];
  groups: GroupTrainingAnalytics[];
}

const DAY_MS = 86_400_000;
const categories: { category: AnalyticsCategory; label: string }[] = [
  { category: "pull", label: "Pull" },
  { category: "push", label: "Push" },
  { category: "legs", label: "Legs" },
  { category: "core", label: "Core" },
  { category: "previous", label: "Previous skills" },
];

function dateTimestamp(value: string): number {
  // Keep accepted dates in sync with the practice log, without local DST hours.
  const valid = shiftCalendarDate(value, 0);
  const [year, month, day] = valid.split("-").map(Number);
  return Date.UTC(year, month - 1, day);
}

function dateString(timestamp: number): string {
  return new Date(timestamp).toISOString().slice(0, 10);
}

function daysInRange(start: string, end: string): number {
  return Math.round((Date.parse(end) - Date.parse(start)) / DAY_MS) + 1;
}

/** Monday–Sunday weeks and actual calendar months, including leap February. */
export function getTrainingPeriodRange(
  anchor: string,
  period: AnalyticsPeriod,
): { start: string; end: string } {
  return periodRangeAtTimestamp(dateTimestamp(anchor), period);
}

function periodRangeAtTimestamp(timestamp: number, period: AnalyticsPeriod) {
  const date = new Date(timestamp);
  if (period === "week") {
    const start = timestamp - ((date.getUTCDay() + 6) % 7) * DAY_MS;
    return { start: dateString(start), end: dateString(start + 6 * DAY_MS) };
  }
  return {
    start: dateString(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1)),
    end: dateString(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)),
  };
}

/** Navigate by calendar periods instead of adding a fixed 30-day month. */
export function shiftTrainingPeriod(
  anchor: string,
  period: AnalyticsPeriod,
  direction: -1 | 1,
): string {
  const range = getTrainingPeriodRange(anchor, period);
  if (period === "week") return shiftCalendarDate(range.start, direction * 7);
  const date = new Date(dateTimestamp(range.start));
  return dateString(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + direction, 1),
  );
}

/** Remove arithmetic noise without rounding away short, positive holds. */
function cleanDecimal(value: number): number {
  return Number(value.toPrecision(15));
}

function getTotals(entries: PracticeEntry[]): TrainingTotals {
  // Compensated addition keeps many fractional holds from accumulating noise.
  let holdSeconds = 0;
  let compensation = 0;
  for (const entry of entries) {
    const value = entry.sets * (entry.holdSeconds ?? 0) - compensation;
    const next = holdSeconds + value;
    compensation = next - holdSeconds - value;
    holdSeconds = next;
  }
  return {
    practiceDays: new Set(entries.map((entry) => entry.date)).size,
    entries: entries.length,
    sets: entries.reduce((sum, entry) => sum + entry.sets, 0),
    repetitions: entries.reduce(
      (sum, entry) => sum + entry.sets * (entry.repetitions ?? 0),
      0,
    ),
    holdSeconds: cleanDecimal(holdSeconds),
    skills: new Set(entries.map((entry) => entry.skillId)).size,
  };
}

function getPeriodAnalytics(
  entries: PracticeEntry[],
  range: { start: string; end: string },
  through: string,
): PeriodAnalytics {
  const totals = getTotals(
    entries.filter(
      (entry) => entry.date >= range.start && entry.date <= through,
    ),
  );
  const days = daysInRange(range.start, through);
  return {
    ...range,
    through,
    days,
    totals,
    consistency: (totals.practiceDays / days) * 100,
  };
}

/**
 * Analyze a calendar period without altering stored history. Ongoing periods
 * compare against the same elapsed days of the preceding period (capped at its
 * length); historical periods compare their complete calendar windows.
 */
export function getTrainingAnalytics(
  entries: PracticeEntry[],
  period: AnalyticsPeriod,
  anchor: string,
  today: string,
): TrainingAnalytics {
  const todayRange = getTrainingPeriodRange(today, period);
  let range = getTrainingPeriodRange(anchor, period);
  if (range.start > todayRange.start) range = todayRange;
  const ongoing = range.start === todayRange.start;
  const through = ongoing ? today : range.end;
  const valid = sanitizePracticeEntries(entries, today);
  const current = getPeriodAnalytics(valid, range, through);
  const previousRange = periodRangeAtTimestamp(
    Date.parse(shiftTrainingPeriod(range.start, period, -1)),
    period,
  );
  const previousDays = daysInRange(previousRange.start, previousRange.end);
  const previousThrough = ongoing
    ? dateString(
        Date.parse(previousRange.start) +
          (Math.min(current.days, previousDays) - 1) * DAY_MS,
      )
    : previousRange.end;
  const previous = getPeriodAnalytics(valid, previousRange, previousThrough);
  const relevant = valid.filter(
    (entry) => entry.date >= range.start && entry.date <= through,
  );

  const daily = Array.from(
    { length: daysInRange(range.start, range.end) },
    (_, index): DailyTrainingAnalytics => {
      const date = shiftCalendarDate(range.start, index);
      const totals = getTotals(relevant.filter((entry) => entry.date === date));
      return {
        date,
        entries: totals.entries,
        sets: totals.sets,
        repetitions: totals.repetitions,
        holdSeconds: totals.holdSeconds,
      };
    },
  );

  const bySkill = new Map<string, PracticeEntry[]>();
  for (const entry of relevant) {
    const history = bySkill.get(entry.skillId) ?? [];
    history.push(entry);
    bySkill.set(entry.skillId, history);
  }
  const skills = [...bySkill].map(([id, history]): SkillTrainingAnalytics => {
    const totals = getTotals(history);
    let bestRepetitions: number | null = null;
    let bestHoldSeconds: number | null = null;
    for (const entry of history) {
      if (entry.repetitions !== undefined)
        bestRepetitions = Math.max(bestRepetitions ?? 0, entry.repetitions);
      if (entry.holdSeconds !== undefined)
        bestHoldSeconds = Math.max(bestHoldSeconds ?? 0, entry.holdSeconds);
    }
    return {
      id,
      name: getPracticeSkillName(id)!,
      category: skillById[id]?.category ?? "previous",
      entries: totals.entries,
      sets: totals.sets,
      repetitions: totals.repetitions,
      holdSeconds: totals.holdSeconds,
      bestRepetitions,
      bestHoldSeconds,
    };
  });
  skills.sort(
    (a, b) =>
      b.sets - a.sets ||
      a.name.localeCompare(b.name) ||
      a.id.localeCompare(b.id),
  );
  const groups = categories.map(
    ({ category, label }): GroupTrainingAnalytics => {
      const totals = getTotals(
        relevant.filter(
          (entry) =>
            (skillById[entry.skillId]?.category ?? "previous") === category,
        ),
      );
      return {
        category,
        label,
        entries: totals.entries,
        sets: totals.sets,
        repetitions: totals.repetitions,
        holdSeconds: totals.holdSeconds,
        practiceDays: totals.practiceDays,
      };
    },
  );
  return { current, previous, daily, skills, groups };
}
