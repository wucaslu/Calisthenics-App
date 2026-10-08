import { runInNewContext } from "node:vm";
import { describe, expect, it } from "vitest";
import {
  ACCESSIBILITY_INIT_SCRIPT,
  ACCESSIBILITY_STORAGE_KEY,
  DEFAULT_ACCESSIBILITY_PREFERENCES,
  getReducedMotion,
  parseAccessibilityPreferences,
  sanitizeAccessibilityPreferences,
} from "@/lib/accessibility";

function beforeFirstPaint(
  raw: string | null,
  { systemReducedMotion = false, blocked = false, mediaBlocked = false } = {},
) {
  const dataset: Record<string, string> = {};
  runInNewContext(ACCESSIBILITY_INIT_SCRIPT, {
    document: { documentElement: { dataset } },
    localStorage: {
      getItem(key: string) {
        expect(key).toBe(ACCESSIBILITY_STORAGE_KEY);
        if (blocked) throw new Error("Storage unavailable");
        return raw;
      },
    },
    window: {
      matchMedia(query: string) {
        expect(query).toBe("(prefers-reduced-motion: reduce)");
        if (mediaBlocked) throw new Error("Media unavailable");
        return { matches: systemReducedMotion };
      },
    },
  });
  return dataset;
}

describe("accessibility preference recovery", () => {
  it("starts with standard appearance, a graph, and the system motion preference", () => {
    expect(parseAccessibilityPreferences(null)).toEqual({
      motion: "system",
      contrast: "standard",
      textSize: "standard",
      skillList: false,
    });
    expect(ACCESSIBILITY_STORAGE_KEY).toBe(
      "calisthenics-skill-tree:accessibility",
    );
  });

  it("round trips preferences independently of the profile and theme", () => {
    const preferences = {
      motion: "reduce",
      contrast: "high",
      textSize: "large",
      skillList: true,
    } as const;
    expect(parseAccessibilityPreferences(JSON.stringify(preferences))).toEqual(
      preferences,
    );
  });

  it("recovers invalid or missing fields without discarding valid choices", () => {
    expect(
      sanitizeAccessibilityPreferences({
        motion: "always",
        contrast: "high",
        textSize: 2,
        skillList: "true",
        theme: "light",
        progress: { "push-up": "mastered" },
      }),
    ).toEqual({
      motion: "system",
      contrast: "high",
      textSize: "standard",
      skillList: false,
    });
    expect(sanitizeAccessibilityPreferences({ textSize: "large" })).toEqual({
      ...DEFAULT_ACCESSIBILITY_PREFERENCES,
      textSize: "large",
    });
  });

  it("recovers corrupt JSON, arrays, and primitive values safely", () => {
    for (const raw of [
      "{",
      "null",
      "true",
      "42",
      '"large"',
      '[{"contrast":"high"}]',
    ]) {
      expect(parseAccessibilityPreferences(raw)).toEqual(
        DEFAULT_ACCESSIBILITY_PREFERENCES,
      );
    }
    const recovered = parseAccessibilityPreferences("{");
    recovered.contrast = "high";
    expect(DEFAULT_ACCESSIBILITY_PREFERENCES.contrast).toBe("standard");
  });

  it("ignores malicious and unknown fields without modifying object prototypes", () => {
    expect(
      parseAccessibilityPreferences(
        '{"__proto__":{"polluted":true},"constructor":{"contrast":"high"},"skillList":true}',
      ),
    ).toEqual({
      ...DEFAULT_ACCESSIBILITY_PREFERENCES,
      skillList: true,
    });
    expect(Object.hasOwn({}, "polluted")).toBe(false);
  });

  it("honors the OS preference and keeps explicitly reduced motion on", () => {
    expect(getReducedMotion(DEFAULT_ACCESSIBILITY_PREFERENCES, false)).toBe(
      false,
    );
    expect(getReducedMotion(DEFAULT_ACCESSIBILITY_PREFERENCES, true)).toBe(
      true,
    );
    expect(
      getReducedMotion(
        { ...DEFAULT_ACCESSIBILITY_PREFERENCES, motion: "reduce" },
        false,
      ),
    ).toBe(true);
    expect(
      getReducedMotion(
        { ...DEFAULT_ACCESSIBILITY_PREFERENCES, motion: "reduce" },
        true,
      ),
    ).toBe(true);
  });
});

describe("accessibility before first paint", () => {
  it("applies saved preferences before hydration", () => {
    expect(
      beforeFirstPaint(
        JSON.stringify({
          motion: "reduce",
          contrast: "high",
          textSize: "large",
        }),
      ),
    ).toEqual({
      reducedMotion: "true",
      contrast: "high",
      textSize: "large",
    });
  });

  it("honors system motion even when storage is blocked", () => {
    expect(
      beforeFirstPaint(null, { blocked: true, systemReducedMotion: true }),
    ).toEqual({
      reducedMotion: "true",
      contrast: "standard",
      textSize: "standard",
    });
  });

  it("recovers corrupt preferences and unavailable media APIs", () => {
    expect(beforeFirstPaint("{", { mediaBlocked: true })).toEqual({
      reducedMotion: "false",
      contrast: "standard",
      textSize: "standard",
    });
  });

  it("matches runtime validation for malformed preferences", () => {
    for (const raw of [
      null,
      "{",
      "null",
      "true",
      "42",
      '"large"',
      '[{"contrast":"high"}]',
      '{"motion":"fast","contrast":"high","textSize":{},"skillList":true}',
      '{"__proto__":{"motion":"reduce"},"textSize":"large"}',
    ]) {
      const preferences = parseAccessibilityPreferences(raw);
      for (const systemReducedMotion of [false, true]) {
        expect(beforeFirstPaint(raw, { systemReducedMotion })).toEqual({
          reducedMotion: String(
            getReducedMotion(preferences, systemReducedMotion),
          ),
          contrast: preferences.contrast,
          textSize: preferences.textSize,
        });
      }
    }
  });
});
