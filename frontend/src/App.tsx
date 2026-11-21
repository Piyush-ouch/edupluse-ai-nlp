import React, { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from './components/layout/DashboardLayout';
import type { NavTabId } from './components/layout/Sidebar';
import { Overview } from './pages/Overview';
import { Analyzer } from './pages/Analyzer';
import { VoiceStudio } from './pages/VoiceStudio';
import { Dashboard } from './pages/Dashboard';
import { TopicModeling } from './pages/TopicModeling';
import { Benchmarks } from './pages/Benchmarks';
import { BatchStudio } from './pages/BatchStudio';
import { SettingsPage } from './pages/SettingsPage';
import { nlpApi } from './services/api';
import type {
  HealthResponse,
  SingleAnalyzeResponse,
  DashboardResponse,
  TopicsComparisonResponse,
  ModelsBenchmarksResponse,
} from './types/nlp';
import { SAMPLE_FEEDBACK_PRESETS } from './utils/constants';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTabId>('analyzer');
  const [backendConnected, setBackendConnected] = useState<boolean>(true);
  const [health, setHealth] = useState<HealthResponse | null>(null);

  // Global search / quick analyze
  const [globalSearch, setGlobalSearch] = useState<string>('');

  // Tab 1: Live Analyzer State
  const [analyzerInput, setAnalyzerInput] = useState<string>(
    SAMPLE_FEEDBACK_PRESETS[2].text
  );
  const [analyzerResult, setAnalyzerResult] = useState<SingleAnalyzeResponse | null>(null);
  const [analyzerLoading, setAnalyzerLoading] = useState<boolean>(false);
  const [analyzerError, setAnalyzerError] = useState<string | null>(null);

  // Tab 2: Dashboard State
  const [selectedCourse, setSelectedCourse] = useState<string>('ALL');
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState<boolean>(false);

  // Tab 3: Topic Modeling State
  const [topicsData, setTopicsData] = useState<TopicsComparisonResponse | null>(null);
  const [topicsLoading, setTopicsLoading] = useState<boolean>(false);

  // Tab 4: Benchmarks State
  const [modelsData, setModelsData] = useState<ModelsBenchmarksResponse | null>(null);
  const [modelsLoading, setModelsLoading] = useState<boolean>(false);

  // Toast Notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(
    null
  );

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 3200);
  }, []);

  const checkHealth = useCallback(async () => {
    try {
      const h = await nlpApi.checkHealth();
      setHealth(h);
      setBackendConnected(true);
    } catch {
      setBackendConnected(false);
    }
  }, []);

  const handleAnalyze = useCallback(
    async (customText?: string) => {
      const targetText = (customText !== undefined ? customText : analyzerInput).trim();
      if (!targetText) {
        setAnalyzerError('Please enter non-empty student feedback text to analyze.');
        return;
      }

      setAnalyzerLoading(true);
      setAnalyzerError(null);
      try {
        const res = await nlpApi.analyzeFeedback(targetText);
        setAnalyzerResult(res);
        setBackendConnected(true);
      } catch (err: any) {
        setBackendConnected(false);
        setAnalyzerError(
          err?.response?.data?.error ||
            'Could not reach Flask NLP API at http://127.0.0.1:5000. Make sure python backend/app.py is running.'
        );
      } finally {
        setAnalyzerLoading(false);
      }
    },
    [analyzerInput]
  );

  const loadDashboard = useCallback(async (course: string) => {
    setDashboardLoading(true);
    try {
      const data = await nlpApi.getDashboard(course);
      setDashboardData(data);
      setBackendConnected(true);
    } catch {
      setBackendConnected(false);
    } finally {
      setDashboardLoading(false);
    }
  }, []);

  const loadTopics = useCallback(async () => {
    setTopicsLoading(true);
    try {
      const data = await nlpApi.getTopics();
      setTopicsData(data);
      setBackendConnected(true);
    } catch {
      setBackendConnected(false);
    } finally {
      setTopicsLoading(false);
    }
  }, []);

  const loadModels = useCallback(async () => {
    setModelsLoading(true);
    try {
      const data = await nlpApi.getModels();
      setModelsData(data);
      setBackendConnected(true);
    } catch {
      setBackendConnected(false);
    } finally {
      setModelsLoading(false);
    }
  }, []);

  // Initial Bootstrap
  useEffect(() => {
    checkHealth();
    handleAnalyze(SAMPLE_FEEDBACK_PRESETS[2].text);
    loadDashboard('ALL');
    loadTopics();
    loadModels();
  }, []);

  const handleCourseChange = (course: string) => {
    setSelectedCourse(course);
    loadDashboard(course);
    showToast(`Filtered analytics dashboard to ${course === 'ALL' ? 'All Courses' : course}`);
  };

  const handleInspectInAnalyzer = (feedbackText: string) => {
    setAnalyzerInput(feedbackText);
    setActiveTab('analyzer');
    handleAnalyze(feedbackText);
    showToast('Loaded feedback into Live NLP Analyzer');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <DashboardLayout
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      backendConnected={backendConnected}
      datasetCount={health?.dataset_records ?? dashboardData?.kpis.total_feedback ?? 620}
      onRefreshConnection={async () => {
        await checkHealth();
        await loadDashboard(selectedCourse);
        showToast('Refreshed connection to Flask NLP Engine');
      }}
      globalSearch={globalSearch}
      onGlobalSearchChange={setGlobalSearch}
      onQuickAnalyzeSearch={(txt) => {
        handleInspectInAnalyzer(txt);
        setGlobalSearch('');
      }}
    >
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-[#141829]/95 border border-[#8B5CF6]/50 shadow-glow-primary text-xs font-semibold text-white">
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
          ) : (
            <AlertCircle className="w-4 h-4 text-[#EF4444]" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {activeTab === 'overview' && (
        <Overview
          dashboardData={dashboardData}
          modelsData={modelsData}
          topicsData={topicsData}
          onNavigate={setActiveTab}
          onQuickAnalyze={handleInspectInAnalyzer}
        />
      )}

      {activeTab === 'analyzer' && (
        <Analyzer
          inputText={analyzerInput}
          onInputChange={setAnalyzerInput}
          onAnalyze={handleAnalyze}
          onClear={() => {
            setAnalyzerInput('');
            setAnalyzerResult(null);
          }}
          result={analyzerResult}
          loading={analyzerLoading}
          error={analyzerError}
        />
      )}

      {activeTab === 'voice' && (
        <VoiceStudio onOpenInAnalyzer={handleInspectInAnalyzer} />
      )}

      {activeTab === 'dashboard' && (
        <Dashboard
          data={dashboardData}
          selectedCourse={selectedCourse}
          onSelectCourse={handleCourseChange}
          loading={dashboardLoading}
          onInspectFeedback={handleInspectInAnalyzer}
          globalSearch={globalSearch}
        />
      )}

      {activeTab === 'topics' && (
        <TopicModeling
          data={topicsData}
          loading={topicsLoading}
          onInspectFeedback={handleInspectInAnalyzer}
        />
      )}

      {activeTab === 'benchmarks' && (
        <Benchmarks data={modelsData} loading={modelsLoading} />
      )}

      {activeTab === 'batch' && (
        <BatchStudio onInspectFeedback={handleInspectInAnalyzer} />
      )}

      {activeTab === 'settings' && (
        <SettingsPage
          health={health}
          backendConnected={backendConnected}
          onRefreshHealth={checkHealth}
        />
      )}
    </DashboardLayout>
  );
};

export default App;

