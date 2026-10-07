"use client";

import { useId, useMemo, useState } from "react";
import { Trophy } from "lucide-react";
import { skillById } from "@/data/skills";
import type { AnalyticsPeriod } from "@/lib/analytics";
import {
  formatPracticeDate,
  getPracticeSkillName,
  sanitizePracticeEntries,
} from "@/lib/practice";
import {
  getLoggedPersonalRecords,
  getPracticeRecordHistory,
} from "@/lib/records";
import type { PracticeEntry } from "@/types/skill";
import styles from "./RecordHistory.module.css";

type RecordMetric = "repetitions" | "holdSeconds";

interface RecordHistoryProps {
  entries: PracticeEntry[];
  today: string;
  start: string;
  through: string;
  period: AnalyticsPeriod;
}

interface ChartPoint {
  date: string;
  value: number;
  carried: boolean;
}

const metrics: { value: RecordMetric; label: string; unit: string }[] = [
  { value: "repetitions", label: "Repetitions", unit: "reps" },
  { value: "holdSeconds", label: "Hold time", unit: "sec" },
];

function formatValue(value: number): string {
  return new Intl.NumberFormat("en", {
    maximumSignificantDigits: 8,
    ...(value > 0 && value < 0.0001 ? { notation: "scientific" } : {}),
  }).format(value);
}

function formatRecord(value: number | null, metric: RecordMetric): string {
  if (value === null) return "Not logged";
  return `${formatValue(value)} ${metric === "repetitions" ? "reps" : "sec hold"}`;
}

