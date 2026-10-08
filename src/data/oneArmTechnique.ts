import { oneArmPushTechnique } from "@/data/oneArmPushTechnique";
import {
  oneArmPullCoreTechnique,
  oneArmPullCoreTechniqueSources,
} from "@/data/oneArmPullCoreTechnique";

export const oneArmTechnique = {
  ...oneArmPushTechnique,
  ...oneArmPullCoreTechnique,
};
export const oneArmTechniqueSources = oneArmPullCoreTechniqueSources;
