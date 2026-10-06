"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Check,
  ChevronRight,
  Compass,
  Dumbbell,
  GitBranch,
  LayoutDashboard,
  Menu,
  RotateCcw,
  Search,
  ShieldCheck,
  Target,
  X,
} from "lucide-react";
import { BrandMark, SkillIcon } from "@/components/ui";
import { SkillTree } from "@/components/SkillTree/SkillTree";
import { SkillDetails } from "@/components/SkillDetails/SkillDetails";
import { Dashboard, ProgressStats } from "@/components/Dashboard/Dashboard";
import { GoalSelector } from "@/components/GoalSelector/GoalSelector";
import { EquipmentSelector } from "@/components/EquipmentSelector/EquipmentSelector";
import { Recommendations } from "@/components/Recommendations";
import { categories, categoryLabels, skillById, skills } from "@/data/skills";
import { useProgress } from "@/hooks/useProgress";
import type { Branch, Category } from "@/types/skill";

type View = "tree" | "overview" | "goals" | "equipment";
const navigation = [
  { id: "tree" as const, label: "Skill tree", Icon: GitBranch },
  { id: "overview" as const, label: "Overview", Icon: LayoutDashboard },
  { id: "goals" as const, label: "My goals", Icon: Target },
  { id: "equipment" as const, label: "Equipment", Icon: Dumbbell },
];
const pageCopy = {
  tree: {
    eyebrow: "PROGRESS HAS A PATH",
    title: "Build strength. Unlock skills.",
    description:
      "Explore your potential, find your next step, and make progress your own.",
  },
  overview: {
    eyebrow: "THE BIGGER PICTURE",
    title: "Your progress, in perspective.",
    description:
      "See how far you’ve come — and where your next practice can take you.",
  },
  goals: {
    eyebrow: "TRAIN WITH INTENTION",
    title: "Choose your next milestone.",
    description:
      "Turn the skills you want into a clear, achievable path forward.",
  },
  equipment: {
    eyebrow: "YOUR TRAINING SETUP",
    title: "Big goals. Your equipment.",
    description:
      "A thoughtful practice starts with the tools you have available.",
  },
};
function subscribeDesktop(callback: () => void) {
  const media = window.matchMedia("(min-width: 768px)");
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}
const desktopSnapshot = () => window.matchMedia("(min-width: 768px)").matches;

