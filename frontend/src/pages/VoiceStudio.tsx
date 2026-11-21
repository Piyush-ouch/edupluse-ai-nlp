import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Mic,
  Square,
  UploadCloud,
  Volume2,
  Activity,
  Sparkles,
  FileAudio,
  Download,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Waves,
  Gauge,
  Radio,
} from 'lucide-react';
import { nlpApi } from '../services/api';
import { LivePcmWavRecorder, convertAudioBlobToPcmWav } from '../utils/audioWav';
import type { VoiceAnalyzeResponse } from '../types/nlp';
import { EmotionResults } from '../components/analyzer/EmotionResults';
import { ModelComparison } from '../components/analyzer/ModelComparison';
import { RecommendationCard } from '../components/analyzer/RecommendationCard';
import { EMOTION_BADGE_STYLES, EMOTION_COLORS, cn } from '../utils/constants';

interface VoiceStudioProps {
  onOpenInAnalyzer: (text: string) => void;
}

const VOICE_SAMPLE_PRESETS = [
  { id: 1, label: 'Sample 1: Joy / Pedagogy (.wav)', emotion: 'Joy / Satisfaction' },
  { id: 2, label: 'Sample 2: Frustration / Grading (.wav)', emotion: 'Frustration / Anger' },
  { id: 3, label: 'Sample 3: Anxiety / Workload (.wav)', emotion: 'Anxiety / Stress' },
  { id: 4, label: 'Sample 4: Confusion / Lectures (.wav)', emotion: 'Confusion' },
];

