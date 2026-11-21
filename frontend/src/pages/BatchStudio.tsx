import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  UploadCloud,
  FileSpreadsheet,
  Play,
  Download,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Sparkles,
  Table,
  Trash2,
  GraduationCap,
  Lightbulb,
  ShieldAlert,
  BookOpen,
} from 'lucide-react';
import { nlpApi } from '../services/api';
import type { BatchAnalysisResponse } from '../types/nlp';
import { EMOTION_BADGE_STYLES, EMOTION_COLORS, TOPIC_COLORS, cn } from '../utils/constants';

interface BatchStudioProps {
  onInspectFeedback: (text: string) => void;
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

const DEFAULT_BATCH_LINES = [
  'The professor explains transformers and attention mechanisms with great clarity and live coding notebooks.',
  'The local GPU lab machines keep crashing during deep learning model training and the Wi-Fi disconnects constantly.',
  'Making the closed-book probability final exam worth seventy percent of the grade causes severe anxiety and sleepless nights.',
  'The database SQL syllabus repeats introductory programming concepts for six weeks and feels super monotonous.',
  'Thank you to the teaching assistants for holding extra evening doubt sessions before the NLP project deadline!',
  'The machine learning exam problem statements were worded so vaguely that nobody knew whether to write code or mathematical proofs.',
].join('\n');

export const BatchStudio: React.FC<BatchStudioProps> = ({ onInspectFeedback }) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // CSV State
  const [fileName, setFileName] = useState<string | null>(null);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvRows, setCsvRows] = useState<Record<string, string>[]>([]);
  const [selectedColumn, setSelectedColumn] = useState<string>('');
  const [selectedSubjectColumn, setSelectedSubjectColumn] = useState<string>('AUTO');

  // Manual Multi-line fallback
  const [manualText, setManualText] = useState<string>(DEFAULT_BATCH_LINES);
  const [inputMode, setInputMode] = useState<'csv' | 'manual'>('csv');

  // Execution & Results State
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [batchResult, setBatchResult] = useState<BatchAnalysisResponse | null>(null);

  const handleFileLoaded = (file: File) => {
    setError(null);
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Invalid file format. Please upload a valid .csv spreadsheet file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = String(e.target?.result || '');
      const lines = content
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);

      if (lines.length < 2) {
        setError('The uploaded CSV file must contain a header row and at least one data row.');
        return;
      }

      const headers = parseCsvLine(lines[0]);
      const parsedRows: Record<string, string>[] = [];
      for (let i = 1; i < Math.min(lines.length, 201); i++) {
        const vals = parseCsvLine(lines[i]);
        const rowObj: Record<string, string> = {};
        headers.forEach((h, idx) => {
          rowObj[h] = vals[idx] || '';
        });
        parsedRows.push(rowObj);
      }

      setFileName(file.name);
      setCsvHeaders(headers);
      setCsvRows(parsedRows);
      setInputMode('csv');

      // Auto-detect best feedback text column
      const candidateCols = [
        'feedback_text',
        'student_comment',
        'feedback',
        'text',
        'review',
        'comment',
        'comments',
        'evaluation',
      ];
      const matchedTextCol =
        headers.find((h) => candidateCols.includes(h.toLowerCase().trim())) ||
        headers[headers.length - 1] ||
        headers[0];
      setSelectedColumn(matchedTextCol);

      // Auto-detect best subject / course column
      const subjCandidates = [
        'subject_title',
        'course_name',
        'course_code',
        'subject',
        'course',
        'department',
      ];
      let matchedSubjCol = 'AUTO';
      for (const sc of subjCandidates) {
        const found = headers.find(
          (h) => h.toLowerCase().trim() === sc && h !== matchedTextCol
        );
        if (found) {
          matchedSubjCol = found;
          break;
        }
      }
      setSelectedSubjectColumn(matchedSubjCol);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileLoaded(e.dataTransfer.files[0]);
    }
  };

  const handleRunBatch = async () => {
    setError(null);
    let textsToAnalyze: string[] = [];
    let subjectsToAnalyze: string[] = [];

    if (inputMode === 'csv' && csvRows.length > 0) {
      if (!selectedColumn) {
        setError('Please select the CSV column containing student feedback text.');
        return;
      }
      for (const row of csvRows.slice(0, 200)) {
        const txt = (row[selectedColumn] || '').trim();
        if (txt) {
          textsToAnalyze.push(txt);
          if (selectedSubjectColumn && selectedSubjectColumn !== 'AUTO') {
            subjectsToAnalyze.push((row[selectedSubjectColumn] || '').trim());
          }
        }
      }
    } else {
      textsToAnalyze = manualText
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean)
        .slice(0, 200);
    }

    if (textsToAnalyze.length === 0) {
      setError('No valid non-empty feedback lines found to analyze.');
      return;
    }

    setLoading(true);
    setProgress(25);
    const timer = setInterval(() => {
      setProgress((p) => (p < 88 ? p + 14 : p));
    }, 180);

    try {
      const response = await nlpApi.analyzeBatchTexts(
        textsToAnalyze,
        subjectsToAnalyze.length > 0 ? subjectsToAnalyze : undefined
      );
      setProgress(100);
      setBatchResult(response);
    } catch (err: any) {
      setError(
        err?.response?.data?.error ||
          'Failed to process batch analysis. Verify Flask backend is running on 127.0.0.1:5000.'
      );
    } finally {
      clearInterval(timer);
      setLoading(false);
    }
  };

  const handleDownloadCsv = () => {
    if (!batchResult || !batchResult.results.length) return;
    const headers = [
      'Index',
      'Subject_Course',
      'Feedback_Text',
      'Predicted_Emotion',
      'Emotion_Confidence_Pct',
      'Primary_Topic',
      'LDA_Topic',
      'NMF_Topic',
      'BERTopic_Cluster',
      'Sentiment_Polarity',
      'Pedagogical_Recommendation',
    ];

    const rows = batchResult.results.map((r) => [
      r.index,
      `"${String(r.subject || 'General Course').replace(/"/g, '""')}"`,
      `"${String(r.feedback_text).replace(/"/g, '""')}"`,
      `"${r.emotion}"`,
      r.emotion_confidence,
      `"${r.topic}"`,
      `"${r.lda_topic}"`,
      `"${r.nmf_topic}"`,
      `"${r.bertopic_topic}"`,
      `"${r.sentiment}"`,
      `"${String(r.recommendation).replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `edupulse_annotated_batch_${batchResult.total_analyzed}_rows.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      {/* Top Mode Switcher & Instructions */}
      <div className="rounded-2xl bg-[#141829]/90 border border-white/[0.08] p-5 sm:p-6 shadow-card-dark space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#6366F1] flex items-center justify-center text-white shadow-glow-primary">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white">
                Batch CSV Studio &amp; Subject-Wise Faculty Action Planner
              </h2>
              <p className="text-xs text-[#94A3B8]">
                Connected to <code className="font-mono text-[#A78BFA]">POST /api/batch</code> &bull; Upload a CSV dataset to generate row-level annotations and subject-wise teacher measures
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-[#090B14] p-1 rounded-xl border border-white/[0.08]">
            <button
              onClick={() => setInputMode('csv')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors',
                inputMode === 'csv'
                  ? 'bg-[#8B5CF6] text-white'
                  : 'text-[#94A3B8] hover:text-white'
              )}
            >
              CSV File Upload
            </button>
            <button
              onClick={() => setInputMode('manual')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors',
                inputMode === 'manual'
                  ? 'bg-[#8B5CF6] text-white'
                  : 'text-[#94A3B8] hover:text-white'
              )}
            >
              Multi-Line Stream
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/35 p-3.5 flex items-center gap-2.5 text-xs text-[#FCA5A5]">
            <AlertCircle className="w-4 h-4 text-[#EF4444] shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {inputMode === 'csv' ? (
          <div className="space-y-4">
            {/* Drag and Drop Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                'cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all',
                dragActive
                  ? 'border-[#8B5CF6] bg-[#8B5CF6]/10'
                  : 'border-white/[0.12] hover:border-[#8B5CF6]/50 bg-[#090B14]/60'
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleFileLoaded(e.target.files[0]);
                }}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-2xl bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 flex items-center justify-center text-[#A78BFA] mx-auto mb-3">
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-white">
                {fileName ? `Loaded: ${fileName}` : 'Drag & drop your CSV file here, or click to browse'}
              </p>
              <p className="text-xs text-[#94A3B8] mt-1">
                Try <code className="font-mono text-[#CBD5E1]">data/batch_test_student_feedback.csv</code> or <code className="font-mono text-[#CBD5E1]">data/mid_semester_quick_eval_2026.csv</code>
              </p>
            </div>

            {/* CSV Preview & Column Detection */}
            {csvRows.length > 0 && (
              <div className="rounded-xl bg-[#090B14]/90 border border-white/[0.08] p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
                    <span className="font-bold text-white">{fileName}</span>
                    <span className="px-2 py-0.5 rounded-full bg-white/[0.06] text-[#CBD5E1] font-mono">
                      {csvRows.length} rows detected
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-white/[0.06] text-[#CBD5E1] font-mono">
                      {csvHeaders.length} columns
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <label className="text-xs text-[#94A3B8] font-medium">
                        Subject / Course Column:
                      </label>
                      <select
                        value={selectedSubjectColumn}
                        onChange={(e) => setSelectedSubjectColumn(e.target.value)}
                        className="bg-[#141829] border border-[#06B6D4]/40 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#22D3EE] focus:outline-none"
                      >
                        <option value="AUTO">Auto-Infer Subject from Text</option>
                        {csvHeaders.map((col) => (
                          <option key={col} value={col}>
                            {col}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <label className="text-xs text-[#94A3B8] font-medium">
                        Feedback Text Column:
                      </label>
                      <select
                        value={selectedColumn}
                        onChange={(e) => setSelectedColumn(e.target.value)}
                        className="bg-[#141829] border border-[#8B5CF6]/40 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-white focus:outline-none"
                      >
                        {csvHeaders.map((col) => (
                          <option key={col} value={col}>
                            {col}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={() => {
                        setFileName(null);
                        setCsvHeaders([]);
                        setCsvRows([]);
                      }}
                      className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#EF4444] hover:bg-white/[0.04]"
                      title="Remove CSV file"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* CSV Preview Table (First 4 Rows) */}
                <div className="overflow-x-auto border-t border-white/[0.06] pt-2">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B] mb-2 flex items-center gap-1.5">
                    <Table className="w-3.5 h-3.5" /> Raw CSV Preview (First 4 Rows)
                  </div>
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-white/[0.06] text-[#94A3B8]">
                        {csvHeaders.slice(0, 6).map((h) => (
                          <th
                            key={h}
                            className={cn(
                              'py-2 px-2.5 font-mono text-[11px]',
                              h === selectedColumn && 'text-[#A78BFA] font-bold underline',
                              h === selectedSubjectColumn && 'text-[#22D3EE] font-bold underline'
                            )}
                          >
                            {h}{' '}
                            {h === selectedColumn
                              ? '(Feedback)'
                              : h === selectedSubjectColumn
                              ? '(Subject)'
                              : ''}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {csvRows.slice(0, 4).map((r, idx) => (
                        <tr key={idx}>
                          {csvHeaders.slice(0, 6).map((h) => (
                            <td
                              key={h}
                              className={cn(
                                'py-2 px-2.5 truncate max-w-[240px]',
                                h === selectedColumn
                                  ? 'text-white font-medium'
                                  : h === selectedSubjectColumn
                                  ? 'text-[#22D3EE] font-semibold'
                                  : 'text-[#94A3B8]'
                              )}
                            >
                              {r[h]}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between text-xs text-[#94A3B8] mb-2">
              <span>Enter one student evaluation per line:</span>
              <span className="font-mono">
                {
                  manualText
                    .split(/\r?\n/)
                    .map((s) => s.trim())
                    .filter(Boolean).length
                }{' '}
                lines ready
              </span>
            </div>
            <textarea
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              rows={6}
              className="w-full rounded-xl bg-[#090B14] border border-white/[0.09] focus:border-[#8B5CF6] p-4 text-xs sm:text-sm text-white font-mono leading-relaxed focus:outline-none"
            />
          </div>
        )}

        {/* Progress Bar during processing */}
        {loading && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-[#A78BFA]">
              <span>Running 5-stage preprocessing, Hybrid Emotion Ensemble, Topic Models &amp; Subject-Wise Teacher Planner...</span>
              <span className="font-mono font-bold">{progress}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-[#090B14] overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/[0.06]">
          <div className="text-xs text-[#94A3B8]">
            {inputMode === 'csv' && csvRows.length === 0 ? (
              <span>
                Tip: Upload <code className="text-white">data/batch_test_student_feedback.csv</code> or switch to{' '}
                <button
                  onClick={() => setInputMode('manual')}
                  className="text-[#A78BFA] underline font-semibold"
                >
                  Multi-Line Stream
                </button>{' '}
                to test immediately.
              </span>
            ) : (
              <span>Generates per-student annotations AND aggregated subject-wise teacher measures below.</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {batchResult && (
              <button
                onClick={handleDownloadCsv}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#4ADE80] bg-[#22C55E]/15 hover:bg-[#22C55E]/25 border border-[#22C55E]/35 flex items-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download Annotated CSV ({batchResult.total_analyzed})
              </button>
            )}

            <button
              onClick={handleRunBatch}
              disabled={loading || (inputMode === 'csv' && csvRows.length === 0)}
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] hover:from-[#7C3AED] hover:to-[#4F46E5] shadow-glow-primary disabled:opacity-40 flex items-center gap-2 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing Batch...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Analyze Batch Dataset
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Batch Results Summary, Annotated Preview Table & Subject-Wise Teacher Action Plan */}
      {batchResult && (
        <div className="space-y-6">
          {/* Distribution Summary Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Emotion Distribution Summary */}
            <div className="rounded-2xl bg-[#141829]/90 border border-white/[0.08] p-5 sm:p-6 shadow-card-dark">
              <h3 className="text-sm sm:text-base font-bold text-white mb-4">
                Batch Emotion Distribution Summary ({batchResult.total_analyzed} Analyzed)
              </h3>
              <div className="space-y-3">
                {Object.entries(batchResult.emotion_counts)
                  .sort((a, b) => b[1] - a[1])
                  .map(([emo, count]) => {
                    const pct = Math.round((count / batchResult.total_analyzed) * 1000) / 10;
                    const color = EMOTION_COLORS[emo] || '#8B5CF6';
                    return (
                      <div key={emo} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-[#E2E8F0]">{emo}</span>
                          <span className="font-mono font-bold text-white">
                            {count} ({pct}%)
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-[#090B14] overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${Math.max(4, pct)}%`, backgroundColor: color }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Topic Distribution Summary */}
            <div className="rounded-2xl bg-[#141829]/90 border border-white/[0.08] p-5 sm:p-6 shadow-card-dark">
              <h3 className="text-sm sm:text-base font-bold text-white mb-4">
                Batch Academic Topic Summary
              </h3>
              <div className="space-y-3">
                {Object.entries(batchResult.topic_counts)
                  .sort((a, b) => b[1] - a[1])
                  .map(([top, count]) => {
                    const pct = Math.round((count / batchResult.total_analyzed) * 1000) / 10;
                    const color = TOPIC_COLORS[top] || '#6366F1';
                    return (
                      <div key={top} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-[#E2E8F0]">{top}</span>
                          <span className="font-mono font-bold text-white">
                            {count} ({pct}%)
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-[#090B14] overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${Math.max(4, pct)}%`, backgroundColor: color }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* Annotated Results Preview Table */}
          <div className="rounded-2xl bg-[#141829]/90 border border-white/[0.08] p-5 sm:p-6 shadow-card-dark">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white">
                  Row-Level Annotated Batch Results Table
                </h3>
                <p className="text-xs text-[#94A3B8]">
                  Showing predictions across Subject, Emotion, Supervised Topic, BERTopic c-TF-IDF, and Row-Level Recommendations
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/[0.08] text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]">
                    <th className="py-3 px-2.5">#</th>
                    <th className="py-3 px-2.5">Subject / Course</th>
                    <th className="py-3 px-2.5">Student Feedback</th>
                    <th className="py-3 px-2.5">Predicted Emotion</th>
                    <th className="py-3 px-2.5">Conf.</th>
                    <th className="py-3 px-2.5">Primary Topic</th>
                    <th className="py-3 px-2.5">Pedagogical Recommendation</th>
                    <th className="py-3 px-2.5 text-right">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05]">
                  {batchResult.results.map((r) => {
                    const badgeStyle =
                      EMOTION_BADGE_STYLES[r.emotion] ||
                      'bg-[#8B5CF6]/15 text-[#C084FC] border-[#8B5CF6]/30';
                    return (
                      <tr key={r.index} className="hover:bg-white/[0.02]">
                        <td className="py-3 px-2.5 font-mono text-[#94A3B8]">{r.index}</td>
                        <td className="py-3 px-2.5 font-semibold text-[#22D3EE] whitespace-nowrap">
                          {r.subject || 'General Course'}
                        </td>
                        <td className="py-3 px-2.5 text-[#E2E8F0] max-w-xs leading-relaxed">
                          {r.feedback_text}
                        </td>
                        <td className="py-3 px-2.5 whitespace-nowrap">
                          <span
                            className={cn(
                              'inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border',
                              badgeStyle
                            )}
                          >
                            {r.emotion}
                          </span>
                        </td>
                        <td className="py-3 px-2.5 font-mono font-bold text-white whitespace-nowrap">
                          {r.emotion_confidence}%
                        </td>
                        <td className="py-3 px-2.5 text-[#A5B4FC] font-medium whitespace-nowrap">
                          {r.topic}
                        </td>
                        <td className="py-3 px-2.5 text-[#94A3B8] max-w-xs leading-relaxed">
                          {r.recommendation}
                        </td>
                        <td className="py-3 px-2.5 text-right whitespace-nowrap">
                          <button
                            onClick={() => onInspectFeedback(r.feedback_text)}
                            className="px-2.5 py-1 rounded-lg bg-[#8B5CF6]/15 hover:bg-[#8B5CF6]/30 text-[#DDD6FE] border border-[#8B5CF6]/30 text-[11px] font-semibold inline-flex items-center gap-1"
                          >
                            <Sparkles className="w-3 h-3" />
                            Inspect
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* =====================================================================
              SUBJECT-WISE TEACHER ACTION PLAN & PEDAGOGICAL MEASURES (AT THE END)
          ====================================================================== */}
          {batchResult.subject_wise_suggestions &&
            batchResult.subject_wise_suggestions.length > 0 && (
              <div className="rounded-3xl bg-gradient-to-br from-[#141829] via-[#141829] to-[#8B5CF6]/10 border border-[#8B5CF6]/35 p-6 shadow-glow-primary space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#8B5CF6] to-[#06B6D4] flex items-center justify-center text-white shadow-glow-primary">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base sm:text-lg font-extrabold text-white">
                          Subject-Wise Teacher Action Plan &amp; Pedagogical Measures
                        </h3>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#8B5CF6]/25 text-[#DDD6FE] border border-[#8B5CF6]/40">
                          {batchResult.subject_wise_suggestions.length} Subjects Aggregated
                        </span>
                      </div>
                      <p className="text-xs text-[#94A3B8] mt-0.5">
                        Synthesized faculty recommendations and corrective measures tailored to each subject teacher based on aggregated student emotions and topics
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                  {batchResult.subject_wise_suggestions.map((subjItem) => {
                    const isUrgent = subjItem.priority_level.includes('Immediate');
                    const isModerate = subjItem.priority_level.includes('Targeted');
                    const emoBadge =
                      EMOTION_BADGE_STYLES[subjItem.dominant_emotion] ||
                      'bg-[#8B5CF6]/15 text-[#C084FC] border-[#8B5CF6]/30';

                    return (
                      <div
                        key={subjItem.subject}
                        className="rounded-2xl bg-[#090B14]/90 border border-white/[0.09] p-5 flex flex-col justify-between space-y-4 relative overflow-hidden"
                      >
                        <div
                          className="absolute top-0 left-0 right-0 h-1"
                          style={{
                            backgroundColor: isUrgent
                              ? '#EF4444'
                              : isModerate
                              ? '#F59E0B'
                              : '#22C55E',
                          }}
                        />

                        <div>
                          {/* Subject Header & Priority Pill */}
                          <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                            <div>
                              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#94A3B8]">
                                Subject Evaluation Summary &bull; {subjItem.total_reviews}{' '}
                                {subjItem.total_reviews === 1 ? 'Review' : 'Reviews'}
                              </span>
                              <h4 className="text-sm sm:text-base font-bold text-white mt-0.5 flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-[#22D3EE] shrink-0" />
                                <span>{subjItem.subject}</span>
                              </h4>
                            </div>

                            <span
                              className={cn(
                                'px-2.5 py-1 rounded-lg text-[11px] font-bold border flex items-center gap-1',
                                isUrgent
                                  ? 'bg-[#EF4444]/15 text-[#FCA5A5] border-[#EF4444]/35'
                                  : isModerate
                                  ? 'bg-[#F59E0B]/15 text-[#FDE68A] border-[#F59E0B]/35'
                                  : 'bg-[#22C55E]/15 text-[#86EFAC] border-[#22C55E]/35'
                              )}
                            >
                              {isUrgent ? (
                                <ShieldAlert className="w-3.5 h-3.5 text-[#EF4444]" />
                              ) : (
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              )}
                              {subjItem.priority_level}
                            </span>
                          </div>

                          {/* Sentiment Balance Bar & Key Tags */}
                          <div className="p-3 rounded-xl bg-[#141829] border border-white/[0.06] space-y-2 mb-3.5">
                            <div className="flex items-center justify-between text-[11px] font-mono">
                              <span className="text-[#4ADE80]">
                                Positive: {subjItem.positive_pct}%
                              </span>
                              <span className="text-[#C084FC]">
                                Constructive: {subjItem.neutral_pct}%
                              </span>
                              <span className="text-[#F87171]">
                                Negative: {subjItem.negative_pct}%
                              </span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-[#090B14] overflow-hidden flex">
                              <div
                                style={{ width: `${subjItem.positive_pct}%` }}
                                className="h-full bg-[#22C55E]"
                              />
                              <div
                                style={{ width: `${subjItem.neutral_pct}%` }}
                                className="h-full bg-[#8B5CF6]"
                              />
                              <div
                                style={{ width: `${subjItem.negative_pct}%` }}
                                className="h-full bg-[#EF4444]"
                              />
                            </div>
                            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                              <span className="text-[#94A3B8]">
                                Dominant Emotion:{' '}
                                <span
                                  className={cn(
                                    'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ml-1',
                                    emoBadge
                                  )}
                                >
                                  {subjItem.dominant_emotion}
                                </span>
                              </span>
                              <span className="text-[#94A3B8]">
                                Focus Topic:{' '}
                                <strong className="text-[#A5B4FC]">
                                  {subjItem.primary_focus_topic}
                                </strong>
                              </span>
                            </div>
                          </div>

                          {/* Executive Summary Directive for the Subject Teacher */}
                          <div className="p-3 rounded-xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/25 mb-3">
                            <div className="text-[11px] font-bold uppercase tracking-wider text-[#C084FC] flex items-center gap-1.5 mb-1">
                              <Lightbulb className="w-3.5 h-3.5 text-[#FBBF24]" />
                              Primary Teacher Directive
                            </div>
                            <p className="text-xs text-[#F8FAFC] leading-relaxed font-medium">
                              {subjItem.summary_action}
                            </p>
                          </div>

                          {/* Bulleted Concrete Measures Teacher Should Take */}
                          <div>
                            <div className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] mb-2">
                              Recommended Measures for Subject Teacher:
                            </div>
                            <ul className="space-y-2">
                              {subjItem.teacher_measures.map((measure, mIdx) => (
                                <li
                                  key={mIdx}
                                  className="text-xs text-[#CBD5E1] leading-relaxed flex items-start gap-2 bg-white/[0.02] p-2.5 rounded-lg border border-white/[0.04]"
                                >
                                  <span className="w-5 h-5 rounded-full bg-[#8B5CF6]/20 text-[#C084FC] font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                                    {mIdx + 1}
                                  </span>
                                  <span>{measure}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
        </div>
      )}
    </motion.div>
  );
};
