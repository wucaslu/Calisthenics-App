import { describe, expect, it } from "vitest";
import { skillById } from "@/data/skills";
import { og2Levels } from "@/data/overcomingGravity";
import { getGoalPath } from "@/lib/graph";
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
});
