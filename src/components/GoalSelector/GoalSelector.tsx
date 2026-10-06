"use client";

import { useState } from "react";
import {
  ArrowRight,
  Check,
  CheckCheck,
  Plus,
  Search,
  Target,
  X,
} from "lucide-react";
import { Difficulty, EmptyState, SkillIcon, StateIcon } from "@/components/ui";
import { branchLabels, categoryLabels, skillById, skills } from "@/data/skills";
import { getGoalPath } from "@/lib/graph";
import { getSkillState, missingEquipment } from "@/lib/progression";
import type { UserProfile } from "@/types/skill";

export function GoalSelector({
  profile,
  onToggle,
  onSelect,
  onExplore,
  hydrated,
}: {
  profile: UserProfile;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
  onExplore: (id: string) => void;
  hydrated: boolean;
}) {
  const [query, setQuery] = useState("");
  const matches = skills.filter((skill) =>
    skill.name.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <div className="goals-layout">
      <section className="goal-paths">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Your direction</span>
            <h2>Small steps. Big milestones.</h2>
            <p>
              One preparation route is chosen at each step, favoring your
              equipment and fewer remaining skills. Already mastered skills are
              cleared from your path.
            </p>
          </div>
        </div>
        {profile.goals.map((id) => {
          const skill = skillById[id],
            path = getGoalPath(id, profile.progress, profile.equipment);
          return (
            <article className="surface-panel goal-path-card" key={id}>
              <div className="goal-path-heading">
                <span className="skill-symbol">
                  <SkillIcon category={skill.category} />
                </span>
                <div>
                  <span className="eyebrow">{branchLabels[skill.branch]}</span>
                  <h3>{skill.name}</h3>
                </div>
                <button
                  className="icon-button"
                  aria-label={`Remove ${skill.name} from goals`}
                  onClick={() => onToggle(id)}
                  disabled={!hydrated}
                >
                  <X size={16} />
                </button>
              </div>
              <div className="goal-path-meta">
                <span>
                  {path.length
                    ? `${path.length} remaining ${path.length === 1 ? "skill" : "skills"}`
                    : "Goal mastered"}
                </span>
                <Difficulty level={skill.difficulty} text />
              </div>
              {path.length ? (
                <div className="path-steps">
                  {path.map((step, index) => (
                    <button key={step.id} onClick={() => onSelect(step.id)}>
                      <span
                        className={`path-step-icon state-${getSkillState(step, profile.progress)}`}
                      >
                        <StateIcon
                          state={getSkillState(step, profile.progress)}
                          size={14}
                        />
                      </span>
                      <span>
                        {step.name}
                        {missingEquipment(step, profile.equipment).length >
                          0 && <small>Equipment needed</small>}
                      </span>
                      {step.id === id ? (
                        <Target size={14} />
                      ) : (
                        <span className="path-step-number">{index + 1}</span>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="goal-complete">
                  <CheckCheck size={21} />
                  You made it. Keep practicing and make it yours.
                </div>
              )}
              <button className="text-button" onClick={() => onExplore(id)}>
                Explore this branch
                <ArrowRight size={14} />
              </button>
            </article>
          );
        })}
        {!profile.goals.length && (
          <EmptyState title="What would you love to unlock?">
            Pick your first goal from the skill list. We’ll find the
            prerequisite path.
          </EmptyState>
        )}
      </section>
      <section className="surface-panel goal-selector">
        <div className="panel-heading">
          <h2>Choose target skills</h2>
          <Target size={18} />
        </div>
        <label className="search-field">
          <Search size={15} />
          <input
            aria-label="Search target skills"
            placeholder="Find your next milestone..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <div className="goal-options">
          {matches.map((skill) => {
            const active = profile.goals.includes(skill.id);
            return (
              <button
                key={skill.id}
                onClick={() => onToggle(skill.id)}
                disabled={!hydrated}
                className={active ? "goal-option selected" : "goal-option"}
                aria-pressed={active}
              >
                <span>
                  <strong>{skill.name}</strong>
                  <small>{categoryLabels[skill.category]}</small>
                </span>
                <span className="goal-option-check">
                  {active ? <Check size={14} /> : <Plus size={14} />}
                </span>
              </button>
            );
          })}
          {!matches.length && (
            <p className="muted-copy">
              No matching skills. Try a shorter name.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
