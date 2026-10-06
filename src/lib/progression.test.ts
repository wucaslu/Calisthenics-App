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
  it("contains all 51 skills with valid, acyclic dependencies and reverse links", () => {
    expect(skills).toHaveLength(51);
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
  it("classifies holds as static and repetition-based skills as dynamic", () => {
    expect(
      skills.every((skill) =>
        ["static", "dynamic"].includes(skill.movementType),
      ),
    ).toBe(true);
    for (const id of [
      "dead-hang",
      "full-planche",
      "full-front-lever",
      "freestanding-handstand",
      "l-sit",
    ])
      expect(skillById[id].movementType).toBe("static");
    for (const id of [
      "push-up",
      "front-lever-raise",
      "handstand-push-up",
      "wall-toe-pull",
      "dragon-flag",
      "pistol-squat",
    ])
      expect(skillById[id].movementType).toBe("dynamic");
  });
});

describe("progression", () => {
  it("unlocks the Dragon Squat branch through preparation and single-leg strength", () => {
    let progress = createDemoProfile().progress;
    expect(getSkillState(skillById["dragon-squat-prep"], progress)).toBe(
      "locked",
    );
    for (const id of ["bodyweight-squat", "split-squat", "reverse-lunge"])
      progress = updateSkillProgress(progress, id, "mastered");
    expect(getSkillState(skillById["dragon-squat-prep"], progress)).toBe(
      "available",
    );
    progress = updateSkillProgress(progress, "dragon-squat-prep", "mastered");
    expect(getSkillState(skillById["assisted-dragon-squat"], progress)).toBe(
      "locked",
    );
    progress = updateSkillProgress(
      progress,
      "assisted-pistol-squat",
      "mastered",
    );
    expect(getSkillState(skillById["assisted-dragon-squat"], progress)).toBe(
      "available",
    );
    progress = updateSkillProgress(
      progress,
      "assisted-dragon-squat",
      "mastered",
    );
    expect(getSkillState(skillById["dragon-squat"], progress)).toBe("locked");
    progress = updateSkillProgress(progress, "pistol-squat", "mastered");
    expect(getSkillState(skillById["dragon-squat"], progress)).toBe(
      "available",
    );
    progress = updateSkillProgress(progress, "dragon-squat", "training");
    progress = updateSkillProgress(progress, "reverse-lunge", "reset");
    expect(progress["dragon-squat"]).toBeUndefined();
    expect(getSkillState(skillById["dragon-squat"], progress)).toBe("locked");
  });
  it("unlocks explosive and high pulls from Pull-up and muscle-ups after straight-bar pressing", () => {
    let progress = createDemoProfile().progress;
    for (const id of ["explosive-pull-up", "high-pull-up"])
      expect(getSkillState(skillById[id], progress)).toBe("available");
    for (const id of ["band-muscle-up", "muscle-up"])
      expect(getSkillState(skillById[id], progress)).toBe("locked");

    progress = updateSkillProgress(progress, "dip", "mastered");
    progress = updateSkillProgress(progress, "straight-bar-dip", "mastered");
    for (const id of ["band-muscle-up", "muscle-up"])
      expect(getSkillState(skillById[id], progress)).toBe("available");
    expect(getSkillState(skillById["strict-muscle-up"], progress)).toBe(
      "locked",
    );

    progress = updateSkillProgress(progress, "muscle-up", "mastered");
    expect(getSkillState(skillById["strict-muscle-up"], progress)).toBe(
      "available",
    );
    progress = updateSkillProgress(progress, "explosive-pull-up", "mastered");
    progress = updateSkillProgress(progress, "explosive-pull-up", "reset");
    expect(progress["muscle-up"]).toBe("mastered");

    progress = updateSkillProgress(progress, "pull-up", "reset");
    for (const id of [
      "explosive-pull-up",
      "high-pull-up",
      "band-muscle-up",
      "muscle-up",
      "strict-muscle-up",
    ])
      expect(getSkillState(skillById[id], progress)).toBe("locked");
    expect(progress["muscle-up"]).toBeUndefined();
  });
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
  it("includes both Dragon Squat preparation and pistol strength once in the Legs branch", () => {
    const path = getGoalPath("dragon-squat", {}).map((skill) => skill.id);
    expect(path).toEqual([
      "bodyweight-squat",
      "split-squat",
      "reverse-lunge",
      "dragon-squat-prep",
      "assisted-pistol-squat",
      "assisted-dragon-squat",
      "pistol-squat",
      "dragon-squat",
    ]);
    expect(
      getVisibleSkills("legs", "", "dragon-squat")
        .map((skill) => skill.id)
        .sort(),
    ).toEqual([...path].sort());
  });
  it("plans muscle-ups from Pull-up and pressing strength without intermediate pull or band requirements", () => {
    expect(
      getGoalPath("strict-muscle-up", createDemoProfile().progress).map(
        (skill) => skill.id,
      ),
    ).toEqual(["dip", "straight-bar-dip", "muscle-up", "strict-muscle-up"]);
  });
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
