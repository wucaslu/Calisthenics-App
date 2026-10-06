export type Category = "push" | "pull" | "core" | "legs";
export type Branch =
  | "fundamentals"
  | "rows"
  | "push-up"
  | "l-sit"
  | "dragon-flag"
  | "posterior-chain"
  | "planche"
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
export type DifficultyLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
export type PersonalRecords = Record<string, string>;

export interface Skill {
  id: string;
  name: string;
  category: Category;
  branch: Branch;
  difficulty: DifficultyLevel;
  movementType: MovementType;
  description: string;
  references: string[];
  referenceLevel?: string;
  prerequisites: string[];
  progressionTo: string[];
  equipment: Equipment[];
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
  version: 1;
  progress: Progress;
  personalRecords: PersonalRecords;
  goals: string[];
  equipment: Equipment[];
  archivedSkills: Record<string, ArchivedSkill>;
}

export interface ArchivedSkill {
  name: string;
  progress?: "training" | "mastered";
  personalRecord?: string;
}
