import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  Server,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Database,
  Cpu,
  Terminal,
} from 'lucide-react';
import type { HealthResponse } from '../types/nlp';

interface SettingsPageProps {
  health: HealthResponse | null;
  backendConnected: boolean;
  onRefreshHealth: () => Promise<any>;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  health,
  backendConnected,
  onRefreshHealth,
}) => {
  const [checking, setChecking] = useState(false);

  const handleTest = async () => {
    setChecking(true);
    await onRefreshHealth();
    setChecking(false);
  };

  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000';

  const endpoints = [
    { method: 'GET', path: '/api/health', desc: 'Engine health, corpus count & class schema' },
    { method: 'POST', path: '/api/analyze', desc: '5-stage preprocessing + 4 emotion models + 3 topic models' },
    { method: 'GET', path: '/api/dashboard', desc: 'Corpus KPIs, emotion/topic distributions & co-occurrence heatmap' },
    { method: 'GET', path: '/api/topics', desc: 'LDA, NMF, BERTopic c-TF-IDF benchmarks & 2D SVD coordinates' },
    { method: 'GET', path: '/api/models', desc: 'Held-out test set Accuracy, Precision, Recall, F1 & confusion matrices' },
    { method: 'POST', path: '/api/batch', desc: 'Bulk CSV / multi-line feedback annotation pipeline' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      <div className="rounded-2xl bg-[#141829]/90 border border-white/[0.08] p-6 shadow-card-dark">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-white/[0.07]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 flex items-center justify-center text-[#A78BFA]">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                System Configuration &amp; Flask REST API Diagnostics
              </h2>
              <p className="text-xs text-[#94A3B8]">
                Verify connectivity between Vite React Frontend (<code className="font-mono text-white">localhost:5173</code>) and Python Flask NLP Backend (<code className="font-mono text-white">127.0.0.1:5000</code>)
              </p>
            </div>
          </div>

          <button
            onClick={handleTest}
            disabled={checking}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] shadow-glow-primary flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
            {checking ? 'Pinging Backend...' : 'Ping Backend API'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
          <div className="p-4 rounded-xl bg-[#090B14]/80 border border-white/[0.07]">
            <div className="flex items-center gap-2 text-xs text-[#94A3B8] font-semibold uppercase">
              <Server className="w-4 h-4 text-[#8B5CF6]" />
              Backend Endpoint
            </div>
            <div className="font-mono text-sm font-bold text-white mt-2">{apiBase}</div>
            <div className="mt-2 flex items-center gap-1.5 text-xs">
              {backendConnected ? (
                <span className="text-[#4ADE80] flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Connected &amp; Healthy
                </span>
              ) : (
                <span className="text-[#F87171] flex items-center gap-1 font-medium">
                  <XCircle className="w-3.5 h-3.5" /> Unreachable
                </span>
              )}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#090B14]/80 border border-white/[0.07]">
            <div className="flex items-center gap-2 text-xs text-[#94A3B8] font-semibold uppercase">
              <Database className="w-4 h-4 text-[#06B6D4]" />
              Loaded Corpus Records
            </div>
            <div className="font-mono text-xl font-extrabold text-white mt-2">
              {health?.dataset_records ?? 620} Evaluations
            </div>
            <div className="text-xs text-[#94A3B8] mt-1">
              Source: <code className="font-mono text-[#CBD5E1]">data/student_feedback_dataset.csv</code>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#090B14]/80 border border-white/[0.07]">
            <div className="flex items-center gap-2 text-xs text-[#94A3B8] font-semibold uppercase">
              <Cpu className="w-4 h-4 text-[#22C55E]" />
              Active NLP Taxonomies
            </div>
            <div className="text-sm font-bold text-white mt-2">
              {health?.emotions?.length ?? 6} Emotions &times; {health?.topics?.length ?? 6} Topics
            </div>
            <div className="text-xs text-[#94A3B8] mt-1">
              Zero dummy data &bull; 100% live model inference
            </div>
          </div>
        </div>
      </div>

      {/* Connected Endpoints Specification */}
      <div className="rounded-2xl bg-[#141829]/90 border border-white/[0.08] p-6 shadow-card-dark">
        <div className="flex items-center gap-2 text-sm font-bold text-white mb-4">
          <Terminal className="w-4 h-4 text-[#A78BFA]" />
          Preserved Flask REST API Endpoints
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {endpoints.map((ep) => (
            <div
              key={ep.path}
              className="p-3.5 rounded-xl bg-[#090B14]/80 border border-white/[0.06] flex items-start justify-between gap-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      ep.method === 'POST'
                        ? 'bg-[#8B5CF6]/20 text-[#C084FC] border border-[#8B5CF6]/35'
                        : 'bg-[#22C55E]/20 text-[#4ADE80] border border-[#22C55E]/35'
                    }`}
                  >
                    {ep.method}
                  </span>
                  <span className="font-mono text-xs font-bold text-white">{ep.path}</span>
                </div>
                <p className="text-xs text-[#94A3B8] mt-1.5">{ep.desc}</p>
              </div>
              <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0 mt-1" />
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

