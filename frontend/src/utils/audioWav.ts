/**
 * Browser Web Audio API -> 16-bit PCM WAV Encoder, Live Microphone Recorder & Acoustic Analyzer.
 * Uses MediaRecorder + AudioContext.decodeAudioData (zero ScriptProcessorNode deprecation warnings!)
 * to produce a clean 16kHz 16-bit Mono PCM .wav file for Python SpeechRecognition.
 */

export interface EncodedWavResult {
  wavBlob: Blob;
  durationSec: number;
  sampleRate: number;
  rmsEnergy: number;
  peakDb: number;
  waveformPeaks: number[];
}

export class LivePcmWavRecorder {
  private stream: MediaStream | null = null;
  private audioCtx: AudioContext | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private animId: number | null = null;
  private isRecording = false;

  async start(onSpectrumUpdate?: (bars: number[]) => void): Promise<void> {
    this.chunks = [];
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });

    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    this.audioCtx = new AudioCtx();
    this.sourceNode = this.audioCtx.createMediaStreamSource(this.stream);
    this.analyserNode = this.audioCtx.createAnalyser();
    this.analyserNode.fftSize = 128;
    this.sourceNode.connect(this.analyserNode);

    this.isRecording = true;

    if (onSpectrumUpdate && this.analyserNode) {
      const freqData = new Uint8Array(this.analyserNode.frequencyBinCount);
      const tick = () => {
        if (!this.isRecording || !this.analyserNode) return;
        this.analyserNode.getByteFrequencyData(freqData);
        const bars: number[] = [];
        for (let i = 0; i < 48; i++) {
          const val = freqData[i % freqData.length] / 255.0;
          bars.push(Math.max(0.08, Math.min(1.0, val)));
        }
        onSpectrumUpdate(bars);
        this.animId = requestAnimationFrame(tick);
      };
      tick();
    }

    this.mediaRecorder = new MediaRecorder(this.stream);
    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        this.chunks.push(e.data);
      }
    };
    this.mediaRecorder.start();
  }

  async stop(targetSampleRate = 16000): Promise<EncodedWavResult> {
    this.isRecording = false;
    if (this.animId !== null) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }

    const rawBlob: Blob = await new Promise((resolve) => {
      if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
        resolve(new Blob(this.chunks));
        return;
      }
      this.mediaRecorder.onstop = () => {
        resolve(
          new Blob(this.chunks, {
            type: this.mediaRecorder?.mimeType || 'audio/webm',
          })
        );
      };
      this.mediaRecorder.stop();
    });

    if (this.sourceNode) {
      try {
        this.sourceNode.disconnect();
      } catch {}
    }
    if (this.analyserNode) {
      try {
        this.analyserNode.disconnect();
      } catch {}
    }
    if (this.stream) {
      this.stream.getTracks().forEach((t) => t.stop());
    }
    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      await this.audioCtx.close().catch(() => {});
    }

    return convertAudioBlobToPcmWav(rawBlob, targetSampleRate);
  }
}

function resampleFloat32(
  input: Float32Array,
  fromRate: number,
  toRate: number
): Float32Array {
  if (input.length === 0) return new Float32Array(0);
  if (fromRate === toRate) return input;
  const ratio = fromRate / toRate;
  const outLength = Math.max(1, Math.round(input.length / ratio));
  const output = new Float32Array(outLength);

  for (let i = 0; i < outLength; i++) {
    const pos = i * ratio;
    const idx = Math.floor(pos);
    const frac = pos - idx;
    const s0 = input[idx] || 0;
    const s1 = input[Math.min(input.length - 1, idx + 1)] || 0;
    output[i] = s0 + frac * (s1 - s0);
  }
  return output;
}

function computeMetricsAndEncodeWav(
  channelData: Float32Array,
  sampleRate: number
): EncodedWavResult {
  let sumSq = 0;
  let peak = 0;
  for (let i = 0; i < channelData.length; i++) {
    const s = Math.abs(channelData[i]);
    sumSq += s * s;
    if (s > peak) peak = s;
  }

  const normalized = new Float32Array(channelData.length);
  const gain = peak > 0.005 ? Math.min(4.0, 0.85 / peak) : 1.0;
  for (let i = 0; i < channelData.length; i++) {
    normalized[i] = Math.max(-1, Math.min(1, channelData[i] * gain));
  }

  const rmsEnergy =
    channelData.length > 0 ? Math.sqrt(sumSq / channelData.length) : 0.05;
  const peakDb =
    Math.round(20 * Math.log10(Math.max(peak, 1e-5)) * 10) / 10;

  const numBars = 48;
  const blockSize = Math.max(1, Math.floor(channelData.length / numBars));
  const waveformPeaks: number[] = [];
  for (let b = 0; b < numBars; b++) {
    let blockMax = 0;
    const start = b * blockSize;
    for (let j = 0; j < blockSize && start + j < channelData.length; j++) {
      const val = Math.abs(channelData[start + j]);
      if (val > blockMax) blockMax = val;
    }
    waveformPeaks.push(
      Math.max(0.08, Math.min(1, Math.round((blockMax / (peak || 1)) * 100) / 100))
    );
  }

  const wavBuffer = encodePcm16Wav(normalized, sampleRate);
  const wavBlob = new Blob([wavBuffer], { type: 'audio/wav' });

  return {
    wavBlob,
    durationSec: Math.round((channelData.length / sampleRate) * 100) / 100,
    sampleRate,
    rmsEnergy: Math.round(rmsEnergy * 10000) / 10000,
    peakDb,
    waveformPeaks,
  };
}

export async function convertAudioBlobToPcmWav(
  inputBlob: Blob,
  targetSampleRate = 16000
): Promise<EncodedWavResult> {
  const arrayBuffer = await inputBlob.arrayBuffer();
  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
  const audioCtx = new AudioCtx();

  try {
    const decodedBuffer = await audioCtx.decodeAudioData(arrayBuffer.slice(0));
    const rawChannel = decodedBuffer.getChannelData(0);
    const downsampled = resampleFloat32(
      rawChannel,
      decodedBuffer.sampleRate,
      targetSampleRate
    );
    return computeMetricsAndEncodeWav(downsampled, targetSampleRate);
  } finally {
    if (audioCtx.state !== 'closed') {
      await audioCtx.close().catch(() => {});
    }
  }
}

function encodePcm16Wav(samples: Float32Array, sampleRate: number): ArrayBuffer {
  const numChannels = 1;
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = samples.length * bytesPerSample;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }

  return buffer;
}

function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}
