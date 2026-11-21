import React from 'react';
import { Lightbulb, Sparkles, ArrowUpRight } from 'lucide-react';

interface RecommendationCardProps {
  recommendation: string;
  emotion: string;
  topic: string;
  sentiment: string;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  emotion,
  topic,
  sentiment,
}) => {
  const isNegative = sentiment === 'Negative';

  return (
    <div className="rounded-2xl bg-gradient-to-br from-[#141829] via-[#141829] to-[#8B5CF6]/[0.12] border border-[#8B5CF6]/30 p-5 sm:p-6 shadow-glow-primary relative overflow-hidden">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#6366F1] flex items-center justify-center text-white shrink-0 shadow-glow-primary">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#A78BFA] flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Pedagogical Intervention Engine
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/[0.06] text-[#CBD5E1] border border-white/[0.08]">
                {topic} &times; {emotion}
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-white mt-1">
              Recommended Faculty &amp; Curriculum Action
            </h3>
            <p className="text-xs sm:text-sm text-[#E2E8F0] leading-relaxed mt-2">
              {recommendation}
            </p>
          </div>
        </div>

        <span
          className={`hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold shrink-0 border ${
            isNegative
              ? 'bg-[#EF4444]/15 text-[#F87171] border-[#EF4444]/30'
              : 'bg-[#22C55E]/15 text-[#4ADE80] border-[#22C55E]/30'
          }`}
        >
          {isNegative ? 'Priority Action' : 'Reinforce Strength'}
          <ArrowUpRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );
};

