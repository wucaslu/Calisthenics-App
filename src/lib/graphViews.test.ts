import { describe, expect, it } from "vitest";
import {
  GRAPH_VIEW_LIMIT,
  GRAPH_VIEW_NAME_MAX_LENGTH,
  GRAPH_VIEW_QUERY_MAX_LENGTH,
  isSavedGraphViews,
  removeGraphView,
  renameGraphView,
  sanitizeGraphViewSettings,
  sanitizeSavedGraphViews,
  saveGraphView,
} from "@/lib/graphViews";
import { createDemoProfile, parseProfile, STORAGE_KEY } from "@/lib/profile";
import type { SavedGraphView } from "@/types/skill";

function makeView(changes: Partial<SavedGraphView> = {}): SavedGraphView {
  return {
    id: "pull-bookmark",
    name: "Pull progression",
    group: "pull",
    branch: "front-lever",
    query: "  lever ",
    maxDifficulty: 10,
    highlightPath: true,
    availableOnly: false,
    selectedSkillId: "full-front-lever",
    viewport: { x: -210.5, y: 75, zoom: 0.8 },
    ...changes,
  };
}

describe("saved graph view recovery", () => {
  it("preserves filters, selection, and camera independently of current skill availability", () => {
    const view = makeView();
    const settings = Object.fromEntries(
      Object.entries(view).filter(([key]) => !["id", "name"].includes(key)),
    );
    expect(sanitizeGraphViewSettings(settings)).toEqual(settings);
    expect(sanitizeSavedGraphViews([view])).toEqual([view]);
    const profile = { ...createDemoProfile(), savedGraphViews: [view] };
    profile.equipment = ["floor"];
    const restored = parseProfile(JSON.stringify(profile));
    expect(restored?.savedGraphViews).toEqual([view]);
    expect(restored?.progress["full-front-lever"]).toBeUndefined();
    expect(restored?.version).toBe(2);
    expect(STORAGE_KEY).toBe("calisthenics-skill-tree:v1");
  });

  it("drops damaged views individually and keeps first unique IDs and case-insensitive names", () => {
    const view = makeView();
    const other = makeView({
      id: "other",
      name: "Push",
      group: "push",
      branch: "planche",
    });
    expect(
      sanitizeSavedGraphViews([
        null,
        view,
        { ...view, name: "Duplicate ID" },
        { ...view, id: "duplicate-name", name: "  PULL PROGRESSION  " },
        { ...view, id: "bad-category", group: "fake" },
        { ...view, id: "mismatch", group: "legs" },
        other,
      ]),
    ).toEqual([view, other]);
    for (const value of [null, {}, "text", 42])
      expect(sanitizeSavedGraphViews(value)).toEqual([]);
  });

  it("recovers stale selections and invalid camera values without losing usable filters", () => {
    for (const selectedSkillId of [
      "fake",
      "constructor",
      "one-leg-front-lever",
      12,
      undefined,
    ]) {
      const recovered = sanitizeGraphViewSettings({
        ...makeView(),
        selectedSkillId,
      });
      expect(recovered?.selectedSkillId).toBeNull();
      expect(recovered?.branch).toBe("front-lever");
    }
    for (const viewport of [
      null,
      {},
      { x: 0, y: 0, zoom: 0 },
      { x: Infinity, y: 0, zoom: 1 },
      { x: 0, y: 1_000_001, zoom: 1 },
      { x: 0, y: 0, zoom: 1.81 },
    ]) {
      const recovered = sanitizeGraphViewSettings({ ...makeView(), viewport });
      expect(recovered).not.toHaveProperty("viewport");
      expect(recovered?.selectedSkillId).toBe("full-front-lever");
    }
    for (const zoom of [0.06, 1.8])
      expect(
        sanitizeGraphViewSettings({
          ...makeView(),
          viewport: { x: -1_000_000, y: 1_000_000, zoom },
        })?.viewport?.zoom,
      ).toBe(zoom);
  });

  it("validates branches against the chosen category and rejects malformed required settings", () => {
    expect(sanitizeGraphViewSettings(makeView({ group: "all" }))?.branch).toBe(
      "front-lever",
    );
    expect(sanitizeGraphViewSettings(makeView({ branch: "all" }))?.branch).toBe(
      "all",
    );
    for (const changes of [
      { group: "fake" },
      { branch: "fake" },
      { group: "push" },
      { query: null },
      { maxDifficulty: 0 },
      { maxDifficulty: 18 },
      { maxDifficulty: 4.5 },
      { maxDifficulty: NaN },
      { highlightPath: "true" },
      { availableOnly: 1 },
    ])
      expect(
        sanitizeGraphViewSettings({ ...makeView(), ...changes }),
      ).toBeNull();
  });

  it("bounds local strings and bookmark counts while preserving order", () => {
    const view = makeView({
      name: "  " + "N".repeat(100) + "  ",
      query: "Q".repeat(200),
    });
    const recovered = sanitizeSavedGraphViews([view])[0];
    expect(recovered.name).toHaveLength(GRAPH_VIEW_NAME_MAX_LENGTH);
    expect(recovered.query).toHaveLength(GRAPH_VIEW_QUERY_MAX_LENGTH);
    const entries = Array.from({ length: GRAPH_VIEW_LIMIT + 5 }, (_, index) =>
      makeView({ id: `view-${index}`, name: `View ${index}` }),
    );
    expect(sanitizeSavedGraphViews(entries)).toEqual(
      entries.slice(0, GRAPH_VIEW_LIMIT),
    );
    expect(
      parseProfile(
        JSON.stringify({ ...createDemoProfile(), savedGraphViews: [] }),
      ),
    ).not.toHaveProperty("savedGraphViews");
    expect(
      parseProfile(JSON.stringify(createDemoProfile())),
    ).not.toHaveProperty("savedGraphViews");
  });
});

