import { describe, expect, it } from "vitest";
import { branches, categories, skillById, skills } from "@/data/skills";
import { getVisibleSkills } from "@/lib/graph";
import { MAX_DIFFICULTY } from "@/lib/difficulty";
import type { DifficultyLevel } from "@/types/skill";

describe("skill tree maximum level", () => {
  it("shows the complete catalog by default and at the workbook's level 17 ceiling", () => {
    expect(getVisibleSkills("all")).toEqual(skills);
    expect(getVisibleSkills("all", "", "all", MAX_DIFFICULTY)).toEqual(skills);
    expect(skills).toHaveLength(139);
  });

  it("enforces an inclusive ceiling for every group and branch, including cross-group prerequisites", () => {
    for (const maximum of [1, 3, 6, 9, 13, 16, 17] as DifficultyLevel[]) {
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

  it("shows level 17 only when the extended ceiling permits it", () => {
    expect(
      getVisibleSkills("all", "", "all", 16).map((skill) => skill.id),
    ).not.toContain("maltese");
    expect(
      getVisibleSkills("all", "", "all", 17).map((skill) => skill.id),
    ).toContain("maltese");
    expect(getVisibleSkills("push", "Full Planche", "planche", 10)).toEqual([]);
    expect(
      getVisibleSkills("push", "Full Planche", "planche", 11).map(
        (skill) => skill.id,
      ),
    ).toContain("full-planche");
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
    expect(visible.map((skill) => skill.id).sort()).toEqual([
      "hollow-body-hold",
      "push-up",
      "scapular-push-up",
    ]);
    expect(visible.every((skill) => skill.branch === "fundamentals")).toBe(
      true,
    );
  });

  it("does not leak ancestors through a search for a hidden skill", () => {
    expect(getVisibleSkills("push", "Full Planche", "planche", 3)).toEqual([]);
    const visible = getVisibleSkills("push", "Full Planche", "planche", 11);
    expect(visible.map((skill) => skill.id)).toContain("full-planche");
    expect(visible.map((skill) => skill.id)).toContain("scapular-push-up");
    expect(visible.every((skill) => skill.difficulty <= 11)).toBe(true);
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
    expect(getVisibleSkills("all", "", "all", MAX_DIFFICULTY)).toEqual(skills);
  });
});
