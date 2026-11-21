import React from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  BarChart3,
  Network,
  Award,
  FileSpreadsheet,
  ArrowRight,
  Cpu,
  CheckCircle2,
  Layers,
  ShieldCheck,
  Zap,
  Mic,
} from 'lucide-react';
import type { DashboardResponse, ModelsBenchmarksResponse, TopicsComparisonResponse } from '../types/nlp';
import type { NavTabId } from '../components/layout/Sidebar';

interface OverviewProps {
  dashboardData: DashboardResponse | null;
  modelsData: ModelsBenchmarksResponse | null;
  topicsData: TopicsComparisonResponse | null;
  onNavigate: (tab: NavTabId) => void;
  onQuickAnalyze: (sampleText: string) => void;
}

export const Overview: React.FC<OverviewProps> = ({
  dashboardData,
  modelsData,
  topicsData,
  onNavigate,
  onQuickAnalyze,
}) => {
  const totalFeedback = dashboardData?.kpis.total_feedback ?? 620;
  const posRate = dashboardData?.kpis.positive_satisfaction_pct ?? 0;
  const domEmotion = dashboardData?.kpis.dominant_emotion ?? 'Loading...';
  const painTopic = dashboardData?.kpis.top_pain_point_topic ?? 'Loading...';

  // Dynamically find best Macro F1 from backend models response
  let bestModelName = 'Hybrid Ensemble';
  let bestMacroF1 = dashboardData?.kpis.best_model_f1 ?? 0;
  if (modelsData?.models) {
    const entries = Object.entries(modelsData.models).sort(
      (a, b) => b[1].macro_f1 - a[1].macro_f1
    );
    if (entries.length > 0) {
      bestModelName = entries[0][0];
      bestMacroF1 = entries[0][1].macro_f1;
    }
  }

  const topicAlgCount = topicsData ? Object.keys(topicsData.topic_models).length : 3;

  const featureCards: {
    id: NavTabId;
    title: string;
    subtitle: string;
    metric: string;
    icon: React.ComponentType<{ className?: string }>;
    gradient: string;
  }[] = [
    {
      id: 'analyzer',
      title: 'Live NLP Analyzer',
      subtitle:
        'Inspect the 5-stage preprocessing trace, negation preservation, and 4 emotion models in real time.',
      metric: '5-Stage Pipeline + 4 Models',
      icon: Sparkles,
      gradient: 'from-[#8B5CF6]/20 to-[#6366F1]/5 border-[#8B5CF6]/35',
    },
    {
      id: 'voice',
      title: 'Voice & Audio Studio',
      subtitle:
        'Record live voice feedback or upload any audio/document file (.wav, .mp3, .m4a, .txt) for Speech-to-Text & Sentiment Analysis.',
      metric: 'SpeechRecognition + WAV',
      icon: Mic,
      gradient: 'from-[#EC4899]/20 to-[#8B5CF6]/5 border-[#EC4899]/35',
    },
    {
      id: 'dashboard',
      title: 'Analytics Dashboard',
      subtitle:
        'Explore corpus-wide emotion donut charts, topic prevalence, and the Topic × Emotion co-occurrence heatmap.',
      metric: `${totalFeedback} Verified Reviews`,
      icon: BarChart3,
      gradient: 'from-[#6366F1]/20 to-[#3B82F6]/5 border-[#6366F1]/35',
    },
    {
      id: 'topics',
      title: 'Topic Modeling Lab',
      subtitle:
        'Compare LDA, NMF, and BERTopic-inspired c-TF-IDF clustering with an interactive 2D semantic scatter plot.',
      metric: `${topicAlgCount} Unsupervised Algorithms`,
      icon: Network,
      gradient: 'from-[#06B6D4]/20 to-[#3B82F6]/5 border-[#06B6D4]/35',
    },
    {
      id: 'benchmarks',
      title: 'Model Benchmarks',
      subtitle:
        'Evaluate held-out test set Accuracy, Precision, Recall, Macro F1, and multi-class confusion matrices.',
      metric: `Best Macro F1: ${bestMacroF1}%`,
      icon: Award,
      gradient: 'from-[#22C55E]/20 to-[#10B981]/5 border-[#22C55E]/35',
    },
    {
      id: 'batch',
      title: 'Batch CSV Studio',
      subtitle:
        'Drag-and-drop custom CSV datasets, select feedback columns, run bulk NLP inference, and export annotated CSVs.',
      metric: 'Up to 200 Rows / Batch',
      icon: FileSpreadsheet,
      gradient: 'from-[#F59E0B]/20 to-[#D97706]/5 border-[#F59E0B]/35',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      {/* Hero Banner */}
      <div className="relative rounded-3xl bg-gradient-to-br from-[#141829] via-[#141829] to-[#8B5CF6]/15 border border-white/[0.09] p-6 sm:p-8 shadow-card-dark overflow-hidden">
        <div className="max-w-3xl space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8B5CF6]/15 border border-[#8B5CF6]/35 text-xs font-semibold text-[#C084FC]">
            <Cpu className="w-3.5 h-3.5" />
            EduPulse AI &bull; Intelligent Student Feedback Emotion &amp; Topic Analytics
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Multi-Paradigm Affective Computing &amp; Topic Discovery for Higher Education
          </h2>

          <p className="text-sm sm:text-base text-[#94A3B8] leading-relaxed">
            Powered by a negation-aware 5-stage preprocessing pipeline, calibrated Classical ML
            (<code className="text-[#CBD5E1] font-mono">TF-IDF + LinearSVC</code>), Deep Subword
            Neural Networks (<code className="text-[#CBD5E1] font-mono">Char N-Gram + SVD + MLP</code>
            ), and Unsupervised Topic Modeling (<code className="text-[#CBD5E1] font-mono">LDA</code>,{' '}
            <code className="text-[#CBD5E1] font-mono">NMF</code>, and{' '}
            <code className="text-[#CBD5E1] font-mono">c-TF-IDF</code>).
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('analyzer')}
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] hover:from-[#7C3AED] hover:to-[#4F46E5] shadow-glow-primary flex items-center gap-2 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              Launch Live NLP Analyzer
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('dashboard')}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-[#E2E8F0] hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-colors"
            >
              Explore Corpus Analytics
            </button>

            <button
              onClick={() => onNavigate('benchmarks')}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-[#E2E8F0] hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-colors"
            >
              View Model Benchmarks ({bestMacroF1}% F1)
            </button>
          </div>
        </div>
      </div>

      {/* Live Executive Snapshot Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-[#141829]/90 border border-white/[0.07] p-4">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]">
            Indexed Student Reviews
          </div>
          <div className="text-2xl font-extrabold text-white mt-1">{totalFeedback}</div>
          <div className="text-xs text-[#4ADE80] mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />6 Courses &bull; 6 Emotions &bull; 6 Topics
          </div>
        </div>

        <div className="rounded-2xl bg-[#141829]/90 border border-white/[0.07] p-4">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]">
            Positive Satisfaction Rate
          </div>
          <div className="text-2xl font-extrabold text-[#22C55E] mt-1">{posRate}%</div>
          <div className="text-xs text-[#94A3B8] mt-1 truncate">
            Dominant: <span className="text-white font-medium">{domEmotion}</span>
          </div>
        </div>

        <div className="rounded-2xl bg-[#141829]/90 border border-white/[0.07] p-4">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]">
            Primary Bottleneck Topic
          </div>
          <div className="text-lg font-extrabold text-[#F87171] mt-1 truncate">{painTopic}</div>
          <div className="text-xs text-[#94A3B8] mt-1">
            Highest negative affect concentration
          </div>
        </div>

        <div className="rounded-2xl bg-[#141829]/90 border border-white/[0.07] p-4">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]">
            Top Performing Emotion Model
          </div>
          <div className="text-2xl font-extrabold text-[#A78BFA] mt-1">{bestMacroF1}% F1</div>
          <div className="text-xs text-[#94A3B8] mt-1 truncate" title={bestModelName}>
            {bestModelName}
          </div>
        </div>
      </div>

      {/* Module Navigation Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#94A3B8]">
            Interactive Platform Modules
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {featureCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                onClick={() => onNavigate(card.id)}
                className={`group cursor-pointer rounded-2xl bg-gradient-to-br ${card.gradient} bg-[#141829] border p-5 shadow-card-dark hover:scale-[1.01] transition-all flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-[#090B14]/70 border border-white/[0.08] flex items-center justify-center text-white">
                      <Icon className="w-5 h-5 text-[#A78BFA]" />
                    </div>
                    <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-full bg-[#090B14]/70 text-[#CBD5E1] border border-white/[0.07]">
                      {card.metric}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-white group-hover:text-[#C084FC] transition-colors">
                    {card.title}
                  </h4>
                  <p className="text-xs text-[#94A3B8] leading-relaxed mt-1.5">{card.subtitle}</p>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-semibold text-white mt-4 pt-3 border-t border-white/[0.06]">
                  <span>Open Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}

          {/* Quick One-Click Live Test Card */}
          <div className="rounded-2xl bg-[#141829]/90 border border-white/[0.08] p-5 shadow-card-dark flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#22D3EE] mb-2">
                <Zap className="w-4 h-4" />
                Instant Pipeline Demo
              </div>
              <h4 className="text-base font-bold text-white">Test Negation &amp; Emotion Shift</h4>
              <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">
                Click below to send a complex negated feedback sentence directly into the Live NLP
                Analyzer and inspect every stage.
              </p>
            </div>
            <button
              onClick={() =>
                onQuickAnalyze(
                  "The instructor doesn't explain how advanced mathematical proofs connect to code, and the grading rubric is not transparent at all!"
                )
              }
              className="mt-4 w-full py-2.5 px-3 rounded-xl bg-white/[0.05] hover:bg-[#8B5CF6]/25 border border-white/[0.08] hover:border-[#8B5CF6]/40 text-xs font-semibold text-white transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#A78BFA]" />
              Run Negation Test Case
            </button>
          </div>
        </div>
      </div>

      {/* System Architecture Specification Footer Card */}
      <div className="rounded-2xl bg-[#141829]/80 border border-white/[0.07] p-5 sm:p-6">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#A78BFA] mb-4">
          <Layers className="w-4 h-4" />
          End-to-End Backend NLP Architecture (Preserved &amp; Verified)
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-[#090B14]/70 border border-white/[0.05]">
            <div className="font-bold text-white mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
              1. Negation-Aware Preprocessing
            </div>
            <p className="text-[#94A3B8] leading-relaxed">
              Contraction expansion, regex noise pruning, word tokenization, stopword filtering that
              explicitly retains negation markers (<code className="text-[#FCA5A5]">not, never, zero</code>
              ), morphological lemmatization, and bigram generation.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-[#090B14]/70 border border-white/[0.05]">
            <div className="font-bold text-white mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#8B5CF6]" />
              2. Hybrid Emotion Ensemble
            </div>
            <p className="text-[#94A3B8] leading-relaxed">
              Combines an Affective Valence Shifter Lexicon (15%), Sublinear TF-IDF + Calibrated
              LinearSVC (40%), and Character 3–5 N-Gram + 120D TruncatedSVD + ReLU Neural MLP (45%).
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-[#090B14]/70 border border-white/[0.05]">
            <div className="font-bold text-white mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#06B6D4]" />
              3. Multi-Algorithm Topic Discovery
            </div>
            <p className="text-[#94A3B8] leading-relaxed">
              Benchmarks probabilistic LDA, Frobenius NMF, and BERTopic-inspired Semantic SVD +
              K-Means + Class-Based TF-IDF (<code className="text-[#22D3EE]">c-TF-IDF</code>) with
              automated pedagogical recommendations.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

