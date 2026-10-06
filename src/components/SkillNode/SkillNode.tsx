"use client";

import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import { Dumbbell, Target } from "lucide-react";
import { Difficulty, SkillIcon, StateIcon, stateLabels } from "@/components/ui";
import type { Skill, SkillState } from "@/types/skill";

export type SkillGraphNode = Node<
  {
    skill: Skill;
    state: SkillState;
    onPath: boolean;
    isGoal: boolean;
    missingEquipment: boolean;
    chosen: boolean;
    onSelect: (id: string) => void;
  },
  "skill"
>;

export function SkillNode({ data }: NodeProps<SkillGraphNode>) {
  const { skill, state } = data;
  return (
    <>
      <Handle type="target" position={Position.Top} />
      <button
        className={`skill-node node-${state} ${data.chosen ? "node-selected" : ""} ${data.onPath ? "node-on-path" : ""}`}
        onClick={() => data.onSelect(skill.id)}
        aria-label={`${skill.name}, ${stateLabels[state]}${data.missingEquipment ? ", equipment needed" : ""}`}
        aria-pressed={data.chosen}
      >
        <span className="node-top">
          <span className="node-category-icon">
            <SkillIcon category={skill.category} size={20} />
          </span>
          <span className={`node-state state-${state}`}>
            <StateIcon state={state} />
            {stateLabels[state]}
          </span>
          {data.isGoal && (
            <Target size={15} className="node-goal" aria-label="Your goal" />
          )}
        </span>
        <span className="node-name">{skill.name}</span>
        <span className="node-bottom">
          <Difficulty level={skill.difficulty} />
          {data.missingEquipment && (
            <span className="node-equipment">
              <Dumbbell size={11} /> Equipment needed
            </span>
          )}
        </span>
      </button>
      <Handle type="source" position={Position.Bottom} />
    </>
  );
}
