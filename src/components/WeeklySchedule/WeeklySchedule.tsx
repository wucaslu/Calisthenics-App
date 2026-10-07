"use client";

import { useState } from "react";
import { CalendarDays, ChevronRight, Moon, Plus, Trash2 } from "lucide-react";
import { MovementBadge, StateBadge } from "@/components/ui";
import { categoryLabels, equipmentLabels, skillById } from "@/data/skills";
import { getSkillState, missingEquipment } from "@/lib/progression";
import {
  canScheduleSkill,
  getSchedulableSkills,
  WEEKDAYS,
  WEEKDAY_LABELS,
} from "@/lib/schedule";
import type {
  Category,
  UserProfile,
  Weekday,
  WeeklySchedule as WeeklyPlan,
} from "@/types/skill";
import { ScheduleSuggestions } from "./ScheduleSuggestions";
import styles from "./WeeklySchedule.module.css";

interface WeeklyScheduleProps {
  profile: UserProfile;
  hydrated: boolean;
  storageAvailable: boolean;
  onAdd: (day: Weekday, skillId: string) => void;
  onRemove: (day: Weekday, skillId: string) => void;
  onApplySuggestion: (schedule: WeeklyPlan) => void;
  onSelect: (id: string) => void;
  onLogPractice: (id: string) => void;
}

const scheduleCategories: Category[] = ["pull", "push", "legs", "core"];

