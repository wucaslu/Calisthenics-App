import { getLocalToday, sanitizePracticeEntries } from "@/lib/practice";
import type { PracticeEntry } from "@/types/skill";

export interface LoggedRecords {
  repetitions: number | null;
  holdSeconds: number | null;
}

export interface PracticeRecordPoint extends LoggedRecords {
  date: string;
  newRepetitions: boolean;
  newHold: boolean;
}

function emptyRecords(): LoggedRecords {
  return { repetitions: null, holdSeconds: null };
}

function includeEntry(records: LoggedRecords, entry: PracticeEntry): void {
  if (entry.repetitions !== undefined)
    records.repetitions = Math.max(records.repetitions ?? 0, entry.repetitions);
  if (entry.holdSeconds !== undefined)
    records.holdSeconds = Math.max(records.holdSeconds ?? 0, entry.holdSeconds);
}

/** Best single-set performance; sets contribute volume rather than records. */
export function getLoggedPersonalRecords(
  entries: PracticeEntry[],
  skillId: string,
  today = getLocalToday(),
): LoggedRecords {
  const records = emptyRecords();
  for (const entry of sanitizePracticeEntries(entries, today)) {
    if (entry.skillId === skillId) includeEntry(records, entry);
  }
  return records;
}

/**
 * Rebuild records by practice date so edits, deletions, and backdated entries
 * also correct the timeline. A day contributes at most one improvement point.
 */
export function getPracticeRecordHistory(
  entries: PracticeEntry[],
  skillId: string,
  today = getLocalToday(),
): PracticeRecordPoint[] {
  const days = new Map<string, LoggedRecords>();
  for (const entry of sanitizePracticeEntries(entries, today)) {
    if (entry.skillId !== skillId) continue;
    const records = days.get(entry.date) ?? emptyRecords();
    includeEntry(records, entry);
    days.set(entry.date, records);
  }

  const best = emptyRecords();
  const history: PracticeRecordPoint[] = [];
  for (const date of [...days.keys()].sort()) {
    const records = days.get(date)!;
    const newRepetitions =
      records.repetitions !== null &&
      (best.repetitions === null || records.repetitions > best.repetitions);
    const newHold =
      records.holdSeconds !== null &&
      (best.holdSeconds === null || records.holdSeconds > best.holdSeconds);
    if (newRepetitions) best.repetitions = records.repetitions;
    if (newHold) best.holdSeconds = records.holdSeconds;
    if (newRepetitions || newHold)
      history.push({ date, ...best, newRepetitions, newHold });
  }
  return history;
}

export function formatLoggedPersonalRecord(records: LoggedRecords): string {
  const metrics: string[] = [];
  if (records.repetitions !== null) metrics.push(`${records.repetitions} reps`);
  if (records.holdSeconds !== null)
    metrics.push(`${records.holdSeconds} sec hold`);
  return metrics.join(" · ");
}
