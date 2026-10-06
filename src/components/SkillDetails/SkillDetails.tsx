"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import {
  ArrowRight,
  Check,
  CheckCheck,
  ChevronRight,
  Dumbbell,
  Flame,
  RotateCcw,
  Sparkles,
  Target,
  Trophy,
  X,
} from "lucide-react";
import {
  Difficulty,
  MovementBadge,
  SkillIcon,
  StateBadge,
  StateIcon,
} from "@/components/ui";
import { branchLabels, equipmentLabels, skillById } from "@/data/skills";
import { getSkillState, missingEquipment } from "@/lib/progression";
import { PERSONAL_RECORD_MAX_LENGTH } from "@/lib/profile";
import type { Skill, UserProfile } from "@/types/skill";

function subscribeMobile(callback: () => void) {
  const media = window.matchMedia("(max-width: 767px)");
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}
const mobileSnapshot = () => window.matchMedia("(max-width: 767px)").matches;

interface Props {
  skill: Skill;
  profile: UserProfile;
  onClose: () => void;
  onSelect: (id: string) => void;
  onProgress: (id: string, action: "training" | "mastered" | "reset") => void;
  onToggleGoal: (id: string) => void;
  onPersonalRecord: (id: string, value: string) => void;
  hydrated: boolean;
  storageAvailable: boolean;
}

