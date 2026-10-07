import { describe, expect, it } from "vitest";
import { branches, categories, skillById, skills } from "@/data/skills";
import { getVisibleSkills } from "@/lib/graph";
import { MAX_DIFFICULTY } from "@/lib/difficulty";
import { createDemoProfile } from "@/lib/profile";
import { getSkillState, updateSkillProgress } from "@/lib/progression";
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

describe("available skill filter", () => {
  it("shows available, mastered, and training skills while excluding locked skills without changing progress", () => {
    const profile = createDemoProfile();
    const before = JSON.stringify(profile);
    const visible = getVisibleSkills("all", "", "all", 17, profile.progress);
    const ids = visible.map((skill) => skill.id);
    expect(ids).toContain("chin-up");
    expect(ids).toContain("push-up");
    expect(ids).toContain("planche-lean");
    expect(ids).not.toContain("tuck-planche");
    expect(
      visible.every(
        (skill) => getSkillState(skill, profile.progress) !== "locked",
      ),
    ).toBe(true);
    expect(JSON.stringify(profile)).toBe(before);
  });

  it("composes with group, branch, level, and search without leaking hidden matches or ancestors", () => {
    const { progress } = createDemoProfile();
    expect(
      getVisibleSkills("push", "Full Planche", "planche", 17, progress),
    ).toEqual([]);
    expect(
      getVisibleSkills("all", "Push-up", "all", 17, progress).map(
        (skill) => skill.id,
      ),
    ).toContain("push-up");
    const visible = getVisibleSkills(
      "legs",
      "Squat",
      "pistol-squat",
      3,
      progress,
    );
    expect(visible.map((skill) => skill.id)).toEqual(["bodyweight-squat"]);
    expect(getVisibleSkills("all", "", "all", 17)).toEqual(skills);
  });

  it("recomputes readiness from complete alternative routes", () => {
    const { progress } = createDemoProfile();
    delete progress["tuck-front-lever"];
    delete progress["pull-up"];
    expect(
      getVisibleSkills("all", "", "all", 17, progress).map((skill) => skill.id),
    ).not.toContain("tuck-front-lever");
    progress["chin-up"] = "mastered";
    expect(
      getVisibleSkills("all", "", "all", 17, progress).map((skill) => skill.id),
    ).toContain("tuck-front-lever");
  });

  it("keeps a skill through training and mastery, then hides descendants whose prerequisite route is reset", () => {
    let progress = createDemoProfile().progress;
    const visibleIds = () =>
      getVisibleSkills("legs", "", "all", 17, progress).map(
        (skill) => skill.id,
      );
    expect(visibleIds()).toContain("bodyweight-squat");
    expect(visibleIds()).not.toContain("split-squat");
    progress = updateSkillProgress(progress, "bodyweight-squat", "training");
    expect(visibleIds()).toContain("bodyweight-squat");
    progress = updateSkillProgress(progress, "bodyweight-squat", "mastered");
    expect(visibleIds()).toEqual(
      expect.arrayContaining(["bodyweight-squat", "split-squat"]),
    );
    progress = updateSkillProgress(progress, "split-squat", "training");
    expect(visibleIds()).toContain("split-squat");
    progress = updateSkillProgress(progress, "bodyweight-squat", "reset");
    expect(visibleIds()).toContain("bodyweight-squat");
    expect(visibleIds()).not.toContain("split-squat");
    expect(progress["split-squat"]).toBeUndefined();
  });
});
