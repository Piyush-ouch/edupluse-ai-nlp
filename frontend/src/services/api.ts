import axios from 'axios';
import type {
  HealthResponse,
  SingleAnalyzeResponse,
  DashboardResponse,
  TopicsComparisonResponse,
  ModelsBenchmarksResponse,
  BatchAnalysisResponse,
  VoiceAnalyzeResponse,
} from '../types/nlp';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 90000,
});

export const nlpApi = {
  async checkHealth(): Promise<HealthResponse> {
    const { data } = await apiClient.get<HealthResponse>('/api/health');
    return data;
  },

  async analyzeFeedback(text: string): Promise<SingleAnalyzeResponse> {
    const { data } = await apiClient.post<SingleAnalyzeResponse>('/api/analyze', { text });
    return data;
  },

  async getDashboard(course: string = 'ALL'): Promise<DashboardResponse> {
    const { data } = await apiClient.get<DashboardResponse>('/api/dashboard', {
      params: { course },
    });
    return data;
  },

  async getTopics(): Promise<TopicsComparisonResponse> {
    const { data } = await apiClient.get<TopicsComparisonResponse>('/api/topics');
    return data;
  },

  async getModels(): Promise<ModelsBenchmarksResponse> {
    const { data } = await apiClient.get<ModelsBenchmarksResponse>('/api/models');
    return data;
  },

  async analyzeBatchTexts(texts: string[], subjects?: string[]): Promise<BatchAnalysisResponse> {
    const { data } = await apiClient.post<BatchAnalysisResponse>('/api/batch', {
      texts,
      subjects,
    });
    return data;
  },

  async analyzeBatchFile(file: File): Promise<BatchAnalysisResponse> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${API_BASE_URL}/api/batch`, {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Batch file upload failed');
    }
    return data as BatchAnalysisResponse;
  },

  async analyzeVoiceOrFile(params: {
    file?: Blob | File;
    filename?: string;
    clientTranscript?: string;
  }): Promise<VoiceAnalyzeResponse> {
    const formData = new FormData();
    if (params.file) {
      formData.append('file', params.file, params.filename || 'recording.wav');
    }
    if (params.filename) {
      formData.append('original_filename', params.filename);
    }
    if (params.clientTranscript) {
      formData.append('client_transcript', params.clientTranscript);
    }

    // Use native fetch so the browser automatically attaches the exact multipart/form-data; boundary=... header
    const response = await fetch(`${API_BASE_URL}/api/voice-analyze`, {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Voice & file analysis failed');
    }
    return data as VoiceAnalyzeResponse;
  },

  async fetchSampleAudioWav(presetId: number): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/api/sample-audio/${presetId}`);
    if (!response.ok) {
      throw new Error('Could not load sample audio from backend');
    }
    return await response.blob();
  },
};
