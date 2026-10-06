export type Category = "push" | "pull" | "core" | "legs";
export type Branch =
  | "fundamentals"
  | "planche"
  | "front-lever"
  | "handstand"
  | "muscle-up"
  | "core"
  | "legs";
export type Equipment =
  | "floor"
  | "pull-up-bar"
  | "parallettes"
  | "resistance-bands"
  | "dip-bars"
  | "rings"
  | "gym";
export type SkillState = "locked" | "available" | "training" | "mastered";
export type Progress = Record<string, "training" | "mastered">;
export type MovementType = "dynamic" | "static";
export type PersonalRecords = Record<string, string>;

export interface Skill {
  id: string;
  name: string;
  category: Category;
  branch: Branch;
  difficulty: number;
  movementType: MovementType;
  description: string;
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
}
