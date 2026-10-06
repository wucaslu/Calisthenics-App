"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  ControlButton,
  getViewportForBounds,
  ReactFlow,
  ReactFlowProvider,
  useNodesInitialized,
  useReactFlow,
  useStore,
  type Edge,
  type Node,
  type NodeProps,
  type NodeChange,
} from "@xyflow/react";
import { ArrowUpRight, Move, Scan, Target } from "lucide-react";
import "@xyflow/react/dist/style.css";
import {
  SkillNode,
  type SkillGraphNode,
} from "@/components/SkillNode/SkillNode";
import {
  EmptyState,
  Difficulty,
  MovementBadge,
  SkillIcon,
  StateBadge,
} from "@/components/ui";
import {
  branchLabels,
  branches,
  categories,
  categoryLabels,
  skillById,
  skills,
} from "@/data/skills";
import {
  getAncestors,
  getGoalPath,
  getVisibleSkills,
  getProgressionLanes,
  layoutSkills,
} from "@/lib/graph";
import { getSkillState, missingEquipment } from "@/lib/progression";
import type { Branch, Category, UserProfile } from "@/types/skill";

type GroupGraphNode = Node<
  { category: Category; count: number; branch?: Branch },
  "category"
>;
function GroupNode({ data }: NodeProps<GroupGraphNode>) {
  if (data.branch)
    return (
      <div className="graph-lane">
        <strong>{branchLabels[data.branch]}</strong>
        <span>{data.count}</span>
      </div>
    );
  return (
    <div className={`graph-group group-${data.category}`}>
      <SkillIcon category={data.category} size={19} />
      <strong>{categoryLabels[data.category]}</strong>
      <span>
        {data.count} {data.count === 1 ? "skill" : "skills"}
      </span>
    </div>
  );
}
const nodeTypes = { skill: SkillNode, category: GroupNode };

function useFitCanvas() {
  const { getNodesBounds, setViewport } = useReactFlow<
    SkillGraphNode | GroupGraphNode
  >();
  const width = useStore((state) => state.width);
  const height = useStore((state) => state.height);
  return useCallback(
    (nodes: (SkillGraphNode | GroupGraphNode)[]) => {
      if (!nodes.length || !width || !height) return;
      const viewport = getViewportForBounds(
        getNodesBounds(nodes),
        width,
        height,
        0.06,
        1,
        0.2,
      );
      return setViewport(viewport, {
        duration: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? 0
          : 250,
      });
    },
    [getNodesBounds, setViewport, width, height],
  );
}

function CanvasControls() {
  const { getNodes } = useReactFlow<SkillGraphNode | GroupGraphNode>();
  const fit = useFitCanvas();
  return (
    <Controls showInteractive={false} showFitView={false}>
      <ControlButton
        aria-label="Fit View"
        title="Fit View"
        onClick={() => void fit(getNodes())}
      >
        <Scan size={14} />
      </ControlButton>
    </Controls>
  );
}
interface Props {
  profile: UserProfile;
  branch: Branch | "all";
  setBranch: (value: Branch | "all") => void;
  group: Category | "all";
  setGroup: (value: Category | "all") => void;
  query: string;
  selectedId: string | null;
  onSelect: (id: string) => void;
  highlightPath: boolean;
  setHighlightPath: (value: boolean) => void;
}

function FitTree({
  viewKey,
  focusGoalPath,
}: {
  viewKey: string;
  focusGoalPath: boolean;
}) {
  const { getNodes, viewportInitialized } = useReactFlow<
    SkillGraphNode | GroupGraphNode
  >();
  const fit = useFitCanvas();
  const initialized = useNodesInitialized();
  useEffect(() => {
    if (!initialized || !viewportInitialized) return;
    const id = requestAnimationFrame(() => {
      const current = getNodes();
      const pathNodes = current.filter(
        (node): node is SkillGraphNode =>
          node.type === "skill" && node.data.onPath,
      );
      const focusIds = new Set(
        pathNodes.flatMap((node) => [
          node.id,
          ...getAncestors(node.id).filter(
            (id) => skillById[id].category === node.data.skill.category,
          ),
        ]),
      );
      const focusGroups = new Set(
        pathNodes.map((node) => node.data.skill.category),
      );
      const focused = current.filter((node) =>
        node.type === "category"
          ? node.data.branch
            ? current.some(
                (item) =>
                  item.type === "skill" &&
                  focusIds.has(item.id) &&
                  item.data.skill.category === node.data.category &&
                  item.data.skill.branch === node.data.branch,
              )
            : focusGroups.has(node.data.category)
          : focusIds.has(node.id),
      );
      void fit(focusGoalPath && pathNodes.length ? focused : current);
    });
    return () => cancelAnimationFrame(id);
  }, [viewKey, focusGoalPath, initialized, viewportInitialized, fit, getNodes]);
  return null;
}

