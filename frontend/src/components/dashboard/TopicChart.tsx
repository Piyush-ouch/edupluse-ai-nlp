import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import { BarChart2 } from 'lucide-react';
import { TOPIC_COLORS } from '../../utils/constants';

interface TopicChartProps {
  distribution: Record<string, number>;
}

export const TopicChart: React.FC<TopicChartProps> = ({ distribution }) => {
  const chartData = Object.entries(distribution)
    .map(([name, count]) => ({
      name,
      shortName: name.split('&')[0].trim().replace(',', ''),
      count,
      color: TOPIC_COLORS[name] || '#6366F1',
    }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="rounded-2xl bg-[#141829]/90 border border-white/[0.08] p-5 sm:p-6 shadow-card-dark flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#6366F1]/15 border border-[#6366F1]/30 flex items-center justify-center text-[#818CF8]">
            <BarChart2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white">
              Academic Topic Prevalence
            </h3>
            <p className="text-xs text-[#94A3B8]">
              Volume of student feedback across core pedagogical &amp; infrastructure domains
            </p>
          </div>
        </div>
      </div>

      <div className="h-[245px] w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 4, right: 20, left: 10, bottom: 4 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
            <XAxis
              type="number"
              stroke="#64748B"
              tick={{ fill: '#94A3B8', fontSize: 11 }}
              axisLine={false}
            />
            <YAxis
              type="category"
              dataKey="shortName"
              width={118}
              stroke="#64748B"
              tick={{ fill: '#E2E8F0', fontSize: 11, fontWeight: 500 }}
              axisLine={false}
            />
            <Tooltip
              cursor={{ fill: 'rgba(255,255,255,0.03)' }}
              contentStyle={{
                backgroundColor: '#0E1120',
                borderColor: 'rgba(99, 102, 241, 0.4)',
                borderRadius: '12px',
                fontSize: '12px',
                color: '#F8FAFC',
              }}
              formatter={(value: number, _name: string, props: any) => [
                `${value} reviews`,
                props.payload.name,
              ]}
            />
            <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={22}>
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

