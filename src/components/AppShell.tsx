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
  BarChart3,
  CalendarDays,
  Check,
  ChevronRight,
  Compass,
  Dumbbell,
  GitBranch,
  LayoutDashboard,
  NotebookPen,
  Menu,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  RotateCcw,
  Search,
  ShieldCheck,
  Sun,
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
import { PracticeLog } from "@/components/PracticeLog/PracticeLog";
import { TrainingAnalytics } from "@/components/TrainingAnalytics/TrainingAnalytics";
import { WeeklySchedule } from "@/components/WeeklySchedule/WeeklySchedule";
import { categories, categoryLabels, skillById, skills } from "@/data/skills";
import { useProgress } from "@/hooks/useProgress";
import { useTheme } from "@/hooks/useTheme";
import { getLocalToday, getPracticeSkillName } from "@/lib/practice";
import { MAX_DIFFICULTY } from "@/lib/difficulty";
import { getSkillState } from "@/lib/progression";
import { canScheduleSkill } from "@/lib/schedule";
import type { Branch, Category, DifficultyLevel } from "@/types/skill";

type View =
  | "tree"
  | "overview"
  | "goals"
  | "equipment"
  | "schedule"
  | "practice"
  | "analytics";
const navigation = [
  { id: "tree" as const, label: "Skill tree", Icon: GitBranch },
  { id: "overview" as const, label: "Overview", Icon: LayoutDashboard },
  { id: "schedule" as const, label: "Weekly schedule", Icon: CalendarDays },
  { id: "practice" as const, label: "Practice log", Icon: NotebookPen },
  { id: "analytics" as const, label: "Analytics", Icon: BarChart3 },
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
  practice: {
    eyebrow: "MAKE PRACTICE A HABIT",
    title: "Every session adds up.",
    description:
      "Record your holds and repetitions, follow your consistency, and see what’s improving.",
  },
  schedule: {
    eyebrow: "PLAN YOUR PRACTICE",
    title: "Plan your training week.",
    description:
      "Choose skills for Monday through Sunday and keep your weekly routine in one place.",
  },
  analytics: {
    eyebrow: "UNDERSTAND YOUR PRACTICE",
    title: "See your training take shape.",
    description:
      "Compare your weekly and monthly consistency, repetitions, and hold time.",
  },
};
function subscribeDesktop(callback: () => void) {
  const media = window.matchMedia("(min-width: 768px)");
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}
const desktopSnapshot = () => window.matchMedia("(min-width: 768px)").matches;

