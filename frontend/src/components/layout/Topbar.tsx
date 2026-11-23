import React, { useState } from 'react';
import {
  Menu,
  Search,
  Bell,
  RefreshCw,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { NAV_ITEMS, type NavTabId } from './Sidebar';
import { cn } from '../../utils/constants';

interface TopbarProps {
  activeTab: NavTabId;
  onSelectTab: (tab: NavTabId) => void;
  onOpenMobileMenu: () => void;
  backendConnected: boolean;
  onRefreshConnection: () => void;
  globalSearch: string;
  onGlobalSearchChange: (val: string) => void;
  onQuickAnalyzeSearch: (text: string) => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  activeTab,
  onSelectTab,
  onOpenMobileMenu,
  backendConnected,
  onRefreshConnection,
  globalSearch,
  onGlobalSearchChange,
  onQuickAnalyzeSearch,
}) => {
  const [notifOpen, setNotifOpen] = useState(false);
  const currentNav = NAV_ITEMS.find((n) => n.id === activeTab) || NAV_ITEMS[0];

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && globalSearch.trim()) {
      if (globalSearch.trim().split(' ').length >= 4) {
        onQuickAnalyzeSearch(globalSearch.trim());
      } else {
        onSelectTab('dashboard');
      }
    }
  };

  return (
    <header className="sticky top-0 z-20 h-16 bg-[#090B14]/85 backdrop-blur-xl border-b border-white/[0.07] px-4 lg:px-8 flex items-center justify-between gap-4">
      {/* Left: Mobile Trigger + Breadcrumb & Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-lg text-[#94A3B8] hover:text-white hover:bg-white/[0.06]"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
            <span
              onClick={() => onSelectTab('overview')}
              className="hover:text-white cursor-pointer transition-colors"
            >
              EduPulse AI
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-[#64748B]" />
            <span className="text-[#A78BFA] font-medium truncate">{currentNav.label}</span>
          </div>
          <h1 className="text-base sm:text-lg font-bold text-white tracking-tight truncate">
            {currentNav.label}
          </h1>
        </div>
      </div>

      {/* Center: Global Search / Quick Analyze Bar */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={globalSearch}
            onChange={(e) => onGlobalSearchChange(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Filter corpus or paste feedback & press Enter to analyze..."
            className="w-full bg-[#141829]/90 border border-white/[0.08] focus:border-[#8B5CF6] rounded-xl pl-10 pr-20 py-2 text-xs text-white placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20 transition-all"
          />
          {globalSearch ? (
            <button
              onClick={() => onQuickAnalyzeSearch(globalSearch)}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 rounded-md bg-[#8B5CF6]/20 hover:bg-[#8B5CF6]/35 text-[#DDD6FE] text-[10px] font-semibold flex items-center gap-1 transition-colors"
            >
              <Sparkles className="w-3 h-3" />
              Analyze
            </button>
          ) : (
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-[#64748B] bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/[0.06]">
              Enter
            </kbd>
          )}
        </div>
      </div>

      {/* Right: Backend Status, Refresh, Notifications, Avatar */}
      <div className="flex items-center gap-2.5">
        <div
          className={cn(
            'hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border',
            backendConnected
              ? 'bg-[#22C55E]/10 text-[#4ADE80] border-[#22C55E]/25'
              : 'bg-[#EF4444]/10 text-[#F87171] border-[#EF4444]/30'
          )}
        >
          {backendConnected ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5 text-[#EF4444]" />
          )}
          <span>
            {backendConnected
              ? window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
                ? 'API 127.0.0.1:5000'
                : 'Cloud API Online'
              : 'API Offline'}
          </span>
        </div>

        <button
          onClick={onRefreshConnection}
          title="Verify backend API connection"
          className="p-2 rounded-xl bg-[#141829] border border-white/[0.07] text-[#94A3B8] hover:text-white hover:border-[#8B5CF6]/40 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen((prev) => !prev)}
            className="relative p-2 rounded-xl bg-[#141829] border border-white/[0.07] text-[#94A3B8] hover:text-white hover:border-[#8B5CF6]/40 transition-colors"
            aria-label="System notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#8B5CF6]" />
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-[#141829] border border-white/[0.1] shadow-card-dark p-4 z-50">
              <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-white/[0.07]">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  System Pipeline Status
                </span>
                <button
                  onClick={() => setNotifOpen(false)}
                  className="text-[11px] text-[#94A3B8] hover:text-white"
                >
                  Close
                </button>
              </div>
              <div className="space-y-2.5 text-xs">
                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                  <p className="font-semibold text-[#4ADE80]">Hybrid Emotion Ensemble Ready</p>
                  <p className="text-[#94A3B8] text-[11px] mt-0.5">
                    Lexicon + Calibrated LinearSVC + Subword SVD Neural MLP active.
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                  <p className="font-semibold text-[#A78BFA]">3 Topic Models Calibrated</p>
                  <p className="text-[#94A3B8] text-[11px] mt-0.5">
                    LDA, NMF, and BERTopic-style c-TF-IDF clusters indexed across 620 evaluations.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Avatar */}
        <button
          onClick={() => onSelectTab('settings')}
          title="System Settings & Diagnostics"
          className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#6366F1] p-[1px] shadow-glow-primary"
        >
          <div className="w-full h-full bg-[#141829] hover:bg-transparent transition-colors rounded-[11px] flex items-center justify-center text-xs font-bold text-white">
            AI
          </div>
        </button>
      </div>
    </header>
  );
};

