import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  ThumbsUp,
  ThumbsDown,
  BookOpen,
  Smile,
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Building2,
} from 'lucide-react';
import { KPICard } from '../components/dashboard/KPICard';
import { EmotionChart } from '../components/dashboard/EmotionChart';
import { TopicChart } from '../components/dashboard/TopicChart';
import { EmotionHeatmap } from '../components/dashboard/EmotionHeatmap';
import type { DashboardResponse } from '../types/nlp';
import { EMOTION_BADGE_STYLES, cn } from '../utils/constants';

interface DashboardProps {
  data: DashboardResponse | null;
  selectedCourse: string;
  onSelectCourse: (course: string) => void;
  loading: boolean;
  onInspectFeedback: (text: string) => void;
  globalSearch?: string;
}

export const Dashboard: React.FC<DashboardProps> = ({
  data,
  selectedCourse,
  onSelectCourse,
  loading,
  onInspectFeedback,
  globalSearch = '',
}) => {
  const [searchQuery, setSearchQuery] = useState(globalSearch);
  const [emotionFilter, setEmotionFilter] = useState('ALL');
  const [topicFilter, setTopicFilter] = useState('ALL');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [sortField, setSortField] = useState<'feedback_id' | 'rating' | 'course_code'>('feedback_id');
  const [sortAsc, setSortAsc] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  React.useEffect(() => {
    if (globalSearch !== undefined) {
      setSearchQuery(globalSearch);
      setPage(1);
    }
  }, [globalSearch]);

  if (!data || loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((n) => (
            <div
              key={n}
              className="h-32 rounded-2xl bg-[#141829]/60 border border-white/[0.06] animate-pulse"
            />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 rounded-2xl bg-[#141829]/60 border border-white/[0.06] animate-pulse" />
          <div className="h-80 rounded-2xl bg-[#141829]/60 border border-white/[0.06] animate-pulse" />
        </div>
      </div>
    );
  }

  const {
    kpis,
    emotion_distribution,
    topic_distribution,
    sentiment_distribution,
    topic_emotion_heatmap,
    emotions_list,
    topics_list,
    course_summary,
    recent_feedback,
  } = data;

  // Compute exact Negative % and Most Discussed Topic from backend payload
  const negCount = sentiment_distribution['Negative'] || 0;
  const negativePct =
    kpis.total_feedback > 0 ? Math.round((negCount / kpis.total_feedback) * 1000) / 10 : 0;

  const mostDiscussedTopic =
    Object.entries(topic_distribution).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';

  const departments = Array.from(new Set(course_summary.map((c) => c.department)));

  // Filtered & sorted feedback explorer rows
  const filteredFeedback = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return recent_feedback
      .filter((item) => {
        const matchEmo = emotionFilter === 'ALL' || item.emotion === emotionFilter;
        const matchTop = topicFilter === 'ALL' || item.topic === topicFilter;
        const matchDept = deptFilter === 'ALL' || item.department === deptFilter;
        const matchQuery =
          !q ||
          item.feedback_text.toLowerCase().includes(q) ||
          item.course_code.toLowerCase().includes(q) ||
          item.course_name.toLowerCase().includes(q) ||
          item.emotion.toLowerCase().includes(q) ||
          item.topic.toLowerCase().includes(q);
        return matchEmo && matchTop && matchDept && matchQuery;
      })
      .sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];
        if (valA < valB) return sortAsc ? -1 : 1;
        if (valA > valB) return sortAsc ? 1 : -1;
        return 0;
      });
  }, [recent_feedback, searchQuery, emotionFilter, topicFilter, deptFilter, sortField, sortAsc]);

  const totalPages = Math.max(1, Math.ceil(filteredFeedback.length / pageSize));
  const paginatedRows = filteredFeedback.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = (field: 'feedback_id' | 'rating' | 'course_code') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      {/* Header Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#141829]/80 border border-white/[0.07] rounded-2xl p-4">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-white">
            Institutional Course Evaluation Intelligence
          </h2>
          <p className="text-xs text-[#94A3B8]">
            Real-time aggregation from <code className="font-mono text-[#A78BFA]">GET /api/dashboard</code>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="text-xs text-[#94A3B8] font-medium">Course Scope:</span>
          <select
            value={selectedCourse}
            onChange={(e) => {
              onSelectCourse(e.target.value);
              setPage(1);
            }}
            className="bg-[#090B14] border border-white/[0.1] rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-[#8B5CF6]"
          >
            <option value="ALL">All University Courses (620 Reviews)</option>
            {course_summary.map((c) => (
              <option key={c.course_code} value={c.course_code}>
                {c.course_code} — {c.course_name} ({c.total_reviews})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 5 Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard
          title="Total Feedback Analyzed"
          value={kpis.total_feedback}
          subtitle={`Avg Rating: ${kpis.average_rating} / 5.0`}
          icon={FileText}
          accent="purple"
        />
        <KPICard
          title="Positive Feedback %"
          value={`${kpis.positive_satisfaction_pct}%`}
          subtitle={`${sentiment_distribution['Positive'] || 0} positive reviews`}
          icon={ThumbsUp}
          accent="green"
        />
        <KPICard
          title="Negative Feedback %"
          value={`${negativePct}%`}
          subtitle={`Pain point: ${kpis.top_pain_point_topic.split('&')[0]}`}
          icon={ThumbsDown}
          accent="red"
        />
        <KPICard
          title="Most Discussed Topic"
          value={mostDiscussedTopic.split('&')[0].trim()}
          subtitle={mostDiscussedTopic}
          icon={BookOpen}
          accent="cyan"
        />
        <KPICard
          title="Most Common Emotion"
          value={kpis.dominant_emotion.split('/')[0].trim()}
          subtitle={kpis.dominant_emotion}
          icon={Smile}
          accent="amber"
        />
      </div>

      {/* Charts Row: Emotion Donut + Academic Topic Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EmotionChart distribution={emotion_distribution} total={kpis.total_feedback} />
        <TopicChart distribution={topic_distribution} />
      </div>

      {/* Topic x Emotion Co-Occurrence Heatmap */}
      <EmotionHeatmap heatmapRows={topic_emotion_heatmap} emotionsList={emotions_list} />

      {/* Department & Course-Wise Feedback Breakdown */}
      <div className="rounded-2xl bg-[#141829]/90 border border-white/[0.08] p-5 sm:p-6 shadow-card-dark">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg bg-[#6366F1]/15 border border-[#6366F1]/30 flex items-center justify-center text-[#818CF8]">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white">
              Department &amp; Course-Wise Feedback Breakdown
            </h3>
            <p className="text-xs text-[#94A3B8]">
              Comparative sentiment, rating, dominant emotion, and top topic across academic departments
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-white/[0.08] text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]">
                <th className="py-3 px-3">Course</th>
                <th className="py-3 px-3">Department</th>
                <th className="py-3 px-3">Reviews</th>
                <th className="py-3 px-3">Avg Rating</th>
                <th className="py-3 px-3">Positive Rate</th>
                <th className="py-3 px-3">Dominant Emotion</th>
                <th className="py-3 px-3">Primary Topic</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {course_summary.map((course) => {
                const badgeStyle =
                  EMOTION_BADGE_STYLES[course.dominant_emotion] ||
                  'bg-[#8B5CF6]/15 text-[#C084FC] border-[#8B5CF6]/30';
                return (
                  <tr
                    key={course.course_code}
                    onClick={() => onSelectCourse(course.course_code)}
                    className="hover:bg-white/[0.03] cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-3">
                      <span className="font-mono font-bold text-[#A5B4FC]">
                        {course.course_code}
                      </span>
                      <span className="block text-xs text-[#94A3B8]">{course.course_name}</span>
                    </td>
                    <td className="py-3.5 px-3 text-xs text-[#CBD5E1]">{course.department}</td>
                    <td className="py-3.5 px-3 font-mono font-semibold text-white">
                      {course.total_reviews}
                    </td>
                    <td className="py-3.5 px-3 font-mono font-bold text-[#FBBF24]">
                      {course.avg_rating} / 5.0
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 rounded-full bg-[#090B14] overflow-hidden">
                          <div
                            className="h-full bg-[#22C55E] rounded-full"
                            style={{ width: `${course.positive_rate_pct}%` }}
                          />
                        </div>
                        <span className="font-mono text-xs font-bold text-[#4ADE80]">
                          {course.positive_rate_pct}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={cn(
                          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border',
                          badgeStyle
                        )}
                      >
                        {course.dominant_emotion}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-xs text-[#CBD5E1] font-medium">
                      {course.top_topic}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Searchable & Filterable Feedback Explorer */}
      <div className="rounded-2xl bg-[#141829]/90 border border-white/[0.08] p-5 sm:p-6 shadow-card-dark space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white">
              Student Feedback Corpus Explorer
            </h3>
            <p className="text-xs text-[#94A3B8]">
              Showing {filteredFeedback.length} matching records &bull; Click any evaluation to inspect in Live NLP Analyzer
            </p>
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search feedback text..."
                className="bg-[#090B14] border border-white/[0.09] focus:border-[#8B5CF6] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-[#64748B] focus:outline-none"
              />
            </div>

            <select
              value={emotionFilter}
              onChange={(e) => {
                setEmotionFilter(e.target.value);
                setPage(1);
              }}
              className="bg-[#090B14] border border-white/[0.09] rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#8B5CF6]"
            >
              <option value="ALL">All Emotions</option>
              {emotions_list.map((emo) => (
                <option key={emo} value={emo}>
                  {emo}
                </option>
              ))}
            </select>

            <select
              value={topicFilter}
              onChange={(e) => {
                setTopicFilter(e.target.value);
                setPage(1);
              }}
              className="bg-[#090B14] border border-white/[0.09] rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#8B5CF6]"
            >
              <option value="ALL">All Academic Topics</option>
              {topics_list.map((top) => (
                <option key={top} value={top}>
                  {top}
                </option>
              ))}
            </select>

            <select
              value={deptFilter}
              onChange={(e) => {
                setDeptFilter(e.target.value);
                setPage(1);
              }}
              className="bg-[#090B14] border border-white/[0.09] rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#8B5CF6]"
            >
              <option value="ALL">All Departments</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            {(searchQuery || emotionFilter !== 'ALL' || topicFilter !== 'ALL' || deptFilter !== 'ALL') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setEmotionFilter('ALL');
                  setTopicFilter('ALL');
                  setDeptFilter('ALL');
                  setPage(1);
                }}
                className="px-2.5 py-1.5 rounded-xl text-xs font-medium text-[#F87171] bg-[#EF4444]/10 hover:bg-[#EF4444]/20 border border-[#EF4444]/25 flex items-center gap-1"
              >
                <Filter className="w-3 h-3" />
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/[0.08] text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]">
                <th
                  onClick={() => handleSort('feedback_id')}
                  className="py-3 px-3 cursor-pointer hover:text-white"
                >
                  <span className="inline-flex items-center gap-1">
                    ID <ArrowUpDown className="w-3 h-3" />
                  </span>
                </th>
                <th
                  onClick={() => handleSort('course_code')}
                  className="py-3 px-3 cursor-pointer hover:text-white"
                >
                  <span className="inline-flex items-center gap-1">
                    Course / Dept <ArrowUpDown className="w-3 h-3" />
                  </span>
                </th>
                <th className="py-3 px-3">Student Feedback Text</th>
                <th className="py-3 px-3">Predicted Emotion</th>
                <th className="py-3 px-3">Academic Topic</th>
                <th
                  onClick={() => handleSort('rating')}
                  className="py-3 px-3 cursor-pointer hover:text-white"
                >
                  <span className="inline-flex items-center gap-1">
                    Rating <ArrowUpDown className="w-3 h-3" />
                  </span>
                </th>
                <th className="py-3 px-3 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {paginatedRows.length > 0 ? (
                paginatedRows.map((row) => {
                  const badgeStyle =
                    EMOTION_BADGE_STYLES[row.emotion] ||
                    'bg-[#8B5CF6]/15 text-[#C084FC] border-[#8B5CF6]/30';
                  return (
                    <tr key={row.feedback_id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-3 font-mono text-[#94A3B8] whitespace-nowrap">
                        {row.feedback_id}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="font-mono font-bold text-[#A5B4FC]">{row.course_code}</span>
                        <span className="block text-[10px] text-[#64748B]">{row.department}</span>
                      </td>
                      <td className="py-3 px-3 text-[#E2E8F0] max-w-md leading-relaxed">
                        {row.feedback_text}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={cn(
                            'inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border',
                            badgeStyle
                          )}
                        >
                          {row.emotion}
                        </span>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#6366F1]/15 text-[#A5B4FC] border border-[#6366F1]/30">
                          {row.topic}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-[#FBBF24] whitespace-nowrap">
                        {row.rating}.0 ★
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => onInspectFeedback(row.feedback_text)}
                          className="px-2.5 py-1 rounded-lg bg-[#8B5CF6]/15 hover:bg-[#8B5CF6]/30 text-[#DDD6FE] border border-[#8B5CF6]/30 text-[11px] font-semibold inline-flex items-center gap-1 transition-colors"
                        >
                          <Sparkles className="w-3 h-3" />
                          Analyze
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#64748B]">
                    No feedback records match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between pt-3 border-t border-white/[0.06] text-xs text-[#94A3B8]">
          <span>
            Page <strong className="text-white">{page}</strong> of{' '}
            <strong className="text-white">{totalPages}</strong> ({filteredFeedback.length} records)
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-lg bg-[#090B14] border border-white/[0.08] text-white disabled:opacity-40 hover:border-[#8B5CF6]"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg bg-[#090B14] border border-white/[0.08] text-white disabled:opacity-40 hover:border-[#8B5CF6]"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