export function WeeklySchedule({
  profile,
  hydrated,
  storageAvailable,
  onAdd,
  onRemove,
  onApplySuggestion,
  onSelect,
  onLogPractice,
}: WeeklyScheduleProps) {
  const [day, setDay] = useState<Weekday>("monday");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [message, setMessage] = useState("");
  const schedule = profile.weeklySchedule ?? {};
  const schedulable = getSchedulableSkills(profile);
  const assigned = new Set(schedule[day] ?? []);
  const unassigned = schedulable.filter((skill) => !assigned.has(skill.id));
  const choices = unassigned.filter((skill) =>
    skill.name.toLowerCase().includes(search.trim().toLowerCase()),
  );
  const selectedSkill =
    choices.find((skill) => skill.id === selectedId) ?? choices[0];
  const trainingDays = WEEKDAYS.filter(
    (weekday) => (schedule[weekday]?.length ?? 0) > 0,
  ).length;
  const skillSlots = WEEKDAYS.reduce(
    (total, weekday) => total + (schedule[weekday]?.length ?? 0),
    0,
  );

  function addSkill(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!hydrated || !selectedSkill) return;
    onAdd(day, selectedSkill.id);
    setMessage(`Added ${selectedSkill.name} to ${WEEKDAY_LABELS[day]}.`);
  }

  return (
    <div className={styles.schedule}>
      <ScheduleSuggestions
        profile={profile}
        hydrated={hydrated}
        onApply={onApplySuggestion}
      />
      <section
        className={`surface-panel ${styles.builder}`}
        aria-labelledby="schedule-builder-title"
      >
        <div className={`panel-heading ${styles.builderHeading}`}>
          <h2 id="schedule-builder-title">
            <CalendarDays size={18} aria-hidden="true" /> Plan your training
            week
          </h2>
          <span className="subtle-label">MONDAY–SUNDAY</span>
        </div>
        <p className={styles.muted}>
          Build a repeating weekly plan with available, training, or mastered
          skills that match your equipment, including supported substitutions.
          The same skill can be planned on different days.
        </p>
        <p className={styles.planHint}>
          Your schedule is a plan. Use Log practice after a session to record
          repetitions or holds and update your records.
        </p>
        {!storageAvailable && (
          <p className={styles.warning}>
            Browser storage is unavailable. Your schedule lasts for this
            session.
          </p>
        )}
        <form onSubmit={addSkill}>
          <fieldset disabled={!hydrated} className={styles.fields}>
            <label>
              Schedule day
              <select
                value={day}
                onChange={(event) => setDay(event.target.value as Weekday)}
              >
                {WEEKDAYS.map((weekday) => (
                  <option key={weekday} value={weekday}>
                    {WEEKDAY_LABELS[weekday]}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Find a schedule skill
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search skill names…"
              />
            </label>
            <label>
              Schedule skill
              <select
                value={selectedSkill?.id ?? ""}
                onChange={(event) => setSelectedId(event.target.value)}
                disabled={!choices.length}
              >
                {!choices.length && (
                  <option value="">No skills to choose</option>
                )}
                {scheduleCategories.map((category) => {
                  const group = choices.filter(
                    (skill) => skill.category === category,
                  );
                  return group.length ? (
                    <optgroup key={category} label={categoryLabels[category]}>
                      {group.map((skill) => (
                        <option key={skill.id} value={skill.id}>
                          {skill.name}
                        </option>
                      ))}
                    </optgroup>
                  ) : null;
                })}
              </select>
            </label>
            <button
              type="submit"
              className={styles.addButton}
              disabled={!choices.length}
            >
              <Plus size={16} aria-hidden="true" /> Add to schedule
            </button>
          </fieldset>
        </form>
        {!choices.length && (
          <p className={styles.emptyChoices}>
            {!schedulable.length
              ? "No skills available to schedule. Master prerequisites in the skill tree or update your equipment."
              : !unassigned.length
                ? `All currently available skills are already scheduled for ${WEEKDAY_LABELS[day]}. Choose another day.`
                : `No matching skills for ${WEEKDAY_LABELS[day]}. Try another skill name.`}
          </p>
        )}
        <p className={styles.status} role="status" aria-live="polite">
          {message}
        </p>
      </section>

      <div className={styles.summary} aria-label="Weekly schedule summary">
        <span>
          <strong>{trainingDays}</strong> planned training{" "}
          {trainingDays === 1 ? "day" : "days"}
        </span>
        <span>
          <strong>{skillSlots}</strong> skill{" "}
          {skillSlots === 1 ? "slot" : "slots"}
        </span>
        <span>
          <strong>{7 - trainingDays}</strong> rest{" "}
          {7 - trainingDays === 1 ? "day" : "days"}
        </span>
      </div>

      <div className={styles.week}>
        {WEEKDAYS.map((weekday) => {
          const ids = schedule[weekday] ?? [];
          const dayLabel = WEEKDAY_LABELS[weekday];
          return (
            <section
              key={weekday}
              className={`surface-panel ${styles.day} ${ids.length ? styles.trainingDay : styles.restDay}`}
              aria-labelledby={`schedule-${weekday}-title`}
            >
              <div className={styles.dayHeading}>
                <h2 id={`schedule-${weekday}-title`}>{dayLabel}</h2>
                <span className={styles.dayCount}>
                  {ids.length
                    ? `${ids.length} ${ids.length === 1 ? "skill" : "skills"}`
                    : "Rest"}
                </span>
              </div>
              {!ids.length ? (
                <div className={styles.rest}>
                  <Moon size={22} aria-hidden="true" />
                  <h3>Rest day</h3>
                  <p>Add a skill above to plan training for {dayLabel}.</p>
                </div>
              ) : (
                <ul className={styles.skillList}>
                  {ids.map((id) => {
                    const skill = skillById[id];
                    const name =
                      skill?.name ?? profile.archivedSkills[id]?.name ?? id;
                    const state = skill
                      ? getSkillState(skill, profile.progress)
                      : null;
                    const ready = canScheduleSkill(id, profile);
                    const missing = skill
                      ? missingEquipment(skill, profile.equipment)
                      : [];
                    const reasons = [
                      !skill && "This skill is no longer in the skill tree.",
                      state === "locked" &&
                        "Locked: master its prerequisites to train this skill.",
                      missing.length > 0 &&
                        `Equipment needed: ${missing.map((item) => equipmentLabels[item]).join(", ")}.`,
                    ].filter(Boolean);
                    return (
                      <li key={id}>
                        <article
                          className={`${styles.skill} ${ready ? "" : styles.unavailable}`}
                          aria-label={`${name} scheduled for ${dayLabel}`}
                        >
                          <div className={styles.skillHeading}>
                            <button
                              type="button"
                              className={styles.detailsButton}
                              disabled={!hydrated || !skill}
                              onClick={() => onSelect(id)}
                              aria-label={`View ${name} details for ${dayLabel}`}
                            >
                              {name}
                              <ChevronRight size={14} aria-hidden="true" />
                            </button>
                            <button
                              type="button"
                              className={styles.removeButton}
                              disabled={!hydrated}
                              onClick={() => {
                                onRemove(weekday, id);
                                setMessage(`Removed ${name} from ${dayLabel}.`);
                              }}
                              aria-label={`Remove ${name} from ${dayLabel}`}
                              title={`Remove ${name} from ${dayLabel}`}
                            >
                              <Trash2 size={14} aria-hidden="true" />
                            </button>
                          </div>
                          {skill && state && (
                            <div className={styles.badges}>
                              <MovementBadge type={skill.movementType} />
                              <StateBadge state={state} />
                            </div>
                          )}
                          {!ready && (
                            <p className={styles.unavailableReason}>
                              <strong>Currently unavailable.</strong>{" "}
                              {reasons.join(" ")} Your plan is kept so you can
                              adjust it.
                            </p>
                          )}
                          <button
                            type="button"
                            className={styles.logButton}
                            disabled={!hydrated || !ready}
                            onClick={() => onLogPractice(id)}
                            aria-label={`Log ${name} practice for ${dayLabel}`}
                          >
                            <Plus size={13} aria-hidden="true" /> Log practice
                          </button>
                        </article>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
