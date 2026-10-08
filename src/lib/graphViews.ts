import { branches, categories, skillById, skills } from "@/data/skills";
import type {
  Branch,
  Category,
  DifficultyLevel,
  GraphViewSettings,
  GraphViewport,
  SavedGraphView,
  UserProfile,
} from "@/types/skill";

export const GRAPH_VIEW_NAME_MAX_LENGTH = 60;
export const GRAPH_VIEW_LIMIT = 20;
export const GRAPH_VIEW_QUERY_MAX_LENGTH = 160;

const GRAPH_VIEW_ID_MAX_LENGTH = 100;
const GRAPH_VIEW_POSITION_LIMIT = 1_000_000;

function isObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function isViewport(value: unknown): value is GraphViewport {
  return (
    isObject(value) &&
    typeof value.x === "number" &&
    Number.isFinite(value.x) &&
    Math.abs(value.x) <= GRAPH_VIEW_POSITION_LIMIT &&
    typeof value.y === "number" &&
    Number.isFinite(value.y) &&
    Math.abs(value.y) <= GRAPH_VIEW_POSITION_LIMIT &&
    typeof value.zoom === "number" &&
    Number.isFinite(value.zoom) &&
    value.zoom >= 0.06 &&
    value.zoom <= 1.8
  );
}

function readGraphViewSettings(
  value: unknown,
  strict: boolean,
): GraphViewSettings | null {
  if (!isObject(value)) return null;
  const { group, branch, query, maxDifficulty, highlightPath, availableOnly } =
    value;
  if (
    (group !== "all" && !categories.includes(group as Category)) ||
    (branch !== "all" && !branches.includes(branch as Branch)) ||
    (group !== "all" &&
      branch !== "all" &&
      !skills.some(
        (skill) => skill.category === group && skill.branch === branch,
      )) ||
    typeof query !== "string" ||
    (strict && query.length > GRAPH_VIEW_QUERY_MAX_LENGTH) ||
    typeof maxDifficulty !== "number" ||
    !Number.isInteger(maxDifficulty) ||
    maxDifficulty < 1 ||
    maxDifficulty > 17 ||
    typeof highlightPath !== "boolean" ||
    typeof availableOnly !== "boolean"
  )
    return null;
  const validSelection =
    typeof value.selectedSkillId === "string" &&
    Object.hasOwn(skillById, value.selectedSkillId);
  if (strict && value.selectedSkillId !== null && !validSelection) return null;
  const viewport = value.viewport;
  const validViewport = isViewport(viewport);
  if (strict && Object.hasOwn(value, "viewport") && !validViewport) return null;
  return {
    group: group as Category | "all",
    branch: branch as Branch | "all",
    query: query.slice(0, GRAPH_VIEW_QUERY_MAX_LENGTH),
    maxDifficulty: maxDifficulty as DifficultyLevel,
    highlightPath,
    availableOnly,
    selectedSkillId: validSelection ? (value.selectedSkillId as string) : null,
    ...(validViewport
      ? {
          viewport: {
            x: viewport.x,
            y: viewport.y,
            zoom: viewport.zoom,
          },
        }
      : {}),
  };
}

/** Restore usable display settings without requiring the selected skill to be unlocked. */
export function sanitizeGraphViewSettings(
  value: unknown,
): GraphViewSettings | null {
  return readGraphViewSettings(value, false);
}

function isViewId(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value.length <= GRAPH_VIEW_ID_MAX_LENGTH &&
    /^[a-zA-Z0-9_-]+$/.test(value)
  );
}

function readSavedGraphView(
  value: unknown,
  strict: boolean,
): SavedGraphView | null {
  if (!isObject(value) || !isViewId(value.id) || typeof value.name !== "string")
    return null;
  const trimmedName = value.name.trim();
  if (
    !trimmedName ||
    (strict &&
      (trimmedName !== value.name ||
        trimmedName.length > GRAPH_VIEW_NAME_MAX_LENGTH))
  )
    return null;
  const settings = readGraphViewSettings(value, strict);
  if (!settings) return null;
  return {
    id: value.id,
    name: trimmedName.slice(0, GRAPH_VIEW_NAME_MAX_LENGTH),
    ...settings,
  };
}

/** Recover valid local bookmarks individually, preserving their order. */
export function sanitizeSavedGraphViews(value: unknown): SavedGraphView[] {
  if (!Array.isArray(value)) return [];
  const views: SavedGraphView[] = [];
  const ids = new Set<string>();
  const names = new Set<string>();
  for (const entry of value) {
    const view = readSavedGraphView(entry, false);
    if (!view || ids.has(view.id) || names.has(view.name.toLowerCase()))
      continue;
    views.push(view);
    ids.add(view.id);
    names.add(view.name.toLowerCase());
    if (views.length === GRAPH_VIEW_LIMIT) break;
  }
  return views;
}

/** Imported backups must preserve every bookmark rather than silently repair it. */
export function isSavedGraphViews(value: unknown): value is SavedGraphView[] {
  if (!Array.isArray(value) || value.length > GRAPH_VIEW_LIMIT) return false;
  const ids = new Set<string>();
  const names = new Set<string>();
  for (const entry of value) {
    const view = readSavedGraphView(entry, true);
    if (!view || ids.has(view.id) || names.has(view.name.toLowerCase()))
      return false;
    ids.add(view.id);
    names.add(view.name.toLowerCase());
  }
  return true;
}

export function saveGraphView(
  profile: UserProfile,
  view: SavedGraphView,
): UserProfile {
  // Names are normalized when a view is first created; saved settings stay exact.
  if (!isObject(view) || typeof view.name !== "string") return profile;
  const candidate = readSavedGraphView(
    { ...view, name: view.name.trim() },
    true,
  );
  const previous = profile.savedGraphViews ?? [];
  if (
    !candidate ||
    previous.length >= GRAPH_VIEW_LIMIT ||
    previous.some(
      (existing) =>
        existing.id === candidate.id ||
        existing.name.toLowerCase() === candidate.name.toLowerCase(),
    )
  )
    return profile;
  return { ...profile, savedGraphViews: [...previous, candidate] };
}

export function renameGraphView(
  profile: UserProfile,
  id: string,
  name: string,
): UserProfile {
  if (typeof name !== "string") return profile;
  const trimmedName = name.trim();
  const previous = profile.savedGraphViews ?? [];
  const target = previous.find((view) => view.id === id);
  if (
    !target ||
    !trimmedName ||
    trimmedName.length > GRAPH_VIEW_NAME_MAX_LENGTH ||
    target.name === trimmedName ||
    previous.some(
      (view) =>
        view.id !== id && view.name.toLowerCase() === trimmedName.toLowerCase(),
    )
  )
    return profile;
  return {
    ...profile,
    savedGraphViews: previous.map((view) =>
      view.id === id ? { ...view, name: trimmedName } : view,
    ),
  };
}

export function removeGraphView(profile: UserProfile, id: string): UserProfile {
  if (!profile.savedGraphViews?.some((view) => view.id === id)) return profile;
  const next = { ...profile };
  const remaining = profile.savedGraphViews.filter((view) => view.id !== id);
  if (remaining.length) next.savedGraphViews = remaining;
  else delete next.savedGraphViews;
  return next;
}
