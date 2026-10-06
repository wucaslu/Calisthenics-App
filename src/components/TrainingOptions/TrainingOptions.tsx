"use client";

import { Check, ChevronRight, Dumbbell } from "lucide-react";
import { StateIcon } from "@/components/ui";
import { equipmentLabels, skillById } from "@/data/skills";
import {
  getEquipmentSetups,
  getPrerequisiteRoutes,
  getSkillState,
  missingEquipmentForSetup,
} from "@/lib/progression";
import type { Skill, UserProfile } from "@/types/skill";
import styles from "./TrainingOptions.module.css";

interface OptionsProps {
  skill: Skill;
  profile: UserProfile;
}

interface PrerequisiteProps extends OptionsProps {
  onSelect: (id: string) => void;
}

function PrerequisiteList({
  ids,
  profile,
  onSelect,
}: {
  ids: string[];
  profile: UserProfile;
  onSelect: (id: string) => void;
}) {
  return (
    <div className={`prerequisite-list ${styles.prerequisites}`}>
      {ids.map((id) => {
        const item = skillById[id];
        const state = getSkillState(item, profile.progress);
        return (
          <button
            key={id}
            type="button"
            onClick={() => onSelect(id)}
            title={`${item.name}: ${state}`}
          >
            <span className={`prerequisite-check state-${state}`}>
              <StateIcon state={state} size={14} />
            </span>
            <span>{item.name}</span>
            <ChevronRight size={13} aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}

export function PrerequisiteOptions({
  skill,
  profile,
  onSelect,
}: PrerequisiteProps) {
  const routes = getPrerequisiteRoutes(skill);
  const hasAlternatives = routes.length > 1;
  const standard = routes[0];
  const completed = (ids: string[]) =>
    ids.filter((id) => profile.progress[id] === "mastered").length;

  return (
    <section className={`detail-section ${styles.section}`}>
      <h3>
        {hasAlternatives ? "Prerequisite routes" : "Prerequisites"}
        {!hasAlternatives && (
          <span>
            {completed(standard.prerequisites)}/{standard.prerequisites.length}
          </span>
        )}
      </h3>
      {hasAlternatives ? (
        <>
          <p className={styles.explanation}>
            Master every prerequisite in any one complete route to unlock this
            skill. These are suggested preparation paths.
          </p>
          <div className={styles.options}>
            {routes.map((route) => {
              const count = completed(route.prerequisites);
              const ready = count === route.prerequisites.length;
              return (
                <article
                  key={route.id}
                  className={`${styles.option} ${ready ? styles.ready : ""}`}
                  aria-label={`${route.label} prerequisite route`}
                >
                  <div className={styles.heading}>
                    <h4>{route.label}</h4>
                    <span className={styles.status}>
                      {ready && <Check size={12} aria-hidden="true" />}
                      {ready
                        ? "Route ready"
                        : `${count}/${route.prerequisites.length} mastered`}
                    </span>
                  </div>
                  <p className={styles.description}>{route.description}</p>
                  <PrerequisiteList
                    ids={route.prerequisites}
                    profile={profile}
                    onSelect={onSelect}
                  />
                </article>
              );
            })}
          </div>
        </>
      ) : standard.prerequisites.length ? (
        <PrerequisiteList
          ids={standard.prerequisites}
          profile={profile}
          onSelect={onSelect}
        />
      ) : (
        <p className="muted-copy">
          No prerequisites. Start here and build your foundation.
        </p>
      )}
    </section>
  );
}

export function EquipmentOptions({ skill, profile }: OptionsProps) {
  const setups = getEquipmentSetups(skill);
  const hasAlternatives = setups.length > 1;

  return (
    <section className={`detail-section ${styles.section}`}>
      <h3>{hasAlternatives ? "Equipment options" : "Equipment needed"}</h3>
      {hasAlternatives && (
        <p className={styles.explanation}>
          Any complete setup works for this skill. Follow the setup notes for
          changes to grip, stability, or range of motion.
        </p>
      )}
      <div className={styles.options}>
        {setups.map((setup) => {
          const missing = missingEquipmentForSetup(setup, profile.equipment);
          const ready = missing.length === 0;
          return (
            <article
              key={setup.id}
              className={
                hasAlternatives
                  ? `${styles.option} ${ready ? styles.ready : ""}`
                  : styles.singleSetup
              }
              aria-label={`${setup.label} equipment setup`}
            >
              {hasAlternatives && (
                <div className={styles.heading}>
                  <h4>{setup.label}</h4>
                  <span
                    className={`${styles.status} ${ready ? "" : styles.unavailable}`}
                  >
                    {ready && <Check size={12} aria-hidden="true" />}
                    {ready ? "Available" : "Equipment missing"}
                  </span>
                </div>
              )}
              {setup.description && (
                <p className={styles.description}>{setup.description}</p>
              )}
              <div className={`equipment-chips ${styles.equipment}`}>
                {setup.equipment.map((item) => (
                  <span
                    key={item}
                    className={missing.includes(item) ? "missing" : ""}
                  >
                    <Dumbbell size={12} aria-hidden="true" />
                    {equipmentLabels[item]}
                    {missing.includes(item) && " · missing"}
                  </span>
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
