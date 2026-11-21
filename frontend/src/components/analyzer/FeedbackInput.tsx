import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  RotateCcw,
  Wand2,
  Loader2,
  Mic,
  MicOff,
  Upload,
} from 'lucide-react';
import { SAMPLE_FEEDBACK_PRESETS, cn } from '../../utils/constants';
import { LivePcmWavRecorder, convertAudioBlobToPcmWav } from '../../utils/audioWav';
import { nlpApi } from '../../services/api';

interface FeedbackInputProps {
  text: string;
  onChange: (val: string) => void;
  onAnalyze: (customText?: string) => void;
  onClear: () => void;
  loading: boolean;
  inferenceMs?: number;
}

export const FeedbackInput: React.FC<FeedbackInputProps> = ({
  text,
  onChange,
  onAnalyze,
  onClear,
  loading,
  inferenceMs,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recSeconds, setRecSeconds] = useState(0);
  const [voiceLoading, setVoiceLoading] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const pcmRecorderRef = useRef<LivePcmWavRecorder | null>(null);
  const liveTranscriptRef = useRef<string>('');
  const recTimerRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      if (recTimerRef.current) window.clearInterval(recTimerRef.current);
    };
  }, []);

  const charCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  const toggleVoiceRecording = async () => {
    if (isRecording) {
      // Stop recording & transcribe exact spoken audio
      setIsRecording(false);
      if (recTimerRef.current) {
        window.clearInterval(recTimerRef.current);
        recTimerRef.current = null;
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }

      if (pcmRecorderRef.current) {
        setVoiceLoading(true);
        setVoiceStatus('Transcribing your exact spoken audio via SpeechRecognition...');
        try {
          const encoded = await pcmRecorderRef.current.stop(16000);
          // Give Web Speech API 350ms to flush any final word after .stop()
          await new Promise((r) => setTimeout(r, 350));

          const res = await nlpApi.analyzeVoiceOrFile({
            file: encoded.wavBlob,
            filename: 'live_microphone_recording.wav',
            clientTranscript: liveTranscriptRef.current.trim(),
          });

          if (res.transcript) {
            onChange(res.transcript);
            onAnalyze(res.transcript);
            setVoiceStatus(
              `Transcribed exact voice (${res.acoustics.duration_sec}s • ${res.recognition_engine})`
            );
          }
        } catch (err: any) {
          if (liveTranscriptRef.current.trim()) {
            onChange(liveTranscriptRef.current.trim());
            onAnalyze(liveTranscriptRef.current.trim());
            setVoiceStatus('Transcribed via live Web Speech API.');
          } else {
            setVoiceStatus(
              err?.message ||
                'No clear speech detected. Please speak clearly into the microphone for 2+ seconds.'
            );
          }
        } finally {
          pcmRecorderRef.current = null;
          setVoiceLoading(false);
        }
      }
      return;
    }

    // Start lossless 16kHz PCM recording from microphone
    setVoiceStatus('Listening... Speak your feedback clearly, then click Stop & Analyze.');
    setRecSeconds(0);
    liveTranscriptRef.current = '';

    try {
      const pcmRec = new LivePcmWavRecorder();
      await pcmRec.start();
      pcmRecorderRef.current = pcmRec;
      setIsRecording(true);
      recTimerRef.current = window.setInterval(() => {
        setRecSeconds((s) => s + 1);
      }, 1000);
    } catch {
      setVoiceStatus('Microphone permission denied or no microphone detected.');
      return;
    }

    // Also run browser SpeechRecognition for real-time caption preview while speaking
    const SpeechRec =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRec) {
      try {
        const recognition = new SpeechRec();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        recognition.onresult = (event: any) => {
          const allParts: string[] = [];
          for (let i = 0; i < event.results.length; i++) {
            const piece = event.results[i][0]?.transcript || '';
            if (piece) allParts.push(piece.trim());
          }
          const combined = allParts.join(' ').trim();
          if (combined) {
            liveTranscriptRef.current = combined;
            onChange(combined);
          }
        };
        recognition.onerror = () => {};
        recognition.start();
        recognitionRef.current = recognition;
      } catch {}
    }
  };

  const handleAudioOrTextFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    setVoiceLoading(true);
    setVoiceStatus(`Processing "${file.name}" for sentiment & emotion...`);
    try {
      const lower = file.name.toLowerCase();
      let uploadBlob: Blob | File = file;
      let uploadName = file.name;

      if (
        lower.endsWith('.wav') ||
        lower.endsWith('.mp3') ||
        lower.endsWith('.webm') ||
        lower.endsWith('.ogg') ||
        lower.endsWith('.m4a') ||
        lower.endsWith('.flac') ||
        file.type.startsWith('audio/')
      ) {
        const encoded = await convertAudioBlobToPcmWav(file);
        uploadBlob = encoded.wavBlob;
        uploadName = file.name.replace(/\.[^.]+$/, '') + '.wav';
      }

      const res = await nlpApi.analyzeVoiceOrFile({
        file: uploadBlob,
        filename: uploadName,
      });

      if (res.transcript) {
        onChange(res.transcript);
        onAnalyze(res.transcript);
        setVoiceStatus(
          `Extracted from "${file.name}" (${res.acoustics.duration_sec}s • ${res.recognition_engine})`
        );
      }
    } catch (err: any) {
      setVoiceStatus(
        err?.message || `Could not extract speech/text from "${file.name}".`
      );
    } finally {
      setVoiceLoading(false);
    }
  };

  return (
    <div className="rounded-2xl bg-[#141829]/90 border border-white/[0.08] p-5 sm:p-6 shadow-card-dark flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 flex items-center justify-center text-[#A78BFA]">
              <Wand2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white">
                Student Feedback Input Stream (Text, Voice &amp; File)
              </h2>
              <p className="text-xs text-[#94A3B8]">
                Type, record live voice via microphone, or upload any audio/text file
              </p>
            </div>
          </div>

          {inferenceMs !== undefined && (
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-[#6366F1]/15 text-[#A5B4FC] border border-[#6366F1]/30">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
              {inferenceMs} ms
            </span>
          )}
        </div>

        {/* Sample Feedback Selector Pills */}
        <div className="mb-3.5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B] mb-2">
            Quick Sample Presets
          </div>
          <div className="flex flex-wrap gap-1.5">
            {SAMPLE_FEEDBACK_PRESETS.map((sample) => (
              <button
                key={sample.label}
                type="button"
                onClick={() => {
                  onChange(sample.text);
                  onAnalyze(sample.text);
                }}
                disabled={loading || voiceLoading}
                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[#0E1120] hover:bg-[#8B5CF6]/20 text-[#CBD5E1] hover:text-white border border-white/[0.07] hover:border-[#8B5CF6]/40 transition-all"
              >
                {sample.label}
              </button>
            ))}
          </div>
        </div>

        {/* Textarea */}
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => onChange(e.target.value)}
            rows={5}
            placeholder="Paste or type student course feedback here, or click 'Record Voice' / 'Upload Audio/File' below..."
            className={cn(
              'w-full rounded-xl bg-[#090B14]/90 border p-4 text-sm text-[#F8FAFC] placeholder-[#64748B] leading-relaxed resize-y focus:outline-none focus:ring-2 transition-all',
              isRecording
                ? 'border-[#EF4444] ring-2 ring-[#EF4444]/30'
                : 'border-white/[0.09] focus:border-[#8B5CF6] focus:ring-[#8B5CF6]/25'
            )}
          />
          <div className="flex items-center justify-between text-[11px] text-[#64748B] mt-1.5 px-1 font-mono">
            <span>
              {wordCount} words
              {voiceStatus && (
                <span className="ml-3 text-[#A78BFA] font-sans font-medium">
                  &bull; {voiceStatus}
                </span>
              )}
            </span>
            <span className={cn(charCount > 600 && 'text-[#F59E0B]')}>
              {charCount} characters
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons Bar (Clear + Voice Recording + File Upload + Analyze) */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 mt-4 pt-4 border-t border-white/[0.06]">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onClear}
            disabled={loading || voiceLoading || !text}
            className="px-3 py-2 rounded-xl text-xs font-semibold text-[#94A3B8] hover:text-white bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.07] disabled:opacity-40 flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Clear
          </button>

          {/* Live Microphone Voice Button */}
          <button
            type="button"
            onClick={toggleVoiceRecording}
            disabled={loading || voiceLoading}
            className={cn(
              'px-3.5 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all',
              isRecording
                ? 'bg-[#EF4444]/20 text-[#FCA5A5] border-[#EF4444]/50 animate-pulse'
                : 'bg-[#8B5CF6]/15 hover:bg-[#8B5CF6]/25 text-[#DDD6FE] border-[#8B5CF6]/35'
            )}
          >
            {isRecording ? (
              <>
                <MicOff className="w-3.5 h-3.5 text-[#EF4444]" />
                Stop &amp; Analyze (00:{String(recSeconds).padStart(2, '0')})
              </>
            ) : (
              <>
                <Mic className="w-3.5 h-3.5 text-[#A78BFA]" />
                Record Voice
              </>
            )}
          </button>

          {/* Upload Any Audio or Text File */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".wav,.mp3,.webm,.ogg,.m4a,.flac,.txt,.csv,.md,.json,audio/*"
            onChange={handleAudioOrTextFileUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading || voiceLoading || isRecording}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#06B6D4]/15 hover:bg-[#06B6D4]/25 text-[#A5F3FC] border border-[#06B6D4]/35 flex items-center gap-1.5 transition-colors"
          >
            {voiceLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Upload className="w-3.5 h-3.5 text-[#22D3EE]" />
            )}
            Upload Audio / File
          </button>
        </div>

        <button
          type="button"
          onClick={() => onAnalyze()}
          disabled={loading || voiceLoading || !text.trim()}
          className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] hover:from-[#7C3AED] hover:to-[#4F46E5] shadow-glow-primary disabled:opacity-50 flex items-center gap-2 transition-all cursor-pointer"
        >
          {loading || voiceLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Running NLP Models...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Analyze Feedback
            </>
          )}
        </button>
      </div>
    </div>
  );
};
