"use client";

import { useSyncExternalStore } from "react";
import {
  ACCESSIBILITY_STORAGE_KEY,
  DEFAULT_ACCESSIBILITY_PREFERENCES,
  getReducedMotion,
  parseAccessibilityPreferences,
  sanitizeAccessibilityPreferences,
  type AccessibilityPreferences,
} from "@/lib/accessibility";

interface AccessibilitySnapshot {
  preferences: AccessibilityPreferences;
  hydrated: boolean;
  storageAvailable: boolean;
  reducedMotion: boolean;
}

const serverSnapshot: AccessibilitySnapshot = {
  preferences: DEFAULT_ACCESSIBILITY_PREFERENCES,
  hydrated: false,
  storageAvailable: true,
  reducedMotion: false,
};
let snapshot = serverSnapshot;
const listeners = new Set<() => void>();
let media: MediaQueryList | null = null;

function publish(
  preferences: AccessibilityPreferences,
  storageAvailable = snapshot.storageAvailable,
) {
  const reducedMotion = getReducedMotion(preferences, media?.matches ?? false);
  const root = document.documentElement;
  root.dataset.reducedMotion = String(reducedMotion);
  root.dataset.contrast = preferences.contrast;
  root.dataset.textSize = preferences.textSize;
  const previous = snapshot;
  if (
    previous.hydrated &&
    previous.storageAvailable === storageAvailable &&
    previous.reducedMotion === reducedMotion &&
    previous.preferences.motion === preferences.motion &&
    previous.preferences.contrast === preferences.contrast &&
    previous.preferences.textSize === preferences.textSize &&
    previous.preferences.skillList === preferences.skillList
  )
    return;
  snapshot = { preferences, hydrated: true, storageAvailable, reducedMotion };
  for (const listener of listeners) listener();
}

function syncStorage(event: StorageEvent) {
  if (event.key !== ACCESSIBILITY_STORAGE_KEY && event.key !== null) return;
  try {
    if (event.storageArea && event.storageArea !== window.localStorage) return;
  } catch {
    // Storage can become unavailable while the page is open.
  }
  publish(
    parseAccessibilityPreferences(event.key === null ? null : event.newValue),
  );
}

function syncSystemMotion() {
  if (snapshot.preferences.motion === "system") publish(snapshot.preferences);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) {
    try {
      media = window.matchMedia("(prefers-reduced-motion: reduce)");
      media.addEventListener("change", syncSystemMotion);
    } catch {
      media = null;
    }
    let preferences = DEFAULT_ACCESSIBILITY_PREFERENCES;
    let storageAvailable = true;
    try {
      preferences = parseAccessibilityPreferences(
        window.localStorage.getItem(ACCESSIBILITY_STORAGE_KEY),
      );
    } catch {
      storageAvailable = false;
      // Keep in-session edits if this hook remounts without storage access.
      preferences = snapshot.preferences;
    }
    window.addEventListener("storage", syncStorage);
    publish(preferences, storageAvailable);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      window.removeEventListener("storage", syncStorage);
      media?.removeEventListener("change", syncSystemMotion);
      media = null;
    }
  };
}

function setPreference<K extends keyof AccessibilityPreferences>(
  key: K,
  value: AccessibilityPreferences[K],
) {
  // Reject unknown keys even if a runtime caller bypasses the TypeScript type.
  if (!Object.hasOwn(DEFAULT_ACCESSIBILITY_PREFERENCES, key)) return;
  const preferences = sanitizeAccessibilityPreferences({
    ...snapshot.preferences,
    [key]: value,
  });
  let storageAvailable = snapshot.storageAvailable;
  try {
    window.localStorage.setItem(
      ACCESSIBILITY_STORAGE_KEY,
      JSON.stringify(preferences),
    );
    storageAvailable = true;
  } catch {
    storageAvailable = false;
  }
  publish(preferences, storageAvailable);
}

function resetPreferences() {
  let storageAvailable = snapshot.storageAvailable;
  try {
    window.localStorage.removeItem(ACCESSIBILITY_STORAGE_KEY);
    storageAvailable = true;
  } catch {
    storageAvailable = false;
  }
  publish({ ...DEFAULT_ACCESSIBILITY_PREFERENCES }, storageAvailable);
}

export function useAccessibility() {
  const state = useSyncExternalStore(
    subscribe,
    () => snapshot,
    () => serverSnapshot,
  );
  return { ...state, setPreference, resetPreferences };
}
