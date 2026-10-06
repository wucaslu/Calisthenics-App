import {
  BicepsFlexed,
  Check,
  Circle,
  CircleDot,
  Flame,
  LockKeyhole,
  PersonStanding,
  Repeat2,
  Target,
  Timer,
  Zap,
} from "lucide-react";
import {
  DIFFICULTY_EXPLANATION,
  getDifficultyTier,
  MAX_DIFFICULTY,
} from "@/lib/difficulty";
import type { Category, MovementType, SkillState } from "@/types/skill";

export const movementLabels: Record<MovementType, string> = {
  dynamic: "Dynamic",
  static: "Static",
};

export function MovementBadge({ type }: { type: MovementType }) {
  const Icon = type === "static" ? Timer : Repeat2;
  return (
    <span
      className={`movement-badge movement-${type}`}
      title={
        type === "static"
          ? "Static: hold a position"
          : "Dynamic: move through repetitions"
      }
    >
      <Icon size={12} aria-hidden="true" />
      {movementLabels[type]}
    </span>
  );
}

export const stateLabels: Record<SkillState, string> = {
  locked: "Locked",
  available: "Available",
  training: "Training",
  mastered: "Mastered",
};
const stateIcons = {
  locked: LockKeyhole,
  available: Circle,
  training: Flame,
  mastered: Check,
};
export function StateIcon({
  state,
  size = 13,
}: {
  state: SkillState;
  size?: number;
}) {
  const Icon = stateIcons[state];
  return <Icon size={size} aria-hidden="true" />;
}
export function StateBadge({ state }: { state: SkillState }) {
  return (
    <span className={`state-badge state-${state}`}>
      <StateIcon state={state} />
      {stateLabels[state]}
    </span>
  );
}
export function SkillIcon({
  category,
  size = 23,
}: {
  category: Category;
  size?: number;
}) {
  const Icon = {
    push: BicepsFlexed,
    pull: PersonStanding,
    core: CircleDot,
    legs: PersonStanding,
  }[category];
  return <Icon size={size} strokeWidth={1.65} aria-hidden="true" />;
}
export function Difficulty({
  level,
  text = false,
}: {
  level: number;
  text?: boolean;
}) {
  return (
    <span
      className={`difficulty ${text ? "difficulty-detailed" : "difficulty-compact"}`}
      aria-label={`Difficulty ${level} of ${MAX_DIFFICULTY}`}
      title={`App difficulty: ${level}/${MAX_DIFFICULTY} · ${getDifficultyTier(level)}. ${DIFFICULTY_EXPLANATION} Published progression levels use their own scales.`}
    >
      <span className="difficulty-score">
        {level}/{MAX_DIFFICULTY}
      </span>
      {text && (
        <>
          <span className="difficulty-bars" aria-hidden="true">
            {Array.from(
              { length: MAX_DIFFICULTY },
              (_, index) => index + 1,
            ).map((value) => (
              <i key={value} className={value <= level ? "filled" : ""} />
            ))}
          </span>
          <span>{getDifficultyTier(level)}</span>
        </>
      )}
    </span>
  );
}
export function EmptyState({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="empty-state">
      <Target size={28} />
      <h3>{title}</h3>
      <p>{children}</p>
    </div>
  );
}
export function BrandMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <Zap size={25} fill="currentColor" strokeWidth={1.3} />
    </span>
  );
}
