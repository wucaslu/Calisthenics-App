"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, TrendingUp } from "lucide-react";
import {
  getTrainingAnalytics,
  getTrainingPeriodRange,
  shiftTrainingPeriod,
  type AnalyticsPeriod,
} from "@/lib/analytics";
import { formatPracticeDate } from "@/lib/practice";
import type { PracticeEntry } from "@/types/skill";
import styles from "./TrainingAnalytics.module.css";

interface TrainingAnalyticsProps {
  entries: PracticeEntry[];
  today: string;
  hydrated: boolean;
  skillLabel?: string;
}

type VolumeMetric = "sets" | "repetitions" | "holdSeconds";

const numberFormat = new Intl.NumberFormat("en", {
  maximumFractionDigits: 2,
});

function formatNumber(value: number): string {
  return numberFormat.format(Math.abs(value) < 0.005 ? 0 : value);
}

function formatHold(seconds: number): string {
  if (seconds > 0 && seconds < 0.01) return "<0.01s";
  const rounded = Math.round(seconds * 100) / 100;
  const hours = Math.floor(rounded / 3600);
  const minutes = Math.floor((rounded % 3600) / 60);
  const remainder = Math.round((rounded % 60) * 100) / 100;
  return [
    hours ? `${formatNumber(hours)}h` : "",
    minutes ? `${minutes}m` : "",
    remainder || (!hours && !minutes) ? `${formatNumber(remainder)}s` : "",
  ]
    .filter(Boolean)
    .join(" ");
}

function changeLabel(current: number, previous: number): string {
  if (current === previous) return "No change";
  if (!previous) return "No previous activity";
  const percent = ((current - previous) / previous) * 100;
  return `${percent > 0 ? "+" : ""}${formatNumber(percent)}% vs previous`;
}

function formatRange(start: string, end: string): string {
  return `${formatPracticeDate(start)} – ${formatPracticeDate(end)}`;
}

function compactDate(date: string, period: AnalyticsPeriod): string {
  const [year, month, day] = date.split("-").map(Number);
  return new Intl.DateTimeFormat("en", {
    ...(period === "week" ? { weekday: "short" } : {}),
    day: "numeric",
    timeZone: "UTC",
  }).format(Date.UTC(year, month - 1, day));
}

const metrics: { value: VolumeMetric; label: string; unit: string }[] = [
  { value: "sets", label: "Sets", unit: "sets" },
  { value: "repetitions", label: "Repetitions", unit: "repetitions" },
  { value: "holdSeconds", label: "Hold time", unit: "seconds held" },
];

