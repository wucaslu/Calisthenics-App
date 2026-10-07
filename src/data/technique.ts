import { coreTechnique, coreTechniqueSources } from "@/data/coreTechnique";
import { legsTechnique, legsTechniqueSources } from "@/data/legsTechnique";
import { pullTechnique, pullTechniqueSources } from "@/data/pullTechnique";
import { pushTechnique, pushTechniqueSources } from "@/data/pushTechnique";
import type { TechniqueGuidance, TechniqueSource } from "@/types/skill";

/** Technique references are separate from the catalog's progression-level sources. */
export const techniqueSources: Record<string, TechniqueSource> = {
  ...pullTechniqueSources,
  ...pushTechniqueSources,
  ...legsTechniqueSources,
  ...coreTechniqueSources,
};

export const skillTechnique: Record<string, TechniqueGuidance> = {
  ...pullTechnique,
  ...pushTechnique,
  ...legsTechnique,
  ...coreTechnique,
};
