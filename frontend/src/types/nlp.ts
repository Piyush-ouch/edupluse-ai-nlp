export type EmotionName =
  | 'Joy / Satisfaction'
  | 'Appreciation / Gratitude'
  | 'Frustration / Anger'
  | 'Anxiety / Stress'
  | 'Confusion'
  | 'Boredom / Disengagement'
  | string;

export type TopicName =
  | 'Teaching Style & Pedagogy'
  | 'Curriculum & Course Content'
  | 'Assessment, Exams & Grading'
  | 'Workload, Deadlines & Pacing'
  | 'Lab Infrastructure & Resources'
  | 'Doubt Support & Mentorship'
  | string;

export interface HealthResponse {
  status: string;
  dataset_records: number;
  emotions: string[];
  topics: string[];
}

export interface PreprocessingDetails {
  raw_text: string;
  expanded_text: string;
  cleaned_text: string;
  tokens: string[];
  filtered_tokens: string[];
  lemmas: string[];
  bigrams: string[];
  processed_text: string;
  token_count: number;
  lemma_count: number;
}

export interface EmotionModelPrediction {
  predicted: string;
  confidence: number;
  probabilities: Record<string, number>;
}

export interface EmotionTrigger {
  lemma: string;
  emotion: string;
  weight: number;
}

export interface EmotionAnalysisResult {
  primary_emotion: string;
  confidence_pct: number;
  sentiment_polarity: 'Positive' | 'Neutral / Constructive' | 'Negative' | string;
  ensemble_probabilities: Record<string, number>;
  model_comparison: {
    'Classical ML (TF-IDF + LinearSVC)': EmotionModelPrediction;
    'Affective Lexicon (Valence Shifters)': EmotionModelPrediction;
    'Deep Neural MLP (Subword SVD Embeddings)': EmotionModelPrediction;
    [key: string]: EmotionModelPrediction;
  };
  detected_triggers: EmotionTrigger[];
}

export interface TopicAnalysisResult {
  primary_topic: string;
  topic_probabilities: Record<string, number>;
  unsupervised_assignments: {
    'LDA (Probabilistic)': string;
    'NMF (Matrix Factorization)': string;
    'BERTopic-Style (c-TF-IDF Clustering)': string;
    [key: string]: string;
  };
}

export interface SingleAnalyzeResponse {
  preprocessing: PreprocessingDetails;
  emotion_analysis: EmotionAnalysisResult;
  topic_analysis: TopicAnalysisResult;
  pedagogical_recommendation: string;
  inference_time_ms: number;
}

export interface DashboardKPIs {
  total_feedback: number;
  average_rating: number;
  positive_satisfaction_pct: number;
  dominant_emotion: string;
  top_pain_point_topic: string;
  best_model_f1: number;
}

export interface CourseSummaryItem {
  course_code: string;
  course_name: string;
  department: string;
  total_reviews: number;
  avg_rating: number;
  positive_rate_pct: number;
  dominant_emotion: string;
  top_topic: string;
}

export interface FeedbackRecord {
  feedback_id: string;
  student_id: string;
  course_code: string;
  course_name: string;
  department: string;
  semester: string;
  rating: number;
  feedback_text: string;
  emotion: string;
  topic: string;
  sentiment: string;
}

export interface TopicEmotionHeatmapRow {
  topic: string;
  [emotion: string]: string | number;
}

export interface DashboardResponse {
  kpis: DashboardKPIs;
  emotion_distribution: Record<string, number>;
  topic_distribution: Record<string, number>;
  sentiment_distribution: Record<string, number>;
  topic_emotion_heatmap: TopicEmotionHeatmapRow[];
  emotions_list: string[];
  topics_list: string[];
  course_summary: CourseSummaryItem[];
  recent_feedback: FeedbackRecord[];
}

export interface TopicKeyword {
  word: string;
  weight: number;
  raw_score: number;
}

export interface DiscoveredTopic {
  cluster_id: number;
  mapped_topic_name: string;
  document_count: number;
  coherence: number;
  keywords: TopicKeyword[];
}

export interface TopicAlgorithmData {
  algorithm_type: string;
  topic_diversity: number;
  coherence_score: number;
  silhouette_score: number;
  topics: DiscoveredTopic[];
}

export interface DocumentClusterPoint2D {
  feedback_id: string;
  x: number;
  y: number;
  emotion: string;
  topic: string;
  course_code: string;
  text: string;
}

export interface TopicsComparisonResponse {
  topic_models: Record<string, TopicAlgorithmData>;
  document_clusters_2d: DocumentClusterPoint2D[];
  topics_list: string[];
  emotions_list: string[];
}

export interface PerClassMetric {
  precision: number;
  recall: number;
  f1: number;
  support: number;
}

export interface ModelBenchmarkMetrics {
  accuracy: number;
  macro_precision: number;
  macro_recall: number;
  macro_f1: number;
  train_time_ms: number;
  inference_latency_ms: number;
  per_class: Record<string, PerClassMetric>;
  confusion_matrix: number[][];
}

export interface ModelsBenchmarksResponse {
  test_sample_count: number;
  train_sample_count: number;
  classes: string[];
  models: Record<string, ModelBenchmarkMetrics>;
}

export interface BatchResultRow {
  index: number;
  subject?: string;
  feedback_text: string;
  emotion: string;
  emotion_confidence: number;
  topic: string;
  lda_topic: string;
  nmf_topic: string;
  bertopic_topic: string;
  sentiment: string;
  recommendation: string;
}

export interface SubjectWiseSuggestion {
  subject: string;
  total_reviews: number;
  positive_pct: number;
  negative_pct: number;
  neutral_pct: number;
  dominant_emotion: string;
  primary_focus_topic: string;
  priority_level: string;
  summary_action: string;
  teacher_measures: string[];
}

export interface BatchAnalysisResponse {
  total_analyzed: number;
  emotion_counts: Record<string, number>;
  topic_counts: Record<string, number>;
  sentiment_counts: Record<string, number>;
  results: BatchResultRow[];
  subject_wise_suggestions?: SubjectWiseSuggestion[];
}

export interface VoiceAcoustics {
  duration_sec: number;
  sample_rate_hz: number;
  channels: number;
  rms_energy: number;
  peak_db: number;
  voiced_activity_pct: number;
  vocal_arousal: string;
  speaking_rate_wpm?: number;
  word_count?: number;
}

export interface VoiceAnalyzeResponse {
  source_name: string;
  transcript: string;
  recognition_engine: string;
  acoustics: VoiceAcoustics;
  nlp_analysis: SingleAnalyzeResponse;
}


