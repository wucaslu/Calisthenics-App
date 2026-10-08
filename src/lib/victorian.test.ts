import { describe, expect, it } from "vitest";
import { skillById } from "@/data/skills";
import { og2Levels } from "@/data/overcomingGravity";
import { getGoalPath, getVisibleSkills } from "@/lib/graph";
import { createDemoProfile, parseProfile } from "@/lib/profile";
import { createProfileBackup, readProfileBackup } from "@/lib/profileBackup";
import {
  getSkillState,
  hasEquipment,
  updateSkillProgress,
} from "@/lib/progression";
import type { Progress } from "@/types/skill";

const chartMilestones = [
  ["protracted-victorian-on-bars", 9, "BJ13"],
  ["victorian-on-bars", 11, "BJ15"],
  ["wide-victorian-on-bars", 13, "BJ17"],
  ["floor-victorian-one-forearm", 14, "BJ18"],
  ["floor-victorian-forearms", 16, "BJ20"],
  ["floor-victorian-straight-arms", 17, "BJ21"],
] as const;

describe("Victorian and SAT preparation", () => {
  it("keeps exact community-chart variants separate from the estimated fixed-bar SAT", () => {
    for (const [id, level, cell] of chartMilestones) {
      expect(og2Levels[id]).toMatchObject({ level, cell, kind: "community" });
      expect(skillById[id].referenceLevel).toContain(cell);
      const floor = id.startsWith("floor-");
      if (floor) {
        expect(skillById[id].equipment).toEqual(["floor"]);
        expect(hasEquipment(skillById[id], [])).toBe(true);
      } else {
        expect(hasEquipment(skillById[id], ["dip-bars"])).toBe(true);
        expect(hasEquipment(skillById[id], ["floor", "rings"])).toBe(false);
      }
    }
    const sat = skillById["straight-arm-touch"];
    expect(sat.difficulty).toBe(16);
    expect(og2Levels[sat.id]).toBeUndefined();
    expect(hasEquipment(sat, ["pull-up-bar"])).toBe(true);
    expect(hasEquipment(sat, ["rings", "dip-bars"])).toBe(false);
    expect(sat.references).toContain("sat");
  });

  it("unlocks every requested variant along a complete route and relocks it after a prerequisite reset", () => {
    for (const id of [
      ...chartMilestones.map(([id]) => id),
      "wide-grip-front-lever",
      "straight-arm-touch",
    ]) {
      let progress: Progress = {};
      for (const step of getGoalPath(id, progress)) {
        expect(getSkillState(step, progress), `${id}: ${step.id}`).toBe(
          "available",
        );
        progress = updateSkillProgress(progress, step.id, "mastered");
      }
      expect(getSkillState(skillById[id], progress)).toBe("mastered");
      progress = updateSkillProgress(
        progress,
        skillById[id].prerequisites[0],
        "reset",
      );
      expect(getSkillState(skillById[id], progress)).toBe("locked");
      expect(progress[id]).toBeUndefined();
    }
  });

  it("prepares Dragon Press through Front Lever and preserves the independent forearm routes", () => {
    const dragonPath = getGoalPath("dragon-press", {}).map((skill) => skill.id);
    expect(dragonPath).toContain("full-front-lever");
    expect(dragonPath).not.toContain("back-lever");
    const forearmPath = getGoalPath("floor-victorian-forearms", {}).map(
      (skill) => skill.id,
    );
    expect(forearmPath).not.toContain("floor-victorian-one-forearm");
    expect(forearmPath).toContain("wide-victorian-on-bars");
  });

  it("plans SAT using only a bar and floor while keeping Victorian supports in their own lanes", () => {
    const satPath = getGoalPath("straight-arm-touch", {}, [
      "floor",
      "pull-up-bar",
    ]);
    const ids = satPath.map((skill) => skill.id);
    expect(ids).toContain("full-front-lever");
    expect(ids).toContain("wide-grip-front-lever");
    expect(
      satPath.every((skill) => hasEquipment(skill, ["floor", "pull-up-bar"])),
    ).toBe(true);
    expect(ids).not.toContain("wide-victorian-on-bars");
    expect(
      getVisibleSkills("pull", "", "front-lever").map((skill) => skill.id),
    ).toContain("straight-arm-touch");
    expect(
      getVisibleSkills("pull", "", "victorian").map((skill) => skill.id),
    ).not.toContain("straight-arm-touch");
    const coreSupports = getVisibleSkills("core", "", "victorian").map(
      (skill) => skill.id,
    );
    expect(coreSupports).toEqual(
      expect.arrayContaining(["dragon-press", "one-arm-dragon-press"]),
    );
    expect(coreSupports).not.toContain("dragon-flag");
  });

  it("preserves old SAT records and archives mastery without granting the new wide-grip milestone", () => {
    const profile = createDemoProfile();
    for (const skill of getGoalPath(
      "wide-victorian-on-bars",
      profile.progress,
    )) {
      profile.progress = updateSkillProgress(
        profile.progress,
        skill.id,
        "mastered",
      );
    }
    profile.progress["straight-arm-touch"] = "mastered";
    profile.personalRecords["straight-arm-touch"] = "2 seconds";
    profile.goals = ["straight-arm-touch"];
    const parsed = parseProfile(JSON.stringify(profile))!;
    expect(parsed.progress["wide-grip-front-lever"]).toBeUndefined();
    expect(parsed.progress["straight-arm-touch"]).toBeUndefined();
    expect(parsed.personalRecords["straight-arm-touch"]).toBe("2 seconds");
    expect(parsed.archivedSkills["straight-arm-touch"]).toMatchObject({
      progress: "mastered",
    });
    expect(parsed.goals).toEqual(["straight-arm-touch"]);
    expect(readProfileBackup(createProfileBackup(parsed))).toEqual(parsed);
  });
});
