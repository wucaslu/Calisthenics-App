"use client";

import { useState } from "react";
import { ArrowRight, WandSparkles } from "lucide-react";
import { MovementBadge, StateBadge } from "@/components/ui";
import { categoryLabels, skillById } from "@/data/skills";
import { getSkillState } from "@/lib/progression";
import { WEEKDAYS, WEEKDAY_LABELS } from "@/lib/schedule";
import { generateWeeklyScheduleSuggestion } from "@/lib/scheduleSuggestions";
import type { UserProfile, Weekday, WeeklySchedule } from "@/types/skill";
import styles from "./ScheduleSuggestions.module.css";

interface ScheduleSuggestionsProps {
  profile: UserProfile;
  hydrated: boolean;
  onApply: (schedule: WeeklySchedule) => void;
}

interface Preview {
  suggestion: ReturnType<typeof generateWeeklyScheduleSuggestion>;
  snapshot: string;
}

function getSnapshot(
  profile: UserProfile,
  days: Weekday[],
  skillsPerDay: number,
): string {
  return JSON.stringify({
    progress: Object.entries(profile.progress).sort(([first], [second]) =>
      first.localeCompare(second),
    ),
    equipment: [...new Set(profile.equipment)].sort(),
    goals: [...new Set(profile.goals)].sort(),
    days: WEEKDAYS.filter((day) => days.includes(day)),
    skillsPerDay,
  });
}