export const VoiceStudio: React.FC<VoiceStudioProps> = ({ onOpenInAnalyzer }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [wavBlobState, setWavBlobState] = useState<Blob | null>(null);
  const [sourceFileName, setSourceFileName] = useState<string>('Microphone Recording');
  const [waveformBars, setWaveformBars] = useState<number[]>(
    Array.from({ length: 48 }, (_, i) => 0.15 + 0.1 * Math.sin(i * 0.4))
  );

  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VoiceAnalyzeResponse | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const pcmRecorderRef = useRef<LivePcmWavRecorder | null>(null);
  const recognitionRef = useRef<any>(null);
  const liveTranscriptRef = useRef<string>('');
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, []);

  const startLiveRecording = async () => {
    setError(null);
    setLiveTranscript('');
    liveTranscriptRef.current = '';
    setRecordingSeconds(0);

    // 1. Start lossless 16kHz PCM WAV capture + real-time 48-bar frequency spectrum
    try {
      const pcmRec = new LivePcmWavRecorder();
      await pcmRec.start((bars) => {
        setWaveformBars(bars);
      });
      pcmRecorderRef.current = pcmRec;
      setIsRecording(true);
      setStatusMessage('Recording live voice... Speak your course feedback clearly.');

      timerRef.current = window.setInterval(() => {
        setRecordingSeconds((s) => s + 1);
      }, 1000);
    } catch {
      setError(
        'Microphone access was blocked or no microphone hardware was found. You can still upload any audio/text file or click a Sample Voice .wav below!'
      );
      return;
    }

    // 2. Also start Browser Web Speech API for real-time caption preview while speaking
    const SpeechRec =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRec) {
      try {
        const rec = new SpeechRec();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = 'en-US';
        rec.onresult = (event: any) => {
          const allParts: string[] = [];
          for (let i = 0; i < event.results.length; i++) {
            const piece = event.results[i][0]?.transcript || '';
            if (piece) allParts.push(piece.trim());
          }
          const combined = allParts.join(' ').trim();
          if (combined) {
            liveTranscriptRef.current = combined;
            setLiveTranscript(combined);
          }
        };
        rec.onerror = () => {};
        rec.start();
        recognitionRef.current = rec;
      } catch {}
    }
  };

  const stopLiveRecording = async () => {
    setIsRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }

    if (pcmRecorderRef.current) {
      setLoading(true);
      setStatusMessage('Transcribing your exact spoken audio via SpeechRecognition...');
      try {
        const encoded = await pcmRecorderRef.current.stop(16000);
        setWaveformBars(encoded.waveformPeaks);
        setWavBlobState(encoded.wavBlob);
        const url = URL.createObjectURL(encoded.wavBlob);
        setAudioUrl(url);
        setSourceFileName('live_microphone_recording.wav');

        // Give Web Speech API 350ms to flush any final word after .stop()
        await new Promise((r) => setTimeout(r, 350));

        const res = await nlpApi.analyzeVoiceOrFile({
          file: encoded.wavBlob,
          filename: 'live_microphone_recording.wav',
          clientTranscript: liveTranscriptRef.current.trim(),
        });
        setResult(res);
        setLiveTranscript(res.transcript);
        setStatusMessage(
          `Voice recognized via ${res.recognition_engine} (${res.acoustics.duration_sec}s)`
        );
      } catch (err: any) {
        setError(
          err?.message ||
            'No clear speech was detected in your recording. Please speak clearly into the microphone for at least 2 seconds.'
        );
      } finally {
        pcmRecorderRef.current = null;
        setLoading(false);
      }
    }
  };

  const processUploadedFile = async (file: File) => {
    setError(null);
    setLoading(true);
    setSourceFileName(file.name);
    setStatusMessage(`Decoding & analyzing "${file.name}"...`);

    try {
      const lower = file.name.toLowerCase();
      const isAudio =
        lower.endsWith('.wav') ||
        lower.endsWith('.mp3') ||
        lower.endsWith('.webm') ||
        lower.endsWith('.ogg') ||
        lower.endsWith('.m4a') ||
        lower.endsWith('.flac') ||
        file.type.startsWith('audio/');

      let uploadBlob: Blob | File = file;
      let uploadName = file.name;

      if (isAudio) {
        const encoded = await convertAudioBlobToPcmWav(file);
        uploadBlob = encoded.wavBlob;
        uploadName = file.name.replace(/\.[^.]+$/, '') + '.wav';
        setWaveformBars(encoded.waveformPeaks);
        setWavBlobState(encoded.wavBlob);
        setAudioUrl(URL.createObjectURL(encoded.wavBlob));
      } else {
        setAudioUrl(null);
        setWavBlobState(null);
      }

      const res = await nlpApi.analyzeVoiceOrFile({
        file: uploadBlob,
        filename: uploadName,
      });

      setResult(res);
      setLiveTranscript(res.transcript);
      setStatusMessage(
        `Analyzed "${file.name}" via ${res.recognition_engine}`
      );
    } catch (err: any) {
      setError(
        err?.response?.data?.error ||
          `Failed to transcribe or analyze "${file.name}". Please ensure it is a valid audio (.wav, .mp3, .m4a, .ogg) or text (.txt, .csv, .md) file.`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLoadSampleVoice = async (presetId: number, label: string) => {
    setError(null);
    setLoading(true);
    setStatusMessage(`Synthesizing & loading "${label}"...`);
    try {
      const blob = await nlpApi.fetchSampleAudioWav(presetId);
      const encoded = await convertAudioBlobToPcmWav(blob);
      setWaveformBars(encoded.waveformPeaks);
      setWavBlobState(encoded.wavBlob);
      setAudioUrl(URL.createObjectURL(encoded.wavBlob));
      const fname = `student_voice_sample_${presetId}.wav`;
      setSourceFileName(fname);

      const res = await nlpApi.analyzeVoiceOrFile({
        file: encoded.wavBlob,
        filename: fname,
      });
      setResult(res);
      setLiveTranscript(res.transcript);
      setStatusMessage(`Recognized speech from ${fname} via ${res.recognition_engine}`);
    } catch (err: any) {
      setError(
        err?.response?.data?.error || 'Could not load synthesized voice sample from backend.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadWav = () => {
    if (!wavBlobState) return;
    const url = URL.createObjectURL(wavBlobState);
    const a = document.createElement('a');
    a.href = url;
    a.download = sourceFileName.endsWith('.wav') ? sourceFileName : `${sourceFileName}.wav`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const primaryEmo = result?.nlp_analysis.emotion_analysis.primary_emotion || '—';
  const polarity = result?.nlp_analysis.emotion_analysis.sentiment_polarity || '—';
  const emoColor = EMOTION_COLORS[primaryEmo] || '#8B5CF6';
  const emoBadge =
    EMOTION_BADGE_STYLES[primaryEmo] ||
    'bg-[#8B5CF6]/15 text-[#C084FC] border-[#8B5CF6]/30';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      {/* Top Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#141829] via-[#141829] to-[#8B5CF6]/15 border border-white/[0.08] p-5 sm:p-6 shadow-card-dark flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#8B5CF6] to-[#06B6D4] flex items-center justify-center text-white shadow-glow-primary">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white">
                Voice Recognition &amp; Multi-File Sentiment Studio
              </h2>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#22C55E]/20 text-[#4ADE80] border border-[#22C55E]/35">
                SpeechRecognition + WebAudio WAV
              </span>
            </div>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Record live spoken student feedback, test synthesized <code className="font-mono text-[#CBD5E1]">.wav</code> recordings, or upload any audio/document file to detect its Sentiment, Emotion &amp; Academic Topic
            </p>
          </div>
        </div>

        {/* One-Click Spoken WAV Sample Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          {VOICE_SAMPLE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleLoadSampleVoice(preset.id, preset.label)}
              disabled={loading || isRecording}
              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-[#090B14] hover:bg-[#8B5CF6]/20 text-[#CBD5E1] hover:text-white border border-white/[0.08] hover:border-[#8B5CF6]/40 flex items-center gap-1.5 transition-all disabled:opacity-40"
            >
              <Volume2 className="w-3.5 h-3.5 text-[#A78BFA]" />
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-2xl bg-[#EF4444]/10 border border-[#EF4444]/35 p-4 flex items-center gap-3 text-xs sm:text-sm text-[#FCA5A5]">
          <AlertCircle className="w-5 h-5 text-[#EF4444] shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Dual Input Workspace: Left = Live Voice Recorder & Waveform, Right = Drag-and-Drop Audio/File Uploader */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Live Microphone Voice Recorder + Waveform Visualizer */}
        <div className="lg:col-span-7 rounded-2xl bg-[#141829]/90 border border-white/[0.08] p-5 sm:p-6 shadow-card-dark flex flex-col justify-between space-y-5">
          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <Radio
                  className={cn(
                    'w-4 h-4',
                    isRecording ? 'text-[#EF4444] animate-pulse' : 'text-[#A78BFA]'
                  )}
                />
                <h3 className="text-sm sm:text-base font-bold text-white">
                  Live Microphone Voice Recorder &amp; Acoustic Spectrum
                </h3>
              </div>
              {isRecording && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#EF4444]/20 text-[#FCA5A5] border border-[#EF4444]/40 animate-pulse">
                  REC 00:{String(recordingSeconds).padStart(2, '0')}
                </span>
              )}
            </div>

            {/* 48-Bar Acoustic Waveform Visualizer */}
            <div className="h-32 rounded-2xl bg-[#090B14] border border-white/[0.07] px-4 py-3 flex items-center justify-between gap-1 overflow-hidden">
              {waveformBars.map((barVal, idx) => (
                <div
                  key={idx}
                  style={{
                    height: `${Math.max(12, Math.round(barVal * 100))}%`,
                    backgroundColor: isRecording
                      ? '#EF4444'
                      : idx % 2 === 0
                      ? '#8B5CF6'
                      : '#06B6D4',
                  }}
                  className="flex-1 rounded-full transition-all duration-100 opacity-85"
                />
              ))}
            </div>

            {/* Audio Player & Download WAV if available */}
            {audioUrl && (
              <div className="mt-4 p-3 rounded-xl bg-[#090B14]/80 border border-white/[0.07] flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-[#CBD5E1] font-medium truncate">
                  <FileAudio className="w-4 h-4 text-[#22D3EE] shrink-0" />
                  <span className="truncate">{sourceFileName}</span>
                </div>
                <div className="flex items-center gap-3 flex-1 justify-end min-w-[220px]">
                  <audio src={audioUrl} controls className="h-8 max-w-[240px]" />
                  {wavBlobState && (
                    <button
                      onClick={handleDownloadWav}
                      title="Download 16-bit PCM WAV recording"
                      className="px-2.5 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-xs font-semibold text-white border border-white/[0.08] flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5 text-[#4ADE80]" />
                      .WAV
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Live / Extracted Transcript Box */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8] mb-1.5">
                <span>Recognized Speech / Extracted Text Transcript</span>
                {statusMessage && (
                  <span className="text-[#A78BFA] normal-case font-medium">{statusMessage}</span>
                )}
              </div>
              <div className="min-h-[84px] p-3.5 rounded-xl bg-[#090B14]/90 border border-white/[0.08] text-xs sm:text-sm text-[#F8FAFC] font-mono leading-relaxed">
                {liveTranscript ? (
                  liveTranscript
                ) : (
                  <span className="text-[#64748B] font-sans">
                    Click &ldquo;Start Voice Recording&rdquo;, select a Sample .WAV above, or drop any audio/text file on the right to transcribe and analyze sentiment...
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Record / Stop Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/[0.06]">
            {!isRecording ? (
              <button
                onClick={startLiveRecording}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] hover:from-[#7C3AED] hover:to-[#4F46E5] shadow-glow-primary flex items-center gap-2 disabled:opacity-50"
              >
                <Mic className="w-4 h-4" />
                Start Live Voice Recording
              </button>
            ) : (
              <button
                onClick={stopLiveRecording}
                className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-[#EF4444] hover:bg-[#DC2626] shadow-lg flex items-center gap-2 animate-pulse"
              >
                <Square className="w-4 h-4 fill-current" />
                Stop &amp; Analyze Voice ({recordingSeconds}s)
              </button>
            )}

            {liveTranscript && (
              <button
                onClick={() => onOpenInAnalyzer(liveTranscript)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#DDD6FE] bg-[#8B5CF6]/15 hover:bg-[#8B5CF6]/30 border border-[#8B5CF6]/35 flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Inspect in 5-Stage NLP Pipeline
              </button>
            )}
          </div>
        </div>

        {/* Right: Drag-and-Drop Audio & Universal File Uploader */}
        <div className="lg:col-span-5 rounded-2xl bg-[#141829]/90 border border-white/[0.08] p-5 sm:p-6 shadow-card-dark flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-[#06B6D4]/15 border border-[#06B6D4]/30 flex items-center justify-center text-[#22D3EE]">
                <UploadCloud className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white">
                  Upload Any Audio Recording or File
                </h3>
                <p className="text-xs text-[#94A3B8]">
                  Supports <code className="text-white">.wav, .mp3, .m4a, .webm, .ogg</code> &amp;{' '}
                  <code className="text-white">.txt, .csv, .md, .json</code>
                </p>
              </div>
            </div>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragActive(false);
                if (e.dataTransfer.files?.[0]) {
                  processUploadedFile(e.dataTransfer.files[0]);
                }
              }}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                'cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all my-3 flex flex-col items-center justify-center min-h-[220px]',
                dragActive
                  ? 'border-[#06B6D4] bg-[#06B6D4]/10'
                  : 'border-white/[0.12] hover:border-[#8B5CF6]/50 bg-[#090B14]/60'
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".wav,.mp3,.webm,.ogg,.m4a,.flac,.txt,.csv,.md,.json,audio/*"
                onChange={(e) => {
                  if (e.target.files?.[0]) processUploadedFile(e.target.files[0]);
                }}
                className="hidden"
              />
              {loading ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-9 h-9 text-[#A78BFA] animate-spin" />
                  <p className="text-xs font-semibold text-white">{statusMessage}</p>
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-2xl bg-[#06B6D4]/15 border border-[#06B6D4]/30 flex items-center justify-center text-[#22D3EE] mb-3">
                    <FileAudio className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-white">
                    Drop Audio Recording or Document File Here
                  </p>
                  <p className="text-xs text-[#94A3B8] mt-1.5 max-w-xs leading-relaxed">
                    Browser WebAudio automatically transcodes MP3, M4A, OGG &amp; WebM into 16kHz PCM WAV for Python SpeechRecognition.
                  </p>
                  <span className="mt-4 px-3.5 py-1.5 rounded-xl bg-white/[0.06] text-xs font-semibold text-white border border-white/[0.08]">
                    Browse Local Files
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-white/[0.06] text-[11px] text-[#94A3B8] flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" />
              Zero external ffmpeg required
            </span>
            <span className="font-mono">16kHz 16-bit Mono PCM</span>
          </div>
        </div>
      </div>

      {/* Results Section: Sentiment Polarity + Emotion + Topic + Acoustic Telemetry */}
      {result && (
        <div className="space-y-6">
          {/* Top 4 Executive Sentiment & Acoustic KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl bg-[#141829]/90 border border-white/[0.08] p-5 shadow-card-dark relative overflow-hidden">
              <div
                className="absolute top-0 left-0 right-0 h-1"
                style={{
                  backgroundColor:
                    polarity === 'Positive'
                      ? '#22C55E'
                      : polarity === 'Negative'
                      ? '#EF4444'
                      : '#F59E0B',
                }}
              />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]">
                Detected Sentiment Polarity
              </span>
              <div
                className={cn(
                  'text-2xl font-extrabold mt-1.5',
                  polarity === 'Positive'
                    ? 'text-[#4ADE80]'
                    : polarity === 'Negative'
                    ? 'text-[#F87171]'
                    : 'text-[#FBBF24]'
                )}
              >
                {polarity}
              </div>
              <p className="text-xs text-[#94A3B8] mt-2 truncate">
                Source: {result.source_name}
              </p>
            </div>

            <div className="rounded-2xl bg-[#141829]/90 border border-white/[0.08] p-5 shadow-card-dark relative overflow-hidden">
              <div
                className="absolute top-0 left-0 right-0 h-1"
                style={{ backgroundColor: emoColor }}
              />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]">
                Primary Academic Emotion
              </span>
              <div className="mt-2">
                <span
                  className={cn(
                    'inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border',
                    emoBadge
                  )}
                >
                  {primaryEmo}
                </span>
              </div>
              <p className="text-xs text-[#94A3B8] mt-2 font-mono">
                Ensemble Confidence: <strong className="text-white">{result.nlp_analysis.emotion_analysis.confidence_pct}%</strong>
              </p>
            </div>

            <div className="rounded-2xl bg-[#141829]/90 border border-white/[0.08] p-5 shadow-card-dark relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#06B6D4]" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]">
                Detected Academic Topic
              </span>
              <div className="text-base font-extrabold text-white mt-1.5 leading-snug">
                {result.nlp_analysis.topic_analysis.primary_topic}
              </div>
              <p className="text-xs text-[#22D3EE] mt-2 truncate">
                c-TF-IDF: {result.nlp_analysis.topic_analysis.unsupervised_assignments['BERTopic-Style (c-TF-IDF Clustering)']}
              </p>
            </div>

            <div className="rounded-2xl bg-[#141829]/90 border border-white/[0.08] p-5 shadow-card-dark relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#8B5CF6]" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]">
                Acoustic Vocal Arousal
              </span>
              <div className="text-sm font-bold text-[#DDD6FE] mt-1.5 leading-snug">
                {result.acoustics.vocal_arousal}
              </div>
              <p className="text-xs text-[#94A3B8] mt-2 font-mono">
                {result.acoustics.duration_sec}s &bull; {result.acoustics.speaking_rate_wpm ?? 130} WPM &bull; {result.acoustics.peak_db} dBFS
              </p>
            </div>
          </div>

          {/* Acoustic Signal Telemetry Bar */}
          <div className="rounded-2xl bg-[#141829]/80 border border-white/[0.07] p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2 font-bold text-white">
              <Waves className="w-4 h-4 text-[#22D3EE]" />
              <span>Acoustic &amp; Speech Signal Telemetry</span>
            </div>
            <div className="flex flex-wrap items-center gap-5 font-mono text-[#CBD5E1]">
              <span>
                Duration: <strong className="text-white">{result.acoustics.duration_sec}s</strong>
              </span>
              <span>
                Speaking Rate:{' '}
                <strong className="text-[#4ADE80]">{result.acoustics.speaking_rate_wpm} WPM</strong>
              </span>
              <span>
                RMS Energy: <strong className="text-white">{result.acoustics.rms_energy}</strong>
              </span>
              <span>
                Peak Level: <strong className="text-[#A5B4FC]">{result.acoustics.peak_db} dBFS</strong>
              </span>
              <span>
                Voiced Frames:{' '}
                <strong className="text-white">{result.acoustics.voiced_activity_pct}%</strong>
              </span>
              <span className="flex items-center gap-1 text-[#A78BFA]">
                <Gauge className="w-3.5 h-3.5" />
                {result.recognition_engine}
              </span>
            </div>
          </div>

          {/* Full Emotion & Topic Probability Bars */}
          <EmotionResults
            emotionAnalysis={result.nlp_analysis.emotion_analysis}
            topicAnalysis={result.nlp_analysis.topic_analysis}
          />

          {/* Multi-Paradigm Model Agreement Matrix */}
          <ModelComparison emotionAnalysis={result.nlp_analysis.emotion_analysis} />

          {/* Actionable Pedagogical Recommendation */}
          <RecommendationCard
            recommendation={result.nlp_analysis.pedagogical_recommendation}
            emotion={result.nlp_analysis.emotion_analysis.primary_emotion}
            topic={result.nlp_analysis.topic_analysis.primary_topic}
            sentiment={result.nlp_analysis.emotion_analysis.sentiment_polarity}
          />
        </div>
      )}
    </motion.div>
  );
};
