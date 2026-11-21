import React from 'react';
import {
  Sparkles,
  LayoutDashboard,
  Cpu,
  BarChart3,
  Network,
  Award,
  FileSpreadsheet,
  Settings,
  ChevronLeft,
  ChevronRight,
  Activity,
  X,
  Mic,
} from 'lucide-react';
import { cn } from '../../utils/constants';

export type NavTabId =
  | 'overview'
  | 'analyzer'
  | 'voice'
  | 'dashboard'
  | 'topics'
  | 'benchmarks'
  | 'batch'
  | 'settings';

interface SidebarProps {
  activeTab: NavTabId;
  onSelectTab: (tab: NavTabId) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  backendConnected: boolean;
  datasetCount: number;
}

export const NAV_ITEMS: {
  id: NavTabId;
  label: string;
  badge?: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: LayoutDashboard,
    description: 'Executive AI intelligence summary',
  },
  {
    id: 'analyzer',
    label: 'Live NLP Analyzer',
    badge: 'Core',
    icon: Sparkles,
    description: 'Real-time emotion & topic pipeline',
  },
  {
    id: 'voice',
    label: 'Voice & Audio Studio',
    badge: 'New',
    icon: Mic,
    description: 'Speech recognition & file sentiment',
  },
  {
    id: 'dashboard',
    label: 'Analytics Dashboard',
    icon: BarChart3,
    description: 'Corpus KPIs & topic-emotion heatmap',
  },
  {
    id: 'topics',
    label: 'Topic Modeling',
    icon: Network,
    description: 'LDA, NMF & BERTopic c-TF-IDF lab',
  },
  {
    id: 'benchmarks',
    label: 'Model Benchmarks',
    icon: Award,
    description: 'F1 metrics & confusion matrix',
  },
  {
    id: 'batch',
    label: 'Batch CSV Studio',
    icon: FileSpreadsheet,
    description: 'Bulk dataset upload & annotation',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    description: 'API endpoint & pipeline diagnostics',
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
  backendConnected,
  datasetCount,
}) => {
  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0E1120] border-r border-white/[0.07] select-none">
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-white/[0.06]">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#6366F1] flex items-center justify-center shadow-glow-primary shrink-0">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[15px] tracking-tight text-white truncate">
                  EduPulse AI
                </span>
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-[#8B5CF6]/20 text-[#C084FC] border border-[#8B5CF6]/30">
                  NLP
                </span>
              </div>
              <p className="text-[11px] text-[#94A3B8] truncate">
                Emotion &amp; Topic Intelligence
              </p>
            </div>
          )}
        </div>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={onToggleCollapse}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="hidden lg:flex w-7 h-7 rounded-lg items-center justify-center text-[#94A3B8] hover:text-white hover:bg-white/[0.06] transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* Mobile Close Button */}
        <button
          onClick={onCloseMobile}
          className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center text-[#94A3B8] hover:text-white hover:bg-white/[0.06]"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {!collapsed && (
          <div className="px-2.5 pb-2 text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
            Workspace Modules
          </div>
        )}
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onSelectTab(item.id);
                onCloseMobile();
              }}
              title={collapsed ? `${item.label} — ${item.description}` : undefined}
              className={cn(
                'w-full group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-gradient-to-r from-[#8B5CF6]/20 to-[#6366F1]/10 text-white border border-[#8B5CF6]/40 shadow-glow-primary'
                  : 'text-[#94A3B8] hover:text-white hover:bg-white/[0.04] border border-transparent'
              )}
            >
              {isActive && (
                <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[#8B5CF6]" />
              )}
              <Icon
                className={cn(
                  'w-[18px] h-[18px] shrink-0 transition-colors',
                  isActive ? 'text-[#A78BFA]' : 'text-[#94A3B8] group-hover:text-white'
                )}
              />
              {!collapsed && (
                <div className="flex-1 flex items-center justify-between min-w-0 text-left">
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-[#8B5CF6]/25 text-[#DDD6FE] border border-[#8B5CF6]/40">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Status & User Profile */}
      <div className="p-3 border-t border-white/[0.06] space-y-2.5">
        {/* Backend Status Card */}
        <div
          className={cn(
            'rounded-xl p-2.5 border transition-colors',
            backendConnected
              ? 'bg-[#22C55E]/[0.06] border-[#22C55E]/25'
              : 'bg-[#EF4444]/[0.08] border-[#EF4444]/30'
          )}
        >
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              {backendConnected && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-75" />
              )}
              <span
                className={cn(
                  'relative inline-flex rounded-full h-2.5 w-2.5',
                  backendConnected ? 'bg-[#22C55E]' : 'bg-[#EF4444]'
                )}
              />
            </span>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white truncate">
                    {backendConnected ? 'Flask NLP Engine Online' : 'Backend Disconnected'}
                  </span>
                </div>
                <p className="text-[11px] text-[#94A3B8] truncate">
                  {backendConnected
                    ? `${datasetCount} Verified Corpus Docs`
                    : 'Run python backend/app.py'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* User Profile & Version */}
        <div className="flex items-center justify-between px-2 py-1.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#6366F1] to-[#06B6D4] flex items-center justify-center text-xs font-bold text-white shrink-0">
              NLP
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">Academic Researcher</p>
                <p className="text-[10px] text-[#94A3B8] truncate">EduPulse v2.4.0 &bull; Port 5000</p>
              </div>
            )}
          </div>
          {!collapsed && <Activity className="w-3.5 h-3.5 text-[#8B5CF6] shrink-0" />}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden lg:block shrink-0 transition-all duration-200 z-30',
          collapsed ? 'w-[72px]' : 'w-64'
        )}
      >
        <div className="fixed top-0 left-0 bottom-0 inherit-width" style={{ width: collapsed ? 72 : 256 }}>
          {sidebarContent}
        </div>
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onCloseMobile}
          />
          <div className="relative w-64 max-w-[80vw] h-full z-10">{sidebarContent}</div>
        </div>
      )}
    </>
  );
};

