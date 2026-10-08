export type Category = "push" | "pull" | "core" | "legs";
export type Branch =
  | "fundamentals"
  | "rows"
  | "push-up"
  | "l-sit"
  | "dragon-flag"
  | "posterior-chain"
  | "planche"
  | "ring-planche"
  | "front-lever"
  | "back-lever"
  | "handstand"
  | "muscle-up"
  | "core"
  | "legs"
  | "pistol-squat"
  | "shrimp-squat"
  | "dragon-squat"
  | "rings"
  | "pelican"
  | "hefesto"
  | "maltese"
  | "iron-cross"
  | "one-arm-pull-up";
export type Equipment =
  "floor" | "pull-up-bar" | "parallettes" | "dip-bars" | "rings" | "gym";
export type SkillState = "locked" | "available" | "training" | "mastered";
export type Progress = Record<string, "training" | "mastered">;
export type MovementType = "dynamic" | "static";
export type DifficultyLevel =
  1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17;
export type PersonalRecords = Record<string, string>;
export type Weekday =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";
export type WeeklySchedule = Partial<Record<Weekday, string[]>>;

export interface GraphViewport {
  x: number;
  y: number;
  zoom: number;
}

export interface GraphViewSettings {
  group: Category | "all";
  branch: Branch | "all";
  query: string;
  maxDifficulty: DifficultyLevel;
  highlightPath: boolean;
  availableOnly: boolean;
  selectedSkillId: string | null;
  viewport?: GraphViewport;
}

export interface SavedGraphView extends GraphViewSettings {
  id: string;
  name: string;
}

export interface MuscleProfile {
  target: string;
  primary: string[];
  secondary: string[];
}

export interface TechniqueGuidance {
  setup: string[];
  cues: string[];
  mistakes: string[];
  sources: string[];
  sourceScope?: string;
}

export interface TechniqueSource {
  title: string;
  url: string;
}

export interface PrerequisiteRoute {
  id: string;
  label: string;
  description: string;
  prerequisites: string[];
}

export interface EquipmentSetup {
  id: string;
  label: string;
  description: string;
  equipment: Equipment[];
}

export interface PracticeEntry {
  id: string;
  skillId: string;
  date: string;
  sets: number;
  repetitions?: number;
  holdSeconds?: number;
  notes: string;
}

export interface Skill {
  id: string;
  name: string;
  category: Category;
  branch: Branch;
  difficulty: DifficultyLevel;
  levelSource?: "book" | "community";
  movementType: MovementType;
  description: string;
  muscles: MuscleProfile;
  technique: TechniqueGuidance;
  references: string[];
  referenceLevel?: string;
  prerequisites: string[];
  alternativeRoutes?: PrerequisiteRoute[];
  progressionTo: string[];
  equipment: Equipment[];
  equipmentSetups?: EquipmentSetup[];
  requirements: { exercise: string; target: string }[];
  exercises: {
    name: string;
    sets?: string;
    reps?: string;
    hold?: string;
    description?: string;
  }[];
}

export interface UserProfile {
  version: 2;
  progress: Progress;
  personalRecords: PersonalRecords;
  goals: string[];
  equipment: Equipment[];
  archivedSkills: Record<string, ArchivedSkill>;
  practiceLog: PracticeEntry[];
  weeklySchedule?: WeeklySchedule;
  savedGraphViews?: SavedGraphView[];
}

export interface ArchivedSkill {
  name: string;
  progress?: "training" | "mastered";
  personalRecord?: string;
}
