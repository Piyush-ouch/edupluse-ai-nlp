import React from 'react';
import { cn } from '../../utils/constants';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  accent?: 'purple' | 'indigo' | 'green' | 'red' | 'amber' | 'cyan';
  badge?: string;
}

const ACCENT_MAP = {
  purple: {
    iconBg: 'bg-[#8B5CF6]/15 text-[#A78BFA] border-[#8B5CF6]/30',
    topBar: 'from-[#8B5CF6] to-[#6366F1]',
  },
  indigo: {
    iconBg: 'bg-[#6366F1]/15 text-[#818CF8] border-[#6366F1]/30',
    topBar: 'from-[#6366F1] to-[#3B82F6]',
  },
  green: {
    iconBg: 'bg-[#22C55E]/15 text-[#4ADE80] border-[#22C55E]/30',
    topBar: 'from-[#22C55E] to-[#10B981]',
  },
  red: {
    iconBg: 'bg-[#EF4444]/15 text-[#F87171] border-[#EF4444]/30',
    topBar: 'from-[#EF4444] to-[#F43F5E]',
  },
  amber: {
    iconBg: 'bg-[#F59E0B]/15 text-[#FBBF24] border-[#F59E0B]/30',
    topBar: 'from-[#F59E0B] to-[#D97706]',
  },
  cyan: {
    iconBg: 'bg-[#06B6D4]/15 text-[#22D3EE] border-[#06B6D4]/30',
    topBar: 'from-[#06B6D4] to-[#3B82F6]',
  },
};

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  accent = 'purple',
  badge,
}) => {
  const styles = ACCENT_MAP[accent];

  return (
    <div className="relative rounded-2xl bg-[#141829]/90 hover:bg-[#1A2036]/90 border border-white/[0.08] hover:border-[#8B5CF6]/35 p-5 shadow-card-dark transition-all duration-200 overflow-hidden group">
      <div className={cn('absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r', styles.topBar)} />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8] truncate">
            {title}
          </p>
          <div className="text-xl sm:text-2xl font-extrabold text-white mt-1.5 tracking-tight truncate">
            {value}
          </div>
        </div>

        <div
          className={cn(
            'w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 transition-transform group-hover:scale-105',
            styles.iconBg
          )}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-white/[0.05]">
        <span className="text-xs text-[#94A3B8] truncate">{subtitle}</span>
        {badge && (
          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-white/[0.05] text-[#CBD5E1] shrink-0">
            {badge}
          </span>
        )}
      </div>
    </div>
  );
};