export function AppShell() {
  const { theme, toggleTheme } = useTheme();
  const {
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
  } = useProgress();
  const [view, setView] = useState<View>("tree");
  const [group, setGroup] = useState<Category | "all">("push");
  const [branch, setBranch] = useState<Branch | "all">("planche");
  const [query, setQuery] = useState("");
  const [maxDifficulty, setMaxDifficulty] =
    useState<DifficultyLevel>(MAX_DIFFICULTY);
  const [highlightPath, setHighlightPath] = useState(true);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [selection, setSelection] = useState<string | null | undefined>(
    undefined,
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [practiceSkillId, setPracticeSkillId] = useState<string | null>(null);
  const [analyticsSkillId, setAnalyticsSkillId] = useState("all");
  const isDesktop = useSyncExternalStore(
    subscribeDesktop,
    desktopSnapshot,
    () => false,
  );
  const selectedId =
    selection === undefined ? (isDesktop ? "tuck-planche" : null) : selection;
  const searchRef = useRef<HTMLInputElement>(null);
  const menuToggleRef = useRef<HTMLButtonElement>(null);
  const menuCloseRef = useRef<HTMLButtonElement>(null);
  const sidebarOpen = isDesktop ? !sidebarCollapsed : menuOpen;
  const selectedSkill =
    selectedId &&
    skillById[selectedId]?.difficulty <= maxDifficulty &&
    (!availableOnly ||
      getSkillState(skillById[selectedId], profile.progress) !== "locked")
      ? skillById[selectedId]
      : null;
  const copy = pageCopy[view];
  const previousLogSkills = [
    ...new Set([
      ...profile.practiceLog.map((entry) => entry.skillId),
      ...(analyticsSkillId === "all" ? [] : [analyticsSkillId]),
    ]),
  ].filter((id) => !skillById[id]);

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
    if (isDesktop || !menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    const menuToggle = menuToggleRef.current;
    document.body.style.overflow = "hidden";
    menuCloseRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      menuToggle?.focus();
    };
  }, [isDesktop, menuOpen]);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 4500);
    return () => clearTimeout(timer);
  }, [notice]);

  const onClose = useCallback(() => setSelection(null), []);
  const onSelect = useCallback(
    (id: string) => {
      const skill = skillById[id];
      if (!skill) return;
      setView("tree");
      if (skill.difficulty > maxDifficulty) {
        setSelection(null);
        setNotice(
          `${skill.name} is level ${skill.difficulty}/${MAX_DIFFICULTY}. Increase Max level to show it.`,
        );
        return;
      }
      if (
        availableOnly &&
        getSkillState(skill, profile.progress) === "locked"
      ) {
        setSelection(null);
        setNotice(`Turn off Available only to view ${skill.name}.`);
        return;
      }
      setSelection(id);
    },
    [maxDifficulty, availableOnly, profile.progress],
  );
  const onProgress = useCallback(
    (id: string, action: "training" | "mastered" | "reset") => {
      setSkillProgress(id, action);
      setNotice(
        `${skillById[id].name}: ${action === "mastered" ? "mastered. New progressions unlocked!" : action === "training" ? "added to your training." : "progress reset. Dependent skills keep progress when another route is complete."}`,
      );
    },
    [setSkillProgress],
  );
  const navigate = (next: View) => {
    setView(next);
    setMenuOpen(false);
    if (next !== "tree") setSelection(null);
    if (next === "practice") setPracticeSkillId(null);
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
    onSelect(id);
  };
  const exploreScheduledSkill = (id: string) => {
    const skill = skillById[id];
    if (!skill) return;
    setGroup(skill.category);
    setBranch(skill.branch);
    setQuery("");
    setMaxDifficulty(
      Math.max(maxDifficulty, skill.difficulty) as DifficultyLevel,
    );
    if (getSkillState(skill, profile.progress) === "locked")
      setAvailableOnly(false);
    setSelection(id);
    setView("tree");
    setMenuOpen(false);
  };

  return (
    <div className={`app-shell ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      {!isDesktop && menuOpen && (
        <button
          className="sidebar-backdrop"
          aria-label="Close navigation"
          onClick={() => setMenuOpen(false)}
        />
      )}
      <aside
        id="main-navigation"
        className={`sidebar ${sidebarOpen ? "open" : ""}`}
        aria-label="Main navigation"
        inert={!sidebarOpen}
        aria-hidden={!sidebarOpen}
      >
        <button
          ref={menuCloseRef}
          className="icon-button sidebar-close"
          onClick={() => setMenuOpen(false)}
          aria-label="Close navigation"
          title="Close navigation"
          aria-controls="main-navigation"
        >
          <X size={20} />
        </button>
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
                  "Restore the demo profile? This replaces your saved progress, personal records, practice log, weekly schedule, goals, and equipment on this device.",
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
      <div className="app-main" inert={!isDesktop && menuOpen}>
        <header className="topbar">
          <div className="topbar-location">
            <button
              ref={menuToggleRef}
              className="icon-button menu-button"
              onClick={() =>
                isDesktop
                  ? setSidebarCollapsed((collapsed) => !collapsed)
                  : setMenuOpen((open) => !open)
              }
              aria-controls="main-navigation"
              aria-expanded={sidebarOpen}
              aria-label={sidebarOpen ? "Close navigation" : "Open navigation"}
              title={sidebarOpen ? "Close navigation" : "Open navigation"}
            >
              {isDesktop ? (
                sidebarOpen ? (
                  <PanelLeftClose size={20} />
                ) : (
                  <PanelLeftOpen size={20} />
                )
              ) : (
                <Menu size={20} />
              )}
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
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
          </button>
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
                  theme={theme}
                  availableOnly={availableOnly}
                  setAvailableOnly={(value) => {
                    setAvailableOnly(value);
                    if (
                      value &&
                      selectedId &&
                      getSkillState(skillById[selectedId], profile.progress) ===
                        "locked"
                    )
                      setSelection(null);
                  }}
                  profile={profile}
                  group={group}
                  setGroup={selectGroup}
                  branch={branch}
                  setBranch={setBranch}
                  query={query}
                  maxDifficulty={maxDifficulty}
                  setMaxDifficulty={(value) => {
                    setMaxDifficulty(value);
                    if (selectedId && skillById[selectedId]?.difficulty > value)
                      setSelection(null);
                  }}
                  selectedId={selectedSkill?.id ?? null}
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
                    onPersonalRecord={setPersonalRecord}
                    storageAvailable={storageAvailable}
                    hydrated={hydrated}
                    onLogPractice={(id) => {
                      setPracticeSkillId(id);
                      setSelection(null);
                      setView("practice");
                    }}
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
              hydrated={hydrated}
              storageAvailable={storageAvailable}
              onRestore={restoreProfile}
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
          {view === "schedule" && (
            <WeeklySchedule
              profile={profile}
              hydrated={hydrated}
              storageAvailable={storageAvailable}
              onAdd={addScheduledSkill}
              onRemove={removeScheduledSkill}
              onSelect={exploreScheduledSkill}
              onLogPractice={(id) => {
                if (!canScheduleSkill(id, profile)) return;
                setPracticeSkillId(id);
                setSelection(null);
                setView("practice");
                setMenuOpen(false);
              }}
            />
          )}
          {view === "practice" && (
            <PracticeLog
              key={practiceSkillId ?? "all"}
              entries={profile.practiceLog}
              initialSkillId={practiceSkillId}
              hydrated={hydrated}
              storageAvailable={storageAvailable}
              onSave={savePractice}
              onDelete={deletePractice}
              onAnalytics={(id) => {
                setAnalyticsSkillId(id ?? "all");
                navigate("analytics");
              }}
            />
          )}
          {view === "analytics" && (
            <>
              <label className="analytics-skill-filter">
                <span>Analytics skill</span>
                <select
                  value={analyticsSkillId}
                  onChange={(event) => setAnalyticsSkillId(event.target.value)}
                  disabled={!hydrated}
                >
                  <option value="all">All skills</option>
                  {categories.map((category) => (
                    <optgroup key={category} label={categoryLabels[category]}>
                      {skills
                        .filter((skill) => skill.category === category)
                        .map((skill) => (
                          <option key={skill.id} value={skill.id}>
                            {skill.name}
                          </option>
                        ))}
                    </optgroup>
                  ))}
                  {previousLogSkills.length > 0 && (
                    <optgroup label="Previous skills">
                      {previousLogSkills.map((id) => (
                        <option key={id} value={id}>
                          {getPracticeSkillName(id)}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </label>
              <TrainingAnalytics
                entries={
                  analyticsSkillId === "all"
                    ? profile.practiceLog
                    : profile.practiceLog.filter(
                        (entry) => entry.skillId === analyticsSkillId,
                      )
                }
                today={hydrated ? getLocalToday() : "2000-01-01"}
                hydrated={hydrated}
                skillLabel={
                  analyticsSkillId === "all"
                    ? "All skills"
                    : (getPracticeSkillName(analyticsSkillId) ??
                      "Selected skill")
                }
              />
            </>
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