describe("saved graph view edits", () => {
  it("saves an independent normalized bookmark without changing training data", () => {
    const profile = createDemoProfile();
    profile.weeklySchedule = { monday: ["push-up"] };
    const snapshot = structuredClone(profile);
    const view = makeView({ name: "  Pull progression  " });
    const saved = saveGraphView(profile, view);
    expect(saved.savedGraphViews).toEqual([makeView()]);
    expect(profile).toEqual(snapshot);
    expect(saved.savedGraphViews?.[0]).not.toBe(view);
    expect(saved.savedGraphViews?.[0].viewport).not.toBe(view.viewport);
    for (const key of [
      "progress",
      "personalRecords",
      "goals",
      "equipment",
      "archivedSkills",
      "practiceLog",
      "weeklySchedule",
    ] as const)
      expect(saved[key]).toBe(profile[key]);
  });

  it("rejects duplicate IDs/names, invalid settings, and additions over the limit", () => {
    const profile = saveGraphView(createDemoProfile(), makeView());
    for (const view of [
      makeView({ name: "New name" }),
      makeView({ id: "other", name: "pull PROGRESSION" }),
      makeView({ id: "other", name: " " }),
      makeView({ id: "other", name: "N".repeat(61) }),
      makeView({ id: "bad id", name: "Other" }),
      makeView({ id: "other", name: "Other", selectedSkillId: "constructor" }),
      makeView({ id: "other", name: "Other", query: "Q".repeat(161) }),
    ])
      expect(saveGraphView(profile, view)).toBe(profile);
    const full = {
      ...profile,
      savedGraphViews: Array.from({ length: GRAPH_VIEW_LIMIT }, (_, index) =>
        makeView({ id: `view-${index}`, name: `View ${index}` }),
      ),
    };
    expect(saveGraphView(full, makeView())).toBe(full);
  });

  it("renames only the selected view and rejects empty, duplicate, or oversized names", () => {
    const profile = saveGraphView(
      saveGraphView(createDemoProfile(), makeView()),
      makeView({ id: "second", name: "Second" }),
    );
    const renamed = renameGraphView(profile, "pull-bookmark", "  Goal path  ");
    expect(renamed.savedGraphViews?.[0]).toEqual(
      makeView({ name: "Goal path" }),
    );
    expect(renamed.savedGraphViews?.[1]).toBe(profile.savedGraphViews?.[1]);
    expect(profile.savedGraphViews?.[0].name).toBe("Pull progression");
    for (const [id, name] of [
      ["fake", "Other"],
      ["pull-bookmark", " "],
      ["pull-bookmark", "Second"],
      ["pull-bookmark", "SECOND"],
      ["pull-bookmark", "N".repeat(61)],
      ["pull-bookmark", " Pull progression "],
    ])
      expect(renameGraphView(profile, id, name)).toBe(profile);
  });

  it("removes only the selected bookmark and omits the optional field after its last removal", () => {
    const profile = saveGraphView(
      saveGraphView(createDemoProfile(), makeView()),
      makeView({ id: "second", name: "Second" }),
    );
    const removed = removeGraphView(profile, "pull-bookmark");
    expect(removed.savedGraphViews).toEqual([profile.savedGraphViews?.[1]]);
    expect(profile.savedGraphViews).toHaveLength(2);
    expect(removeGraphView(profile, "fake")).toBe(profile);
    const last = removeGraphView(removed, "second");
    expect(last).toEqual(createDemoProfile());
    expect(last).not.toHaveProperty("savedGraphViews");
  });
});

describe("saved graph view import validation", () => {
  it("accepts exact saved settings and rejects values that require local recovery", () => {
    expect(isSavedGraphViews([makeView()])).toBe(true);
    expect(isSavedGraphViews([])).toBe(true);
    for (const value of [
      null,
      {},
      [makeView(), makeView()],
      [makeView(), makeView({ id: "other", name: "PULL PROGRESSION" })],
      [makeView({ name: " Pull progression " })],
      [makeView({ name: "N".repeat(61) })],
      [makeView({ query: "Q".repeat(161) })],
      [makeView({ selectedSkillId: "one-leg-front-lever" })],
      [{ ...makeView(), viewport: null }],
      [{ ...makeView(), selectedSkillId: undefined }],
      Array.from({ length: GRAPH_VIEW_LIMIT + 1 }, (_, index) =>
        makeView({ id: `view-${index}`, name: `View ${index}` }),
      ),
    ])
      expect(isSavedGraphViews(value)).toBe(false);
  });
});
