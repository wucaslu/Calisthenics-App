"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createDemoProfile,
  parseProfile,
  STORAGE_KEY,
  updatePersonalRecord,
  savePracticeToProfile,
  deletePracticeFromProfile,
} from "@/lib/profile";
import { updateSkillProgress } from "@/lib/progression";
import {
  addScheduledSkill as addToSchedule,
  removeScheduledSkill as removeFromSchedule,
} from "@/lib/schedule";
import { skillById } from "@/data/skills";
import type {
  Equipment,
  UserProfile,
  PracticeEntry,
  Weekday,
} from "@/types/skill";

export function useProgress() {
  const [profile, setProfile] = useState<UserProfile>(createDemoProfile);
  const [hydrated, setHydrated] = useState(false);
  const [storageAvailable, setStorageAvailable] = useState(true);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) setProfile(parseProfile(raw) ?? createDemoProfile());
      } catch {
        setStorageAvailable(false);
      }
      setHydrated(true);
    });
    const sync = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY)
        setProfile(
          event.newValue
            ? (parseProfile(event.newValue) ?? createDemoProfile())
            : createDemoProfile(),
        );
    };
    window.addEventListener("storage", sync);
    return () => {
      active = false;
      window.removeEventListener("storage", sync);
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch {
      queueMicrotask(() => setStorageAvailable(false));
    }
  }, [profile, hydrated]);

  const setSkillProgress = useCallback(
    (id: string, action: "training" | "mastered" | "reset") => {
      setProfile((previous) => ({
        ...previous,
        progress: updateSkillProgress(previous.progress, id, action),
      }));
    },
    [],
  );
  const toggleGoal = useCallback((id: string) => {
    if (!skillById[id]) return;
    setProfile((previous) => ({
      ...previous,
      goals: previous.goals.includes(id)
        ? previous.goals.filter((goal) => goal !== id)
        : [...previous.goals, id],
    }));
  }, []);
  const setPersonalRecord = useCallback((id: string, value: string) => {
    setProfile((previous) => ({
      ...previous,
      personalRecords: updatePersonalRecord(
        previous.personalRecords,
        id,
        value,
      ),
    }));
  }, []);
  const toggleEquipment = useCallback((item: Equipment) => {
    if (item === "floor") return;
    setProfile((previous) => ({
      ...previous,
      equipment: previous.equipment.includes(item)
        ? previous.equipment.filter((value) => value !== item)
        : [...previous.equipment, item],
    }));
  }, []);
  const restoreDemo = useCallback(() => setProfile(createDemoProfile()), []);
  const restoreProfile = useCallback(
    (next: UserProfile): boolean => {
      if (!hydrated) return false;
      try {
        // Persist before replacing state so a storage failure keeps the old profile.
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        setProfile(next);
        setStorageAvailable(true);
        return true;
      } catch {
        setStorageAvailable(false);
        return false;
      }
    },
    [hydrated],
  );
  const savePractice = useCallback((entry: PracticeEntry) => {
    setProfile((previous) => savePracticeToProfile(previous, entry));
  }, []);
  const deletePractice = useCallback((id: string) => {
    setProfile((previous) => deletePracticeFromProfile(previous, id));
  }, []);
  const addScheduledSkill = useCallback((day: Weekday, skillId: string) => {
    setProfile((previous) => addToSchedule(previous, day, skillId));
  }, []);
  const removeScheduledSkill = useCallback((day: Weekday, skillId: string) => {
    setProfile((previous) => removeFromSchedule(previous, day, skillId));
  }, []);
  return {
    profile,
    hydrated,
    storageAvailable,
    setSkillProgress,
    setPersonalRecord,
    toggleGoal,
    toggleEquipment,
    restoreDemo,
    restoreProfile,
    savePractice,
    deletePractice,
    addScheduledSkill,
    removeScheduledSkill,
  };
}
