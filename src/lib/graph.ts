import { branches, categories, skillById, skills } from "@/data/skills";
import type { Branch, Category, Progress, Skill } from "@/types/skill";

/** Minimal outstanding dependency set, prerequisites before dependents.
 * Every prerequisite is required (AND). Shared dependencies occur once, and
 * mastered subtrees are omitted; there is no unnecessary single-chain detour.
 */
export function getGoalPath(goalId: string, progress: Progress): Skill[] {
  const result: Skill[] = [];
  const visited = new Set<string>();
  const visit = (id: string) => {
    if (visited.has(id) || progress[id] === "mastered") return;
    visited.add(id);
    const skill = skillById[id];
    if (!skill) return;
    skill.prerequisites.forEach(visit);
    result.push(skill);
  };
  visit(goalId);
  return result;
}

export function getAncestors(id: string): string[] {
  return getGoalPath(id, {})
    .map((skill) => skill.id)
    .filter((item) => item !== id);
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
    const parents = skillById[id].prerequisites;
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
