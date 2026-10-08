"use client";

import { useId, useState } from "react";
import { Bookmark, Check, Pencil, Play, Plus, Trash2, X } from "lucide-react";
import { branchLabels, categoryLabels, skillById } from "@/data/skills";
import { GRAPH_VIEW_LIMIT, GRAPH_VIEW_NAME_MAX_LENGTH } from "@/lib/graphViews";
import type { GraphViewSettings, SavedGraphView } from "@/types/skill";
import styles from "./SavedGraphViews.module.css";

interface SavedGraphViewsProps {
  views: SavedGraphView[];
  currentView: GraphViewSettings;
  hydrated: boolean;
  storageAvailable: boolean;
  onSave: (view: SavedGraphView) => void;
  onLoad: (view: SavedGraphView) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}

function summarizeView(view: GraphViewSettings) {
  return [
    view.group === "all" ? "All groups" : categoryLabels[view.group],
    view.branch === "all" ? "All branches" : branchLabels[view.branch],
    `Up to level ${view.maxDifficulty}`,
    view.availableOnly ? "Available only" : "All skill states",
    view.highlightPath ? "Goal paths highlighted" : "Goal paths off",
  ].join(" · ");
}

export function SavedGraphViews({
  views,
  currentView,
  hydrated,
  storageAvailable,
  onSave,
  onLoad,
  onRename,
  onDelete,
}: SavedGraphViewsProps) {
  const id = useId();
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedName, setEditedName] = useState("");
  const [message, setMessage] = useState("");
  const [saveError, setSaveError] = useState("");
  const [renameError, setRenameError] = useState("");
  const editingView = views.find((view) => view.id === editingId);
  const atLimit = views.length >= GRAPH_VIEW_LIMIT;

  function validateName(value: string, exceptId?: string) {
    const trimmed = value.trim();
    if (!trimmed) return "Enter a name for this view.";
    if (trimmed.length > GRAPH_VIEW_NAME_MAX_LENGTH) {
      return `Use ${GRAPH_VIEW_NAME_MAX_LENGTH} characters or fewer.`;
    }
    if (
      views.some(
        (view) =>
          view.id !== exceptId &&
          view.name.toLowerCase() === trimmed.toLowerCase(),
      )
    ) {
      return "A view with this name already exists. Choose another name.";
    }
    return "";
  }

  function saveView(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!hydrated) return;
    const error = atLimit
      ? `You can save up to ${GRAPH_VIEW_LIMIT} views. Delete a view to make room.`
      : validateName(name);
    if (error) {
      setSaveError(error);
      setMessage("");
      return;
    }
    const trimmedName = name.trim();
    const viewId =
      globalThis.crypto?.randomUUID?.() ??
      `view-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    onSave({ ...currentView, id: viewId, name: trimmedName });
    setName("");
    setSaveError("");
    setMessage(`Saved ${trimmedName}.`);
  }

  function renameView(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!hydrated || !editingView) return;
    const error = validateName(editedName, editingView.id);
    if (error) {
      setRenameError(error);
      setMessage("");
      return;
    }
    const trimmedName = editedName.trim();
    onRename(editingView.id, trimmedName);
    setEditingId(null);
    setRenameError("");
    setMessage(`Renamed ${editingView.name} to ${trimmedName}.`);
  }

  return (
    <section
      className={`surface-panel ${styles.panel}`}
      aria-labelledby={`${id}-title`}
    >
      <div className={styles.heading}>
        <h2 id={`${id}-title`}>
          <Bookmark size={18} aria-hidden="true" /> Saved graph views
        </h2>
        <span className={styles.count}>
          {views.length} / {GRAPH_VIEW_LIMIT}
        </span>
      </div>
      <p className={styles.description}>
        Save your filters, selected skill, and graph position to return to a
        view later. Loading a view uses your current skill progress.
      </p>
      {!storageAvailable && (
        <p className={styles.warning}>
          Browser storage is unavailable. Saved views last for this session.
          Export your profile to keep them.
        </p>
      )}
      <form onSubmit={saveView} className={styles.saveForm}>
        <label className={styles.nameField}>
          Saved view name
          <input
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setSaveError("");
            }}
            maxLength={GRAPH_VIEW_NAME_MAX_LENGTH}
            disabled={!hydrated || atLimit}
            placeholder="For example, Push foundations"
            aria-invalid={saveError ? true : undefined}
            aria-describedby={saveError ? `${id}-save-error` : undefined}
          />
        </label>
        <button
          className={styles.saveButton}
          type="submit"
          disabled={!hydrated || atLimit}
        >
          <Plus size={16} aria-hidden="true" /> Save current view
        </button>
      </form>
      {saveError && (
        <p id={`${id}-save-error`} className={styles.warning} role="alert">
          {saveError}
        </p>
      )}
      {atLimit && (
        <p className={styles.limit}>
          You have {GRAPH_VIEW_LIMIT} saved views. Delete a view to make room
          for another.
        </p>
      )}

      {views.length ? (
        <ul className={styles.views} aria-label="Saved graph views">
          {views.map((view) => (
            <li key={view.id} className={styles.view}>
              <div className={styles.viewInfo}>
                <h3>{view.name}</h3>
                <p className={styles.summary}>{summarizeView(view)}</p>
                {view.query && (
                  <p className={styles.detail}>Search: {view.query}</p>
                )}
                {view.selectedSkillId && skillById[view.selectedSkillId] && (
                  <p className={styles.detail}>
                    Selected skill: {skillById[view.selectedSkillId].name}
                  </p>
                )}
              </div>
              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.actionButton}
                  aria-label={`Load ${view.name}`}
                  disabled={!hydrated}
                  onClick={() => {
                    onLoad(view);
                    setMessage(`Loaded ${view.name}.`);
                  }}
                >
                  <Play size={14} aria-hidden="true" /> Load
                </button>
                <button
                  type="button"
                  className={styles.actionButton}
                  aria-label={`Rename ${view.name}`}
                  disabled={!hydrated}
                  onClick={() => {
                    setEditingId(view.id);
                    setEditedName(view.name);
                    setRenameError("");
                    setMessage("");
                  }}
                >
                  <Pencil size={14} aria-hidden="true" /> Rename
                </button>
                <button
                  type="button"
                  className={styles.actionButton}
                  aria-label={`Delete ${view.name}`}
                  disabled={!hydrated}
                  onClick={() => {
                    onDelete(view.id);
                    if (editingId === view.id) setEditingId(null);
                    setMessage(`Deleted ${view.name}.`);
                  }}
                >
                  <Trash2 size={14} aria-hidden="true" /> Delete
                </button>
              </div>
              {editingView?.id === view.id && (
                <form className={styles.renameForm} onSubmit={renameView}>
                  <label className={styles.nameField}>
                    New name for {view.name}
                    <input
                      value={editedName}
                      onChange={(event) => {
                        setEditedName(event.target.value);
                        setRenameError("");
                      }}
                      maxLength={GRAPH_VIEW_NAME_MAX_LENGTH}
                      disabled={!hydrated}
                      aria-invalid={renameError ? true : undefined}
                      aria-describedby={
                        renameError ? `${id}-rename-error` : undefined
                      }
                    />
                  </label>
                  <div className={styles.actions}>
                    <button
                      type="submit"
                      className={styles.saveButton}
                      disabled={!hydrated}
                    >
                      <Check size={14} aria-hidden="true" /> Save name
                    </button>
                    <button
                      type="button"
                      className={styles.actionButton}
                      onClick={() => {
                        setEditingId(null);
                        setRenameError("");
                      }}
                    >
                      <X size={14} aria-hidden="true" /> Cancel rename
                    </button>
                  </div>
                  {renameError && (
                    <p
                      id={`${id}-rename-error`}
                      className={styles.renameError}
                      role="alert"
                    >
                      {renameError}
                    </p>
                  )}
                </form>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.empty}>
          No saved views yet. Set the tree filters below, then save the view.
        </p>
      )}
      <p
        className={styles.status}
        role="status"
        aria-label="Saved views status"
        aria-live="polite"
      >
        {message}
      </p>
    </section>
  );
}
