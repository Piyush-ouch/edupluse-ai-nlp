import React, { useState } from 'react';
import { Sidebar, type NavTabId } from './Sidebar';
import { Topbar } from './Topbar';

interface DashboardLayoutProps {
  activeTab: NavTabId;
  onSelectTab: (tab: NavTabId) => void;
  backendConnected: boolean;
  datasetCount: number;
  onRefreshConnection: () => void;
  globalSearch: string;
  onGlobalSearchChange: (val: string) => void;
  onQuickAnalyzeSearch: (text: string) => void;
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  activeTab,
  onSelectTab,
  backendConnected,
  datasetCount,
  onRefreshConnection,
  globalSearch,
  onGlobalSearchChange,
  onQuickAnalyzeSearch,
  children,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#090B14] text-[#F8FAFC] flex">
      {/* Subtle Ambient Background Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/4 w-[500px] h-[500px] rounded-full bg-[#8B5CF6]/[0.07] blur-[130px]" />
        <div className="absolute top-1/3 -right-32 w-[420px] h-[420px] rounded-full bg-[#6366F1]/[0.06] blur-[120px]" />
      </div>

      <Sidebar
        activeTab={activeTab}
        onSelectTab={onSelectTab}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        backendConnected={backendConnected}
        datasetCount={datasetCount}
      />

      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <Topbar
          activeTab={activeTab}
          onSelectTab={onSelectTab}
          onOpenMobileMenu={() => setMobileOpen(true)}
          backendConnected={backendConnected}
          onRefreshConnection={onRefreshConnection}
          globalSearch={globalSearch}
          onGlobalSearchChange={onGlobalSearchChange}
          onQuickAnalyzeSearch={onQuickAnalyzeSearch}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

