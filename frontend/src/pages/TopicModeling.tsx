import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Network,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Compass,
  Filter,
} from 'lucide-react';
import type { TopicsComparisonResponse, DocumentClusterPoint2D } from '../types/nlp';
import { TOPIC_COLORS, EMOTION_COLORS, cn } from '../utils/constants';

interface TopicModelingProps {
  data: TopicsComparisonResponse | null;
  loading: boolean;
  onInspectFeedback: (text: string) => void;
}

export const TopicModeling: React.FC<TopicModelingProps> = ({
  data,
  loading,
  onInspectFeedback,
}) => {
  const modelKeys = data ? Object.keys(data.topic_models) : [];
  const [selectedAlg, setSelectedAlg] = useState<string>(
    modelKeys[2] || modelKeys[0] || 'BERTopic-Style (Semantic Embeddings + c-TF-IDF)'
  );
  const [colorMode, setColorMode] = useState<'topic' | 'emotion'>('topic');
  const [topicFilter, setTopicFilter] = useState<string>('ALL');

  // Zoom & Pan state for 2D Semantic Scatter Plot
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const screenPointsRef = useRef<
    { sx: number; sy: number; pt: DocumentClusterPoint2D; color: string }[]
  >([]);
  const [hoveredPoint, setHoveredPoint] = useState<{
    sx: number;
    sy: number;
    pt: DocumentClusterPoint2D;
    color: string;
  } | null>(null);

  useEffect(() => {
    if (data && !data.topic_models[selectedAlg]) {
      const keys = Object.keys(data.topic_models);
      if (keys.length > 0) setSelectedAlg(keys[keys.length - 1]);
    }
  }, [data, selectedAlg]);

  const drawScatter = useCallback(() => {
    if (!data || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const parent = canvas.parentElement;
    if (parent) {
      canvas.width = Math.max(550, parent.clientWidth);
      canvas.height = 440;
    }

    const points = data.document_clusters_2d.filter(
      (p) => topicFilter === 'ALL' || p.topic === topicFilter
    );
    const allPoints = data.document_clusters_2d;

    const xs = allPoints.map((p) => p.x);
    const ys = allPoints.map((p) => p.y);
    const minX = Math.min(...xs, -0.5);
    const maxX = Math.max(...xs, 0.5);
    const minY = Math.min(...ys, -0.5);
    const maxY = Math.max(...ys, 0.5);

    const pad = 48;
    const w = canvas.width - pad * 2;
    const h = canvas.height - pad * 2;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Subtle coordinate grid
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.07)';
    ctx.lineWidth = 1;
    for (let i = 1; i <= 5; i++) {
      const gy = (canvas.height / 6) * i;
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.lineTo(canvas.width, gy);
      ctx.stroke();

      const gx = (canvas.width / 6) * i;
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, canvas.height);
      ctx.stroke();
    }

    const palette = colorMode === 'topic' ? TOPIC_COLORS : EMOTION_COLORS;
    const renderedPoints: {
      sx: number;
      sy: number;
      pt: DocumentClusterPoint2D;
      color: string;
    }[] = [];

    points.forEach((pt) => {
      const baseX = pad + ((pt.x - minX) / (maxX - minX || 1)) * w;
      const baseY = pad + ((pt.y - minY) / (maxY - minY || 1)) * h;

      // Apply zoom & pan around canvas center
      const sx = cx + (baseX - cx) * zoom + pan.x;
      const sy = cy + (baseY - cy) * zoom + pan.y;

      const key = colorMode === 'topic' ? pt.topic : pt.emotion;
      const color = palette[key] || '#8B5CF6';

      // Outer subtle glow
      ctx.beginPath();
      ctx.arc(sx, sy, 6 * Math.min(1.4, Math.max(0.85, zoom * 0.7)), 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.85;
      ctx.fill();
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = '#090B14';
      ctx.stroke();
      ctx.globalAlpha = 1;

      renderedPoints.push({ sx, sy, pt, color });
    });

    screenPointsRef.current = renderedPoints;
  }, [data, colorMode, topicFilter, zoom, pan]);

  useEffect(() => {
    drawScatter();
    window.addEventListener('resize', drawScatter);
    return () => window.removeEventListener('resize', drawScatter);
  }, [drawScatter]);

  if (!data || loading) {
    return (
      <div className="space-y-6">
        <div className="h-44 rounded-2xl bg-[#141829]/60 border border-white/[0.06] animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="h-56 rounded-2xl bg-[#141829]/60 border border-white/[0.06] animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  const activeModel = data.topic_models[selectedAlg] || Object.values(data.topic_models)[0];
  const legendMap = colorMode === 'topic' ? TOPIC_COLORS : EMOTION_COLORS;

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    if (isDragging) {
      setPan({
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y,
      });
      return;
    }

    let found: { sx: number; sy: number; pt: DocumentClusterPoint2D; color: string } | null = null;
    for (const item of screenPointsRef.current) {
      if (Math.hypot(mx - item.sx, my - item.sy) <= 9) {
        found = item;
        break;
      }
    }
    setHoveredPoint(found);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      {/* Algorithm Comparison Table Card */}
      <div className="rounded-2xl bg-[#141829]/90 border border-white/[0.08] p-5 sm:p-6 shadow-card-dark">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 flex items-center justify-center text-[#A78BFA]">
              <Network className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white">
                Unsupervised Topic Modeling Benchmark (LDA vs. NMF vs. BERTopic c-TF-IDF)
              </h2>
              <p className="text-xs text-[#94A3B8]">
                Click any algorithm row or use the selector to inspect its discovered topics and top weighted keywords
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#94A3B8]">Inspect Model:</span>
            <select
              value={selectedAlg}
              onChange={(e) => setSelectedAlg(e.target.value)}
              className="bg-[#090B14] border border-white/[0.1] rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-[#8B5CF6]"
            >
              {Object.keys(data.topic_models).map((alg) => (
                <option key={alg} value={alg}>
                  {alg}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-white/[0.08] text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]">
                <th className="py-3 px-3">Topic Modeling Algorithm</th>
                <th className="py-3 px-3">Mathematical Formulation</th>
                <th className="py-3 px-3">Discovered Topics</th>
                <th className="py-3 px-3">Topic Coherence</th>
                <th className="py-3 px-3">Topic Diversity</th>
                <th className="py-3 px-3">Silhouette Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {Object.entries(data.topic_models).map(([algName, info]) => {
                const isSelected = algName === selectedAlg;
                return (
                  <tr
                    key={algName}
                    onClick={() => setSelectedAlg(algName)}
                    className={cn(
                      'cursor-pointer transition-colors',
                      isSelected ? 'bg-[#8B5CF6]/[0.1]' : 'hover:bg-white/[0.03]'
                    )}
                  >
                    <td className="py-3.5 px-3 font-bold text-white">
                      <div className="flex items-center gap-2">
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-[#A78BFA] shrink-0" />}
                        <span>{algName}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-xs text-[#94A3B8]">{info.algorithm_type}</td>
                    <td className="py-3.5 px-3 font-mono font-semibold text-white">
                      {info.topics.length} Clusters
                    </td>
                    <td className="py-3.5 px-3 font-mono font-bold text-[#4ADE80]">
                      {info.coherence_score}
                    </td>
                    <td className="py-3.5 px-3 font-mono font-bold text-[#A5B4FC]">
                      {info.topic_diversity}%
                    </td>
                    <td className="py-3.5 px-3 font-mono font-bold text-[#FBBF24]">
                      {info.silhouette_score}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Discovered Topics & Top Keywords Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#22D3EE]" />
            <h3 className="text-sm font-bold text-white">
              Discovered Topics &amp; Top Weighted Keywords —{' '}
              <span className="text-[#A78BFA]">{selectedAlg}</span>
            </h3>
          </div>
          <span className="text-xs text-[#94A3B8]">
            {activeModel.topics.length} Topics Discovered
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {activeModel.topics.map((topic) => {
            const color = TOPIC_COLORS[topic.mapped_topic_name] || '#8B5CF6';
            return (
              <div
                key={topic.cluster_id}
                className="rounded-2xl bg-[#141829]/90 border border-white/[0.08] p-5 shadow-card-dark relative overflow-hidden"
              >
                <div
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{ backgroundColor: color }}
                />

                <div className="flex items-start justify-between gap-2 mb-4">
                  <div>
                    <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#94A3B8]">
                      Cluster #{topic.cluster_id + 1} &bull; {topic.document_count} Evaluations
                    </span>
                    <h4 className="text-sm sm:text-base font-bold text-white mt-0.5">
                      {topic.mapped_topic_name}
                    </h4>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#22C55E]/15 text-[#4ADE80] border border-[#22C55E]/30">
                    Coh: {topic.coherence}
                  </span>
                </div>

                {/* Top Keywords Bars */}
                <div className="space-y-2">
                  {topic.keywords.slice(0, 8).map((kw) => {
                    const widthPct = Math.max(10, Math.round(kw.weight * 100));
                    return (
                      <div key={kw.word} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-[#E2E8F0] font-medium">{kw.word}</span>
                          <span className="text-[#94A3B8] text-[11px]">{kw.raw_score}</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-[#090B14] overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${widthPct}%`, backgroundColor: color }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive 2D Semantic Scatter Plot */}
      <div className="rounded-2xl bg-[#141829]/90 border border-white/[0.08] p-5 sm:p-6 shadow-card-dark space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white">
              Interactive 2D Semantic Embedding Scatter Plot (TruncatedSVD Latent Space)
            </h3>
            <p className="text-xs text-[#94A3B8]">
              Plotted from real backend <code className="font-mono text-[#A78BFA]">document_clusters_2d</code> coordinates ({data.document_clusters_2d.length} documents) &bull; Drag to pan, use zoom controls, or click any point to analyze
            </p>
          </div>

          {/* Scatter Plot Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={colorMode}
              onChange={(e) => setColorMode(e.target.value as 'topic' | 'emotion')}
              className="bg-[#090B14] border border-white/[0.1] rounded-xl px-3 py-1.5 text-xs font-semibold text-white focus:outline-none focus:border-[#8B5CF6]"
            >
              <option value="topic">Color By: Academic Topic</option>
              <option value="emotion">Color By: Student Emotion</option>
            </select>

            <div className="flex items-center gap-1 bg-[#090B14] border border-white/[0.08] rounded-xl p-1">
              <button
                onClick={() => setZoom((z) => Math.min(3.5, +(z + 0.3).toFixed(2)))}
                title="Zoom in"
                className="p-1.5 rounded-lg text-[#94A3B8] hover:text-white hover:bg-white/[0.06]"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <span className="text-[11px] font-mono text-[#CBD5E1] px-1.5">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={() => setZoom((z) => Math.max(0.6, +(z - 0.3).toFixed(2)))}
                title="Zoom out"
                className="p-1.5 rounded-lg text-[#94A3B8] hover:text-white hover:bg-white/[0.06]"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setZoom(1);
                  setPan({ x: 0, y: 0 });
                }}
                title="Reset zoom and pan"
                className="p-1.5 rounded-lg text-[#94A3B8] hover:text-white hover:bg-white/[0.06]"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Topic Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-[#94A3B8] flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3" /> Filter Topic:
          </span>
          <button
            onClick={() => setTopicFilter('ALL')}
            className={cn(
              'px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors',
              topicFilter === 'ALL'
                ? 'bg-[#8B5CF6]/25 text-white border-[#8B5CF6]/50'
                : 'bg-[#090B14] text-[#94A3B8] border-white/[0.07] hover:text-white'
            )}
          >
            All Topics ({data.document_clusters_2d.length})
          </button>
          {data.topics_list.map((top) => (
            <button
              key={top}
              onClick={() => setTopicFilter(top)}
              className={cn(
                'px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors',
                topicFilter === top
                  ? 'bg-[#8B5CF6]/25 text-white border-[#8B5CF6]/50'
                  : 'bg-[#090B14] text-[#94A3B8] border-white/[0.07] hover:text-white'
              )}
            >
              {top.split('&')[0].trim()}
            </button>
          ))}
        </div>

        {/* Canvas Container */}
        <div className="relative rounded-2xl bg-[#090B14] border border-white/[0.08] overflow-hidden h-[440px]">
          <canvas
            ref={canvasRef}
            onMouseDown={(e) => {
              setIsDragging(true);
              dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
            }}
            onMouseUp={() => setIsDragging(false)}
            onMouseLeave={() => {
              setIsDragging(false);
              setHoveredPoint(null);
            }}
            onMouseMove={handleCanvasMouseMove}
            onClick={() => {
              if (hoveredPoint) {
                onInspectFeedback(hoveredPoint.pt.text.replace(/\.\.\.$/, ''));
              }
            }}
            className="w-full h-full block cursor-grab active:cursor-grabbing"
          />

          {/* Interactive Hover Tooltip */}
          {hoveredPoint && (
            <div
              style={{
                left: Math.min(
                  (canvasRef.current?.width || 700) - 310,
                  Math.max(12, hoveredPoint.sx + 14)
                ),
                top: Math.max(12, hoveredPoint.sy - 24),
              }}
              className="absolute z-20 pointer-events-none w-72 rounded-xl bg-[#0E1120]/95 backdrop-blur-md border border-[#8B5CF6]/50 p-3.5 shadow-card-dark text-xs space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span
                  className="font-mono font-bold"
                  style={{ color: hoveredPoint.color }}
                >
                  {hoveredPoint.pt.feedback_id} ({hoveredPoint.pt.course_code})
                </span>
                <span className="text-[10px] font-mono text-[#94A3B8]">
                  ({hoveredPoint.pt.x}, {hoveredPoint.pt.y})
                </span>
              </div>
              <div className="text-[11px] text-[#A5B4FC] font-medium">
                Topic: <span className="text-white">{hoveredPoint.pt.topic}</span>
              </div>
              <div className="text-[11px] text-[#4ADE80] font-medium">
                Emotion: <span className="text-white">{hoveredPoint.pt.emotion}</span>
              </div>
              <p className="text-[#E2E8F0] leading-relaxed pt-1 border-t border-white/[0.08]">
                &ldquo;{hoveredPoint.pt.text}&rdquo;
              </p>
              <div className="text-[10px] text-[#C084FC] flex items-center gap-1 pt-0.5">
                <Sparkles className="w-3 h-3" /> Click point to inspect in Live NLP Analyzer
              </div>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-[#CBD5E1]">
          {Object.entries(legendMap).map(([label, color]) => (
            <div key={label} className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full inline-block"
                style={{ backgroundColor: color }}
              />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

