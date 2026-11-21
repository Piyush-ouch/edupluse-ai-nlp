import React from 'react';
import { motion } from 'framer-motion';
import { HeartPulse, Compass } from 'lucide-react';
import { EMOTION_COLORS, TOPIC_COLORS } from '../../utils/constants';
import type { EmotionAnalysisResult, TopicAnalysisResult } from '../../types/nlp';

interface EmotionResultsProps {
  emotionAnalysis: EmotionAnalysisResult;
  topicAnalysis: TopicAnalysisResult;
}

export const EmotionResults: React.FC<EmotionResultsProps> = ({
  emotionAnalysis,
  topicAnalysis,
}) => {
  const sortedEmotions = Object.entries(emotionAnalysis.ensemble_probabilities).sort(
    (a, b) => b[1] - a[1]
  );

  const sortedTopics = Object.entries(topicAnalysis.topic_probabilities).sort(
    (a, b) => b[1] - a[1]
  );

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {/* Emotion Probability Bars */}
      <div className="rounded-2xl bg-[#141829]/90 border border-white/[0.08] p-5 sm:p-6 shadow-card-dark">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 flex items-center justify-center text-[#A78BFA]">
              <HeartPulse className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                Emotion Probability Distribution
              </h3>
              <p className="text-xs text-[#94A3B8]">
                Weighted Hybrid Ensemble (45% Neural MLP + 40% LinearSVC + 15% Lexicon)
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3.5 mt-4">
          {sortedEmotions.map(([emotion, prob], index) => {
            const pct = Math.round(prob * 1000) / 10;
            const color = EMOTION_COLORS[emotion] || '#8B5CF6';
            const isTop = index === 0;
            return (
              <div key={emotion} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <span className={isTop ? 'font-bold text-white' : 'font-medium text-[#CBD5E1]'}>
                      {emotion}
                    </span>
                    {isTop && (
                      <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-white/[0.08] text-white">
                        Primary
                      </span>
                    )}
                  </div>
                  <span className="font-mono font-bold text-white">{pct.toFixed(1)}%</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-[#090B14] overflow-hidden border border-white/[0.05]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(2, pct)}%` }}
                    transition={{ duration: 0.55, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Topic Probability & Multi-Algorithm Assignments */}
      <div className="rounded-2xl bg-[#141829]/90 border border-white/[0.08] p-5 sm:p-6 shadow-card-dark flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#06B6D4]/15 border border-[#06B6D4]/30 flex items-center justify-center text-[#22D3EE]">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white">
                  Academic Topic Attribution
                </h3>
                <p className="text-xs text-[#94A3B8]">
                  Calibrated topic probabilities &amp; unsupervised cluster assignments
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3 mt-3">
            {sortedTopics.map(([topic, prob], index) => {
              const pct = Math.round(prob * 1000) / 10;
              const color = TOPIC_COLORS[topic] || '#6366F1';
              const isTop = index === 0;
              return (
                <div key={topic} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className={isTop ? 'font-bold text-white' : 'font-medium text-[#CBD5E1]'}>
                      {topic}
                    </span>
                    <span className="font-mono font-bold text-white">{pct.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-[#090B14] overflow-hidden border border-white/[0.05]">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(2, pct)}%` }}
                      transition={{ duration: 0.55, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Unsupervised Topic Model Predictions */}
        <div className="mt-5 pt-4 border-t border-white/[0.07]">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] mb-2.5">
            Unsupervised Topic Discovery Assignments
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {Object.entries(topicAnalysis.unsupervised_assignments).map(([alg, assignedTopic]) => (
              <div
                key={alg}
                className="p-2.5 rounded-xl bg-[#090B14]/80 border border-white/[0.07]"
              >
                <div className="text-[10px] font-semibold uppercase text-[#64748B] truncate">
                  {alg}
                </div>
                <div className="text-xs font-bold text-[#A5B4FC] mt-1 leading-snug">
                  {assignedTopic}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

