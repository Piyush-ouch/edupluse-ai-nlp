import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  Award,
  Trophy,
  Clock,
  Grid,
  BarChart3,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import type { ModelsBenchmarksResponse, ModelBenchmarkMetrics } from '../types/nlp';
import { EMOTION_BADGE_STYLES, EMOTION_COLORS, cn } from '../utils/constants';

interface BenchmarksProps {
  data: ModelsBenchmarksResponse | null;
  loading: boolean;
}

function computeWeightedF1(model: ModelBenchmarkMetrics): number {
  const entries = Object.values(model.per_class);
  const totalSupport = entries.reduce((acc, c) => acc + c.support, 0);
  if (totalSupport === 0) return model.macro_f1;
  const weightedSum = entries.reduce((acc, c) => acc + c.f1 * c.support, 0);
  return Math.round((weightedSum / totalSupport) * 100) / 100;
}

export const Benchmarks: React.FC<BenchmarksProps> = ({ data, loading }) => {
  const [selectedModelKey, setSelectedModelKey] = useState<string>('');

  // Dynamically identify best model from actual backend Macro F1
  const sortedModels = React.useMemo(() => {
    if (!data?.models) return [];
    return Object.entries(data.models).sort((a, b) => b[1].macro_f1 - a[1].macro_f1);
  }, [data]);

  const bestModelName = sortedModels[0]?.[0] || '';

  useEffect(() => {
    if (bestModelName && !selectedModelKey) {
      setSelectedModelKey(bestModelName);
    }
  }, [bestModelName, selectedModelKey]);

  if (!data || loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="h-44 rounded-2xl bg-[#141829]/60 border border-white/[0.06] animate-pulse"
            />
          ))}
        </div>
        <div className="h-80 rounded-2xl bg-[#141829]/60 border border-white/[0.06] animate-pulse" />
      </div>
    );
  }

  const activeKey =
    selectedModelKey && data.models[selectedModelKey]
      ? selectedModelKey
      : bestModelName;
  const activeMetrics = data.models[activeKey];

  // Prepare grouped bar chart data for all 4 models
  const comparisonChartData = Object.entries(data.models).map(([name, m]) => {
    const shortName = name.includes('Ensemble')
      ? 'Hybrid Ensemble'
      : name.includes('LinearSVC')
      ? 'Calibrated LinearSVC'
      : name.includes('Neural')
      ? 'Subword SVD + MLP'
      : 'Affective Lexicon';
    return {
      name: shortName,
      fullName: name,
      Accuracy: m.accuracy,
      Precision: m.macro_precision,
      Recall: m.macro_recall,
      'Macro F1': m.macro_f1,
      'Weighted F1': computeWeightedF1(m),
    };
  });

  // Prepare class-wise Precision & Recall chart for the selected model
  const classWiseChartData = data.classes.map((cls) => ({
    emotion: cls.split('/')[0].trim(),
    fullEmotion: cls,
    Precision: activeMetrics.per_class[cls]?.precision ?? 0,
    Recall: activeMetrics.per_class[cls]?.recall ?? 0,
    'F1-Score': activeMetrics.per_class[cls]?.f1 ?? 0,
  }));

  // Confusion Matrix max value
  let maxCm = 1;
  activeMetrics.confusion_matrix.forEach((row) =>
    row.forEach((v) => {
      if (v > maxCm) maxCm = v;
    })
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      {/* Top Banner */}
      <div className="rounded-2xl bg-[#141829]/80 border border-white/[0.08] p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#6366F1] flex items-center justify-center text-white shadow-glow-primary">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white">
              Held-Out Test Set Evaluation &amp; Multi-Model Benchmarks
            </h2>
            <p className="text-xs text-[#94A3B8]">
              Stratified Train Split: <strong className="text-white">{data.train_sample_count} docs</strong>{' '}
              &bull; Held-Out Test Split: <strong className="text-white">{data.test_sample_count} docs</strong>{' '}
              &bull; Live metrics from <code className="font-mono text-[#A78BFA]">GET /api/models</code>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/30 text-xs">
          <Trophy className="w-4 h-4 text-[#4ADE80]" />
          <span className="text-[#CBD5E1]">Best Model by Macro F1:</span>
          <strong className="text-[#4ADE80] font-mono">
            {bestModelName.split('(')[0].trim()} ({data.models[bestModelName]?.macro_f1}%)
          </strong>
        </div>
      </div>

      {/* 4 Model Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {Object.entries(data.models).map(([modelName, metrics]) => {
          const isBest = modelName === bestModelName;
          const isSelected = modelName === activeKey;
          const weightedF1 = computeWeightedF1(metrics);

          return (
            <div
              key={modelName}
              onClick={() => setSelectedModelKey(modelName)}
              className={cn(
                'cursor-pointer rounded-2xl p-5 border transition-all relative overflow-hidden flex flex-col justify-between',
                isSelected
                  ? 'bg-[#1A2036] border-[#8B5CF6] shadow-glow-primary'
                  : 'bg-[#141829]/90 border-white/[0.08] hover:border-white/[0.2]'
              )}
            >
              {isBest && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#22C55E] via-[#8B5CF6] to-[#06B6D4]" />
              )}

              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="text-xs font-bold text-white leading-snug">{modelName}</span>
                  {isBest ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#22C55E]/20 text-[#4ADE80] border border-[#22C55E]/40 shrink-0 flex items-center gap-1">
                      <Trophy className="w-3 h-3" /> Top F1
                    </span>
                  ) : isSelected ? (
                    <CheckCircle2 className="w-4 h-4 text-[#A78BFA] shrink-0" />
                  ) : null}
                </div>

                <div className="my-3 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-white font-mono">
                    {metrics.macro_f1}%
                  </span>
                  <span className="text-xs text-[#94A3B8] font-medium">Macro F1</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-white/[0.06]">
                  <div>
                    <span className="text-[#64748B] block text-[10px] uppercase">Accuracy</span>
                    <span className="font-mono font-bold text-[#E2E8F0]">{metrics.accuracy}%</span>
                  </div>
                  <div>
                    <span className="text-[#64748B] block text-[10px] uppercase">Weighted F1</span>
                    <span className="font-mono font-bold text-[#A5B4FC]">{weightedF1}%</span>
                  </div>
                  <div>
                    <span className="text-[#64748B] block text-[10px] uppercase">Precision</span>
                    <span className="font-mono font-semibold text-[#CBD5E1]">
                      {metrics.macro_precision}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[#64748B] block text-[10px] uppercase">Recall</span>
                    <span className="font-mono font-semibold text-[#CBD5E1]">
                      {metrics.macro_recall}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-2.5 border-t border-white/[0.05] flex items-center justify-between text-[11px] text-[#94A3B8] font-mono">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#6366F1]" />
                  {metrics.inference_latency_ms} ms/doc
                </span>
                <span>Train: {metrics.train_time_ms} ms</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row: 1. Model Performance Comparison Chart + 2. Class-Wise Precision/Recall */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-[#141829]/90 border border-white/[0.08] p-5 sm:p-6 shadow-card-dark">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 flex items-center justify-center text-[#A78BFA]">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                Model Performance Comparison Chart
              </h3>
              <p className="text-xs text-[#94A3B8]">
                Accuracy, Precision, Recall &amp; Macro F1 across all 4 emotion architectures
              </p>
            </div>
          </div>

          <div className="h-[270px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonChartData} margin={{ top: 10, right: 10, left: -12, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="#64748B"
                  tick={{ fill: '#E2E8F0', fontSize: 11 }}
                  axisLine={false}
                />
                <YAxis
                  domain={[65, 100]}
                  stroke="#64748B"
                  tick={{ fill: '#94A3B8', fontSize: 11 }}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0E1120',
                    borderColor: 'rgba(139, 92, 246, 0.4)',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#F8FAFC',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="Accuracy" fill="#6366F1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Precision" fill="#06B6D4" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Recall" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Macro F1" fill="#22C55E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Class-wise Precision, Recall & F1 Chart */}
        <div className="rounded-2xl bg-[#141829]/90 border border-white/[0.08] p-5 sm:p-6 shadow-card-dark">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#06B6D4]/15 border border-[#06B6D4]/30 flex items-center justify-center text-[#22D3EE]">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white">
                  Class-Wise Precision, Recall &amp; F1
                </h3>
                <p className="text-xs text-[#94A3B8] truncate max-w-sm">
                  Active Model: <span className="text-[#A78BFA] font-semibold">{activeKey}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="h-[270px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={classWiseChartData} margin={{ top: 10, right: 10, left: -12, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis
                  dataKey="emotion"
                  stroke="#64748B"
                  tick={{ fill: '#E2E8F0', fontSize: 11 }}
                  axisLine={false}
                />
                <YAxis
                  domain={[50, 100]}
                  stroke="#64748B"
                  tick={{ fill: '#94A3B8', fontSize: 11 }}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0E1120',
                    borderColor: 'rgba(6, 182, 212, 0.4)',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#F8FAFC',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="Precision" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Recall" fill="#06B6D4" radius={[4, 4, 0, 0]} />
                <Bar dataKey="F1-Score" fill="#22C55E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row: Multi-Class Confusion Matrix + Emotion-Wise Performance Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Multi-Class Confusion Matrix */}
        <div className="lg:col-span-7 rounded-2xl bg-[#141829]/90 border border-white/[0.08] p-5 sm:p-6 shadow-card-dark">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#22C55E]/15 border border-[#22C55E]/30 flex items-center justify-center text-[#4ADE80]">
                <Grid className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white">
                  Multi-Class Confusion Matrix
                </h3>
                <p className="text-xs text-[#94A3B8]">
                  Rows = True Ground-Truth Emotion &bull; Columns = Predicted Emotion ({activeKey.split('(')[0].trim()})
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/[0.08] text-[10px] font-semibold uppercase tracking-wider text-[#94A3B8]">
                  <th className="py-2.5 px-2 text-left">True \ Pred</th>
                  {data.classes.map((cls) => (
                    <th key={cls} className="py-2.5 px-2 text-center">
                      {cls.split('/')[0].trim()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {activeMetrics.confusion_matrix.map((row, rIdx) => (
                  <tr key={data.classes[rIdx]}>
                    <td className="py-2.5 px-2 font-semibold text-white whitespace-nowrap">
                      {data.classes[rIdx].split('/')[0].trim()}
                    </td>
                    {row.map((val, cIdx) => {
                      const isDiag = rIdx === cIdx;
                      const alpha =
                        val === 0 ? 0.02 : Math.min(0.85, Math.max(0.18, val / maxCm));
                      const bg =
                        val === 0
                          ? 'rgba(255,255,255,0.02)'
                          : isDiag
                          ? `rgba(34, 197, 94, ${alpha})`
                          : `rgba(239, 68, 68, ${alpha})`;
                      return (
                        <td key={cIdx} className="p-1 text-center">
                          <div
                            style={{ backgroundColor: bg }}
                            className={cn(
                              'py-2 px-1.5 rounded-lg font-mono font-bold border border-white/[0.05]',
                              val === 0 ? 'text-[#64748B]' : 'text-white'
                            )}
                            title={`True: ${data.classes[rIdx]} | Predicted: ${data.classes[cIdx]} -> ${val} samples`}
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

        {/* Emotion-Wise Performance Breakdown Table */}
        <div className="lg:col-span-5 rounded-2xl bg-[#141829]/90 border border-white/[0.08] p-5 sm:p-6 shadow-card-dark flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white">
                  Emotion-Wise Performance Breakdown
                </h3>
                <p className="text-xs text-[#94A3B8]">
                  Per-class Precision, Recall, F1 &amp; Support for selected model
                </p>
              </div>
              <select
                value={activeKey}
                onChange={(e) => setSelectedModelKey(e.target.value)}
                className="bg-[#090B14] border border-white/[0.1] rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#8B5CF6] max-w-[180px]"
              >
                {Object.keys(data.models).map((k) => (
                  <option key={k} value={k}>
                    {k.split('(')[0].trim()}
                  </option>
                ))}
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/[0.08] text-[10px] font-semibold uppercase tracking-wider text-[#94A3B8]">
                    <th className="py-2.5 px-2">Emotion Class</th>
                    <th className="py-2.5 px-2">Precision</th>
                    <th className="py-2.5 px-2">Recall</th>
                    <th className="py-2.5 px-2">F1-Score</th>
                    <th className="py-2.5 px-2 text-right">Support</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05]">
                  {data.classes.map((cls) => {
                    const m = activeMetrics.per_class[cls];
                    const badgeStyle =
                      EMOTION_BADGE_STYLES[cls] ||
                      'bg-[#8B5CF6]/15 text-[#C084FC] border-[#8B5CF6]/30';
                    const color = EMOTION_COLORS[cls] || '#8B5CF6';
                    return (
                      <tr key={cls} className="hover:bg-white/[0.02]">
                        <td className="py-2.5 px-2">
                          <span
                            className={cn(
                              'inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border',
                              badgeStyle
                            )}
                          >
                            {cls}
                          </span>
                        </td>
                        <td className="py-2.5 px-2 font-mono text-[#CBD5E1]">{m.precision}%</td>
                        <td className="py-2.5 px-2 font-mono text-[#CBD5E1]">{m.recall}%</td>
                        <td className="py-2.5 px-2 font-mono font-bold" style={{ color }}>
                          {m.f1}%
                        </td>
                        <td className="py-2.5 px-2 font-mono text-right text-[#94A3B8]">
                          {m.support}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-[#94A3B8]">
            <span>Total Held-Out Test Support</span>
            <span className="font-mono font-bold text-white">{data.test_sample_count} samples</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

