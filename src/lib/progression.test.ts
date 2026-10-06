import { describe, expect, it } from "vitest";
import { skillById, skills } from "@/data/skills";
import { getGoalPath, getVisibleSkills, layoutSkills } from "@/lib/graph";
import {
  getSkillState,
  hasEquipment,
  missingEquipment,
  updateSkillProgress,
} from "@/lib/progression";
import { createDemoProfile, parseProfile } from "@/lib/profile";
import { getRecommendations } from "@/lib/recommendations";

describe("skill database", () => {
  it("contains all 48 skills with valid, acyclic dependencies and reverse links", () => {
    expect(skills).toHaveLength(48);
    expect(new Set(skills.map((skill) => skill.id)).size).toBe(skills.length);
    const visit = (id: string, ancestors: string[] = []) => {
      expect(ancestors).not.toContain(id);
      for (const parent of skillById[id].prerequisites) {
        expect(skillById[parent].progressionTo).toContain(id);
        visit(parent, [...ancestors, id]);
      }
    };
    skills.forEach((skill) => visit(skill.id));
  });
  it("places prerequisite nodes above their dependents", () => {
    const positions = layoutSkills(skills);
    for (const skill of skills)
      for (const parent of skill.prerequisites) {
        expect(positions.get(parent)!.y).toBeLessThan(
          positions.get(skill.id)!.y,
        );
      }
  });
  it("groups skills in Pull, Push, Legs, and Core with handstands under Push", () => {
    expect(new Set(skills.map((skill) => skill.category))).toEqual(
      new Set(["pull", "push", "legs", "core"]),
    );
    expect(skillById["freestanding-handstand"].category).toBe("push");
    expect(
      getVisibleSkills("legs").every((skill) => skill.category === "legs"),
    ).toBe(true);
  });
});

describe("progression", () => {
  it("keeps a skill locked until every prerequisite is mastered", () => {
    expect(
      getSkillState(skillById["tuck-planche"], { "planche-lean": "mastered" }),
    ).toBe("locked");
    expect(
      getSkillState(skillById["planche-lean"], {
        "push-up": "mastered",
        "scapular-push-up": "training",
      }),
    ).toBe("locked");
  });
  it("makes a skill available when all prerequisites are mastered", () => {
    expect(
      getSkillState(skillById["planche-lean"], {
        "push-up": "mastered",
        "scapular-push-up": "mastered",
      }),
    ).toBe("available");
  });
  it("unlocks downstream skills immediately on mastery", () => {
    const profile = createDemoProfile();
    const progress = updateSkillProgress(
      profile.progress,
      "planche-lean",
      "mastered",
    );
    expect(getSkillState(skillById["tuck-planche"], progress)).toBe(
      "available",
    );
    expect(getSkillState(skillById["pseudo-planche-push-up"], progress)).toBe(
      "available",
    );
  });
  it("rejects training and mastery for a locked skill", () => {
    expect(updateSkillProgress({}, "full-planche", "mastered")).toEqual({});
    expect(updateSkillProgress({}, "full-planche", "training")).toEqual({});
  });
  it("resets dependent training/mastery transitively", () => {
    const profile = createDemoProfile();
    let progress = updateSkillProgress(
      profile.progress,
      "planche-lean",
      "mastered",
    );
    progress = updateSkillProgress(progress, "tuck-planche", "mastered");
    progress = updateSkillProgress(progress, "push-up", "reset");
    expect(progress["planche-lean"]).toBeUndefined();
    expect(progress["tuck-planche"]).toBeUndefined();
    expect(getSkillState(skillById["tuck-planche"], progress)).toBe("locked");
  });
});

describe("goal paths", () => {
  it("returns the shortest outstanding planche path for the demo profile", () => {
    expect(
      getGoalPath("tuck-planche", createDemoProfile().progress).map(
        (skill) => skill.id,
      ),
    ).toEqual(["planche-lean", "tuck-planche"]);
  });
  it("includes supporting prerequisites and deduplicates shared dependencies", () => {
    const path = getGoalPath("tuck-planche", {}).map((skill) => skill.id);
    expect(path).toEqual([
      "push-up",
      "scapular-push-up",
      "planche-lean",
      "hollow-body-hold",
      "tuck-planche",
    ]);
    expect(new Set(path).size).toBe(path.length);
  });
  it("omits an already mastered goal and handles unknown IDs", () => {
    expect(getGoalPath("push-up", { "push-up": "mastered" })).toEqual([]);
    expect(getGoalPath("missing", {})).toEqual([]);
  });
});

describe("equipment and recommendations", () => {
  it("requires every piece of equipment, while always allowing floor skills", () => {
    expect(hasEquipment(skillById["push-up"], [])).toBe(true);
    expect(hasEquipment(skillById["band-muscle-up"], ["pull-up-bar"])).toBe(
      false,
    );
    expect(
      missingEquipment(skillById["band-muscle-up"], ["pull-up-bar"]),
    ).toEqual(["resistance-bands"]);
    expect(
      hasEquipment(skillById["band-muscle-up"], [
        "pull-up-bar",
        "resistance-bands",
      ]),
    ).toBe(true);
    expect(hasEquipment(skillById["dip"], ["gym"])).toBe(true);
  });
  it("recommends available goal prerequisites deterministically", () => {
    const profile = createDemoProfile();
    const result = getRecommendations(profile);
    expect(result).toHaveLength(4);
    expect(result[0].skill.id).toBe("planche-lean");
    expect(result.some((item) => item.skill.id === "tuck-front-lever")).toBe(
      true,
    );
    expect(result).toEqual(getRecommendations(profile));
    result.forEach(({ skill }) => {
      expect(["available", "training"]).toContain(
        getSkillState(skill, profile.progress),
      );
      expect(hasEquipment(skill, profile.equipment)).toBe(true);
    });
  });
  it("removes bar recommendations when equipment is unavailable", () => {
    const result = getRecommendations(
      { ...createDemoProfile(), equipment: ["floor"] },
      5,
    );
    expect(
      result.some((item) => item.skill.equipment.includes("pull-up-bar")),
    ).toBe(false);
  });
});

describe("persisted profile validation", () => {
  it("does not treat inherited object keys as skill IDs", () => {
    const parsed = parseProfile(
      JSON.stringify({
        version: 1,
        progress: { constructor: "mastered" },
        goals: ["constructor", "toString", "__proto__"],
        equipment: ["floor"],
      }),
    );
    expect(parsed?.progress).toEqual({});
    expect(parsed?.goals).toEqual([]);
    expect(getGoalPath("constructor", {})).toEqual([]);
  });
  it("rejects corrupt or incompatible data", () => {
    expect(parseProfile("not json")).toBeNull();
    expect(parseProfile('{"version":2}')).toBeNull();
  });
  it("round-trips the demo and removes unknown and inconsistent progress", () => {
    expect(parseProfile(JSON.stringify(createDemoProfile()))).toEqual(
      createDemoProfile(),
    );
    const parsed = parseProfile(
      JSON.stringify({
        version: 1,
        goals: ["fake", "push-up", "push-up"],
        equipment: ["fake"],
        progress: {
          "full-planche": "mastered",
          "push-up": "mastered",
          fake: "mastered",
        },
      }),
    );
    expect(parsed?.progress).toEqual({ "push-up": "mastered" });
    expect(parsed?.goals).toEqual(["push-up"]);
    expect(parsed?.equipment).toEqual(["floor"]);
  });
});