export function SkillDetails({
  skill,
  profile,
  onClose,
  onSelect,
  onProgress,
  onToggleGoal,
  onPersonalRecord,
  hydrated,
  storageAvailable,
}: Props) {
  const state = getSkillState(skill, profile.progress);
  const missing = missingEquipment(skill, profile.equipment);
  const isGoal = profile.goals.includes(skill.id);
  const mobile = useSyncExternalStore(
    subscribeMobile,
    mobileSnapshot,
    () => false,
  );
  const panel = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!mobile) return;
    const previous = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.querySelector<HTMLButtonElement>("button")?.focus();
    const keyboard = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab") return;
      const controls = panel.current?.querySelectorAll<HTMLElement>(
        'button:not(:disabled), input:not(:disabled), textarea:not(:disabled), select:not(:disabled), a[href], [tabindex="0"]',
      );
      if (!controls?.length) return;
      const first = controls[0],
        last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", keyboard);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", keyboard);
      previous?.focus();
    };
  }, [mobile, onClose]);

  return (
    <>
      {mobile && (
        <button
          className="detail-backdrop"
          aria-label="Close skill details"
          onClick={onClose}
          tabIndex={-1}
        />
      )}
      <aside
        className="detail-panel"
        ref={panel}
        role={mobile ? "dialog" : undefined}
        aria-modal={mobile || undefined}
        aria-labelledby="detail-title"
      >
        <div className="detail-panel-top">
          <span>SKILL DETAILS</span>
          <button
            className="icon-button"
            onClick={onClose}
            aria-label="Close skill details"
          >
            <X size={17} />
          </button>
        </div>
        <div className="detail-scroll">
          <div className="detail-emblem">
            <SkillIcon category={skill.category} size={36} />
            <span className="emblem-orbit" />
          </div>
          <span className="eyebrow">
            {branchLabels[skill.branch]} progression
          </span>
          <h2 id="detail-title">{skill.name}</h2>
          <div className="detail-meta">
            <StateBadge state={state} />
            <MovementBadge type={skill.movementType} />
            <Difficulty level={skill.difficulty} text />
          </div>
          <p className="detail-description">{skill.description}</p>
          <div className="personal-record-card">
            <div className="personal-record-heading">
              <label htmlFor="personal-record">
                <Trophy size={14} aria-hidden="true" />
                Personal Record
              </label>
              <button
                type="button"
                className="personal-record-clear"
                onClick={() => onPersonalRecord(skill.id, "")}
                disabled={!hydrated || !profile.personalRecords[skill.id]}
                aria-label={`Clear personal record for ${skill.name}`}
              >
                Clear
              </button>
            </div>
            <input
              id="personal-record"
              type="text"
              value={profile.personalRecords[skill.id] ?? ""}
              onChange={(event) =>
                onPersonalRecord(skill.id, event.target.value)
              }
              placeholder={
                skill.movementType === "static"
                  ? "e.g. 25 seconds"
                  : "e.g. 12 reps + 10 kg"
              }
              maxLength={PERSONAL_RECORD_MAX_LENGTH}
              disabled={!hydrated}
              autoComplete="off"
              aria-describedby="personal-record-hint personal-record-storage"
            />
            <p id="personal-record-hint">
              Your best time, reps, or added weight.
            </p>
            <small id="personal-record-storage">
              {storageAvailable
                ? "Saved automatically on this device."
                : "Kept for this session; browser storage is unavailable."}
            </small>
          </div>
          <button
            className={`goal-button ${isGoal ? "is-goal" : ""}`}
            onClick={() => onToggleGoal(skill.id)}
            disabled={!hydrated}
            aria-pressed={isGoal}
          >
            <Target size={15} />
            {isGoal ? "One of your goals" : "Add to my goals"}
            {isGoal && <Check size={13} />}
          </button>

          <div className="detail-section">
            <h3>
              Prerequisites{" "}
              <span>
                {
                  skill.prerequisites.filter(
                    (id) => profile.progress[id] === "mastered",
                  ).length
                }
                /{skill.prerequisites.length}
              </span>
            </h3>
            {skill.prerequisites.length ? (
              <div className="prerequisite-list">
                {skill.prerequisites.map((id) => {
                  const item = skillById[id],
                    itemState = getSkillState(item, profile.progress);
                  return (
                    <button key={id} onClick={() => onSelect(id)}>
                      <span className={`prerequisite-check state-${itemState}`}>
                        <StateIcon state={itemState} size={14} />
                      </span>
                      <span>{item.name}</span>
                      <ChevronRight size={13} />
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="muted-copy">
                No prerequisites. Start here and build your foundation.
              </p>
            )}
          </div>
          <div className="criteria-card">
            <Sparkles size={16} />
            <div>
              <h3>Example mastery criteria</h3>
              {skill.requirements.map((requirement) => (
                <p key={requirement.exercise}>{requirement.target}</p>
              ))}
              <small>
                A guide for clean, controlled form. Progress at your own pace.
              </small>
            </div>
          </div>
          <div className="detail-section">
            <h3>Your practice plan</h3>
            <div className="exercise-list">
              {skill.exercises.map((exercise, index) => (
                <div key={exercise.name} className="exercise">
                  <span className="exercise-index">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h4>{exercise.name}</h4>
                    <span className="exercise-dose">
                      {exercise.sets && `${exercise.sets} sets`}
                      {exercise.reps && ` × ${exercise.reps} reps`}
                      {exercise.hold && ` × ${exercise.hold}`}
                    </span>
                    <p>{exercise.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="detail-section">
            <h3>Equipment needed</h3>
            <div className="equipment-chips">
              {skill.equipment.map((item) => (
                <span
                  key={item}
                  className={missing.includes(item) ? "missing" : ""}
                >
                  <Dumbbell size={12} />
                  {equipmentLabels[item]}
                  {missing.includes(item) && " · missing"}
                </span>
              ))}
            </div>
          </div>
          <div className="detail-section">
            <h3>Unlocks next</h3>
            {skill.progressionTo.length ? (
              <div className="unlock-list">
                {skill.progressionTo.map((id) => (
                  <button key={id} onClick={() => onSelect(id)}>
                    {skillById[id].name}
                    <ArrowRight size={14} />
                  </button>
                ))}
              </div>
            ) : (
              <p className="muted-copy">
                A milestone at the end of this branch. Keep refining your form.
              </p>
            )}
          </div>
        </div>
        <div className="detail-actions">
          {state === "locked" && (
            <p>Master all prerequisites to unlock this skill.</p>
          )}
          {state !== "locked" && missing.length > 0 && (
            <p>Update your equipment to start training.</p>
          )}
          <button
            className="primary-button"
            disabled={
              !hydrated ||
              state === "locked" ||
              state === "mastered" ||
              state === "training" ||
              missing.length > 0
            }
            onClick={() => onProgress(skill.id, "training")}
          >
            <Flame size={15} />
            {state === "training" ? "Currently training" : "Start Training"}
          </button>
          <button
            className="secondary-button"
            disabled={!hydrated || state === "locked" || state === "mastered"}
            onClick={() => onProgress(skill.id, "mastered")}
          >
            <CheckCheck size={16} />
            {state === "mastered" ? "Skill mastered" : "Mark as Mastered"}
          </button>
          <button
            className="reset-button"
            disabled={!hydrated || !profile.progress[skill.id]}
            onClick={() => onProgress(skill.id, "reset")}
          >
            <RotateCcw size={12} />
            Reset Progress
          </button>
          {profile.progress[skill.id] && (
            <small>Resetting also relocks dependent skills.</small>
          )}
        </div>
      </aside>
    </>
  );
}
