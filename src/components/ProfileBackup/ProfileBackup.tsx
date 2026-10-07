"use client";

import { useRef, useState } from "react";
import { Download, Upload } from "lucide-react";
import { getLocalToday } from "@/lib/practice";
import {
  createProfileBackup,
  PROFILE_BACKUP_MAX_BYTES,
  readProfileBackup,
} from "@/lib/profileBackup";
import type { UserProfile } from "@/types/skill";
import styles from "./ProfileBackup.module.css";

export function ProfileBackup({
  profile,
  hydrated,
  storageAvailable,
  onRestore,
}: {
  profile: UserProfile;
  hydrated: boolean;
  storageAvailable: boolean;
  onRestore: (profile: UserProfile) => boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  function exportBackup() {
    let url: string | undefined;
    try {
      url = URL.createObjectURL(
        new Blob([createProfileBackup(profile)], { type: "application/json" }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = `calisthenics-profile-${getLocalToday()}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setError(false);
      setMessage(
        "Profile backup exported. Keep the JSON file to restore your progress in another browser or the desktop app.",
      );
    } catch {
      setError(true);
      setMessage(
        "The backup could not be exported. Your current profile has not changed.",
      );
    } finally {
      if (url) {
        const backupUrl = url;
        setTimeout(() => URL.revokeObjectURL(backupUrl), 10_000);
      }
    }
  }

  async function importBackup(file: File) {
    setBusy(true);
    setMessage("");
    try {
      if (file.size > PROFILE_BACKUP_MAX_BYTES)
        throw new Error("Choose a profile backup smaller than 5 MB.");
      const restored = readProfileBackup(await file.text());
      const confirmed = window.confirm(
        "Import this profile backup? This replaces your current progress, personal records, practice log, goals, equipment, and archived records on this device. Export your current profile first if you want to keep it.",
      );
      if (!confirmed) {
        setError(false);
        setMessage("Import cancelled. Your current profile has not changed.");
        return;
      }
      if (!onRestore(restored))
        throw new Error(
          "The imported profile could not be saved on this device. Your current profile has not changed.",
        );
      setError(false);
      setMessage("Profile imported and saved on this device.");
    } catch (problem) {
      setError(true);
      const explanation =
        problem instanceof Error
          ? problem.message
          : "The backup could not be imported.";
      setMessage(
        explanation.includes("has not changed")
          ? explanation
          : `${explanation} Your current profile has not changed.`,
      );
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <section
      className={`surface-panel ${styles.panel}`}
      aria-labelledby="profile-backup-title"
    >
      <div className="panel-heading">
        <h2 id="profile-backup-title">Profile backup</h2>
      </div>
      <p className="muted-copy">
        Export your progress, personal records, practice log, goals, equipment,
        and archived records. Import the JSON backup to move your profile to the
        desktop app or another browser. Import replaces the profile on this
        device.
      </p>
      <div className={styles.actions}>
        <button
          className="secondary-button"
          onClick={exportBackup}
          disabled={!hydrated || busy}
        >
          <Download size={15} /> Export JSON
        </button>
        <button
          className="secondary-button"
          onClick={() => inputRef.current?.click()}
          disabled={!hydrated || !storageAvailable || busy}
        >
          <Upload size={15} /> {busy ? "Reading backup…" : "Import JSON"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="application/json,.json"
          aria-label="Choose profile backup JSON"
          hidden
          disabled={!hydrated || !storageAvailable || busy}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void importBackup(file);
          }}
        />
      </div>
      {!storageAvailable && (
        <p className="muted-copy">
          Storage is unavailable. You can export this session’s profile;
          importing requires available storage.
        </p>
      )}
      <p
        className={`${styles.message} ${error ? styles.error : ""}`}
        role="status"
        aria-live="polite"
      >
        {message}
      </p>
    </section>
  );
}
