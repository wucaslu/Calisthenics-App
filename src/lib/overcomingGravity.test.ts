import { describe, expect, it } from "vitest";
import { og2Levels } from "@/data/overcomingGravity";
import { skillById, skills } from "@/data/skills";
import { getLevelSourceLabel } from "@/lib/difficulty";
import { getGoalPath } from "@/lib/graph";
import {
  getSkillState,
  hasEquipment,
  updateSkillProgress,
} from "@/lib/progression";

describe("uploaded Overcoming Gravity chart", () => {
  it("uses the workbook difficulty and source for every mapped skill without app overrides", () => {
    for (const [id, entry] of Object.entries(og2Levels)) {
      expect(skillById[id].difficulty, id).toBe(entry.level);
      expect(skillById[id].levelSource, id).toBe(entry.kind);
      expect(skillById[id].referenceLevel, id).toContain(entry.cell);
    }
    expect(og2Levels["inverted-row"]).toMatchObject({
      level: 2,
      cell: "U6",
      name: "Ring Rows",
      kind: "book",
    });
  });

  it("includes the complete workbook Pelican-to-Hefesto progression with distinct form and apparatus", () => {
    for (const [id, level, cell] of [
      ["incline-pelican-curl", 5, "BI9"],
      ["pelican-curl", 6, "BI10"],
      ["feet-elevated-pelican-curl", 7, "BI11"],
      ["hefesto-negative", 8, "BI12"],
      ["hefesto", 9, "BI13"],
      ["back-lever-hefesto", 10, "BI14"],
      ["archer-hefesto", 11, "BI15"],
      ["hand-on-wrist-hefesto", 12, "BI16"],
    ] as const) {
      expect(og2Levels[id]).toMatchObject({ level, cell, kind: "community" });
      expect(skillById[id].category).toBe("pull");
      expect(skillById[id].movementType).toBe("dynamic");
    }
    expect(skillById["feet-elevated-pelican-curl"].description).toContain(
      "feet stay supported",
    );
    expect(
      hasEquipment(skillById["feet-elevated-pelican-curl"], ["rings"]),
    ).toBe(false);
    expect(
      hasEquipment(skillById["feet-elevated-pelican-curl"], ["rings", "gym"]),
    ).toBe(true);
    expect(skillById["back-lever-hefesto"].description).toContain(
      "full horizontal back lever",
    );
    expect(skillById["archer-hefesto"].equipment).toEqual(["rings"]);
    expect(skillById["hand-on-wrist-hefesto"].equipment).toEqual([
      "pull-up-bar",
    ]);
    expect(skillById["hand-on-wrist-hefesto"].description).toContain(
      "other hand holds the working wrist",
    );
    expect(
      skillById["hefesto-negative"].alternativeRoutes?.[0].prerequisites,
    ).toEqual(["feet-elevated-pelican-curl", "straight-bar-dip"]);
    for (const id of ["feet-elevated-pelican-curl", "hand-on-wrist-hefesto"]) {
      let progress = {};
      for (const skill of getGoalPath(id, progress)) {
        expect(getSkillState(skill, progress)).toBe("available");
        progress = updateSkillProgress(progress, skill.id, "mastered");
      }
      expect(getSkillState(skillById[id], progress)).toBe("mastered");
    }
  });

  it("uses the book levels and cells for matched movements, including the explicit level 17 Maltese entry", () => {
    for (const [id, level, cell] of [
      ["diamond-push-up", 2, "AI6"],
      ["tuck-planche", 5, "AE9"],
      ["full-planche", 11, "AE15"],
      ["full-front-lever", 8, "S12"],
      ["back-lever", 7, "R11"],
      ["iron-cross", 10, "Z14"],
      ["maltese", 17, "AM20"],
      ["manna", 13, "M17"],
    ] as const) {
      expect(og2Levels[id]).toMatchObject({ level, cell, kind: "book" });
      expect(skillById[id].difficulty).toBe(level);
      expect(skillById[id].levelSource).toBe("book");
      expect(skillById[id].referenceLevel).toContain(cell);
    }
  });

  it("keeps ring planches distinct from the floor and parallel-bar chart", () => {
    for (const [floorId, ringId, floorLevel, ringLevel, ringCell] of [
      ["tuck-planche", "ring-tuck-planche", 5, 6, "AF10"],
      ["advanced-tuck-planche", "ring-advanced-tuck-planche", 6, 8, "AF12"],
      ["straddle-planche", "ring-straddle-planche", 8, 10, "AF14"],
      ["half-lay-planche", "ring-half-lay-planche", 9, 12, "AF16"],
      ["full-planche", "ring-full-planche", 11, 14, "AF18"],
    ] as const) {
      expect(skillById[floorId].difficulty).toBe(floorLevel);
      expect(skillById[ringId].difficulty).toBe(ringLevel);
      expect(og2Levels[ringId].cell).toBe(ringCell);
      expect(skillById[ringId].branch).toBe("ring-planche");
      expect(hasEquipment(skillById[ringId], ["rings"])).toBe(true);
      expect(hasEquipment(skillById[ringId], ["floor", "parallettes"])).toBe(
        false,
      );
    }
    const ringPath = getGoalPath("ring-full-planche", {}).map(
      (skill) => skill.id,
    );
    expect(ringPath).toContain("ring-half-lay-planche");
    expect(ringPath).toContain("full-planche");
    expect(skillById["ring-full-planche"].prerequisites).toEqual([
      "ring-half-lay-planche",
      "full-planche",
    ]);
  });

  it("uses half-lay options from mixed half-lay / one-leg rows while excluding one-leg and weighted milestones", () => {
    expect(og2Levels["half-lay-back-lever"]).toMatchObject({
      level: 6,
      cell: "R10",
    });
    expect(og2Levels["half-lay-front-lever"]).toMatchObject({
      level: 7,
      cell: "S11",
    });
    expect(og2Levels["half-lay-planche"]).toMatchObject({
      level: 9,
      cell: "AE13",
    });
    expect(
      skills.some((skill) =>
        /(?:one|single|1)[ -]leg|weighted|\+\s*\d+\s*(?:lbs?|kg)/i.test(
          `${skill.id} ${skill.name}`,
        ),
      ),
    ).toBe(false);
  });

  it("labels book, community additions, and app estimates without attributing custom skills to the book", () => {
    expect(skillById["dragon-flag"].difficulty).toBe(6);
    expect(skillById["dragon-flag"].levelSource).toBe("community");
    for (const id of [
      "90-degree-hold",
      "v-sit",
      "one-arm-pull-up",
      "muscle-up",
    ])
      expect(skillById[id].levelSource).toBeUndefined();
    expect(skillById.hefesto.difficulty).toBe(9);
    expect(skillById.hefesto.levelSource).toBe("community");
    expect(og2Levels.hefesto).toMatchObject({
      level: 9,
      kind: "community",
      cell: "BI13",
    });
    expect(skillById.hefesto.referenceLevel).toContain(
      "Community extension · Level 9 · BI13",
    );
    expect(getLevelSourceLabel("book")).toBe("OG2 book");
    expect(getLevelSourceLabel("community")).toBe("Community chart");
    expect(getLevelSourceLabel()).toBe("App estimate");
  });

  it("distinguishes supinated one-arm chin-ups and full-range handstand push-ups from their existing variants", () => {
    expect(og2Levels["one-arm-chin-up-negative"]).toMatchObject({
      level: 8,
      cell: "W12",
    });
    expect(og2Levels["one-arm-chin-up"]).toMatchObject({
      level: 9,
      cell: "W13",
    });
    expect(skillById["one-arm-pull-up"].difficulty).toBe(10);
    expect(skillById["one-arm-chin-up"].equipment).toEqual(["rings"]);
    expect(
      skillById["full-range-handstand-push-up"].difficulty,
    ).toBeGreaterThan(skillById["handstand-push-up"].difficulty);
    expect(hasEquipment(skillById["handstand-push-up"], ["floor"])).toBe(true);
    expect(
      hasEquipment(skillById["full-range-handstand-push-up"], ["floor"]),
    ).toBe(false);
    expect(
      hasEquipment(skillById["full-range-handstand-push-up"], ["parallettes"]),
    ).toBe(true);
  });

  it("makes the added chart endpoints reachable through complete unassisted routes", () => {
    for (const id of [
      "ring-full-planche",
      "manna",
      "one-arm-chin-up",
      "full-range-handstand-push-up",
      "dragon-flag",
    ]) {
      let progress = {};
      for (const skill of getGoalPath(id, progress)) {
        expect(getSkillState(skill, progress)).toBe("available");
        progress = updateSkillProgress(progress, skill.id, "mastered");
      }
      expect(getSkillState(skillById[id], progress)).toBe("mastered");
    }
  });
});
