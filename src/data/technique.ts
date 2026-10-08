import { coreTechnique, coreTechniqueSources } from "@/data/coreTechnique";
import {
  advancedStaticTechnique,
  advancedStaticTechniqueSources,
} from "@/data/advancedStaticTechnique";
import { legsTechnique, legsTechniqueSources } from "@/data/legsTechnique";
import { pullTechnique, pullTechniqueSources } from "@/data/pullTechnique";
import { pushTechnique, pushTechniqueSources } from "@/data/pushTechnique";
import {
  oneArmTechnique,
  oneArmTechniqueSources,
} from "@/data/oneArmTechnique";
import type { TechniqueGuidance, TechniqueSource } from "@/types/skill";

/** Technique references are separate from the catalog's progression-level sources. */
export const techniqueSources: Record<string, TechniqueSource> = {
  ...advancedStaticTechniqueSources,
  ...oneArmTechniqueSources,
  ...pullTechniqueSources,
  ...pushTechniqueSources,
  ...legsTechniqueSources,
  ...coreTechniqueSources,
};

export const skillTechnique: Record<string, TechniqueGuidance> = {
  ...advancedStaticTechnique,
  ...oneArmTechnique,
  ...pullTechnique,
  ...pushTechnique,
  ...legsTechnique,
  ...coreTechnique,
};
