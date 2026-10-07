import { describe, expect, it } from "vitest";
import { skillById, skills } from "@/data/skills";
import { alternativeRoutes, equipmentSetups } from "@/data/trainingOptions";
import {
  getAncestors,
  getGoalPath,
  getGoalPlan,
  getPreferredPrerequisiteRoute,
  getVisibleSkills,
  layoutSkills,
} from "@/lib/graph";
import {
  getEquipmentSetups,
  getPrerequisiteIds,
  getPrerequisiteRoutes,
  getSkillState,
  hasEquipment,
  missingEquipment,
  missingEquipmentForSetup,
  normalizeProgress,
  updateSkillProgress,
} from "@/lib/progression";
import type { Progress, Skill } from "@/types/skill";

const leverFoundations: Progress = {
  "dead-hang": "mastered",
  "scapular-pull-up": "mastered",
  "hollow-body-hold": "mastered",
};

describe("alternative prerequisite routes", () => {
  it("requires all members of one complete route, without combining incomplete routes", () => {
    const lever = skillById["tuck-front-lever"];
    expect(getSkillState(lever, leverFoundations)).toBe("locked");
    const chinUpRoute: Progress = {
      ...leverFoundations,
      "chin-up": "mastered",
    };
    expect(getSkillState(lever, chinUpRoute)).toBe("available");
    expect(chinUpRoute["pull-up"]).toBeUndefined();
    expect(
      getSkillState(lever, {
        ...chinUpRoute,
        "hollow-body-hold": "training",
      }),
    ).toBe("locked");
    expect(
      getSkillState(skillById["ring-dip"], {
        "diamond-push-up": "mastered",
        "rings-turned-out-support": "mastered",
      }),
    ).toBe("locked");
  });

  it("retains mastered descendants after a reset when another complete route survives", () => {
    const progress: Progress = {
      ...leverFoundations,
      "pull-up": "mastered",
      "chin-up": "mastered",
      "tuck-front-lever": "mastered",
      "advanced-tuck-front-lever": "mastered",
    };
    const oneRouteLeft = updateSkillProgress(progress, "pull-up", "reset");
    expect(oneRouteLeft["tuck-front-lever"]).toBe("mastered");
    expect(oneRouteLeft["advanced-tuck-front-lever"]).toBe("mastered");
    const noRouteLeft = updateSkillProgress(oneRouteLeft, "chin-up", "reset");
    expect(noRouteLeft["tuck-front-lever"]).toBeUndefined();
    expect(noRouteLeft["advanced-tuck-front-lever"]).toBeUndefined();
    expect(noRouteLeft["hollow-body-hold"]).toBe("mastered");
  });

  it("does not invent prerequisite mastery when validating inconsistent saved progress", () => {
    const normalized = normalizeProgress({
      ...leverFoundations,
      "chin-up": "training",
      "tuck-front-lever": "mastered",
      "advanced-tuck-front-lever": "mastered",
    });
    expect(normalized["chin-up"]).toBe("training");
    expect(normalized["pull-up"]).toBeUndefined();
    expect(normalized["tuck-front-lever"]).toBeUndefined();
    expect(normalized["advanced-tuck-front-lever"]).toBeUndefined();
  });

  it("plans the fewest remaining steps and gives standard preparation deterministic equal-score priority", () => {
    expect(
      getGoalPlan("tuck-front-lever", {}).routeIds["tuck-front-lever"],
    ).toBe("chin-up-foundation");
    expect(
      getGoalPlan("tuck-front-lever", {
        ...leverFoundations,
        "pull-up-negative": "mastered",
      }).routeIds["tuck-front-lever"],
    ).toBe("standard");
    const progress: Progress = { ...leverFoundations, "chin-up": "mastered" };
    const plan = getGoalPlan("tuck-front-lever", progress);
    expect(plan.skills.map((skill) => skill.id)).toEqual(["tuck-front-lever"]);
    expect(plan.routeIds["tuck-front-lever"]).toBe("chin-up-foundation");
    expect(
      getPreferredPrerequisiteRoute(skillById["tuck-front-lever"], progress).id,
    ).toBe("chin-up-foundation");
    const mastered = updateSkillProgress(
      progress,
      "tuck-front-lever",
      "mastered",
    );
    expect(getGoalPath("tuck-front-lever", mastered)).toEqual([]);
    expect(mastered["pull-up"]).toBeUndefined();
  });

  it("finds the smallest unique remaining set across shared dependencies rather than optimizing each child alone", () => {
    const synthetic: Skill[] = [
      { ...skillById["push-up"], id: "test-shared-x", prerequisites: [] },
      { ...skillById["push-up"], id: "test-shared-y", prerequisites: [] },
      { ...skillById["push-up"], id: "test-private-z", prerequisites: [] },
      {
        ...skillById["push-up"],
        id: "test-choice-a",
        prerequisites: ["test-shared-x", "test-shared-y"],
        alternativeRoutes: [
          {
            id: "private-route",
            label: "Private route",
            description: "An isolated shorter route.",
            prerequisites: ["test-private-z"],
          },
        ],
      },
      {
        ...skillById["push-up"],
        id: "test-choice-b",
        prerequisites: ["test-shared-x", "test-shared-y"],
      },
      {
        ...skillById["push-up"],
        id: "test-goal",
        prerequisites: ["test-choice-a", "test-choice-b"],
      },
    ];
    for (const skill of synthetic) skillById[skill.id] = skill;
    try {
      expect(getGoalPath("test-choice-a", {}).map((skill) => skill.id)).toEqual(
        ["test-private-z", "test-choice-a"],
      );
      const sharedPlan = getGoalPlan("test-goal", {});
      expect(sharedPlan.skills.map((skill) => skill.id)).toEqual([
        "test-shared-x",
        "test-shared-y",
        "test-choice-a",
        "test-choice-b",
        "test-goal",
      ]);
      expect(sharedPlan.routeIds["test-choice-a"]).toBe("standard");
    } finally {
      for (const skill of synthetic) delete skillById[skill.id];
    }
  });

  it("uses available equipment to favor a complete floor route without removing the original route", () => {
    const standard = getGoalPlan("pistol-squat-negative", {});
    expect(standard.routeIds["pistol-squat-negative"]).toBe("standard");
    expect(standard.skills.map((skill) => skill.id)).toContain("deep-step-up");
    const floorPlan = getGoalPlan("pistol-squat-negative", {}, ["floor"]);
    expect(floorPlan.routeIds["pistol-squat-negative"]).toBe(
      "shrimp-squat-foundation",
    );
    expect(floorPlan.skills.map((skill) => skill.id)).not.toContain(
      "deep-step-up",
    );
    expect(
      floorPlan.skills.every((skill) => hasEquipment(skill, ["floor"])),
    ).toBe(true);
    let progress: Progress = {};
    for (const skill of floorPlan.skills) {
      expect(getSkillState(skill, progress)).toBe("available");
      progress = updateSkillProgress(progress, skill.id, "mastered");
    }
    expect(progress["pistol-squat-negative"]).toBe("mastered");
    expect(progress["deep-step-up"]).toBeUndefined();
  });

  it("keeps the entire requested bar muscle-up chain mandatory", () => {
    const chain = [
      "pull-up",
      "chest-to-bar-pull-up",
      "explosive-pull-up",
      "high-pull-up",
      "muscle-up",
      "strict-muscle-up",
    ];
    const path = getGoalPath("strict-muscle-up", {}, ["rings"]).map(
      (skill) => skill.id,
    );
    expect(path.filter((id) => chain.includes(id))).toEqual(chain);
    for (const id of chain)
      expect(getPrerequisiteRoutes(skillById[id])).toHaveLength(1);
  });
});

