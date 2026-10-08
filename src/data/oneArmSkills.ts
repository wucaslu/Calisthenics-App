import { getOneArmPushSkills } from "@/data/oneArmPushSkills";
import { getOneArmPullCoreSkills } from "@/data/oneArmPullCoreSkills";
import type { Og2Define, Og2Hold, Og2Reps } from "@/data/og2Skills";

export function getOneArmSkills(
  define: Og2Define,
  hold: Og2Hold,
  reps: Og2Reps,
) {
  return [
    ...getOneArmPushSkills(define, hold, reps),
    ...getOneArmPullCoreSkills(define, hold, reps),
  ];
}
