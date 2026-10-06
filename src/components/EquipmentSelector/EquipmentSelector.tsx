import {
  Check,
  Circle,
  Dumbbell,
  Layers,
  Minus,
  RectangleHorizontal,
  Sparkles,
} from "lucide-react";
import { equipmentLabels, skills } from "@/data/skills";
import { getSkillState, hasEquipment } from "@/lib/progression";
import { Recommendations } from "@/components/Recommendations";
import type { Equipment, UserProfile } from "@/types/skill";

const equipmentInfo = {
  floor: {
    Icon: Layers,
    description:
      "Your starting point. Push, balance, and build your core anywhere.",
  },
  "pull-up-bar": {
    Icon: Minus,
    description:
      "Hangs, pull-ups, front levers, and your path to the muscle-up.",
  },
  parallettes: {
    Icon: RectangleHorizontal,
    description:
      "Stable hand supports for L-sits, V-sits, and compression work.",
  },
  "dip-bars": {
    Icon: RectangleHorizontal,
    description:
      "Parallel bars for support holds and vertical pushing strength.",
  },
  rings: {
    Icon: Circle,
    description:
      "Adjustable rings for rows, levers, support holds, and advanced strength skills.",
  },
  gym: {
    Icon: Dumbbell,
    description:
      "A secure bench plus access to pull-up bars, dip bars, and parallettes.",
  },
};

export function EquipmentSelector({
  profile,
  onToggle,
  onSelect,
  hydrated,
}: {
  profile: UserProfile;
  onToggle: (item: Equipment) => void;
  onSelect: (id: string) => void;
  hydrated: boolean;
}) {
  const compatible = skills.filter((skill) =>
    hasEquipment(skill, profile.equipment),
  ).length;
  const trainable = skills.filter(
    (skill) =>
      ["training", "available"].includes(
        getSkillState(skill, profile.progress),
      ) && hasEquipment(skill, profile.equipment),
  ).length;
  return (
    <>
      <div className="equipment-intro surface-panel">
        <span className="equipment-intro-icon">
          <Sparkles size={25} />
        </span>
        <div>
          <h2>Make the most of what you have.</h2>
          <p>
            Your setup supports{" "}
            <strong>
              {compatible} of {skills.length} skills
            </strong>
            , with <strong>{trainable} ready to train</strong>. Select your
            equipment to tailor recommendations.
          </p>
        </div>
      </div>
      <div className="equipment-grid">
        {(Object.keys(equipmentLabels) as Equipment[]).map((item) => {
          const { Icon, description } = equipmentInfo[item],
            selected = profile.equipment.includes(item);
          return (
            <button
              key={item}
              className={`equipment-card ${selected ? "selected" : ""}`}
              onClick={() => onToggle(item)}
              disabled={!hydrated || item === "floor"}
              aria-pressed={selected}
            >
              <span className="equipment-card-top">
                <span className="equipment-icon">
                  <Icon size={26} strokeWidth={1.5} />
                </span>
                <span className="equipment-check">
                  {selected && <Check size={15} />}
                </span>
              </span>
              <h3>{equipmentLabels[item]}</h3>
              <p>{description}</p>
              <span className="equipment-status">
                {item === "floor"
                  ? "Always available"
                  : selected
                    ? "In your setup"
                    : "Add to your setup"}
              </span>
            </button>
          );
        })}
      </div>
      <div className="equipment-note">
        <Dumbbell size={16} />
        <p>
          Equipment changes update recommendations immediately. Missing
          equipment is marked on the tree and in skill details; it never erases
          skills you’ve already mastered.
        </p>
      </div>
      <Recommendations
        profile={profile}
        onSelect={onSelect}
        onEquipment={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      />
    </>
  );
}