describe("route catalog and graph integrity", () => {
  it("contains only active, unassisted milestones, with unique route and setup IDs", () => {
    for (const id of [
      ...Object.keys(alternativeRoutes),
      ...Object.keys(equipmentSetups),
    ])
      expect(skillById[id]).toBeDefined();
    for (const skill of skills) {
      const routes = getPrerequisiteRoutes(skill);
      const setups = getEquipmentSetups(skill);
      expect(new Set(routes.map((route) => route.id)).size).toBe(routes.length);
      expect(new Set(setups.map((setup) => setup.id)).size).toBe(setups.length);
      for (const parent of getPrerequisiteIds(skill)) {
        expect(skillById[parent]).toBeDefined();
        expect(parent).not.toMatch(
          /assisted|band|weighted|^(one|single|1)-leg/,
        );
        expect(skillById[parent].progressionTo).toContain(skill.id);
      }
    }
  });

  it("keeps the union of every alternative acyclic and above dependent nodes", () => {
    const positions = layoutSkills(skills);
    const visit = (id: string, ancestors: string[] = []) => {
      expect(ancestors).not.toContain(id);
      for (const parent of getPrerequisiteIds(skillById[id])) {
        expect(positions.get(parent)!.y).toBeLessThan(positions.get(id)!.y);
        visit(parent, [...ancestors, id]);
      }
    };
    skills.forEach((skill) => visit(skill.id));
  });

  it("shows alternative ancestors in the tree without adding every route to the chosen goal path", () => {
    const ancestors = getAncestors("tuck-front-lever");
    expect(ancestors).toEqual(
      expect.arrayContaining(["pull-up", "chin-up", "ring-pull-up"]),
    );
    const visible = getVisibleSkills("pull", "Tuck Front Lever").map(
      (skill) => skill.id,
    );
    expect(visible).toEqual(expect.arrayContaining(ancestors));
    const path = getGoalPath("tuck-front-lever", {}).map((skill) => skill.id);
    expect(path).toContain("chin-up");
    expect(path).not.toContain("pull-up");
    expect(path).not.toContain("ring-pull-up");
  });
});

