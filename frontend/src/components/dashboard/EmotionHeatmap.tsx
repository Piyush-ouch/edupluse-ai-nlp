import React from 'react';
import { Grid } from 'lucide-react';
import type { TopicEmotionHeatmapRow } from '../../types/nlp';

interface EmotionHeatmapProps {
  heatmapRows: TopicEmotionHeatmapRow[];
  emotionsList: string[];
}

export const EmotionHeatmap: React.FC<EmotionHeatmapProps> = ({
  heatmapRows,
  emotionsList,
}) => {
  let maxCell = 1;
  heatmapRows.forEach((row) => {
    emotionsList.forEach((emo) => {
      const val = Number(row[emo] || 0);
      if (val > maxCell) maxCell = val;
    });
  });

  return (
    <div className="rounded-2xl bg-[#141829]/90 border border-white/[0.08] p-5 sm:p-6 shadow-card-dark">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 flex items-center justify-center text-[#A78BFA]">
            <Grid className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white">
              Topic &times; Emotion Co-Occurrence Heatmap
            </h3>
            <p className="text-xs text-[#94A3B8]">
              Cross-tabulation matrix mapping which academic topics trigger positive vs. negative student emotions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-[11px] text-[#94A3B8]">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-[#22C55E]/60 inline-block" />
            Positive Affect
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-[#EF4444]/60 inline-block" />
            Negative / Pain Point
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-[#8B5CF6]/60 inline-block" />
            Constructive / Neutral
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="border-b border-white/[0.08] text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]">
              <th className="py-3 px-3 text-left">Academic Topic \ Student Emotion</th>
              {emotionsList.map((emo) => (
                <th key={emo} className="py-3 px-2.5 text-center">
                  {emo}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05]">
            {heatmapRows.map((row) => (
              <tr key={row.topic} className="hover:bg-white/[0.02] transition-colors">
                <td className="py-3 px-3 font-semibold text-white whitespace-nowrap">
                  {row.topic}
                </td>
                {emotionsList.map((emo) => {
                  const val = Number(row[emo] || 0);
                  const ratio = val / maxCell;
                  const alpha = val === 0 ? 0.03 : Math.min(0.85, Math.max(0.14, ratio));
                  const isPos = emo.includes('Joy') || emo.includes('Appreciation');
                  const isConstructive = emo.includes('Confusion') || emo.includes('Boredom');

                  const bg =
                    val === 0
                      ? 'rgba(255, 255, 255, 0.02)'
                      : isPos
                      ? `rgba(34, 197, 94, ${alpha})`
                      : isConstructive
                      ? `rgba(139, 92, 246, ${alpha})`
                      : `rgba(239, 68, 68, ${alpha})`;

                  return (
                    <td key={emo} className="p-1.5 text-center">
                      <div
                        style={{ backgroundColor: bg }}
                        className="py-2 px-2 rounded-lg font-mono font-bold text-white transition-transform hover:scale-105 border border-white/[0.05]"
                        title={`${row.topic} × ${emo}: ${val} evaluations`}
                      >
                        {val}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

