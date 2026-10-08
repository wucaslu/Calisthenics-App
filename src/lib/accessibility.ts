export interface AccessibilityPreferences {
  motion: "system" | "reduce";
  contrast: "standard" | "high";
  textSize: "standard" | "large";
  skillList: boolean;
}

export const ACCESSIBILITY_STORAGE_KEY =
  "calisthenics-skill-tree:accessibility";

export const DEFAULT_ACCESSIBILITY_PREFERENCES: AccessibilityPreferences = {
  motion: "system",
  contrast: "standard",
  textSize: "standard",
  skillList: false,
};

export function sanitizeAccessibilityPreferences(
  value: unknown,
): AccessibilityPreferences {
  if (!value || typeof value !== "object" || Array.isArray(value))
    return { ...DEFAULT_ACCESSIBILITY_PREFERENCES };
  const candidate = value as Record<string, unknown>;
  return {
    motion: candidate.motion === "reduce" ? "reduce" : "system",
    contrast: candidate.contrast === "high" ? "high" : "standard",
    textSize: candidate.textSize === "large" ? "large" : "standard",
    skillList: candidate.skillList === true,
  };
}

export function parseAccessibilityPreferences(
  raw: string | null,
): AccessibilityPreferences {
  try {
    return sanitizeAccessibilityPreferences(raw ? JSON.parse(raw) : null);
  } catch {
    return { ...DEFAULT_ACCESSIBILITY_PREFERENCES };
  }
}

export function getReducedMotion(
  preferences: AccessibilityPreferences,
  systemReducedMotion: boolean,
): boolean {
  return preferences.motion === "reduce" || systemReducedMotion;
}

// Apply preferences before the page paints, including the system motion setting
// when local storage cannot be read. This mirrors the runtime validation above.
export const ACCESSIBILITY_INIT_SCRIPT = `(function(){var p={};try{p=JSON.parse(localStorage.getItem(${JSON.stringify(ACCESSIBILITY_STORAGE_KEY)})||"null")||{}}catch(e){}var s=false;try{s=window.matchMedia("(prefers-reduced-motion: reduce)").matches}catch(e){}var d=document.documentElement.dataset;d.reducedMotion=String(p.motion==="reduce"||s);d.contrast=p.contrast==="high"?"high":"standard";d.textSize=p.textSize==="large"?"large":"standard"})()`;