describe("exercise-specific equipment substitutions", () => {
  it("allows floor and dip bars for suspended L-sit skills while preserving the standard setup", () => {
    for (const id of ["tuck-l-sit", "l-sit", "v-sit"]) {
      const skill = skillById[id];
      expect(skill.equipment).toEqual(["parallettes"]);
      expect(getEquipmentSetups(skill).map((setup) => setup.id)).toEqual([
        "standard",
        "floor",
        "dip-bars",
      ]);
      expect(hasEquipment(skill, [])).toBe(true);
      expect(hasEquipment(skill, ["dip-bars"])).toBe(true);
      expect(missingEquipment(skill, [])).toEqual([]);
      expect(
        missingEquipmentForSetup(getEquipmentSetups(skill)[0], []),
      ).toEqual(["parallettes"]);
    }
    expect(hasEquipment(skillById["tuck-planche-push-up"], [])).toBe(true);
    expect(
      getEquipmentSetups(skillById["90-degree-hold"])[1].equipment,
    ).toEqual(["parallettes"]);
  });

  it("allows rings for basic hangs and front levers but keeps apparatus-specific skills distinct", () => {
    for (const id of [
      "dead-hang",
      "scapular-pull-up",
      "pull-up",
      "tuck-front-lever",
      "full-front-lever",
    ])
      expect(hasEquipment(skillById[id], ["rings"])).toBe(true);
    for (const id of [
      "chest-to-bar-pull-up",
      "explosive-pull-up",
      "high-pull-up",
      "muscle-up",
      "strict-muscle-up",
      "straight-bar-dip",
      "hefesto",
      "toes-to-bar",
    ]) {
      expect(hasEquipment(skillById[id], ["rings"])).toBe(false);
      expect(hasEquipment(skillById[id], ["pull-up-bar"])).toBe(true);
    }
    for (const id of [
      "ring-pull-up",
      "ring-muscle-up",
      "pelican-press",
      "pelican-planche",
      "maltese",
      "iron-cross",
    ]) {
      expect(hasEquipment(skillById[id], ["pull-up-bar", "gym"])).toBe(false);
      expect(hasEquipment(skillById[id], ["rings"])).toBe(true);
    }
  });

  it("preserves apparatus-specific requirements for the new chart variants", () => {
    expect(hasEquipment(skillById["archer-pull-up"], ["rings"])).toBe(false);
    expect(hasEquipment(skillById["ring-archer-pull-up"], ["rings"])).toBe(
      true,
    );
    expect(
      hasEquipment(skillById["ring-archer-pull-up"], ["pull-up-bar"]),
    ).toBe(false);
    for (const id of ["ring-full-planche", "ring-full-planche-push-up"]) {
      expect(hasEquipment(skillById[id], ["rings"])).toBe(true);
      expect(hasEquipment(skillById[id], ["parallettes", "dip-bars"])).toBe(
        false,
      );
    }
    expect(hasEquipment(skillById["full-planche-push-up"], ["floor"])).toBe(
      true,
    );
    for (const id of ["straddle-l-sit", "v-sit-170", "manna"]) {
      expect(hasEquipment(skillById[id], ["floor"])).toBe(true);
      expect(hasEquipment(skillById[id], ["dip-bars"])).toBe(true);
    }
    expect(
      hasEquipment(skillById["full-range-handstand-push-up"], ["dip-bars"]),
    ).toBe(true);
    expect(
      hasEquipment(skillById["full-range-handstand-push-up"], ["floor"]),
    ).toBe(false);
    expect(hasEquipment(skillById["one-arm-chin-up"], ["pull-up-bar"])).toBe(
      true,
    );
  });

  it("requires a secure row-height setup and preserves bench or anchor equipment requirements", () => {
    expect(hasEquipment(skillById["inverted-row"], ["pull-up-bar"])).toBe(
      false,
    );
    expect(hasEquipment(skillById["inverted-row"], ["rings"])).toBe(true);
    expect(hasEquipment(skillById["inverted-row"], ["dip-bars"])).toBe(true);
    for (const id of ["dragon-flag", "nordic-curl", "decline-pike-push-up"])
      expect(
        hasEquipment(skillById[id], ["floor", "rings", "parallettes"]),
      ).toBe(false);
    expect(hasEquipment(skillById["dragon-flag"], ["gym"])).toBe(true);
  });
});