function RecordChart({
  points,
  start,
  through,
  skillName,
  metric,
}: {
  points: ChartPoint[];
  start: string;
  through: string;
  skillName: string;
  metric: RecordMetric;
}) {
  const id = useId();
  const width = 680;
  const height = 230;
  const left = 74;
  const right = width - 26;
  const top = 24;
  const bottom = height - 43;
  const maximumValue = Math.max(...points.map((point) => point.value));
  const upper =
    metric === "repetitions"
      ? Math.max(2, Math.ceil((maximumValue * 1.15) / 2) * 2)
      : maximumValue * 1.15;
  const duration = Date.parse(through) - Date.parse(start);
  const x = (date: string) =>
    duration === 0
      ? (left + right) / 2
      : left +
        ((Date.parse(date) - Date.parse(start)) / duration) * (right - left);
  const y = (value: number) => bottom - (value / upper) * (bottom - top);
  const path = points
    .map((point, index) =>
      index === 0
        ? `M ${x(point.date)} ${y(point.value)}`
        : `H ${x(point.date)} V ${y(point.value)}`,
    )
    .join(" ");
  const last = points.at(-1)!;
  const metricLabel = metric === "repetitions" ? "repetition" : "hold-time";
  const unit = metric === "repetitions" ? "reps" : "sec";
  const carried = points[0].carried;

  return (
    <svg
      className={styles.chart}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-description`}
    >
      <title id={`${id}-title`}>
        {skillName} {metricLabel} personal records over time
      </title>
      <desc id={`${id}-description`}>
        Best single-set performance from {formatPracticeDate(start)} through{" "}
        {formatPracticeDate(through)}.{" "}
        {carried
          ? "An earlier record is carried into this period. "
          : "The line begins with the first logged record. "}
        Each filled point marks a new best on its logged date. The record at the
        end is {formatRecord(last.value, metric)}. Dates and values appear
        below.
      </desc>
      {[0, upper / 2, upper].map((value) => (
        <g key={value} aria-hidden="true">
          <line
            x1={left}
            x2={right}
            y1={y(value)}
            y2={y(value)}
            className={styles.gridLine}
          />
          <text
            x={left - 12}
            y={y(value) + 4}
            textAnchor="end"
            className={styles.axisText}
          >
            {formatValue(value)}
          </text>
        </g>
      ))}
      <text
        x={left}
        y={top - 11}
        className={styles.axisText}
        aria-hidden="true"
      >
        {unit} per set
      </text>
      <path
        d={`${path} H ${x(through)}`}
        className={styles.recordLine}
        aria-hidden="true"
      />
      {points.map((point) => (
        <circle
          key={`${point.date}-${point.carried ? "carried" : "new"}`}
          cx={x(point.date)}
          cy={y(point.value)}
          r={4.5}
          className={point.carried ? styles.carriedPoint : styles.recordPoint}
          aria-hidden="true"
        >
          <title>
            {formatPracticeDate(point.date)}:{" "}
            {formatRecord(point.value, metric)}
            {point.carried ? " carried into period" : " new best"}
          </title>
        </circle>
      ))}
      <text
        x={duration === 0 ? x(start) : left}
        y={height - 13}
        textAnchor={duration === 0 ? "middle" : "start"}
        className={styles.axisText}
        aria-hidden="true"
      >
        {formatPracticeDate(start, true)}
      </text>
      {duration > 0 && (
        <text
          x={right}
          y={height - 13}
          textAnchor="end"
          className={styles.axisText}
          aria-hidden="true"
        >
          {formatPracticeDate(through, true)}
        </text>
      )}
    </svg>
  );
}

export function RecordHistory({
  entries,
  today,
  start,
  through,
  period,
}: RecordHistoryProps) {
  const id = useId();
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<RecordMetric | null>(
    null,
  );
  const loggedSkills = useMemo(
    () =>
      [
        ...new Set(
          sanitizePracticeEntries(entries, today).map((entry) => entry.skillId),
        ),
      ]
        .map((skillId) => ({
          id: skillId,
          name: getPracticeSkillName(skillId)!,
        }))
        .sort(
          (a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id),
        ),
    [entries, today],
  );
  const skillId =
    loggedSkills.find((skill) => skill.id === selectedSkillId)?.id ??
    loggedSkills[0]?.id ??
    "";
  const skillName = getPracticeSkillName(skillId) ?? "Selected skill";
  const history = useMemo(
    () => getPracticeRecordHistory(entries, skillId, through),
    [entries, skillId, through],
  );
  const records = useMemo(
    () => getLoggedPersonalRecords(entries, skillId, through),
    [entries, skillId, through],
  );
  const metric =
    selectedMetric ??
    (records.repetitions === null && records.holdSeconds !== null
      ? "holdSeconds"
      : "repetitions");
  const metricDescription =
    metric === "repetitions" ? "repetition" : "hold-time";
  const metricDetails = metrics.find((item) => item.value === metric)!;
  const improved = history.filter((point) =>
    metric === "repetitions" ? point.newRepetitions : point.newHold,
  );
  const baseline = improved.filter((point) => point.date < start).at(-1);
  const milestones = improved.filter((point) => point.date >= start);
  const chartPoints: ChartPoint[] = [
    ...(baseline
      ? [{ date: start, value: baseline[metric]!, carried: true }]
      : []),
    ...milestones.map((point) => ({
      date: point.date,
      value: point[metric]!,
      carried: false,
    })),
  ];

  return (
    <section className={styles.records} aria-labelledby={`${id}-heading`}>
      <div className={styles.heading}>
        <h3 id={`${id}-heading`}>
          <Trophy size={17} aria-hidden="true" /> Personal records over time
        </h3>
        <span className={styles.periodLabel}>
          Through {formatPracticeDate(through, true)}
        </span>
      </div>
      <p className={styles.muted}>
        Records use the best single set for each skill and are recalculated from
        your practice logs. Manual records are not dated in this history.
      </p>
      {!loggedSkills.length ? (
        <p className={styles.empty} role="status">
          No logged records yet. Add repetitions or a hold duration in the
          practice log to track your personal records over time.
        </p>
      ) : (
        <>
          <div className={styles.controls}>
            <label className={styles.skillSelect}>
              <span>Record skill</span>
              <select
                value={skillId}
                onChange={(event) => {
                  setSelectedSkillId(event.target.value);
                  setSelectedMetric(null);
                }}
              >
                {loggedSkills.map((skill) => (
                  <option key={skill.id} value={skill.id}>
                    {skill.name}
                    {skillById[skill.id] ? "" : " (previous skill)"}
                  </option>
                ))}
              </select>
            </label>
            <div
              className={styles.segmented}
              aria-label="Personal record metric"
            >
              {metrics.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  aria-label={`Record metric: ${item.label}`}
                  aria-pressed={metric === item.value}
                  onClick={() => setSelectedMetric(item.value)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <dl className={styles.summary} aria-label="Records at period end">
            <div>
              <dt>Best repetitions</dt>
              <dd>{formatRecord(records.repetitions, "repetitions")}</dd>
            </div>
            <div>
              <dt>Longest hold</dt>
              <dd>{formatRecord(records.holdSeconds, "holdSeconds")}</dd>
            </div>
          </dl>
          <p className={styles.muted}>
            {skillName}&apos;s logged records as of{" "}
            {formatPracticeDate(through)}. Later entries are excluded when you
            browse an earlier period.
          </p>

          {records[metric] === null ? (
            <p className={styles.empty} role="status">
              No {metricDescription} record for {skillName} as of{" "}
              {formatPracticeDate(through)}. Log{" "}
              {metric === "repetitions" ? "repetitions" : "a hold duration"} or
              browse another period.
            </p>
          ) : (
            <>
              <figure className={styles.figure}>
                <figcaption>
                  {skillName} · best {metricDetails.unit} per set
                </figcaption>
                <div
                  className={styles.chartScroll}
                  role="region"
                  aria-label="Personal record timeline chart"
                  tabIndex={0}
                >
                  <RecordChart
                    points={chartPoints}
                    start={start}
                    through={through}
                    skillName={skillName}
                    metric={metric}
                  />
                </div>
                {baseline && (
                  <p className={styles.baseline}>
                    Starting record:{" "}
                    <strong>{formatRecord(baseline[metric], metric)}</strong>,
                    set on{" "}
                    <time dateTime={baseline.date}>
                      {formatPracticeDate(baseline.date)}
                    </time>
                    . Carried forward until you improve it.
                  </p>
                )}
                {!baseline && milestones.length > 0 && (
                  <p className={styles.muted}>
                    The timeline begins on your first logged {metricDescription}
                    record; earlier days have no recorded value.
                  </p>
                )}
              </figure>

              {milestones.length ? (
                <div
                  className={styles.tableScroll}
                  role="region"
                  aria-label="Personal record milestones table"
                  tabIndex={0}
                >
                  <table>
                    <caption>
                      New {metricDescription} records this {period} (
                      {milestones.length})
                    </caption>
                    <thead>
                      <tr>
                        <th scope="col">Logged date</th>
                        <th scope="col">
                          New best ({metricDetails.unit} per set)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {milestones.map((point) => (
                        <tr key={point.date}>
                          <th scope="row">
                            <time dateTime={point.date}>
                              {formatPracticeDate(point.date)}
                            </time>
                          </th>
                          <td>{formatRecord(point[metric], metric)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className={styles.noMilestones} role="status">
                  No new {metricDescription} record this {period}. Your earlier
                  best is carried forward; matching or lower efforts do not
                  create a new record.
                </p>
              )}
            </>
          )}
        </>
      )}
    </section>
  );
}
