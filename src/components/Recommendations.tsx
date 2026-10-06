import { ArrowUpRight, Dumbbell, Sparkles } from "lucide-react";
import { EmptyState, SkillIcon } from "@/components/ui";
import { getRecommendations } from "@/lib/recommendations";
import type { UserProfile } from "@/types/skill";

export function Recommendations({
  profile,
  onSelect,
  onEquipment,
}: {
  profile: UserProfile;
  onSelect: (id: string) => void;
  onEquipment: () => void;
}) {
  const recommendations = getRecommendations(profile);
  return (
    <section className="recommendation-section">
      <div className="section-heading">
        <div>
          <span className="eyebrow">
            <Sparkles size={12} />A little direction
          </span>
          <h2>What should I train next?</h2>
          <p>Your next moves, based on your goals, progress, and equipment.</p>
        </div>
        <button className="text-button" onClick={onEquipment}>
          <Dumbbell size={14} />
          My equipment
          <ArrowUpRight size={14} />
        </button>
      </div>
      {recommendations.length ? (
        <div className="recommendation-grid">
          {recommendations.map(({ skill, reason }, index) => (
            <button
              key={skill.id}
              className="recommendation-card"
              onClick={() => onSelect(skill.id)}
            >
              <span className="recommendation-top">
                <span className="skill-symbol">
                  <SkillIcon category={skill.category} size={20} />
                </span>
                <span className="recommendation-number">0{index + 1}</span>
              </span>
              <h3>
                {skill.name}
                <ArrowUpRight size={15} />
              </h3>
              <p>{reason}</p>
              <span className="recommendation-dose">
                {skill.exercises[0].sets} sets ·{" "}
                {skill.exercises[0].hold ?? `${skill.exercises[0].reps} reps`}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <EmptyState title="You’re caught up with your setup">
          Choose another goal or add equipment to find your next progression.
        </EmptyState>
      )}
    </section>
  );
}
