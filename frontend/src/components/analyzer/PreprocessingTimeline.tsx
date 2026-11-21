import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Layers,
  ShieldAlert,
  Sparkles,
  Check,
  Filter,
} from 'lucide-react';
import type { PreprocessingDetails, EmotionTrigger } from '../../types/nlp';
import { NEGATION_WORDS, cn } from '../../utils/constants';

interface PreprocessingTimelineProps {
  preprocessing: PreprocessingDetails;
  triggers: EmotionTrigger[];
}

export const PreprocessingTimeline: React.FC<PreprocessingTimelineProps> = ({
  preprocessing,
  triggers,
}) => {
  const [expandedStages, setExpandedStages] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: true,
    4: true,
    5: true,
  });

  const toggleStage = (stage: number) => {
    setExpandedStages((prev) => ({ ...prev, [stage]: !prev[stage] }));
  };

  const expandAll = () =>
    setExpandedStages({ 1: true, 2: true, 3: true, 4: true, 5: true });
  const collapseAll = () =>
    setExpandedStages({ 1: false, 2: false, 3: false, 4: false, 5: false });

  // Derive removed stopwords and preserved negations
  const filteredSet = new Set(preprocessing.filtered_tokens);
  const removedStopwords = preprocessing.tokens.filter((t) => !filteredSet.has(t));
  const preservedNegations = preprocessing.filtered_tokens.filter((t) =>
    NEGATION_WORDS.has(t)
  );

  // Trigger map for lemma highlighting
  const triggerMap = new Map<string, EmotionTrigger>();
  triggers.forEach((tr) => triggerMap.set(tr.lemma, tr));

  return (
    <div className="rounded-2xl bg-[#141829]/90 border border-white/[0.08] p-5 sm:p-6 shadow-card-dark">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#6366F1]/15 border border-[#6366F1]/30 flex items-center justify-center text-[#818CF8]">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white">
              Five-Stage NLP Preprocessing Pipeline
            </h3>
            <p className="text-xs text-[#94A3B8]">
              Interactive token transformation trace from raw text (${preprocessing.token_count} tokens) to normalized lemmas (${preprocessing.lemma_count} lemmas)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={expandAll}
            className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-white/[0.04] hover:bg-white/[0.08] text-[#CBD5E1] border border-white/[0.07]"
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-white/[0.04] hover:bg-white/[0.08] text-[#CBD5E1] border border-white/[0.07]"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Vertical Timeline */}
      <div className="relative pl-6 sm:pl-8 space-y-4 before:content-[''] before:absolute before:left-2.5 sm:before:left-3.5 before:top-3 before:bottom-3 before:w-[2px] before:bg-gradient-to-b before:from-[#8B5CF6] before:via-[#6366F1] before:to-[#06B6D4]/40">
        {/* STAGE 1 */}
        <div className="relative rounded-xl bg-[#090B14]/80 border border-white/[0.07] overflow-hidden">
          <span className="absolute -left-[23px] sm:-left-[27px] top-4 w-5 h-5 rounded-full bg-[#8B5CF6] text-[10px] font-bold text-white flex items-center justify-center ring-4 ring-[#141829]">
            1
          </span>
          <button
            onClick={() => toggleStage(1)}
            className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-white/[0.02]"
          >
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#A78BFA]">
                Stage 1 &bull; Lowercasing &amp; Contraction Expansion
              </span>
              <p className="text-[11px] text-[#94A3B8] mt-0.5">
                Normalizes case and expands clitics (e.g., &ldquo;doesn&apos;t&rdquo; &rarr; &ldquo;does not&rdquo;) to expose negation tokens
              </p>
            </div>
            {expandedStages[1] ? (
              <ChevronUp className="w-4 h-4 text-[#94A3B8]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#94A3B8]" />
            )}
          </button>
          {expandedStages[1] && (
            <div className="px-4 pb-3.5 pt-1 border-t border-white/[0.05] space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-[#141829] border border-white/[0.05]">
                <span className="text-[10px] font-semibold uppercase text-[#64748B] block mb-1">
                  Original Raw Input
                </span>
                <p className="font-mono text-[#CBD5E1]">{preprocessing.raw_text}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-[#8B5CF6]/[0.06] border border-[#8B5CF6]/20">
                <span className="text-[10px] font-semibold uppercase text-[#C084FC] block mb-1">
                  Expanded &amp; Case-Normalized Output
                </span>
                <p className="font-mono text-white">{preprocessing.expanded_text}</p>
              </div>
            </div>
          )}
        </div>

        {/* STAGE 2 */}
        <div className="relative rounded-xl bg-[#090B14]/80 border border-white/[0.07] overflow-hidden">
          <span className="absolute -left-[23px] sm:-left-[27px] top-4 w-5 h-5 rounded-full bg-[#6366F1] text-[10px] font-bold text-white flex items-center justify-center ring-4 ring-[#141829]">
            2
          </span>
          <button
            onClick={() => toggleStage(2)}
            className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-white/[0.02]"
          >
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#818CF8]">
                Stage 2 &bull; Punctuation Cleaning &amp; Word Tokenization ({preprocessing.tokens.length} Tokens)
              </span>
              <p className="text-[11px] text-[#94A3B8] mt-0.5">
                Strips non-alphanumeric noise while preserving intra-word hyphens and token boundaries
              </p>
            </div>
            {expandedStages[2] ? (
              <ChevronUp className="w-4 h-4 text-[#94A3B8]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#94A3B8]" />
            )}
          </button>
          {expandedStages[2] && (
            <div className="px-4 pb-3.5 pt-2 border-t border-white/[0.05]">
              <div className="flex flex-wrap gap-1.5">
                {preprocessing.tokens.map((tok, i) => {
                  const isNeg = NEGATION_WORDS.has(tok);
                  return (
                    <span
                      key={`${tok}-${i}`}
                      className={cn(
                        'px-2 py-0.5 rounded-md font-mono text-xs border',
                        isNeg
                          ? 'bg-[#EF4444]/20 text-[#FCA5A5] border-[#EF4444]/40 font-semibold'
                          : 'bg-[#141829] text-[#E2E8F0] border-white/[0.08]'
                      )}
                    >
                      {tok}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* STAGE 3 */}
        <div className="relative rounded-xl bg-[#090B14]/80 border border-white/[0.07] overflow-hidden">
          <span className="absolute -left-[23px] sm:-left-[27px] top-4 w-5 h-5 rounded-full bg-[#3B82F6] text-[10px] font-bold text-white flex items-center justify-center ring-4 ring-[#141829]">
            3
          </span>
          <button
            onClick={() => toggleStage(3)}
            className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-white/[0.02]"
          >
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#60A5FA]">
                Stage 3 &bull; Negation-Aware Stopword Filtering ({preprocessing.filtered_tokens.length} Retained)
              </span>
              <p className="text-[11px] text-[#94A3B8] mt-0.5">
                Prunes {removedStopwords.length} functional stopwords while safeguarding valence-shifting negation markers
              </p>
            </div>
            {expandedStages[3] ? (
              <ChevronUp className="w-4 h-4 text-[#94A3B8]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#94A3B8]" />
            )}
          </button>
          {expandedStages[3] && (
            <div className="px-4 pb-3.5 pt-2 border-t border-white/[0.05] space-y-3">
              <div>
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#4ADE80] mb-1.5">
                  <Check className="w-3.5 h-3.5" />
                  Retained Content &amp; Negation Tokens ({preprocessing.filtered_tokens.length})
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {preprocessing.filtered_tokens.map((tok, i) => {
                    const isNeg = NEGATION_WORDS.has(tok);
                    return (
                      <span
                        key={`${tok}-${i}`}
                        className={cn(
                          'px-2 py-0.5 rounded-md font-mono text-xs border',
                          isNeg
                            ? 'bg-[#EF4444]/25 text-[#FCA5A5] border-[#EF4444]/50 font-bold'
                            : 'bg-[#141829] text-[#E2E8F0] border-white/[0.1]'
                        )}
                      >
                        {tok}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <div className="p-2.5 rounded-lg bg-[#141829]/90 border border-white/[0.06]">
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase text-[#94A3B8] mb-1.5">
                    <Filter className="w-3 h-3 text-[#64748B]" />
                    Stopwords Removed ({removedStopwords.length})
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {removedStopwords.length > 0 ? (
                      removedStopwords.map((sw, i) => (
                        <span
                          key={`${sw}-${i}`}
                          className="px-1.5 py-0.5 rounded text-[11px] font-mono line-through text-[#64748B] bg-white/[0.02]"
                        >
                          {sw}
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-[#64748B]">None removed</span>
                    )}
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-[#EF4444]/[0.06] border border-[#EF4444]/20">
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase text-[#F87171] mb-1.5">
                    <ShieldAlert className="w-3 h-3" />
                    Negation Shifters Preserved ({preservedNegations.length})
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {preservedNegations.length > 0 ? (
                      preservedNegations.map((neg, i) => (
                        <span
                          key={`${neg}-${i}`}
                          className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-[#EF4444]/25 text-[#FCA5A5] border border-[#EF4444]/40"
                        >
                          {neg}
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-[#94A3B8]">
                        No negation words present in input
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* STAGE 4 */}
        <div className="relative rounded-xl bg-[#090B14]/80 border border-white/[0.07] overflow-hidden">
          <span className="absolute -left-[23px] sm:-left-[27px] top-4 w-5 h-5 rounded-full bg-[#22C55E] text-[10px] font-bold text-[#090B14] flex items-center justify-center ring-4 ring-[#141829]">
            4
          </span>
          <button
            onClick={() => toggleStage(4)}
            className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-white/[0.02]"
          >
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#4ADE80]">
                Stage 4 &bull; Morphological Lemmatization &amp; Affective Trigger Tagging ({preprocessing.lemmas.length} Lemmas)
              </span>
              <p className="text-[11px] text-[#94A3B8] mt-0.5">
                Maps inflected academic vocabulary to canonical root forms and tags matched emotion lexicon stems
              </p>
            </div>
            {expandedStages[4] ? (
              <ChevronUp className="w-4 h-4 text-[#94A3B8]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#94A3B8]" />
            )}
          </button>
          {expandedStages[4] && (
            <div className="px-4 pb-3.5 pt-2 border-t border-white/[0.05]">
              <div className="flex flex-wrap gap-1.5">
                {preprocessing.lemmas.map((lemma, i) => {
                  const trig = triggerMap.get(lemma);
                  return (
                    <span
                      key={`${lemma}-${i}`}
                      title={
                        trig
                          ? `Emotion Trigger: ${trig.emotion} (Weight: ${trig.weight})`
                          : undefined
                      }
                      className={cn(
                        'px-2.5 py-1 rounded-lg font-mono text-xs border flex items-center gap-1',
                        trig
                          ? 'bg-[#F59E0B]/20 text-[#FDE68A] border-[#F59E0B]/50 font-semibold shadow-sm'
                          : 'bg-[#22C55E]/10 text-[#86EFAC] border-[#22C55E]/30'
                      )}
                    >
                      {lemma}
                      {trig && <Sparkles className="w-3 h-3 text-[#FBBF24]" />}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* STAGE 5 */}
        <div className="relative rounded-xl bg-[#090B14]/80 border border-white/[0.07] overflow-hidden">
          <span className="absolute -left-[23px] sm:-left-[27px] top-4 w-5 h-5 rounded-full bg-[#06B6D4] text-[10px] font-bold text-[#090B14] flex items-center justify-center ring-4 ring-[#141829]">
            5
          </span>
          <button
            onClick={() => toggleStage(5)}
            className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-white/[0.02]"
          >
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#22D3EE]">
                Stage 5 &bull; Contextual N-Gram Extraction ({preprocessing.bigrams.length} Bigrams)
              </span>
              <p className="text-[11px] text-[#94A3B8] mt-0.5">
                Constructs contiguous lemma bigrams for TF-IDF vectorization and topic modeling
              </p>
            </div>
            {expandedStages[5] ? (
              <ChevronUp className="w-4 h-4 text-[#94A3B8]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#94A3B8]" />
            )}
          </button>
          {expandedStages[5] && (
            <div className="px-4 pb-3.5 pt-2 border-t border-white/[0.05]">
              <div className="flex flex-wrap gap-1.5">
                {preprocessing.bigrams.length > 0 ? (
                  preprocessing.bigrams.map((bg, i) => (
                    <span
                      key={`${bg}-${i}`}
                      className="px-2.5 py-1 rounded-lg font-mono text-xs bg-[#8B5CF6]/15 text-[#DDD6FE] border border-[#8B5CF6]/35"
                    >
                      {bg}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-[#64748B]">
                    Input too short to generate multi-token bigrams.
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

