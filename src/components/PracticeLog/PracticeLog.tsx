"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarDays,
  BarChart3,
  Check,
  Pencil,
  Plus,
  Timer,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { categories, categoryLabels, skillById, skills } from "@/data/skills";
import {
  formatPracticeDate,
  getLocalToday,
  getPracticeRecords,
  getPracticeSkillName,
  getPracticeTrends,
  PRACTICE_LIMITS,
  validatePracticeEntry,
} from "@/lib/practice";
import type { PracticeEntry } from "@/types/skill";
import styles from "./PracticeLog.module.css";

interface PracticeLogProps {
  entries: PracticeEntry[];
  initialSkillId?: string | null;
  hydrated: boolean;
  storageAvailable: boolean;
  onSave: (entry: PracticeEntry) => void;
  onDelete: (id: string) => void;
  onAnalytics: (skillId?: string) => void;
}

function entrySummary(entry: PracticeEntry): string {
  const metrics = [
    entry.repetitions === undefined ? null : `${entry.repetitions} reps`,
    entry.holdSeconds === undefined ? null : `${entry.holdSeconds} sec hold`,
  ].filter(Boolean);
  return `${entry.sets} ${entry.sets === 1 ? "set" : "sets"} × ${metrics.join(" + ")} per set`;
}

