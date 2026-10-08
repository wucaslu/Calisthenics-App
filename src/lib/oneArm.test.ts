import { describe, expect, it } from "vitest";
import { og2Levels } from "@/data/overcomingGravity";
import { skills, skillById } from "@/data/skills";
import { getGoalPath } from "@/lib/graph";
import {
  getSkillState,
  hasEquipment,
  updateSkillProgress,
} from "@/lib/progression";
import { createDemoProfile, parseProfile } from "@/lib/profile";
import { createProfileBackup, readProfileBackup } from "@/lib/profileBackup";

const milestones = [
  ["one-arm-one-leg-plank", 4, "AU8", "book"],
  ["elevated-one-arm-push-up", 5, "AJ9", "book"],
  ["ring-straddle-one-arm-push-up", 7, "AJ11", "book"],
  ["bent-body-one-arm-dip", 7, "AK11", "book"],
  ["straddle-one-arm-elbow-lever", 7, "AS11", "book"],
  ["one-arm-elbow-lever", 8, "AS12", "book"],
  ["one-arm-back-lever", 8, "BL12", "community"],
  ["ring-one-arm-push-up", 9, "AJ13", "book"],
  ["straight-body-one-arm-dip", 9, "AK13", "book"],
  ["one-arm-straight-muscle-up", 9, "AR13", "book"],
  ["one-arm-handstand", 10, "E14", "book"],
  ["one-arm-ab-wheel", 10, "AU14", "book"],
  ["one-arm-front-lever", 12, "BL16", "community"],
  ["one-arm-dragon-press", 13, "BL17", "community"],
  ["one-arm-planche", 16, "BL20", "community"],
] as const;

describe("one-arm workbook milestones", () => {
  it("uses all fifteen exact cells and preserves the book/community distinction", () => {
    for (const [id, level, cell, kind] of milestones) {
      expect(og2Levels[id]).toMatchObject({ level, cell, kind });
      expect(skillById[id].difficulty).toBe(level);
      expect(skillById[id].levelSource).toBe(kind);
      expect(skillById[id].referenceLevel).toContain(cell);
    }
    expect(og2Levels["full-ab-wheel"]).toMatchObject({
      level: 8,
      cell: "AU12",
      kind: "book",
    });
    expect(og2Levels["dragon-press"]).toMatchObject({
      level: 10,
      cell: "BJ14",
      kind: "community",
    });
    expect(skills.some((skill) => /wall|weighted/i.test(skill.name))).toBe(
      false,
    );
  });

  it("makes every new milestone reachable through complete preparation routes", () => {
    for (const [id] of milestones) {
      let progress = {};
      for (const step of getGoalPath(id, progress)) {
        expect(getSkillState(step, progress), `${id}: ${step.id}`).toBe(
          "available",
        );
        progress = updateSkillProgress(progress, step.id, "mastered");
      }
      expect(getSkillState(skillById[id], progress)).toBe("mastered");
      const reset = updateSkillProgress(
        progress,
        skillById[id].prerequisites[0],
        "reset",
      );
      expect(getSkillState(skillById[id], reset)).toBe("locked");
      expect(reset[id]).toBeUndefined();
    }
  });

  it("requires the real apparatus and preserves movement and support differences", () => {
    for (const id of ["full-ab-wheel", "one-arm-ab-wheel"]) {
      expect(hasEquipment(skillById[id], ["floor", "gym"])).toBe(false);
      expect(hasEquipment(skillById[id], ["floor", "ab-wheel"])).toBe(true);
    }
    for (const id of [
      "ring-straddle-one-arm-push-up",
      "ring-one-arm-push-up",
      "one-arm-straight-muscle-up",
    ]) {
      expect(hasEquipment(skillById[id], ["floor", "gym"])).toBe(false);
      expect(hasEquipment(skillById[id], ["rings"])).toBe(true);
    }
    expect(skillById["one-arm-one-leg-plank"].movementType).toBe("static");
    expect(skillById["one-arm-ab-wheel"].movementType).toBe("dynamic");
    expect(skillById["one-arm-dragon-press"].equipment).toEqual(["floor"]);
    expect(skillById["dragon-flag"].equipment).toEqual(["gym"]);
    expect(skillById["one-arm-straight-muscle-up"].description).toMatch(
      /both.*(?:grips|rings|hands)|(?:grips|rings|hands).*both/i,
    );
  });

  it("round-trips new equipment and skill records without altering existing profile data", () => {
    const profile = createDemoProfile();
    profile.equipment.push("ab-wheel");
    profile.personalRecords["one-arm-handstand"] = "3 seconds";
    profile.personalRecords["push-up"] = "15 reps";
    expect(parseProfile(JSON.stringify(profile))).toEqual(profile);
    expect(readProfileBackup(createProfileBackup(profile))).toEqual(profile);
  });
});
