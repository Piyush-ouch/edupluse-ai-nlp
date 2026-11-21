import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import { PieChart as PieIcon } from 'lucide-react';
import { EMOTION_COLORS } from '../../utils/constants';

interface EmotionChartProps {
  distribution: Record<string, number>;
  total: number;
}

export const EmotionChart: React.FC<EmotionChartProps> = ({ distribution, total }) => {
  const chartData = Object.entries(distribution)
    .map(([name, value]) => ({
      name,
      value,
      pct: total > 0 ? Math.round((value / total) * 1000) / 10 : 0,
      color: EMOTION_COLORS[name] || '#8B5CF6',
    }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="rounded-2xl bg-[#141829]/90 border border-white/[0.08] p-5 sm:p-6 shadow-card-dark flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 flex items-center justify-center text-[#A78BFA]">
            <PieIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white">
              Emotion Distribution (Donut)
            </h3>
            <p className="text-xs text-[#94A3B8]">
              6-class student affective breakdown across {total} evaluations
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-4 my-2">
        <div className="h-[230px] w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={58}
                outerRadius={88}
                paddingAngle={3}
                stroke="none"
              >
                {chartData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0E1120',
                  borderColor: 'rgba(139, 92, 246, 0.4)',
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: '#F8FAFC',
                }}
                formatter={(val: number, name: string) => [`${val} reviews`, name]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-extrabold text-white">{total}</span>
            <span className="text-[10px] uppercase tracking-wider text-[#94A3B8]">
              Evaluations
            </span>
          </div>
        </div>

        {/* Custom Legend */}
        <div className="space-y-2.5">
          {chartData.map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between text-xs p-2 rounded-xl bg-[#090B14]/60 border border-white/[0.04]"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-[#E2E8F0] font-medium truncate">{item.name}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0 font-mono">
                <span className="text-[#94A3B8]">{item.value}</span>
                <span className="font-bold text-white w-12 text-right">{item.pct}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