export function PracticeLog({
  entries,
  initialSkillId,
  hydrated,
  storageAvailable,
  onSave,
  onDelete,
  onAnalytics,
}: PracticeLogProps) {
  const initialSkill =
    initialSkillId && skillById[initialSkillId] ? initialSkillId : "pull-up";
  const [skillId, setSkillId] = useState(initialSkill);
  const [search, setSearch] = useState("");
  const [date, setDate] = useState("");
  const [sets, setSets] = useState("3");
  const [repetitions, setRepetitions] = useState("");
  const [holdSeconds, setHoldSeconds] = useState("");
  const [notes, setNotes] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [filter, setFilter] = useState(
    initialSkillId && skillById[initialSkillId] ? initialSkillId : "all",
  );
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const skillRef = useRef<HTMLSelectElement>(null);
  const focusedShortcutRef = useRef<string | null>(null);
  useEffect(() => {
    if (!initialSkillId) {
      focusedShortcutRef.current = null;
      return;
    }
    if (
      !hydrated ||
      !skillById[initialSkillId] ||
      focusedShortcutRef.current === initialSkillId
    )
      return;
    focusedShortcutRef.current = initialSkillId;
    formRef.current?.scrollIntoView({ behavior: "auto", block: "start" });
    skillRef.current?.focus({ preventScroll: true });
  }, [hydrated, initialSkillId]);
  // The server preview stays deterministic; local calendar dates begin after hydration.
  const today = hydrated ? getLocalToday() : "2000-01-01";
  const selectedName = getPracticeSkillName(skillId) ?? "Skill";
  const relevant = useMemo(
    () =>
      filter === "all"
        ? entries
        : entries.filter((entry) => entry.skillId === filter),
    [entries, filter],
  );
  const history = useMemo(
    () =>
      [...relevant].sort(
        (a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id),
      ),
    [relevant],
  );
  const trends = getPracticeTrends(relevant, today);
  const records = getPracticeRecords(relevant);
  const loggedSkillIds = [
    ...new Set(entries.map((entry) => entry.skillId)),
  ].sort((a, b) =>
    (getPracticeSkillName(a) ?? a).localeCompare(getPracticeSkillName(b) ?? b),
  );
  const matchingSkills = skills.filter(
    (skill) =>
      skill.id === skillId ||
      skill.name.toLowerCase().includes(search.trim().toLowerCase()),
  );
  const windowLabel = (start: string, end: string) =>
    `${formatPracticeDate(start, true)}–${formatPracticeDate(end, true)}`;

  function resetForm() {
    setEditingId(null);
    setDate("");
    setSets("3");
    setRepetitions("");
    setHoldSeconds("");
    setNotes("");
    setError(null);
  }

  function editEntry(entry: PracticeEntry) {
    setEditingId(entry.id);
    setSkillId(entry.skillId);
    setSearch("");
    setDate(entry.date);
    setSets(String(entry.sets));
    setRepetitions(
      entry.repetitions === undefined ? "" : String(entry.repetitions),
    );
    setHoldSeconds(
      entry.holdSeconds === undefined ? "" : String(entry.holdSeconds),
    );
    setNotes(entry.notes);
    setPendingDelete(null);
    setError(null);
    setMessage("");
    formRef.current?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "start",
    });
    skillRef.current?.focus({ preventScroll: true });
  }

  function saveEntry(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const entry: PracticeEntry = {
      id:
        editingId ??
        globalThis.crypto?.randomUUID?.() ??
        `practice-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      skillId,
      date: date || getLocalToday(),
      sets: Number(sets),
      ...(repetitions.trim() ? { repetitions: Number(repetitions) } : {}),
      ...(holdSeconds.trim() ? { holdSeconds: Number(holdSeconds) } : {}),
      notes: notes.trim(),
    };
    const validation = validatePracticeEntry(entry);
    if (validation) {
      setError(validation);
      setMessage("");
      return;
    }
    onSave(entry);
    setMessage(
      `${editingId ? "Updated" : "Added"} ${selectedName} practice${storageAvailable ? "." : " for this session."}`,
    );
    resetForm();
  }

  return (
    <div className={styles.log}>
      <button
        className={`secondary-button ${styles.analyticsShortcut}`}
        type="button"
        disabled={!hydrated}
        onClick={() => onAnalytics(filter === "all" ? undefined : filter)}
      >
        <BarChart3 size={16} aria-hidden="true" />
        Weekly & monthly analytics
      </button>
      <section
        className={`surface-panel ${styles.trends}`}
        aria-labelledby="practice-trends-title"
      >
        <div className="panel-heading">
          <h2 id="practice-trends-title">
            <TrendingUp size={17} aria-hidden="true" /> Practice consistency
          </h2>
          <span className="subtle-label">
            {filter === "all" ? "ALL SKILLS" : getPracticeSkillName(filter)}
          </span>
        </div>
        <p className={styles.muted}>
          A practice day counts once, even when you log several skills or sets.
        </p>
        <div className={styles.stats}>
          <div>
            <span>Last 7 days</span>
            <strong>
              {trends.current.practiceDays}
              <small> / 7 days</small>
            </strong>
            <small>
              {windowLabel(trends.current.start, trends.current.end)}
            </small>
          </div>
          <div>
            <span>Previous 7 days</span>
            <strong>
              {trends.previous.practiceDays}
              <small> / 7 days</small>
            </strong>
            <small>
              {windowLabel(trends.previous.start, trends.previous.end)}
            </small>
          </div>
          <div>
            <span>Change in practice days</span>
            <strong>
              {trends.difference > 0 ? "+" : ""}
              {trends.difference}
              <small> days</small>
            </strong>
            <small>Compared with the previous 7-day window</small>
          </div>
          <div>
            <span>Logged history</span>
            <strong>
              {trends.totalEntries}
              <small> entries</small>
            </strong>
            <small>{trends.totalDays} distinct practice days, all time</small>
          </div>
        </div>
        <figure
          className={styles.chart}
          aria-labelledby="practice-chart-caption"
        >
          <figcaption id="practice-chart-caption">
            Practice days across 8 rolling weeks{" "}
            <span>Each column covers 7 days; the final window ends today.</span>
          </figcaption>
          <ol className={styles.bars}>
            {trends.weeks.map((week) => (
              <li
                key={week.end}
                aria-label={`${windowLabel(week.start, week.end)}: ${week.practiceDays} of 7 practice days, ${week.entries} log entries`}
              >
                <strong aria-hidden="true">
                  {week.practiceDays}
                  <small>/7</small>
                </strong>
                <div className={styles.barTrack} aria-hidden="true">
                  <span
                    style={{ height: `${(week.practiceDays / 7) * 100}%` }}
                  />
                </div>
                <time dateTime={week.end} aria-hidden="true">
                  {formatPracticeDate(week.end, true)}
                </time>
              </li>
            ))}
          </ol>
        </figure>
      </section>

      <div className={styles.content}>
        <section
          className={`surface-panel ${styles.formPanel}`}
          aria-labelledby="practice-form-title"
        >
          <div className="panel-heading">
            <h2 id="practice-form-title">
              <Plus size={17} aria-hidden="true" />
              {editingId ? "Edit practice" : "Log practice"}
            </h2>
          </div>
          <p className={styles.muted}>
            Record a skill you practised, including locked skills. Entries leave
            mastery and your Personal Record unchanged.
          </p>
          {!storageAvailable && (
            <p className={styles.warning}>
              Browser storage is unavailable. Your log lasts for this session.
            </p>
          )}
          <form ref={formRef} onSubmit={saveEntry} noValidate>
            <fieldset disabled={!hydrated} className={styles.fields}>
              <label>
                Find a skill
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search skill names…"
                />
              </label>
              <label>
                Practised skill
                <select
                  ref={skillRef}
                  value={skillId}
                  onChange={(event) => setSkillId(event.target.value)}
                >
                  {categories.map((category) => (
                    <optgroup key={category} label={categoryLabels[category]}>
                      {matchingSkills
                        .filter((skill) => skill.category === category)
                        .map((skill) => (
                          <option key={skill.id} value={skill.id}>
                            {skill.name}
                          </option>
                        ))}
                    </optgroup>
                  ))}
                  {!skillById[skillId] && editingId && (
                    <optgroup label="Previous skills">
                      <option value={skillId}>{selectedName}</option>
                    </optgroup>
                  )}
                </select>
              </label>
              <div className={styles.fieldPair}>
                <label>
                  Practice date
                  <input
                    type="date"
                    value={hydrated ? date || today : ""}
                    min="1900-01-01"
                    max={hydrated ? today : undefined}
                    onChange={(event) => setDate(event.target.value)}
                  />
                </label>
                <label>
                  Sets
                  <input
                    type="number"
                    inputMode="numeric"
                    min="1"
                    max={PRACTICE_LIMITS.sets}
                    step="1"
                    value={sets}
                    onChange={(event) => setSets(event.target.value)}
                  />
                </label>
              </div>
              <p className={styles.metricHint} id="practice-metrics-help">
                Enter repetitions or hold duration for each set. Add both for
                mixed practice; use separate entries when sets have different
                values.
              </p>
              <div className={styles.fieldPair}>
                <label>
                  Repetitions per set
                  <input
                    type="number"
                    inputMode="numeric"
                    min="1"
                    max={PRACTICE_LIMITS.repetitions}
                    step="1"
                    value={repetitions}
                    onChange={(event) => setRepetitions(event.target.value)}
                    placeholder="e.g. 5"
                    aria-describedby="practice-metrics-help"
                  />
                </label>
                <label>
                  Hold seconds per set
                  <input
                    type="number"
                    inputMode="decimal"
                    min="0.01"
                    max={PRACTICE_LIMITS.holdSeconds}
                    step="any"
                    value={holdSeconds}
                    onChange={(event) => setHoldSeconds(event.target.value)}
                    placeholder="e.g. 12.5"
                    aria-describedby="practice-metrics-help"
                  />
                </label>
              </div>
              <label>
                Practice notes <span>(optional)</span>
                <textarea
                  value={notes}
                  rows={3}
                  maxLength={PRACTICE_LIMITS.notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Form, rest time, setup or how the practice felt…"
                />
              </label>
              {error && (
                <p className={styles.error} role="alert">
                  {error}
                </p>
              )}
              <div className={styles.formActions}>
                <button className={styles.primaryButton} type="submit">
                  <Check size={15} aria-hidden="true" />
                  {editingId ? "Save changes" : "Save practice"}
                </button>
                {editingId && (
                  <button
                    className={styles.secondaryButton}
                    type="button"
                    onClick={() => {
                      resetForm();
                      setMessage("");
                    }}
                  >
                    Cancel edit
                  </button>
                )}
              </div>
            </fieldset>
          </form>
          <p className={styles.status} role="status" aria-live="polite">
            {message}
          </p>
        </section>

        <section
          className={`surface-panel ${styles.historyPanel}`}
          aria-labelledby="practice-history-title"
        >
          <div className="panel-heading">
            <h2 id="practice-history-title">
              <CalendarDays size={17} aria-hidden="true" /> Practice history
            </h2>
            <span className="count-pill">{history.length}</span>
          </div>
          <label className={styles.filter}>
            History skill
            <select
              value={filter}
              onChange={(event) => {
                setFilter(event.target.value);
                setPendingDelete(null);
              }}
              disabled={!hydrated}
            >
              <option value="all">All skills</option>
              {[
                ...new Set([
                  ...loggedSkillIds,
                  ...(filter !== "all" ? [filter] : []),
                ]),
              ].map((id) => (
                <option key={id} value={id}>
                  {getPracticeSkillName(id)}
                </option>
              ))}
            </select>
          </label>
          {filter !== "all" && (
            <div className={styles.records}>
              <span>
                <Timer size={15} aria-hidden="true" />
                <strong>
                  {records.holdSeconds === null
                    ? "—"
                    : `${records.holdSeconds} sec`}
                </strong>
                <small>Best hold per set</small>
              </span>
              <span>
                <TrendingUp size={15} aria-hidden="true" />
                <strong>
                  {records.repetitions === null
                    ? "—"
                    : `${records.repetitions} reps`}
                </strong>
                <small>Best repetitions per set</small>
              </span>
            </div>
          )}
          {!history.length ? (
            <div className={styles.empty}>
              <CalendarDays size={28} aria-hidden="true" />
              <h3>
                {filter === "all"
                  ? "Your first practice starts here"
                  : "No practice logged for this skill"}
              </h3>
              <p>
                Save repetitions or a hold duration to build your history and
                see consistency over time.
              </p>
            </div>
          ) : (
            <ol className={styles.history}>
              {history.map((entry) => (
                <li key={entry.id}>
                  <article
                    className={styles.entry}
                    aria-label={`${getPracticeSkillName(entry.skillId)} practice on ${formatPracticeDate(entry.date)}`}
                  >
                    <div className={styles.entryHeading}>
                      <strong>{getPracticeSkillName(entry.skillId)}</strong>
                      <time dateTime={entry.date}>
                        {formatPracticeDate(entry.date)}
                      </time>
                    </div>
                    <p className={styles.entryMetrics}>{entrySummary(entry)}</p>
                    {entry.notes && (
                      <p className={styles.notes}>{entry.notes}</p>
                    )}
                    <div className={styles.entryActions}>
                      <button
                        className={styles.secondaryButton}
                        type="button"
                        disabled={!hydrated}
                        onClick={() => editEntry(entry)}
                        aria-label={`Edit ${getPracticeSkillName(entry.skillId)} practice on ${formatPracticeDate(entry.date)}`}
                      >
                        <Pencil size={13} aria-hidden="true" />
                        Edit
                      </button>
                      <button
                        className={styles.deleteButton}
                        type="button"
                        disabled={!hydrated}
                        onClick={() => setPendingDelete(entry.id)}
                        aria-label={`Delete ${getPracticeSkillName(entry.skillId)} practice on ${formatPracticeDate(entry.date)}`}
                      >
                        <Trash2 size={13} aria-hidden="true" />
                        Delete
                      </button>
                    </div>
                    {pendingDelete === entry.id && (
                      <div
                        className={styles.confirm}
                        role="group"
                        aria-label="Confirm practice deletion"
                      >
                        <p>
                          Delete this {getPracticeSkillName(entry.skillId)}{" "}
                          entry from {formatPracticeDate(entry.date)}? This
                          cannot be undone.
                        </p>
                        <div className={styles.entryActions}>
                          <button
                            className={styles.deleteButton}
                            type="button"
                            onClick={() => {
                              onDelete(entry.id);
                              setPendingDelete(null);
                              if (editingId === entry.id) resetForm();
                              setMessage("Practice entry deleted.");
                            }}
                          >
                            Confirm delete
                          </button>
                          <button
                            className={styles.secondaryButton}
                            type="button"
                            onClick={() => setPendingDelete(null)}
                          >
                            Keep entry
                          </button>
                        </div>
                      </div>
                    )}
                  </article>
                </li>
              ))}
            </ol>
          )}
          {filter === "all" && history.length > 0 && (
            <p className={styles.muted}>
              Filter by a skill to see its best logged hold and repetitions.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
