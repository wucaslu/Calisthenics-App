import { branches, categories, skillById, skills } from "@/data/skills";
import {
  getPrerequisiteIds,
  getPrerequisiteRoutes,
} from "@/data/trainingOptions";
import { hasEquipment } from "@/lib/progression";
import type {
  Branch,
  Category,
  Equipment,
  PrerequisiteRoute,
  Progress,
  Skill,
} from "@/types/skill";

interface RoutePlan {
  ids: string[];
  visited: Set<string>;
  routeIds: Record<string, string>;
}

/** Choose complete AND routes across the dependency graph, with OR between routes.
 * Shared skills are assigned one route and counted once; mastered subtrees are
 * omitted. When equipment is provided, fewer unavailable steps takes priority,
 * then fewer remaining skills. Standard routes win equal-score ties.
 */
export function getGoalPlan(
  goalId: string,
  progress: Progress,
  equipment?: Equipment[],
): { skills: Skill[]; routeIds: Record<string, string> } {
  const expand = (id: string, plan: RoutePlan): RoutePlan[] => {
    const skill = skillById[id];
    if (!skill || progress[id] === "mastered" || plan.visited.has(id))
      return [plan];
    return getPrerequisiteRoutes(skill).flatMap((route) => {
      const visited = new Set(plan.visited);
      visited.add(id);
      let candidates: RoutePlan[] = [
        {
          ids: [...plan.ids],
          visited,
          routeIds: { ...plan.routeIds, [id]: route.id },
        },
      ];
      for (const parent of route.prerequisites)
        candidates = candidates.flatMap((candidate) =>
          expand(parent, candidate),
        );
      return candidates.map((candidate) => ({
        ...candidate,
        ids: [...candidate.ids, id],
      }));
    });
  };
  const candidates = expand(goalId, {
    ids: [],
    visited: new Set(),
    routeIds: {},
  });
  const unavailableCount = (plan: RoutePlan) =>
    equipment
      ? plan.ids.filter((id) => !hasEquipment(skillById[id], equipment)).length
      : 0;
  const best = candidates.reduce((chosen, candidate) => {
    const difference = unavailableCount(candidate) - unavailableCount(chosen);
    return difference < 0 ||
      (difference === 0 && candidate.ids.length < chosen.ids.length)
      ? candidate
      : chosen;
  });
  return {
    skills: best.ids.map((id) => skillById[id]),
    routeIds: best.routeIds,
  };
}

export function getGoalPath(
  goalId: string,
  progress: Progress,
  equipment?: Equipment[],
): Skill[] {
  return getGoalPlan(goalId, progress, equipment).skills;
}

export function getPreferredPrerequisiteRoute(
  skill: Skill,
  progress: Progress,
  equipment?: Equipment[],
): PrerequisiteRoute {
  const withoutTarget = { ...progress };
  delete withoutTarget[skill.id];
  const plan = getGoalPlan(skill.id, withoutTarget, equipment);
  const routes = getPrerequisiteRoutes(skill);
  return (
    routes.find((route) => route.id === plan.routeIds[skill.id]) ?? routes[0]
  );
}

export function getAncestors(id: string): string[] {
  const result: string[] = [];
  const visited = new Set<string>();
  const visit = (current: string) => {
    if (visited.has(current)) return;
    visited.add(current);
    const skill = skillById[current];
    if (!skill) return;
    getPrerequisiteIds(skill).forEach(visit);
    if (current !== id) result.push(current);
  };
  visit(id);
  return result;
}

export function getVisibleSkills(
  group: Category | "all",
  query = "",
  branch: Branch | "all" = "all",
): Skill[] {
  const chosen = skills.filter(
    (skill) =>
      (group === "all" || skill.category === group) &&
      (branch === "all" || skill.branch === branch),
  );
  const ids = new Set(
    chosen.flatMap((skill) => [skill.id, ...getAncestors(skill.id)]),
  );
  const scoped = skills.filter((skill) => ids.has(skill.id));
  if (!query.trim()) return scoped;
  const matches = scoped.filter((skill) =>
    skill.name.toLowerCase().includes(query.trim().toLowerCase()),
  );
  const matchIds = new Set(
    matches.flatMap((skill) => [skill.id, ...getAncestors(skill.id)]),
  );
  return scoped.filter((skill) => matchIds.has(skill.id));
}

export function layoutSkills(
  visible: Skill[],
): Map<string, { x: number; y: number }> {
  const levels = new Map<string, number>();
  const level = (id: string): number => {
    if (levels.has(id)) return levels.get(id)!;
    const parents = getPrerequisiteIds(skillById[id]);
    const depth = parents.length ? Math.max(...parents.map(level)) + 1 : 0;
    levels.set(id, depth);
    return depth;
  };
  visible.forEach((skill) => level(skill.id));
  const positions = new Map<string, { x: number; y: number }>();
  const activeGroups = categories.filter((category) =>
    visible.some((skill) => skill.category === category),
  );
  let offset = 0;
  for (const category of activeGroups) {
    // Each progression owns a lane. A new skill cannot shuffle unrelated
    // branches across columns; shared foundations connect across lanes.
    for (const branch of branches) {
      const items = visible.filter(
        (skill) => skill.category === category && skill.branch === branch,
      );
      if (!items.length) continue;
      const occupied = new Map<number, number>();
      let width = 1;
      const ordered = [...items].sort(
        (a, b) =>
          levels.get(a.id)! - levels.get(b.id)! ||
          a.difficulty - b.difficulty ||
          a.name.localeCompare(b.name),
      );
      for (const skill of ordered) {
        const depth = levels.get(skill.id)!;
        const column = occupied.get(depth) ?? 0;
        width = Math.max(width, column + 1);
        occupied.set(depth, column + 1);
        positions.set(skill.id, { x: (offset + column) * 236, y: depth * 150 });
      }
      offset += width;
    }
    // Leave a little extra space between the four primary groups.
    offset += 0.3;
  }
  return positions;
}

export function getProgressionLanes(visible: Skill[]) {
  const positions = layoutSkills(visible);
  return categories.flatMap((category) =>
    branches.flatMap((branch) => {
      const items = visible
        .filter(
          (skill) => skill.category === category && skill.branch === branch,
        )
        .sort(
          (a, b) =>
            positions.get(a.id)!.y - positions.get(b.id)!.y ||
            a.name.localeCompare(b.name),
        );
      return items.length
        ? [
            {
              category,
              branch,
              items,
              position: {
                x: Math.min(
                  ...items.map((skill) => positions.get(skill.id)!.x),
                ),
                y:
                  Math.min(
                    ...items.map((skill) => positions.get(skill.id)!.y),
                  ) - 55,
              },
            },
          ]
        : [];
    }),
  );
}
