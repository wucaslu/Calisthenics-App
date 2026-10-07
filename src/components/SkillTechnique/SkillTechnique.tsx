import { ExternalLink } from "lucide-react";
import { techniqueSources } from "@/data/technique";
import type { Skill } from "@/types/skill";
import styles from "./SkillTechnique.module.css";

interface Props {
  skill: Skill;
}

export function SkillTechnique({ skill }: Props) {
  const { setup, cues, mistakes, sources, sourceScope } = skill.technique;

  return (
    <section className={styles.section} aria-label="Technique & form">
      <h3>Technique &amp; form</h3>
      <div className={styles.guidance}>
        <div className={styles.group}>
          <h4>Setup</h4>
          <ul className={styles.list}>
            {setup.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
        </div>
        <div className={styles.group}>
          <h4>Form cues</h4>
          <ol className={`${styles.list} ${styles.cues}`}>
            {cues.map((cue) => (
              <li key={cue}>{cue}</li>
            ))}
          </ol>
        </div>
        <div className={styles.group}>
          <h4>Common mistakes</h4>
          <ul className={styles.list}>
            {mistakes.map((mistake) => (
              <li key={mistake}>{mistake}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className={styles.references}>
        <h4>Technique sources</h4>
        {sourceScope && <p className={styles.scope}>{sourceScope}</p>}
        <ul className={styles.sources}>
          {sources.map((id) => {
            const source = techniqueSources[id];
            return (
              <li key={id}>
                <a href={source.url} target="_blank" rel="noopener noreferrer">
                  <span>{source.title}</span>
                  <ExternalLink size={12} aria-hidden="true" />
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
