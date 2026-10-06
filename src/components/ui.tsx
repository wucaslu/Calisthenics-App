import {
  BicepsFlexed,
  Check,
  Circle,
  CircleDot,
  Flame,
  LockKeyhole,
  PersonStanding,
  Target,
  Zap,
} from "lucide-react";
import type { Category, SkillState } from "@/types/skill";

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
    <span className="difficulty" aria-label={`Difficulty ${level} of 5`}>
      <span className="difficulty-bars" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((value) => (
          <i key={value} className={value <= level ? "filled" : ""} />
        ))}
      </span>
      {text && (
        <span>
          {
            ["", "Foundation", "Beginner", "Intermediate", "Advanced", "Elite"][
              level
            ]
          }
        </span>
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
