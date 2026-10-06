import {
  ArrowRight,
  CheckCheck,
  Flame,
  Target,
  TrendingUp,
} from "lucide-react";
import { Difficulty, EmptyState, SkillIcon, StateBadge } from "@/components/ui";
import { categories, categoryLabels, skillById, skills } from "@/data/skills";
import { getGoalPath } from "@/lib/graph";
import { completion, getSkillState } from "@/lib/progression";
import { Recommendations } from "@/components/Recommendations";
import type { UserProfile } from "@/types/skill";

export function ProgressStats({ profile }: { profile: UserProfile }) {
  const mastered = skills.filter(
    (skill) => getSkillState(skill, profile.progress) === "mastered",
  ).length;
  const training = skills.filter(
    (skill) => getSkillState(skill, profile.progress) === "training",
  ).length;
  return (
    <div className="stats-grid">
      {[
        {
          label: "Skills mastered",
          value: mastered,
          suffix: `/ ${skills.length}`,
          Icon: CheckCheck,
          className: "accent",
        },
        {
          label: "Currently training",
          value: training,
          suffix: "skills in motion",
          Icon: Flame,
          className: "amber",
        },
        {
          label: "Active goals",
          value: profile.goals.length,
          suffix: "milestones ahead",
          Icon: Target,
          className: "violet",
        },
        {
          label: "Tree completion",
          value: `${completion(profile.progress)}%`,
          suffix: "every skill counts",
          Icon: TrendingUp,
          className: "accent",
        },
      ].map(({ label, value, suffix, Icon, className }) => (
        <div className="stat-card" key={label}>
          <div>
            <span className="stat-label">{label}</span>
            <div className="stat-value">
              {value}
              <span>{suffix}</span>
            </div>
          </div>
          <span className={`stat-icon ${className}`}>
            <Icon size={19} strokeWidth={1.7} />
          </span>
        </div>
      ))}
    </div>
  );
}

export function Dashboard({
  profile,
  onSelect,
  onGoals,
  onEquipment,
}: {
  profile: UserProfile;
  onSelect: (id: string) => void;
  onGoals: () => void;
  onEquipment: () => void;
}) {
  const training = skills.filter(
    (skill) => getSkillState(skill, profile.progress) === "training",
  );
  const mastered = skills.filter(
    (skill) => getSkillState(skill, profile.progress) === "mastered",
  );
  return (
    <>
      <div className="overview-grid">
        <section className="surface-panel">
          <div className="panel-heading">
            <h2>Your current goals</h2>
            <button className="text-button" onClick={onGoals}>
              Manage
              <ArrowRight size={14} />
            </button>
          </div>
          {profile.goals.length ? (
            profile.goals.map((id) => {
              const goal = skillById[id],
                remaining = getGoalPath(id, profile.progress).length;
              return (
                <button
                  className="overview-goal"
                  key={id}
                  onClick={() => onSelect(id)}
                >
                  <span className="skill-symbol">
                    <SkillIcon category={goal.category} />
                  </span>
                  <span>
                    <strong>{goal.name}</strong>
                    <small>
                      {remaining
                        ? `${remaining} skills to master on your path`
                        : "Goal achieved — enjoy this milestone"}
                    </small>
                  </span>
                  <Target size={17} />
                </button>
              );
            })
          ) : (
            <EmptyState title="Choose your direction">
              Add a target skill to get a clear path forward.
            </EmptyState>
          )}
        </section>
        <section className="surface-panel">
          <div className="panel-heading">
            <h2>Progress by group</h2>
            <span className="subtle-label">MASTERED</span>
          </div>
          <div className="category-progress">
            {categories.map((category) => {
              const total = skills.filter(
                  (skill) => skill.category === category,
                ).length,
                count = mastered.filter(
                  (skill) => skill.category === category,
                ).length;
              return (
                <div key={category}>
                  <div className="category-progress-label">
                    <span>
                      <SkillIcon category={category} size={17} />
                      {categoryLabels[category]}
                    </span>
                    <span>
                      {count}
                      <small> / {total}</small>
                    </span>
                  </div>
                  <div className="progress-track">
                    <span style={{ width: `${(count / total) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
      <section className="surface-panel training-panel">
        <div className="panel-heading">
          <h2>Currently training</h2>
          <span className="count-pill">{training.length}</span>
        </div>
        {training.length ? (
          <div className="training-grid">
            {training.map((skill) => (
              <button
                className="training-item"
                key={skill.id}
                onClick={() => onSelect(skill.id)}
              >
                <span className="skill-symbol">
                  <SkillIcon category={skill.category} />
                </span>
                <span>
                  <strong>{skill.name}</strong>
                  <Difficulty level={skill.difficulty} text />
                </span>
                <StateBadge state="training" />
              </button>
            ))}
          </div>
        ) : (
          <p className="muted-copy">
            Open an available skill and choose Start Training to build your
            practice list.
          </p>
        )}
      </section>
      <Recommendations
        profile={profile}
        onSelect={onSelect}
        onEquipment={onEquipment}
      />
      <section className="surface-panel mastered-panel">
        <div className="panel-heading">
          <h2>Your mastered skills</h2>
          <span className="count-pill">{mastered.length}</span>
        </div>
        <div className="mastered-grid">
          {mastered.map((skill) => (
            <button key={skill.id} onClick={() => onSelect(skill.id)}>
              <CheckCheck size={15} />
              {skill.name}
            </button>
          ))}
        </div>
        {!mastered.length && (
          <p className="muted-copy">
            Your first milestone is waiting. Start with a foundation skill.
          </p>
        )}
      </section>
      {Object.keys(profile.archivedSkills).length > 0 && (
        <details className="surface-panel archived-skills">
          <summary>
            Previous skill records{" "}
            <span className="count-pill">
              {Object.keys(profile.archivedSkills).length}
            </span>
          </summary>
          <p className="muted-copy">
            Saved history for removed milestones or progress relocked by the
            revised route. These entries do not count toward tree completion.
          </p>
          <div className="archived-skill-list">
            {Object.entries(profile.archivedSkills).map(([id, item]) => (
              <div key={id}>
                <strong>{item.name}</strong>
                {item.progress && <StateBadge state={item.progress} />}
                {item.personalRecord && <span>{item.personalRecord}</span>}
              </div>
            ))}
          </div>
        </details>
      )}
    </>
  );
}