export function AppShell() {
  const {
    profile,
    hydrated,
    storageAvailable,
    setSkillProgress,
    toggleGoal,
    toggleEquipment,
    restoreDemo,
  } = useProgress();
  const [view, setView] = useState<View>("tree");
  const [group, setGroup] = useState<Category | "all">("push");
  const [branch, setBranch] = useState<Branch | "all">("planche");
  const [query, setQuery] = useState("");
  const [highlightPath, setHighlightPath] = useState(true);
  const [selection, setSelection] = useState<string | null | undefined>(
    undefined,
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const isDesktop = useSyncExternalStore(
    subscribeDesktop,
    desktopSnapshot,
    () => false,
  );
  const selectedId =
    selection === undefined ? (isDesktop ? "tuck-planche" : null) : selection;
  const searchRef = useRef<HTMLInputElement>(null);
  const selectedSkill = selectedId ? skillById[selectedId] : null;
  const copy = pageCopy[view];

  useEffect(() => {
    const keyboard = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        searchRef.current?.focus();
      }
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", keyboard);
    return () => window.removeEventListener("keydown", keyboard);
  }, []);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 4500);
    return () => clearTimeout(timer);
  }, [notice]);

  const onClose = useCallback(() => setSelection(null), []);
  const onSelect = useCallback((id: string) => {
    setSelection(id);
    setView("tree");
  }, []);
  const onProgress = useCallback(
    (id: string, action: "training" | "mastered" | "reset") => {
      setSkillProgress(id, action);
      setNotice(
        `${skillById[id].name}: ${action === "mastered" ? "mastered. New progressions unlocked!" : action === "training" ? "added to your training." : "progress reset, including dependent skills."}`,
      );
    },
    [setSkillProgress],
  );
  const navigate = (next: View) => {
    setView(next);
    setMenuOpen(false);
    if (next !== "tree") setSelection(null);
  };
  const selectGroup = (next: Category | "all") => {
    setGroup(next);
    setBranch("all");
    setQuery("");
    setView("tree");
    setMenuOpen(false);
  };
  const exploreGoal = (id: string) => {
    const skill = skillById[id];
    setGroup(skill.category);
    setBranch(skill.branch);
    setQuery("");
    setSelection(id);
    setView("tree");
  };

  return (
    <div className="app-shell">
      {menuOpen && (
        <button
          className="sidebar-backdrop"
          aria-label="Close navigation"
          onClick={() => setMenuOpen(false)}
        />
      )}
      <aside
        className={`sidebar ${menuOpen ? "open" : ""}`}
        aria-label="Main navigation"
        inert={!isDesktop && !menuOpen}
        aria-hidden={!isDesktop && !menuOpen}
      >
        <Link
          className="brand"
          href="/"
          aria-label="Calisthenics Skill Tree home"
        >
          <BrandMark />
          <span>
            CALISTHENICS<small>SKILL TREE</small>
          </span>
        </Link>
        <span className="sidebar-label">YOUR WORKSPACE</span>
        <nav>
          {navigation.map(({ id, label, Icon }) => (
            <button
              key={id}
              className={`nav-item ${view === id ? "active" : ""}`}
              onClick={() => navigate(id)}
              aria-current={view === id ? "page" : undefined}
            >
              <Icon size={18} strokeWidth={1.7} />
              <span>{label}</span>
              {id === "goals" && (
                <span className="nav-count">{profile.goals.length}</span>
              )}
              {view === id && <span className="nav-active-dot" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-groups">
          <span className="sidebar-label">SKILL GROUPS</span>
          {categories.map((category) => (
            <button
              key={category}
              className={`group-nav ${view === "tree" && group === category ? "active" : ""}`}
              onClick={() => selectGroup(category)}
              aria-label={`Show ${categoryLabels[category]} skills`}
              aria-pressed={view === "tree" && group === category}
            >
              <SkillIcon category={category} size={17} />
              <span>{categoryLabels[category]}</span>
              <span>
                {skills.filter((skill) => skill.category === category).length}
              </span>
            </button>
          ))}
        </div>
        <div className="sidebar-bottom">
          <div className="journey-card">
            <Compass size={22} />
            <h3>It’s your journey.</h3>
            <p>
              Build consistency.
              <br />
              The skills will follow.
            </p>
            <button onClick={() => navigate("goals")}>
              Find your direction
              <ArrowUpRight size={13} />
            </button>
          </div>
          <div className="local-profile">
            <span className="profile-avatar">YOU</span>
            <div>
              <strong>Your training space</strong>
              <span>
                <i />
                Local profile
              </span>
            </div>
          </div>
          <button
            className="restore-demo"
            onClick={() => {
              if (
                window.confirm(
                  "Restore the demo profile? This replaces your saved progress, goals, and equipment on this device.",
                )
              ) {
                restoreDemo();
                setNotice("Demo profile restored.");
              }
            }}
            disabled={!hydrated}
          >
            <RotateCcw size={11} />
            Restore demo
          </button>
        </div>
      </aside>
      <div className="app-main">
        <header className="topbar">
          <div className="topbar-location">
            <button
              className="icon-button menu-button"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-expanded={menuOpen}
              aria-label="Toggle navigation"
            >
              <Menu size={20} />
            </button>
            <span className="location-workspace">Workspace</span>
            <ChevronRight size={12} />
            <strong>
              {navigation.find((item) => item.id === view)?.label}
            </strong>
          </div>
          <label className="search-field global-search">
            <Search size={15} />
            <input
              ref={searchRef}
              aria-label="Search all skills"
              placeholder="Find a skill..."
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setView("tree");
                setGroup("all");
                setBranch("all");
              }}
            />
            <kbd>⌘ K</kbd>
            {query && (
              <button
                aria-label="Clear skill search"
                className="icon-button"
                onClick={() => setQuery("")}
              >
                <X size={13} />
              </button>
            )}
          </label>
          <span className="local-mode">
            <ShieldCheck size={14} />
            No account needed
          </span>
        </header>
        <main className="page-content">
          <div className="page-heading">
            <div>
              <span className="eyebrow">{copy.eyebrow}</span>
              <h1>{copy.title}</h1>
              <p>{copy.description}</p>
            </div>
            {view === "tree" && (
              <button
                className="primary-button heading-goals"
                onClick={() => navigate("goals")}
              >
                <Target size={16} />
                Set your goals
                <ArrowUpRight size={15} />
              </button>
            )}
          </div>
          <ProgressStats profile={profile} />
          {view === "tree" && (
            <>
              <div
                className={`tree-layout ${selectedSkill ? "with-details" : ""}`}
              >
                <SkillTree
                  profile={profile}
                  group={group}
                  setGroup={selectGroup}
                  branch={branch}
                  setBranch={setBranch}
                  query={query}
                  selectedId={selectedId}
                  onSelect={onSelect}
                  highlightPath={highlightPath}
                  setHighlightPath={setHighlightPath}
                />
                {selectedSkill && (
                  <SkillDetails
                    key={selectedSkill.id}
                    skill={selectedSkill}
                    profile={profile}
                    onClose={onClose}
                    onSelect={onSelect}
                    onProgress={onProgress}
                    onToggleGoal={toggleGoal}
                    hydrated={hydrated}
                  />
                )}
              </div>
              <Recommendations
                profile={profile}
                onSelect={exploreGoal}
                onEquipment={() => navigate("equipment")}
              />
            </>
          )}
          {view === "overview" && (
            <Dashboard
              profile={profile}
              onSelect={exploreGoal}
              onGoals={() => navigate("goals")}
              onEquipment={() => navigate("equipment")}
            />
          )}
          {view === "goals" && (
            <GoalSelector
              profile={profile}
              onToggle={toggleGoal}
              onSelect={exploreGoal}
              onExplore={exploreGoal}
              hydrated={hydrated}
            />
          )}
          {view === "equipment" && (
            <EquipmentSelector
              profile={profile}
              onToggle={toggleEquipment}
              onSelect={exploreGoal}
              hydrated={hydrated}
            />
          )}
          <footer className="page-footer">
            <span>
              <ShieldCheck size={12} />
              {!hydrated
                ? "Loading your profile…"
                : storageAvailable
                  ? "Progress saved on this device"
                  : "Storage unavailable — progress lasts for this session"}
            </span>
            <span>{skills.length} skills. Four groups. Endless potential.</span>
          </footer>
        </main>
      </div>
      <div className="notice-region" role="status" aria-live="polite">
        {notice && (
          <div className="notice">
            <Check size={17} />
            <span>{notice}</span>
            <button
              className="icon-button"
              aria-label="Dismiss notification"
              onClick={() => setNotice(null)}
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
