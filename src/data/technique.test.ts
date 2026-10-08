import { describe, expect, it } from "vitest";
import { skills, skillById } from "@/data/skills";
import { skillTechnique, techniqueSources } from "@/data/technique";

const guidanceText = (id: string) => {
  const guidance = skillTechnique[id];
  return [...guidance.setup, ...guidance.cues, ...guidance.mistakes].join(" ");
};

describe("skill technique guidance", () => {
  it("covers the active catalog without orphaned guidance or missing detail sections", () => {
    expect(Object.keys(skillTechnique).sort()).toEqual(
      skills.map((skill) => skill.id).sort(),
    );

    for (const skill of skills) {
      const guidance = skillTechnique[skill.id];
      expect(skill.technique, skill.id).toEqual(guidance);
      expect(guidance.setup.length, `${skill.id} setup`).toBeGreaterThan(0);
      expect(guidance.cues.length, `${skill.id} cues`).toBeGreaterThanOrEqual(
        3,
      );
      expect(
        guidance.mistakes.length,
        `${skill.id} mistakes`,
      ).toBeGreaterThanOrEqual(2);

      for (const [section, entries] of Object.entries({
        setup: guidance.setup,
        cues: guidance.cues,
        mistakes: guidance.mistakes,
      })) {
        expect(
          entries.every((entry) => entry.length > 0 && entry === entry.trim()),
          `${skill.id} ${section}`,
        ).toBe(true);
        expect(new Set(entries).size, `${skill.id} ${section}`).toBe(
          entries.length,
        );
      }
      if (guidance.sourceScope !== undefined) {
        expect(guidance.sourceScope, skill.id).not.toBe("");
        expect(guidance.sourceScope, skill.id).toBe(
          guidance.sourceScope.trim(),
        );
      }
    }
  });

  it("resolves every technique citation to a titled HTTPS instructional reference", () => {
    const referencedSources = new Set<string>();
    for (const skill of skills) {
      const ids = skillTechnique[skill.id].sources;
      expect(ids.length, skill.id).toBeGreaterThan(0);
      expect(new Set(ids).size, skill.id).toBe(ids.length);
      for (const id of ids) {
        const source = techniqueSources[id];
        expect(source, `${skill.id}: ${id}`).toBeDefined();
        expect(source.title.trim(), id).not.toBe("");
        expect(source.title, id).toBe(source.title.trim());
        expect(source.url, id).toBe(source.url.trim());
        const url = new URL(source.url);
        expect(url.protocol, id).toBe("https:");
        expect(url.hostname, id).not.toBe("");
        expect(url.username, id).toBe("");
        expect(url.password, id).toBe("");
        referencedSources.add(id);
      }
    }
    expect([...referencedSources].sort()).toEqual(
      Object.keys(techniqueSources).sort(),
    );
  });

  it("distinguishes bent-arm support from straight-arm planche and raised-handle pressing range", () => {
    expect(guidanceText("90-degree-hold")).toMatch(
      /(?:bent|bend|90)[^.]*elbow|elbow[^.]*(?:bent|bend|90)/i,
    );
    expect(guidanceText("full-planche")).toMatch(
      /straight[^.]*(?:arm|elbow)|(?:arm|elbow)[^.]*straight/i,
    );
    expect(guidanceText("handstand-push-up")).toMatch(
      /head[^.]*floor|floor[^.]*head/i,
    );
    expect(guidanceText("full-range-handstand-push-up")).toMatch(
      /raised|elevated|handles|parallettes/i,
    );
    expect(guidanceText("full-range-handstand-push-up")).toMatch(
      /shoulder[^.]*hand[^.]*(?:height|level)|head[^.]*below[^.]*hand/i,
    );
    expect(skillTechnique["full-range-handstand-push-up"].cues).not.toEqual(
      skillTechnique["handstand-push-up"].cues,
    );
  });

  it("keeps Pelican Push Up a controlled transition between planche and back lever", () => {
    const text = guidanceText("pelican-planche");
    expect(skillById["pelican-planche"].movementType).toBe("dynamic");
    expect(text).toMatch(/planche/i);
    expect(text).toMatch(/back[- ]lever/i);
    expect(text).toMatch(/return|reverse|back again|both directions/i);
    expect(skillTechnique["pelican-planche"].sourceScope).toBeTruthy();
  });

  it("distinguishes trunk shapes and avoids using the neck as the dragon-flag support", () => {
    expect(guidanceText("hollow-body-hold")).toMatch(
      /lower back[^.]*(?:floor|ground)|(?:floor|ground)[^.]*lower back/i,
    );
    expect(guidanceText("arch-body-hold")).toMatch(/chest|thigh/i);
    expect(skillTechnique["arch-body-hold"].cues).not.toEqual(
      skillTechnique["hollow-body-hold"].cues,
    );
    expect(guidanceText("dragon-flag")).toMatch(/upper back|shoulder/i);
    expect(guidanceText("dragon-flag")).toMatch(/neck/i);
  });

  it("preserves the high-angle V-sit and horizontal Manna positions", () => {
    expect(guidanceText("v-sit-155")).toMatch(/155/);
    expect(guidanceText("v-sit-155")).toMatch(/hip|shoulder extension/i);
    expect(guidanceText("manna")).toMatch(/horizontal/i);
    expect(guidanceText("manna")).toMatch(/hip/i);
    expect(skillTechnique["v-sit-155"].cues).not.toEqual(
      skillTechnique["l-sit"].cues,
    );
    expect(skillTechnique.manna.cues).not.toEqual(skillTechnique["l-sit"].cues);
  });
});
