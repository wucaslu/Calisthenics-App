import { retiredSkillNames } from "@/data/retiredSkills";
import { skillById } from "@/data/skills";
import type { PracticeEntry } from "@/types/skill";

export const PRACTICE_LIMITS = {
  sets: 100,
  repetitions: 10_000,
  holdSeconds: 86_400,
  notes: 1_000,
} as const;

const DAY_MS = 86_400_000;

/** A user's date, rather than the UTC date returned by toISOString(). */
export function getLocalToday(now = new Date()): string {
  return `${now.getFullYear().toString().padStart(4, "0")}-${(now.getMonth() + 1).toString().padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")}`;
}

function calendarTime(value: unknown): number | null {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))
    return null;
  const [year, month, day] = value.split("-").map(Number);
  if (year < 1900 || year > 9999) return null;
  const timestamp = Date.UTC(year, month - 1, day);
  const date = new Date(timestamp);
  return date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
    ? timestamp
    : null;
}

/** UTC arithmetic here represents date-only ordinals, never elapsed local hours. */
export function shiftCalendarDate(date: string, days: number): string {
  const timestamp = calendarTime(date);
  if (timestamp === null || !Number.isInteger(days))
    throw new Error(
      "A valid calendar date and whole number of days are required.",
    );
  return new Date(timestamp + days * DAY_MS).toISOString().slice(0, 10);
}

export function formatPracticeDate(date: string, short = false): string {
  const timestamp = calendarTime(date);
  if (timestamp === null) return date;
  return new Intl.DateTimeFormat("en", {
    month: short ? "short" : "long",
    day: "numeric",
    ...(short ? {} : { year: "numeric" }),
    timeZone: "UTC",
  }).format(timestamp);
}

export function getPracticeSkillName(skillId: string): string | null {
  return (
    skillById[skillId]?.name ??
    (Object.hasOwn(retiredSkillNames, skillId)
      ? retiredSkillNames[skillId]
      : null)
  );
}

export function validatePracticeEntry(
  value: unknown,
  today = getLocalToday(),
): string | null {
  if (!value || typeof value !== "object" || Array.isArray(value))
    return "Practice entry is invalid.";
  const entry = value as Record<string, unknown>;
  if (typeof entry.id !== "string" || !/^[A-Za-z0-9_-]{1,100}$/.test(entry.id))
    return "Practice entry needs a valid identifier.";
  if (typeof entry.skillId !== "string" || !getPracticeSkillName(entry.skillId))
    return "Choose a skill from the catalog.";
  const date = calendarTime(entry.date);
  const lastDate = calendarTime(today);
  if (date === null) return "Choose a valid calendar date.";
  if (lastDate === null) return "Today's calendar date is invalid.";
  if (date > lastDate) return "Practice dates cannot be in the future.";
  if (
    typeof entry.sets !== "number" ||
    !Number.isInteger(entry.sets) ||
    entry.sets < 1 ||
    entry.sets > PRACTICE_LIMITS.sets
  )
    return `Sets must be a whole number from 1 to ${PRACTICE_LIMITS.sets}.`;
  if (
    entry.repetitions !== undefined &&
    (typeof entry.repetitions !== "number" ||
      !Number.isInteger(entry.repetitions) ||
      entry.repetitions < 1 ||
      entry.repetitions > PRACTICE_LIMITS.repetitions)
  )
    return `Repetitions must be a whole number from 1 to ${PRACTICE_LIMITS.repetitions}.`;
  if (
    entry.holdSeconds !== undefined &&
    (typeof entry.holdSeconds !== "number" ||
      !Number.isFinite(entry.holdSeconds) ||
      entry.holdSeconds <= 0 ||
      entry.holdSeconds > PRACTICE_LIMITS.holdSeconds)
  )
    return `Hold duration must be greater than 0 and no more than ${PRACTICE_LIMITS.holdSeconds} seconds.`;
  if (entry.repetitions === undefined && entry.holdSeconds === undefined)
    return "Add repetitions or a hold duration for each set.";
  if (
    typeof entry.notes !== "string" ||
    entry.notes.length > PRACTICE_LIMITS.notes
  )
    return `Notes must be no longer than ${PRACTICE_LIMITS.notes} characters.`;
  return null;
}

/**
 * Recover stored history independently of the current clock or timezone. A date
 * recorded before travel may be tomorrow in the next timezone; keep that record.
 * Callers computing trends can pass today to exclude future days from windows.
 */
export function sanitizePracticeEntries(
  value: unknown,
  today = "9999-12-31",
): PracticeEntry[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const result: PracticeEntry[] = [];
  for (const item of value) {
    if (validatePracticeEntry(item, today)) continue;
    const entry = item as PracticeEntry;
    if (seen.has(entry.id)) continue;
    seen.add(entry.id);
    result.push({
      id: entry.id,
      skillId: entry.skillId,
      date: entry.date,
      sets: entry.sets,
      ...(entry.repetitions === undefined
        ? {}
        : { repetitions: entry.repetitions }),
      ...(entry.holdSeconds === undefined
        ? {}
        : { holdSeconds: entry.holdSeconds }),
      notes: entry.notes,
    });
  }
  return result;
}

export interface PracticeWeek {
  start: string;
  end: string;
  practiceDays: number;
  entries: number;
}

export function getPracticeTrends(
  entries: PracticeEntry[],
  today = getLocalToday(),
) {
  const valid = sanitizePracticeEntries(entries, today);
  const weeks: PracticeWeek[] = Array.from({ length: 8 }, (_, index) => {
    const end = shiftCalendarDate(today, -7 * (7 - index));
    const start = shiftCalendarDate(end, -6);
    const inWindow = valid.filter(
      (entry) => entry.date >= start && entry.date <= end,
    );
    return {
      start,
      end,
      practiceDays: new Set(inWindow.map((entry) => entry.date)).size,
      entries: inWindow.length,
    };
  });
  const current = weeks[7];
  const previous = weeks[6];
  return {
    weeks,
    current,
    previous,
    difference: current.practiceDays - previous.practiceDays,
    totalDays: new Set(valid.map((entry) => entry.date)).size,
    totalEntries: valid.length,
  };
}

export function getPracticeRecords(entries: PracticeEntry[], skillId?: string) {
  const relevant = skillId
    ? entries.filter((entry) => entry.skillId === skillId)
    : entries;
  let holdSeconds: number | null = null;
  let repetitions: number | null = null;
  for (const entry of relevant) {
    if (entry.holdSeconds !== undefined)
      holdSeconds = Math.max(holdSeconds ?? 0, entry.holdSeconds);
    if (entry.repetitions !== undefined)
      repetitions = Math.max(repetitions ?? 0, entry.repetitions);
  }
  return { holdSeconds, repetitions };
}
