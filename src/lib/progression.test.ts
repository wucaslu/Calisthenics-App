import { describe, expect, it } from "vitest";
import { skillById, skills } from "@/data/skills";
import { researchSources } from "@/data/references";
import {
  getGoalPath,
  getVisibleSkills,
  getProgressionLanes,
  layoutSkills,
} from "@/lib/graph";
import {
  getSkillState,
  hasEquipment,
  missingEquipment,
  updateSkillProgress,
} from "@/lib/progression";
import { createDemoProfile, parseProfile } from "@/lib/profile";
import { getRecommendations } from "@/lib/recommendations";
import { getDifficultyTier, MAX_DIFFICULTY } from "@/lib/difficulty";

describe("skill database", () => {
  it("contains all 105 skills with valid, acyclic dependencies and reverse links", () => {
    expect(skills).toHaveLength(105);
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
      "back-lever",
      "maltese",
      "iron-cross",
      "90-degree-hold",
    ])
      expect(skillById[id].movementType).toBe("static");
    for (const id of [
      "push-up",
      "front-lever-raise",
      "handstand-push-up",
      "frog-stand-to-handstand",
      "dragon-flag",
      "pistol-squat",
      "skin-the-cat",
      "pelican-press",
      "pelican-planche",
      "hefesto",
    ])
      expect(skillById[id].movementType).toBe("dynamic");
  });
  it("excludes assisted milestones and records published levels separately from app estimates", () => {
    expect(skills.some((skill) => /assisted|band|wall/i.test(skill.name))).toBe(
      false,
    );
    for (const skill of skills) {
      expect(skill.difficulty).toBeGreaterThanOrEqual(1);
      expect(skill.difficulty).toBeLessThanOrEqual(MAX_DIFFICULTY);
      expect(Number.isInteger(skill.difficulty)).toBe(true);
      for (const id of skill.references)
        expect(researchSources[id]?.url).toMatch(/^https:\/\//);
    }
    expect(skillById["diamond-push-up"].referenceLevel).toBe(
      "Pushing progression · Level 4",
    );
    expect(skillById["diamond-push-up"].difficulty).toBe(3);
    expect(skillById["maltese"].referenceLevel).toBeUndefined();
  });
  it("distinguishes advanced skill demands on the 10-point scale", () => {
    const ordered = [
      "back-lever",
      "90-degree-hold",
      "full-front-lever",
      "full-planche",
      "maltese",
    ].map((id) => skillById[id].difficulty);
    expect(ordered).toEqual([6, 7, 8, 9, 10]);
    expect(skillById["full-front-lever-row"].difficulty).toBeGreaterThan(
      skillById["full-front-lever"].difficulty,
    );
    expect(skillById["pelican-planche"].difficulty).toBeGreaterThan(
      skillById["pelican-press"].difficulty,
    );
    expect(getDifficultyTier(6)).toBe("Intermediate");
    expect(getDifficultyTier(7)).toBe("Advanced");
    expect(getDifficultyTier(9)).toBe("Elite");
  });
  it("keeps progression lanes separate and skill rectangles from overlapping", () => {
    const positions = layoutSkills(skills);
    const lanes = getProgressionLanes(skills);
    for (const lane of lanes) {
      expect(
        lane.items.every(
          (item) =>
            item.category === lane.category && item.branch === lane.branch,
        ),
      ).toBe(true);
      for (const other of lanes.filter(
        (item) =>
          item.category === lane.category && item.branch !== lane.branch,
      )) {
        const xs = lane.items.map((item) => positions.get(item.id)!.x);
        const otherXs = other.items.map((item) => positions.get(item.id)!.x);
        expect(
          Math.max(...xs) + 210 <= Math.min(...otherXs) ||
            Math.max(...otherXs) + 210 <= Math.min(...xs),
        ).toBe(true);
      }
    }
    for (let index = 0; index < skills.length; index++) {
      const a = positions.get(skills[index].id)!;
      for (const skill of skills.slice(index + 1)) {
        const b = positions.get(skill.id)!;
        expect(Math.abs(a.x - b.x) >= 210 || Math.abs(a.y - b.y) >= 104).toBe(
          true,
        );
      }
    }
  });
});