export function TrainingAnalytics({
  entries,
  today,
  hydrated,
  skillLabel,
}: TrainingAnalyticsProps) {
  const [period, setPeriod] = useState<AnalyticsPeriod>("week");
  const [anchor, setAnchor] = useState<string | null>(null);
  const [metric, setMetric] = useState<VolumeMetric>("sets");
  const analytics = useMemo(
    () => getTrainingAnalytics(entries, period, anchor ?? today, today),
    [entries, period, anchor, today],
  );
  const { current, previous, daily, skills, groups } = analytics;
  const currentRange = getTrainingPeriodRange(today, period);
  const isCurrentPeriod = current.start === currentRange.start;
  const periodLabel = period === "week" ? "week" : "month";
  const metricLabel = metrics.find((item) => item.value === metric)!;
  const maximumVolume = Math.max(1, ...daily.map((day) => day[metric]));
  const maximumGroupSets = Math.max(1, ...groups.map((group) => group.sets));
  const consistencyChange = current.consistency - previous.consistency;
  const summary = [
    {
      label: "Logged entries",
      value: formatNumber(current.totals.entries),
      change: changeLabel(current.totals.entries, previous.totals.entries),
    },
    {
      label: "Total sets",
      value: formatNumber(current.totals.sets),
      change: changeLabel(current.totals.sets, previous.totals.sets),
    },
    {
      label: "Total repetitions",
      value: formatNumber(current.totals.repetitions),
      change: changeLabel(
        current.totals.repetitions,
        previous.totals.repetitions,
      ),
    },
    {
      label: "Total hold time",
      value: formatHold(current.totals.holdSeconds),
      change: changeLabel(
        current.totals.holdSeconds,
        previous.totals.holdSeconds,
      ),
    },
    {
      label: "Skills practiced",
      value: formatNumber(current.totals.skills),
      change: changeLabel(current.totals.skills, previous.totals.skills),
    },
  ];

  return (
    <section
      className={`surface-panel ${styles.analytics}`}
      aria-labelledby="training-analytics-title"
      aria-busy={!hydrated}
    >
      <div className={`panel-heading ${styles.heading}`}>
        <h2 id="training-analytics-title">
          <TrendingUp size={18} aria-hidden="true" /> Training analytics
        </h2>
        <span className="subtle-label">{skillLabel ?? "ALL SKILLS"}</span>
      </div>
      {!hydrated ? (
        <p className={styles.muted}>Loading saved practice…</p>
      ) : (
        <>
          <div className={styles.controls}>
            <div className={styles.segmented} aria-label="Analytics period">
              {(["week", "month"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-pressed={period === option}
                  onClick={() => setPeriod(option)}
                >
                  {option === "week" ? "Weekly" : "Monthly"}
                </button>
              ))}
            </div>
            <button
              type="button"
              className={styles.resetButton}
              disabled={isCurrentPeriod}
              onClick={() => setAnchor(null)}
            >
              This {periodLabel}
            </button>
          </div>

          <div className={styles.periodNavigation}>
            <button
              type="button"
              className={styles.arrowButton}
              aria-label={`Previous ${periodLabel}`}
              onClick={() =>
                setAnchor(shiftTrainingPeriod(current.start, period, -1))
              }
            >
              <ChevronLeft size={19} aria-hidden="true" />
            </button>
            <h3 aria-live="polite">
              <time dateTime={current.start}>
                {formatPracticeDate(current.start)}
              </time>
              <span> – </span>
              <time dateTime={current.end}>
                {formatPracticeDate(current.end)}
              </time>
            </h3>
            <button
              type="button"
              className={styles.arrowButton}
              aria-label={`Next ${periodLabel}`}
              disabled={isCurrentPeriod}
              onClick={() =>
                setAnchor(shiftTrainingPeriod(current.start, period, 1))
              }
            >
              <ChevronRight size={19} aria-hidden="true" />
            </button>
          </div>

          <p className={styles.comparison}>
            {isCurrentPeriod ? "So far: " : "Period: "}
            {formatRange(current.start, current.through)} ({current.days}{" "}
            {current.days === 1 ? "day" : "days"}). Compared with{" "}
            {formatRange(previous.start, previous.through)} ({previous.days}{" "}
            {previous.days === 1 ? "day" : "days"}).
          </p>

          <div
            className={styles.summary}
            role="region"
            aria-label="Training summary"
          >
            <div
              className={styles.stat}
              role="group"
              aria-label="Practice days"
            >
              <span>Practice days</span>
              <strong>
                {current.totals.practiceDays}
                <small> / {current.days}</small>
              </strong>
              <span className={styles.consistency}>
                {formatNumber(current.consistency)}% consistency
              </span>
              <small>
                {consistencyChange === 0
                  ? "No change in consistency"
                  : `${consistencyChange > 0 ? "+" : ""}${formatNumber(consistencyChange)} percentage points`}
              </small>
            </div>
            {summary.map((item) => (
              <div
                className={styles.stat}
                key={item.label}
                role="group"
                aria-label={item.label}
              >
                <span>{item.label}</span>
                <strong>{item.value}</strong>
                <small>{item.change}</small>
              </div>
            ))}
          </div>

          <p className={styles.muted}>
            Practice days count once, regardless of how many entries you log.
            Volume includes every set; repetitions and hold seconds are
            multiplied by sets. Entries are individual skill logs.
          </p>

          {!current.totals.entries && (
            <p className={styles.empty} role="status">
              No practice logged for this {periodLabel}
              {skillLabel ? ` for ${skillLabel}` : ""}. Add an entry in the
              practice log or browse another period to see your training here.
            </p>
          )}

          <figure
            className={styles.chart}
            role="region"
            aria-label="Daily training volume"
          >
            <div className={styles.chartHeading}>
              <figcaption>
                Daily volume <span>{metricLabel.unit}</span>
              </figcaption>
              <div
                className={styles.segmented}
                aria-label="Daily volume metric"
              >
                {metrics.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    aria-pressed={metric === item.value}
                    onClick={() => setMetric(item.value)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            <div
              className={styles.chartScroll}
              tabIndex={period === "month" ? 0 : undefined}
              role="region"
              aria-label={`${period === "month" ? "Scrollable monthly" : "Weekly"} daily volume chart`}
            >
              <ol
                className={`${styles.bars} ${period === "month" ? styles.monthBars : ""}`}
                style={{
                  gridTemplateColumns: `repeat(${daily.length}, minmax(0, 1fr))`,
                }}
                aria-label={`${metricLabel.label} by day`}
              >
                {daily.map((day) => {
                  const value = day[metric];
                  const future = day.date > today;
                  const accessibleValue =
                    metric === "holdSeconds" && value > 0 && value < 0.01
                      ? "less than 0.01"
                      : formatNumber(value);
                  const description = `${formatPracticeDate(day.date)}: ${accessibleValue} ${metricLabel.unit}, ${day.entries} ${day.entries === 1 ? "entry" : "entries"}${future ? ", upcoming day" : ""}`;
                  return (
                    <li
                      key={day.date}
                      className={future ? styles.future : undefined}
                      title={description}
                      aria-label={description}
                    >
                      <strong aria-hidden="true">
                        {metric === "holdSeconds"
                          ? formatHold(value)
                          : formatNumber(value)}
                      </strong>
                      <div className={styles.barTrack} aria-hidden="true">
                        <span
                          style={{
                            height: `${(value / maximumVolume) * 100}%`,
                          }}
                        />
                      </div>
                      <time dateTime={day.date} aria-hidden="true">
                        {compactDate(day.date, period)}
                      </time>
                    </li>
                  );
                })}
              </ol>
            </div>
            {period === "month" && (
              <p className={styles.muted}>
                Scroll horizontally to view every day of the month.
              </p>
            )}
            {isCurrentPeriod && current.through < current.end && (
              <p className={styles.muted}>
                Upcoming days are dimmed and excluded from consistency.
              </p>
            )}
          </figure>

          <div className={styles.breakdowns}>
            <section aria-labelledby="training-groups-title">
              <h3 id="training-groups-title">Training by group</h3>
              <p className={styles.muted}>Set volume in this period</p>
              <ul className={styles.groups}>
                {groups
                  .filter(
                    (group) => group.category !== "previous" || group.entries,
                  )
                  .map((group) => (
                    <li key={group.category}>
                      <div className={styles.groupLabel}>
                        <span>{group.label}</span>
                        <strong>{formatNumber(group.sets)} sets</strong>
                      </div>
                      <div className={styles.groupTrack} aria-hidden="true">
                        <span
                          style={{
                            width: `${(group.sets / maximumGroupSets) * 100}%`,
                          }}
                        />
                      </div>
                      <small>
                        {group.entries}{" "}
                        {group.entries === 1 ? "entry" : "entries"} ·{" "}
                        {group.practiceDays}{" "}
                        {group.practiceDays === 1
                          ? "practice day"
                          : "practice days"}
                      </small>
                    </li>
                  ))}
              </ul>
            </section>

            <section
              className={styles.comparisonPanel}
              aria-label="Period comparison"
            >
              <h3>Previous {periodLabel}</h3>
              <p className={styles.muted}>
                {formatRange(previous.start, previous.through)}
              </p>
              <dl>
                <div>
                  <dt>Practice days</dt>
                  <dd>
                    {previous.totals.practiceDays} / {previous.days}
                  </dd>
                </div>
                <div>
                  <dt>Consistency</dt>
                  <dd>{formatNumber(previous.consistency)}%</dd>
                </div>
                <div>
                  <dt>Logged entries</dt>
                  <dd>{formatNumber(previous.totals.entries)}</dd>
                </div>
                <div>
                  <dt>Total sets</dt>
                  <dd>{formatNumber(previous.totals.sets)}</dd>
                </div>
                <div>
                  <dt>Total repetitions</dt>
                  <dd>{formatNumber(previous.totals.repetitions)}</dd>
                </div>
                <div>
                  <dt>Total hold time</dt>
                  <dd>{formatHold(previous.totals.holdSeconds)}</dd>
                </div>
              </dl>
              <p className={styles.muted}>
                {isCurrentPeriod
                  ? "Ongoing periods compare the same number of elapsed calendar days, capped at the previous period’s length."
                  : "Completed periods compare their full calendar ranges."}
              </p>
            </section>
          </div>

          {skills.length > 0 && (
            <details className={styles.skillBreakdown}>
              <summary>Skill breakdown ({skills.length})</summary>
              <p className={styles.muted}>
                Total volume counts every set. Best repetitions and holds are
                per set within this period.
              </p>
              <div
                className={styles.tableScroll}
                role="region"
                aria-label="Skill breakdown table"
                tabIndex={0}
              >
                <table>
                  <caption className={styles.visuallyHidden}>
                    Per-skill training for{" "}
                    {formatRange(current.start, current.through)}
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">Skill</th>
                      <th scope="col">Entries</th>
                      <th scope="col">Sets</th>
                      <th scope="col">Total reps</th>
                      <th scope="col">Total hold</th>
                      <th scope="col">Best per set</th>
                    </tr>
                  </thead>
                  <tbody>
                    {skills.map((skill) => (
                      <tr key={skill.id}>
                        <th scope="row">{skill.name}</th>
                        <td>{formatNumber(skill.entries)}</td>
                        <td>{formatNumber(skill.sets)}</td>
                        <td>
                          {skill.repetitions
                            ? formatNumber(skill.repetitions)
                            : "—"}
                        </td>
                        <td>
                          {skill.holdSeconds
                            ? formatHold(skill.holdSeconds)
                            : "—"}
                        </td>
                        <td>
                          {[
                            skill.bestRepetitions === null
                              ? null
                              : `${formatNumber(skill.bestRepetitions)} reps`,
                            skill.bestHoldSeconds === null
                              ? null
                              : `${formatHold(skill.bestHoldSeconds)} hold`,
                          ]
                            .filter(Boolean)
                            .join(" · ") || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          )}
        </>
      )}
    </section>
  );
}
