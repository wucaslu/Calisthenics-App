import { describe, expect, it } from "vitest";
import { skillMuscles } from "@/data/muscles";
import { skills, skillById } from "@/data/skills";

describe("skill muscle profiles", () => {
  it("covers every active skill with a target and distinct primary and secondary muscles", () => {
    expect(Object.keys(skillMuscles).sort()).toEqual(
      skills.map((skill) => skill.id).sort(),
    );
    for (const skill of skills) {
      const { target, primary, secondary } = skill.muscles;
      expect(target.trim()).not.toBe("");
      expect(primary.length).toBeGreaterThan(0);
      expect(secondary.length).toBeGreaterThan(0);
      const all = [...primary, ...secondary];
      expect(
        all.every((muscle) => muscle.trim() && muscle === muscle.trim()),
      ).toBe(true);
      expect(new Set(all).size).toBe(all.length);
    }
  });
  it("distinguishes grip, lever, pressing, knee-flexion, and compression muscles", () => {
    const primary = (id: string) => skillById[id].muscles.primary.join(", ");
    expect(primary("dead-hang")).toMatch(/forearm.*finger flexors/i);
    expect(primary("full-front-lever")).toMatch(/latissimus/i);
    expect(primary("back-lever")).toMatch(/anterior deltoids/i);
    expect(primary("back-lever")).not.toMatch(/latissimus/i);
    expect(primary("90-degree-hold")).toMatch(/triceps/i);
    expect(primary("pelican-planche")).toMatch(/biceps/i);
    expect(primary("pelican-planche")).toMatch(/triceps/i);
    expect(primary("nordic-curl")).toMatch(/hamstrings/i);
    expect(primary("l-sit")).toMatch(/hip flexors/i);
    expect(primary("dragon-flag")).toMatch(/rectus abdominis/i);
    expect(primary("calf-raise")).toMatch(/gastrocnemius/i);
  });
});