describe("progression", () => {
  it("prepares both new skills through unassisted routes without changing existing planche unlocks", () => {
    for (const id of ["90-degree-hold", "pelican-planche"]) {
      let progress = createDemoProfile().progress;
      expect(getSkillState(skillById[id], progress)).toBe("locked");
      for (const skill of getGoalPath(id, progress)) {
        expect(["available", "training"]).toContain(
          getSkillState(skill, progress),
        );
        progress = updateSkillProgress(progress, skill.id, "mastered");
      }
      expect(getSkillState(skillById[id], progress)).toBe("mastered");
      const reset = updateSkillProgress(
        progress,
        id === "90-degree-hold" ? "tuck-planche-push-up" : "back-lever",
        "reset",
      );
      expect(getSkillState(skillById[id], reset)).toBe("locked");
    }
    const pelicanPath = getGoalPath("pelican-planche", {}).map(
      (skill) => skill.id,
    );
    expect(pelicanPath).toContain("full-planche");
    expect(pelicanPath).toContain("back-lever");
    expect(pelicanPath).toContain("pelican-press");
    expect(
      getGoalPath("full-planche", {}).map((skill) => skill.id),
    ).not.toContain("90-degree-hold");
    expect(hasEquipment(skillById["90-degree-hold"], [])).toBe(true);
    expect(hasEquipment(skillById["pelican-planche"], ["pull-up-bar"])).toBe(
      false,
    );
    expect(hasEquipment(skillById["pelican-planche"], ["rings"])).toBe(true);
  });
  it("unlocks Dragon Squat through unassisted single-leg strength and cascades resets", () => {
    let progress = createDemoProfile().progress;
    expect(getSkillState(skillById["dragon-squat"], progress)).toBe("locked");
    for (const id of [
      "bodyweight-squat",
      "split-squat",
      "deep-step-up",
      "pistol-squat-negative",
      "pistol-squat",
    ])
      progress = updateSkillProgress(progress, id, "mastered");
    expect(getSkillState(skillById["dragon-squat"], progress)).toBe("locked");
    progress = updateSkillProgress(progress, "reverse-lunge", "mastered");
    expect(getSkillState(skillById["dragon-squat"], progress)).toBe(
      "available",
    );
    progress = updateSkillProgress(progress, "dragon-squat", "training");
    progress = updateSkillProgress(progress, "reverse-lunge", "reset");
    expect(progress["dragon-squat"]).toBeUndefined();
    expect(getSkillState(skillById["dragon-squat"], progress)).toBe("locked");
  });
  it("requires the ordered pulling chain and pressing strength before muscle-up", () => {
    let progress = createDemoProfile().progress;
    for (const [id, next] of [
      ["chest-to-bar-pull-up", "explosive-pull-up"],
      ["explosive-pull-up", "high-pull-up"],
    ]) {
      expect(["available", "training"]).toContain(
        getSkillState(skillById[id], progress),
      );
      expect(getSkillState(skillById[next], progress)).toBe("locked");
      progress = updateSkillProgress(progress, id, "mastered");
      expect(getSkillState(skillById[next], progress)).toBe("available");
    }
    progress = updateSkillProgress(progress, "high-pull-up", "mastered");
    expect(getSkillState(skillById["muscle-up"], progress)).toBe("locked");
    progress = updateSkillProgress(progress, "dip", "mastered");
    progress = updateSkillProgress(progress, "straight-bar-dip", "mastered");
    expect(getSkillState(skillById["muscle-up"], progress)).toBe("available");
    progress = updateSkillProgress(progress, "muscle-up", "mastered");
    expect(getSkillState(skillById["strict-muscle-up"], progress)).toBe(
      "available",
    );
    progress = updateSkillProgress(progress, "explosive-pull-up", "reset");
    for (const id of ["high-pull-up", "muscle-up", "strict-muscle-up"])
      expect(getSkillState(skillById[id], progress)).toBe("locked");
    expect(progress["muscle-up"]).toBeUndefined();
  });
  it("keeps ring muscle-ups independent of the bar muscle-up chain", () => {
    let progress = createDemoProfile().progress;
    for (const skill of getGoalPath("ring-muscle-up", progress)) {
      expect(skill.id).not.toMatch(
        /^(muscle-up|high-pull-up|explosive-pull-up|chest-to-bar-pull-up)$/,
      );
      progress = updateSkillProgress(progress, skill.id, "mastered");
    }
    expect(getSkillState(skillById["ring-muscle-up"], progress)).toBe(
      "mastered",
    );
    expect(getSkillState(skillById["muscle-up"], progress)).toBe("locked");
  });
  it("makes every added milestone reachable through its visible prerequisite path", () => {
    for (const goal of [
      "one-arm-row",
      "one-arm-push-up",
      "advanced-tuck-front-lever-row",
      "frog-stand-to-handstand",
      "advanced-shrimp-squat",
      "nordic-curl",
      "hanging-windshield-wiper",
      "v-sit",
    ]) {
      let progress = {};
      for (const skill of getGoalPath(goal, progress)) {
        expect(getSkillState(skill, progress)).toBe("available");
        progress = updateSkillProgress(progress, skill.id, "mastered");
      }
      expect(getSkillState(skillById[goal], progress)).toBe("mastered");
    }
  });
  it("makes advanced milestones reachable and cascades resets through shared ring foundations", () => {
    let progress = createDemoProfile().progress;
    for (const goal of [
      "back-lever",
      "maltese",
      "pelican-press",
      "hefesto",
      "iron-cross",
      "one-arm-pull-up",
      "ring-muscle-up",
    ]) {
      const visible = getVisibleSkills(
        skillById[goal].category,
        "",
        skillById[goal].branch,
      ).map((skill) => skill.id);
      for (const skill of getGoalPath(goal, progress)) {
        expect(visible).toContain(skill.id);
        expect(["available", "training"]).toContain(
          getSkillState(skill, progress),
        );
        progress = updateSkillProgress(progress, skill.id, "mastered");
      }
      expect(getSkillState(skillById[goal], progress)).toBe("mastered");
    }
    progress = updateSkillProgress(progress, "ring-support-hold", "reset");
    for (const id of [
      "maltese",
      "pelican-press",
      "iron-cross",
      "ring-muscle-up",
    ])
      expect(getSkillState(skillById[id], progress)).toBe("locked");
    expect(getSkillState(skillById["back-lever"], progress)).toBe("mastered");
    expect(getSkillState(skillById["one-arm-pull-up"], progress)).toBe(
      "mastered",
    );
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
  it("includes unassisted pistol strength and balance once in the Dragon Squat path", () => {
    const path = getGoalPath("dragon-squat", {}).map((skill) => skill.id);
    expect(path).toEqual([
      "bodyweight-squat",
      "split-squat",
      "deep-step-up",
      "pistol-squat-negative",
      "pistol-squat",
      "reverse-lunge",
      "dragon-squat",
    ]);
    expect(
      getVisibleSkills("legs", "", "dragon-squat")
        .map((skill) => skill.id)
        .sort(),
    ).toEqual([...path].sort());
  });
  it("plans the complete pulling chain and pressing prerequisites for strict muscle-up", () => {
    expect(
      getGoalPath("strict-muscle-up", createDemoProfile().progress).map(
        (skill) => skill.id,
      ),
    ).toEqual([
      "chest-to-bar-pull-up",
      "explosive-pull-up",
      "high-pull-up",
      "dip",
      "straight-bar-dip",
      "muscle-up",
      "strict-muscle-up",
    ]);
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
  it("requires rings for advanced ring skills while always allowing floor skills", () => {
    expect(hasEquipment(skillById["push-up"], [])).toBe(true);
    expect(hasEquipment(skillById["pelican-press"], ["pull-up-bar"])).toBe(
      false,
    );
    expect(
      missingEquipment(skillById["pelican-press"], ["pull-up-bar"]),
    ).toEqual(["rings"]);
    expect(hasEquipment(skillById["pelican-press"], ["rings"])).toBe(true);
    expect(hasEquipment(skillById["pelican-press"], ["gym"])).toBe(false);
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
