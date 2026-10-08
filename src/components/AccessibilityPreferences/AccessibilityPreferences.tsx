"use client";

import { Accessibility, RotateCcw } from "lucide-react";
import type { AccessibilityPreferences as Preferences } from "@/lib/accessibility";
import styles from "./AccessibilityPreferences.module.css";

interface Props {
  preferences: Preferences;
  hydrated: boolean;
  storageAvailable: boolean;
  reducedMotion: boolean;
  onChange: <K extends keyof Preferences>(
    key: K,
    value: Preferences[K],
  ) => void;
  onReset: () => void;
}

export function AccessibilityPreferences({
  preferences,
  hydrated,
  storageAvailable,
  reducedMotion,
  onChange,
  onReset,
}: Props) {
  return (
    <section
      className={`panel ${styles.preferences}`}
      aria-labelledby="accessibility-title"
    >
      <div className={styles.heading}>
        <div>
          <h2 id="accessibility-title">
            <Accessibility size={19} /> Accessibility preferences
          </h2>
          <p>Choose how the app looks and how you explore skills.</p>
        </div>
        <button
          type="button"
          className={styles.reset}
          disabled={!hydrated}
          onClick={onReset}
        >
          <RotateCcw size={14} /> Reset accessibility preferences
        </button>
      </div>

      <fieldset disabled={!hydrated} className={styles.fields}>
        <legend className={styles.srOnly}>Accessibility options</legend>
        <div className={styles.option}>
          <label htmlFor="accessibility-motion">Motion</label>
          <select
            id="accessibility-motion"
            value={preferences.motion}
            onChange={(event) =>
              onChange("motion", event.target.value as Preferences["motion"])
            }
            aria-describedby="accessibility-motion-description"
          >
            <option value="system">Use system preference</option>
            <option value="reduce">Reduce motion</option>
          </select>
          <p id="accessibility-motion-description">
            Limit animations and use instant movement in the skill tree.
          </p>
          <p className={styles.status} role="status">
            {preferences.motion === "system"
              ? `System preference: ${reducedMotion ? "reduced motion" : "standard motion"}.`
              : "Reduced motion is on."}
          </p>
        </div>
        <div className={styles.option}>
          <label htmlFor="accessibility-contrast">Contrast</label>
          <select
            id="accessibility-contrast"
            value={preferences.contrast}
            onChange={(event) =>
              onChange(
                "contrast",
                event.target.value as Preferences["contrast"],
              )
            }
            aria-describedby="accessibility-contrast-description"
          >
            <option value="standard">Standard</option>
            <option value="high">High</option>
          </select>
          <p id="accessibility-contrast-description">
            Make text, controls, and skill connections easier to distinguish in
            either theme.
          </p>
        </div>
        <div className={styles.option}>
          <label htmlFor="accessibility-text-size">Text size</label>
          <select
            id="accessibility-text-size"
            value={preferences.textSize}
            onChange={(event) =>
              onChange(
                "textSize",
                event.target.value as Preferences["textSize"],
              )
            }
            aria-describedby="accessibility-text-description"
          >
            <option value="standard">Standard</option>
            <option value="large">Large</option>
          </select>
          <p id="accessibility-text-description">
            Increase text throughout the app, including skill cards and
            descriptions.
          </p>
        </div>
        <div className={`${styles.option} ${styles.listOption}`}>
          <label className={styles.checkbox} htmlFor="accessibility-skill-list">
            <input
              id="accessibility-skill-list"
              type="checkbox"
              checked={preferences.skillList}
              onChange={(event) => onChange("skillList", event.target.checked)}
              aria-describedby="accessibility-list-description"
            />
            <span>Use a skill list on desktop</span>
          </label>
          <p id="accessibility-list-description">
            Browse skill cards in a list instead of the graph. Filters, skill
            details, and progress updates remain available.
          </p>
        </div>
      </fieldset>

      <p className={styles.hint}>
        These preferences apply to this browser. Your training progress stays
        unchanged when you reset them.
      </p>
      {!storageAvailable && (
        <p className={styles.warning}>
          Browser storage is unavailable. Preference changes will last for this
          session.
        </p>
      )}
    </section>
  );
}