export function ScheduleSuggestions({
  profile,
  hydrated,
  onApply,
}: ScheduleSuggestionsProps) {
  const [days, setDays] = useState<Weekday[]>([
    "monday",
    "wednesday",
    "friday",
  ]);
  const [skillsPerDay, setSkillsPerDay] = useState(3);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [message, setMessage] = useState("");
  const snapshot = getSnapshot(profile, days, skillsPerDay);
  const stale = preview !== null && preview.snapshot !== snapshot;
  const activeGoals = [...new Set(profile.goals)]
    .map((id) => skillById[id])
    .filter((skill) => skill && profile.progress[skill.id] !== "mastered");
  const achievedGoals = [...new Set(profile.goals)]
    .map((id) => skillById[id])
    .filter((skill) => skill && profile.progress[skill.id] === "mastered");
  const suggestedDays = preview
    ? WEEKDAYS.filter((day) => (preview.suggestion.days[day]?.length ?? 0) > 0)
    : [];
  const suggestedCount = suggestedDays.reduce(
    (count, day) => count + (preview?.suggestion.days[day]?.length ?? 0),
    0,
  );
  const unavailableGoals = preview?.suggestion.unavailableGoalIds
    .map((id) => skillById[id]?.name)
    .filter(Boolean);

  function generate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!hydrated || !days.length) return;
    const suggestion = generateWeeklyScheduleSuggestion(profile, {
      days,
      skillsPerDay,
    });
    setPreview({ suggestion, snapshot });
    setMessage(
      WEEKDAYS.some((day) => (suggestion.days[day]?.length ?? 0) > 0)
        ? "Suggestions are ready to review. Your schedule has not changed."
        : "No suggestions are available for these settings.",
    );
  }

  function apply() {
    if (!hydrated || !preview || stale || !suggestedCount) return;
    onApply(preview.suggestion.schedule);
    setMessage(
      "Suggestions are now included in your schedule. Your existing assignments were kept, with each skill listed once per day.",
    );
  }

  return (
    <section
      className={`surface-panel ${styles.generator}`}
      aria-labelledby="schedule-suggestions-title"
    >
      <div className={`panel-heading ${styles.heading}`}>
        <h2 id="schedule-suggestions-title">
          <WandSparkles size={18} aria-hidden="true" /> Suggest a training week
        </h2>
        <span className="subtle-label">BASED ON YOUR PROGRESS</span>
      </div>
      <p className={styles.intro}>
        Get skill choices from your available, training, and mastered skills,
        using your equipment and the next steps toward your goals. Preview a
        week, then add it alongside your current assignments.
      </p>
      {activeGoals.length ? (
        <div className={styles.goals}>
          <span className={styles.goalLabel}>Working toward</span>
          <ul aria-label="Goals used for suggestions">
            {activeGoals.map((goal) => (
              <li key={goal.id}>{goal.name}</li>
            ))}
          </ul>
        </div>
      ) : (
        <p className={styles.hint}>
          Mark goals in the skill tree to focus your suggestions. You can also
          generate a week of foundations and skills you are already training.
        </p>
      )}
      {achievedGoals.length > 0 && (
        <p className={styles.hint}>
          Already achieved: {achievedGoals.map((goal) => goal.name).join(", ")}.
          Suggestions focus on your remaining goals or general practice.
        </p>
      )}

      <form onSubmit={generate}>
        <fieldset disabled={!hydrated} className={styles.controls}>
          <legend>Training days</legend>
          <div className={styles.weekdays}>
            {WEEKDAYS.map((day) => (
              <label
                key={day}
                className={`${styles.weekday} ${days.includes(day) ? styles.selectedDay : ""}`}
              >
                <input
                  type="checkbox"
                  checked={days.includes(day)}
                  aria-label={`Train on ${WEEKDAY_LABELS[day]}`}
                  onChange={(event) => {
                    const checked = event.target.checked;
                    setDays((current) =>
                      checked
                        ? WEEKDAYS.filter(
                            (weekday) =>
                              weekday === day || current.includes(weekday),
                          )
                        : current.filter((weekday) => weekday !== day),
                    );
                  }}
                />
                <span>{WEEKDAY_LABELS[day]}</span>
              </label>
            ))}
          </div>
          <div className={styles.actions}>
            <label className={styles.limit}>
              Suggested skills per day
              <select
                value={skillsPerDay}
                onChange={(event) =>
                  setSkillsPerDay(Number(event.target.value))
                }
              >
                {[1, 2, 3, 4, 5, 6].map((count) => (
                  <option key={count} value={count}>
                    Up to {count} {count === 1 ? "skill" : "skills"}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="submit"
              className={styles.generateButton}
              disabled={!days.length}
            >
              <WandSparkles size={15} aria-hidden="true" /> Generate suggestions
            </button>
          </div>
        </fieldset>
      </form>
      {!days.length && (
        <p className={styles.hint}>Choose at least one training day.</p>
      )}
      <p className={styles.hint}>
        Suggestions are skill choices; adjust workload to suit your training.
        Generating or adding a plan does not create practice logs.
      </p>
      <p
        className={`${styles.status} ${stale ? styles.stale : ""}`}
        role="status"
        aria-label="Suggestion status"
        aria-live="polite"
      >
        {stale
          ? "Your skills, equipment, goals, or settings changed. Generate suggestions again before adding them."
          : message}
      </p>

      {preview && (
        <div className={styles.preview} aria-label="Suggested weekly schedule">
          <div className={styles.previewHeading}>
            <h3>Suggested week</h3>
            <span>
              {suggestedCount} skill{" "}
              {suggestedCount === 1 ? "choice" : "choices"}
              {" · "}
              {suggestedDays.length} training{" "}
              {suggestedDays.length === 1 ? "day" : "days"}
            </span>
          </div>
          {!!unavailableGoals?.length && (
            <p className={styles.warning}>
              No current training step is available for{" "}
              {unavailableGoals.join(", ")}. Master the required skills or
              update your equipment to open a route.
            </p>
          )}
          {!suggestedCount ? (
            <p className={styles.empty}>
              No skills match your current progress and equipment. Update your
              equipment or master prerequisites in the skill tree, then try
              again.
            </p>
          ) : (
            <>
              <div
                className={`${styles.previewDays} ${stale ? styles.stalePreview : ""}`}
              >
                {suggestedDays.map((day) => {
                  const choices = preview.suggestion.days[day] ?? [];
                  return (
                    <section
                      key={day}
                      className={styles.previewDay}
                      aria-label={`Suggested ${WEEKDAY_LABELS[day]}`}
                    >
                      <div className={styles.dayHeading}>
                        <h4>{WEEKDAY_LABELS[day]}</h4>
                        <span>
                          {choices.length
                            ? `${choices.length} ${choices.length === 1 ? "skill" : "skills"}`
                            : "No suggestion"}
                        </span>
                      </div>
                      {!choices.length ? (
                        <p className={styles.rest}>No training suggested.</p>
                      ) : (
                        <ul className={styles.skillList}>
                          {choices.map(({ skill, reason }) => (
                            <li key={skill.id}>
                              <article
                                className={styles.skill}
                                data-skill-id={skill.id}
                                aria-label={`${skill.name} suggested for ${WEEKDAY_LABELS[day]}`}
                              >
                                <h5>{skill.name}</h5>
                                <div className={styles.skillMeta}>
                                  <span>{categoryLabels[skill.category]}</span>
                                  <MovementBadge type={skill.movementType} />
                                  <StateBadge
                                    state={getSkillState(
                                      skill,
                                      profile.progress,
                                    )}
                                  />
                                </div>
                                <p>{reason}</p>
                              </article>
                            </li>
                          ))}
                        </ul>
                      )}
                    </section>
                  );
                })}
              </div>
              <div className={styles.applyRow}>
                <p className={styles.hint}>
                  Your current assignments stay in place. Each skill appears
                  once per day; adding suggestions may increase the number of
                  skills in a session.
                </p>
                <button
                  type="button"
                  className={styles.applyButton}
                  onClick={apply}
                  disabled={!hydrated || stale}
                >
                  Add suggestions to schedule{" "}
                  <ArrowRight size={15} aria-hidden="true" />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
}