export function SkillTree(props: Props) {
  const [dimensions, setDimensions] = useState<
    Record<string, { width: number; height: number }>
  >({});
  // Keep React Flow's measured dimensions in our controlled node data.
  // This also lets its initialization hook and viewport fitting settle correctly.
  const onNodesChange = useCallback(
    (changes: NodeChange<SkillGraphNode | GroupGraphNode>[]) => {
      setDimensions((previous) => {
        let next = previous;
        for (const change of changes) {
          if (change.type !== "dimensions" || !change.dimensions) continue;
          const current = next[change.id];
          if (
            current?.width === change.dimensions.width &&
            current?.height === change.dimensions.height
          )
            continue;
          next = { ...next, [change.id]: change.dimensions };
        }
        return next;
      });
    },
    [],
  );
  const { profile, branch, group, query, selectedId, onSelect, highlightPath } =
    props;
  const visible = useMemo(
    () => getVisibleSkills(group, query, branch),
    [group, branch, query],
  );
  const lanes = useMemo(() => getProgressionLanes(visible), [visible]);
  const { nodes, edges } = useMemo(() => {
    const positions = layoutSkills(visible);
    const goalIds = new Set(profile.goals);
    const pathIds = new Set(
      profile.goals.flatMap((id) =>
        getGoalPath(id, profile.progress).map((skill) => skill.id),
      ),
    );
    const ids = new Set(visible.map((skill) => skill.id));
    const nodes: (SkillGraphNode | GroupGraphNode)[] = visible.map((skill) => ({
      id: skill.id,
      measured: dimensions[skill.id],
      type: "skill",
      // Custom buttons must accept clicks even when graph selection is disabled.
      style: { pointerEvents: "auto" },
      position: positions.get(skill.id)!,
      data: {
        skill,
        state: getSkillState(skill, profile.progress),
        chosen: selectedId === skill.id,
        onPath: highlightPath && pathIds.has(skill.id),
        isGoal: goalIds.has(skill.id),
        missingEquipment: missingEquipment(skill, profile.equipment).length > 0,
        onSelect,
      },
    }));
    for (const category of categories) {
      const items = visible.filter((skill) => skill.category === category);
      if (items.length)
        nodes.push({
          id: `group-${category}`,
          measured: dimensions[`group-${category}`],
          type: "category",
          data: { category, count: items.length },
          position: {
            x: Math.min(...items.map((skill) => positions.get(skill.id)!.x)),
            y:
              Math.min(...items.map((skill) => positions.get(skill.id)!.y)) -
              110,
          },
        });
    }
    for (const lane of lanes) {
      const id = `lane-${lane.category}-${lane.branch}`;
      nodes.push({
        id,
        measured: dimensions[id],
        type: "category",
        data: {
          category: lane.category,
          branch: lane.branch,
          count: lane.items.length,
        },
        position: lane.position,
      });
    }
    const edges: Edge[] = visible.flatMap((skill) =>
      skill.prerequisites
        .filter((id) => ids.has(id))
        .map((id) => {
          const highlighted =
            highlightPath &&
            pathIds.has(skill.id) &&
            (pathIds.has(id) || profile.progress[id] === "mastered");
          return {
            id: `${id}-${skill.id}`,
            source: id,
            target: skill.id,
            type: "smoothstep",
            style: {
              stroke: highlighted
                ? "var(--tree-path)"
                : profile.progress[id] === "mastered"
                  ? "var(--tree-edge-mastered)"
                  : "var(--tree-edge-locked)",
              strokeWidth: highlighted ? 1.8 : 1.3,
            },
            animated: highlighted && profile.progress[id] === "training",
          };
        }),
    );
    return { nodes, edges };
  }, [
    visible,
    lanes,
    profile,
    selectedId,
    onSelect,
    highlightPath,
    dimensions,
  ]);

  return (
    <section className="tree-card" aria-label="Interactive skill tree">
      <div className="tree-toolbar">
        <div className="tree-heading">
          <span className="live-dot" />
          <h2>Your skill tree</h2>
          <span className="count-pill">{visible.length} skills</span>
        </div>
        <div className="tree-filter-controls">
          <label className="branch-select">
            <span className="sr-only">Skill group</span>
            <select
              value={group}
              onChange={(event) =>
                props.setGroup(event.target.value as Category | "all")
              }
            >
              <option value="all">All groups</option>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {categoryLabels[item]}
                </option>
              ))}
            </select>
          </label>
          <label className="branch-select">
            <span className="sr-only">Skill branch</span>
            <select
              value={branch}
              onChange={(event) =>
                props.setBranch(event.target.value as Branch | "all")
              }
            >
              <option value="all">All progressions</option>
              {branches
                .filter(
                  (item) =>
                    group === "all" ||
                    skills.some(
                      (skill) =>
                        skill.branch === item && skill.category === group,
                    ),
                )
                .map((item) => (
                  <option key={item} value={item}>
                    {branchLabels[item]}
                  </option>
                ))}
            </select>
          </label>
        </div>
      </div>
      <div className="tree-subtoolbar">
        <div className="tree-legend">
          {(["mastered", "training", "available", "locked"] as const).map(
            (state) => (
              <StateBadge key={state} state={state} />
            ),
          )}
        </div>
        <button
          className={`path-toggle ${highlightPath ? "active" : ""}`}
          aria-pressed={highlightPath}
          onClick={() => props.setHighlightPath(!highlightPath)}
        >
          <Target size={13} />
          Goal paths
        </button>
      </div>
      {visible.length ? (
        <>
          <div className="tree-canvas">
            <ReactFlowProvider>
              <ReactFlow<SkillGraphNode | GroupGraphNode>
                nodes={nodes}
                onNodesChange={onNodesChange}
                edges={edges}
                nodeTypes={nodeTypes}
                nodesDraggable={false}
                nodesConnectable={false}
                nodesFocusable={false}
                edgesFocusable={false}
                elementsSelectable={false}
                minZoom={0.06}
                maxZoom={1.8}
                colorMode="dark"
                aria-label="Pannable calisthenics dependency graph"
              >
                <Background
                  variant={BackgroundVariant.Dots}
                  gap={20}
                  size={1}
                  color="var(--tree-grid)"
                />
                <CanvasControls />
                <FitTree
                  viewKey={`${group}:${branch}:${query}`}
                  focusGoalPath={
                    group !== "all" &&
                    (branch === "all" ||
                      profile.goals.some(
                        (id) => skillById[id]?.branch === branch,
                      ))
                  }
                />
              </ReactFlow>
            </ReactFlowProvider>
            <div className="canvas-note">
              <Move size={12} />
              Drag to explore<span>·</span>Scroll to zoom
            </div>
            <span className="canvas-branch-label">
              {group === "all"
                ? "PULL · PUSH · LEGS · CORE"
                : `${categoryLabels[group].toUpperCase()}${branch !== "all" ? ` / ${branchLabels[branch].toUpperCase()}` : ""} + PREREQUISITES`}
            </span>
          </div>
          <div className="mobile-skill-list">
            <p className="mobile-tree-note">
              Choose a skill to explore its prerequisites and progressions.
            </p>
            {lanes.map((lane) => (
              <section
                className="mobile-progression"
                key={`${lane.category}-${lane.branch}`}
              >
                <h3>
                  {categoryLabels[lane.category]}{" "}
                  <span>/ {branchLabels[lane.branch]}</span>
                </h3>
                {lane.items.map((skill) => (
                  <button
                    key={skill.id}
                    onClick={() => onSelect(skill.id)}
                    className={`mobile-skill ${selectedId === skill.id ? "chosen" : ""}`}
                  >
                    <span className="skill-symbol">
                      <SkillIcon category={skill.category} />
                    </span>
                    <span>
                      <strong>{skill.name}</strong>
                      <span className="mobile-skill-meta">
                        <StateBadge
                          state={getSkillState(skill, profile.progress)}
                        />
                        <MovementBadge type={skill.movementType} />
                        <Difficulty level={skill.difficulty} text />
                        {missingEquipment(skill, profile.equipment).length >
                          0 && <small>Equipment needed</small>}
                      </span>
                    </span>
                    <ArrowUpRight size={17} />
                  </button>
                ))}
              </section>
            ))}
          </div>
        </>
      ) : (
        <EmptyState title="No skills found">
          Try another name or choose a different branch.
        </EmptyState>
      )}
      <div className="tree-footer">
        <span>
          <Target size={13} />A little stronger. One skill at a time.
        </span>
        <span>All prerequisites must be mastered to unlock a skill.</span>
      </div>
    </section>
  );
}
