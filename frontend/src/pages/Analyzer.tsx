import React from 'react';
import { motion } from 'framer-motion';
import {
  Heart,
  Compass,
  ShieldCheck,
  Activity,
  Lightbulb,
  AlertCircle,
} from 'lucide-react';
import { FeedbackInput } from '../components/analyzer/FeedbackInput';
import { PreprocessingTimeline } from '../components/analyzer/PreprocessingTimeline';
import { EmotionResults } from '../components/analyzer/EmotionResults';
import { ModelComparison } from '../components/analyzer/ModelComparison';
import { RecommendationCard } from '../components/analyzer/RecommendationCard';
import type { SingleAnalyzeResponse } from '../types/nlp';
import { EMOTION_COLORS, EMOTION_BADGE_STYLES, cn } from '../utils/constants';

interface AnalyzerProps {
  inputText: string;
  onInputChange: (val: string) => void;
  onAnalyze: (customText?: string) => void;
  onClear: () => void;
  result: SingleAnalyzeResponse | null;
  loading: boolean;
  error: string | null;
}

export const Analyzer: React.FC<AnalyzerProps> = ({
  inputText,
  onInputChange,
  onAnalyze,
  onClear,
  result,
  loading,
  error,
}) => {
  const primaryEmotion = result?.emotion_analysis.primary_emotion || '—';
  const emotionConf = result?.emotion_analysis.confidence_pct ?? 0;
  const primaryTopic = result?.topic_analysis.primary_topic || '—';
  const topicProbRaw =
    result && primaryTopic in result.topic_analysis.topic_probabilities
      ? result.topic_analysis.topic_probabilities[primaryTopic]
      : 0;
  const topicConf = Math.round(topicProbRaw * 1000) / 10;

  const emotionColor = EMOTION_COLORS[primaryEmotion] || '#8B5CF6';
  const badgeStyle =
    EMOTION_BADGE_STYLES[primaryEmotion] ||
    'bg-[#8B5CF6]/15 text-[#C084FC] border-[#8B5CF6]/30';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      {error && (
        <div className="rounded-2xl bg-[#EF4444]/10 border border-[#EF4444]/35 p-4 flex items-center gap-3 text-xs sm:text-sm text-[#FCA5A5]">
          <AlertCircle className="w-5 h-5 text-[#EF4444] shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Top Split Workspace: Left = Input Stream, Right = Instant Executive Readout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7 flex flex-col">
          <FeedbackInput
            text={inputText}
            onChange={onInputChange}
            onAnalyze={onAnalyze}
            onClear={onClear}
            loading={loading}
            inferenceMs={result?.inference_time_ms}
          />
        </div>

        {/* Right Section: Primary Emotion, Topic, Confidence & Faculty Intervention */}
        <div className="lg:col-span-5 rounded-2xl bg-[#141829]/90 border border-white/[0.08] p-5 sm:p-6 shadow-card-dark flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#A78BFA]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
                  Real-Time Inference Readout
                </span>
              </div>
              {result && (
                <span className="text-[11px] font-mono text-[#4ADE80]">
                  Polarity: {result.emotion_analysis.sentiment_polarity}
                </span>
              )}
            </div>

            {result ? (
              <div className="space-y-4">
                {/* Emotion + Topic 2-Card Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="p-4 rounded-xl bg-[#090B14]/85 border border-white/[0.07] relative overflow-hidden">
                    <div
                      className="absolute top-0 left-0 right-0 h-1"
                      style={{ backgroundColor: emotionColor }}
                    />
                    <div className="flex items-center justify-between text-[11px] text-[#94A3B8] font-semibold uppercase">
                      <span>Primary Emotion</span>
                      <Heart className="w-3.5 h-3.5" style={{ color: emotionColor }} />
                    </div>
                    <div className="mt-2">
                      <span
                        className={cn(
                          'inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border',
                          badgeStyle
                        )}
                      >
                        {primaryEmotion}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs">
                      <span className="text-[#94A3B8]">Ensemble Conf.</span>
                      <span className="font-mono font-extrabold text-white">{emotionConf}%</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#090B14]/85 border border-white/[0.07] relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-[#06B6D4]" />
                    <div className="flex items-center justify-between text-[11px] text-[#94A3B8] font-semibold uppercase">
                      <span>Academic Topic</span>
                      <Compass className="w-3.5 h-3.5 text-[#22D3EE]" />
                    </div>
                    <div className="mt-2 text-xs sm:text-sm font-bold text-white leading-snug">
                      {primaryTopic}
                    </div>
                    <div className="mt-2.5 flex items-center justify-between text-xs">
                      <span className="text-[#94A3B8]">Topic Score</span>
                      <span className="font-mono font-extrabold text-[#22D3EE]">
                        {topicConf.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Compact Faculty Intervention Summary inside Right Panel */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-[#8B5CF6]/15 to-[#6366F1]/5 border border-[#8B5CF6]/30">
                  <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#C084FC] mb-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-[#FBBF24]" />
                    Recommended Faculty Intervention
                  </div>
                  <p className="text-xs text-[#E2E8F0] leading-relaxed">
                    {result.pedagogical_recommendation}
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-[#64748B]">
                Enter student feedback on the left and click <strong>Analyze Feedback</strong> to
                inspect real-time predictions.
              </div>
            )}
          </div>

          {/* Bottom Token Density Bar */}
          {result && (
            <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-[#94A3B8]">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
                Tokens: <strong className="text-white">{result.preprocessing.token_count}</strong> &rarr;
                Lemmas: <strong className="text-white">{result.preprocessing.lemma_count}</strong>
              </span>
              <span className="font-mono text-[11px]">
                Bigrams: {result.preprocessing.bigrams.length}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Detailed Sections When Analysis Result Exists */}
      {result && (
        <>
          {/* Emotion & Topic Probability Bars */}
          <EmotionResults
            emotionAnalysis={result.emotion_analysis}
            topicAnalysis={result.topic_analysis}
          />

          {/* Model Agreement Comparison Matrix */}
          <ModelComparison emotionAnalysis={result.emotion_analysis} />

          {/* Interactive 5-Stage Preprocessing Timeline */}
          <PreprocessingTimeline
            preprocessing={result.preprocessing}
            triggers={result.emotion_analysis.detected_triggers}
          />

          {/* Full Actionable Pedagogical Recommendation Card */}
          <RecommendationCard
            recommendation={result.pedagogical_recommendation}
            emotion={result.emotion_analysis.primary_emotion}
            topic={result.topic_analysis.primary_topic}
            sentiment={result.emotion_analysis.sentiment_polarity}
          />
        </>
      )}
    </motion.div>
  );
};

