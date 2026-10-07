import { describe, expect, it } from "vitest";
import { branches, categories, skillById, skills } from "@/data/skills";
import { getVisibleSkills } from "@/lib/graph";
import type { DifficultyLevel } from "@/types/skill";

describe("skill tree maximum level", () => {
  it("shows the unchanged complete catalog by default and at level 10", () => {
    expect(getVisibleSkills("all")).toEqual(skills);
    expect(getVisibleSkills("all", "", "all", 10)).toEqual(skills);
    expect(skills).toHaveLength(101);
  });

  it("enforces an inclusive ceiling for every group and branch, including cross-group prerequisites", () => {
    for (const maximum of [1, 3, 6, 9] as DifficultyLevel[]) {
      for (const group of ["all", ...categories] as const) {
        for (const branch of ["all", ...branches] as const) {
          const visible = getVisibleSkills(group, "", branch, maximum);
          expect(visible.every((skill) => skill.difficulty <= maximum)).toBe(
            true,
          );
        }
      }
    }
    expect(
      getVisibleSkills("push", "", "planche", 3).map((skill) => skill.id),
    ).toContain("planche-lean");
    expect(
      getVisibleSkills("push", "", "planche", 2).map((skill) => skill.id),
    ).not.toContain("planche-lean");
  });

  it("hides a higher-level alternative prerequisite without hiding its eligible target or foundations", () => {
    const ids = getVisibleSkills("legs", "", "pistol-squat", 3).map(
      (skill) => skill.id,
    );
    expect(ids).toEqual(
      expect.arrayContaining([
        "pistol-squat-negative",
        "deep-step-up",
        "split-squat",
        "bodyweight-squat",
      ]),
    );
    expect(ids).not.toContain("shrimp-squat");
    expect(
      getVisibleSkills("legs", "", "pistol-squat", 4).map((skill) => skill.id),
    ).toContain("shrimp-squat");
  });

  it("retains lower-level foundations when every skill in an advanced branch is hidden", () => {
    const visible = getVisibleSkills("push", "", "planche", 1);
    expect(visible.map((skill) => skill.id)).toEqual(["scapular-push-up"]);
    expect(visible[0].branch).toBe("fundamentals");
  });

  it("does not leak ancestors through a search for a hidden skill", () => {
    expect(getVisibleSkills("push", "Full Planche", "planche", 3)).toEqual([]);
    const visible = getVisibleSkills("push", "Full Planche", "planche", 9);
    expect(visible.map((skill) => skill.id)).toContain("full-planche");
    expect(visible.map((skill) => skill.id)).toContain("scapular-push-up");
    expect(visible.every((skill) => skill.difficulty <= 9)).toBe(true);
  });

  it("composes search and branch scope while preserving eligible prerequisites only", () => {
    expect(
      getVisibleSkills("legs", "  pistol squat negative  ", "pistol-squat", 3)
        .map((skill) => skill.id)
        .sort(),
    ).toEqual([
      "bodyweight-squat",
      "deep-step-up",
      "pistol-squat-negative",
      "split-squat",
    ]);
    expect(getVisibleSkills("pull", "Pistol Squat Negative", "all", 3)).toEqual(
      [],
    );
  });

  it("preserves catalog metadata and restores hidden nodes when the ceiling is raised", () => {
    const before = JSON.stringify(skills);
    const prerequisiteIds = [...skillById["full-planche"].prerequisites];
    const limited = getVisibleSkills("all", "", "all", 2);
    limited.pop();
    expect(JSON.stringify(skills)).toBe(before);
    expect(skillById["full-planche"].prerequisites).toEqual(prerequisiteIds);
    expect(getVisibleSkills("all", "", "all", 10)).toEqual(skills);
  });
});
