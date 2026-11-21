import React from 'react';
import { CheckCircle2, AlertTriangle, GitCompare } from 'lucide-react';
import type { EmotionAnalysisResult } from '../../types/nlp';
import { EMOTION_BADGE_STYLES, cn } from '../../utils/constants';

interface ModelComparisonProps {
  emotionAnalysis: EmotionAnalysisResult;
}

export const ModelComparison: React.FC<ModelComparisonProps> = ({ emotionAnalysis }) => {
  const primaryEmotion = emotionAnalysis.primary_emotion;

  const rows = [
    {
      name: 'Hybrid Ensemble (Weighted Fusion)',
      architecture: '45% Neural MLP + 40% LinearSVC + 15% Lexicon',
      predicted: emotionAnalysis.primary_emotion,
      confidence: emotionAnalysis.confidence_pct,
      isEnsemble: true,
    },
    ...Object.entries(emotionAnalysis.model_comparison).map(([modelName, details]) => ({
      name: modelName,
      architecture: modelName.includes('LinearSVC')
        ? 'Word/Bigram Sublinear TF-IDF + Platt Calibration'
        : modelName.includes('Neural')
        ? 'Char 3-5 N-Gram + 120D TruncatedSVD + ReLU MLP (128x64)'
        : 'Domain Affective Dictionary + 2-Token Valence Shifter Window',
      predicted: details.predicted,
      confidence: details.confidence,
      isEnsemble: false,
    })),
  ];

  const allAgree = rows.every((r) => r.predicted === primaryEmotion);

  return (
    <div className="rounded-2xl bg-[#141829]/90 border border-white/[0.08] p-5 sm:p-6 shadow-card-dark">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 flex items-center justify-center text-[#A78BFA]">
            <GitCompare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white">
              Multi-Paradigm Model Agreement Matrix
            </h3>
            <p className="text-xs text-[#94A3B8]">
              Side-by-side comparison of Lexicon, Classical LinearSVC, Deep Neural MLP, and Hybrid Ensemble
            </p>
          </div>
        </div>

        <div
          className={cn(
            'flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border',
            allAgree
              ? 'bg-[#22C55E]/10 text-[#4ADE80] border-[#22C55E]/30'
              : 'bg-[#F59E0B]/10 text-[#FBBF24] border-[#F59E0B]/30'
          )}
        >
          {allAgree ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              100% Model Consensus
            </>
          ) : (
            <>
              <AlertTriangle className="w-3.5 h-3.5" />
              Divergent Sub-Model Signals Resolved by Ensemble
            </>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/[0.08] text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]">
              <th className="py-3 px-3">NLP Classifier Paradigm</th>
              <th className="py-3 px-3">Feature &amp; Mathematical Representation</th>
              <th className="py-3 px-3">Predicted Emotion</th>
              <th className="py-3 px-3">Confidence</th>
              <th className="py-3 px-3 text-right">Consensus</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06] text-xs sm:text-sm">
            {rows.map((row) => {
              const agrees = row.predicted === primaryEmotion;
              const badgeStyle =
                EMOTION_BADGE_STYLES[row.predicted] ||
                'bg-[#8B5CF6]/15 text-[#C084FC] border-[#8B5CF6]/30';
              return (
                <tr
                  key={row.name}
                  className={cn(
                    'transition-colors',
                    row.isEnsemble
                      ? 'bg-[#8B5CF6]/[0.07]'
                      : !agrees
                      ? 'bg-[#F59E0B]/[0.04]'
                      : 'hover:bg-white/[0.02]'
                  )}
                >
                  <td className="py-3.5 px-3 font-semibold text-white">
                    <div className="flex items-center gap-2">
                      {row.name}
                      {row.isEnsemble && (
                        <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-[#8B5CF6]/25 text-[#DDD6FE] border border-[#8B5CF6]/40">
                          Active Output
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-3 text-xs text-[#94A3B8]">{row.architecture}</td>
                  <td className="py-3.5 px-3">
                    <span
                      className={cn(
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border',
                        badgeStyle
                      )}
                    >
                      {row.predicted}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 font-mono font-bold text-white">
                    {row.confidence.toFixed(1)}%
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    {agrees ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-[#4ADE80]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Aligned
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-[#FBBF24]">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Disagrees
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

