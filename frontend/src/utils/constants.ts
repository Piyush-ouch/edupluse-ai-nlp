import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const EMOTION_COLORS: Record<string, string> = {
  'Joy / Satisfaction': '#22C55E',
  'Appreciation / Gratitude': '#06B6D4',
  'Frustration / Anger': '#EF4444',
  'Anxiety / Stress': '#F59E0B',
  'Confusion': '#8B5CF6',
  'Boredom / Disengagement': '#94A3B8',
};

export const EMOTION_BADGE_STYLES: Record<string, string> = {
  'Joy / Satisfaction': 'bg-[#22C55E]/15 text-[#4ADE80] border-[#22C55E]/30',
  'Appreciation / Gratitude': 'bg-[#06B6D4]/15 text-[#22D3EE] border-[#06B6D4]/30',
  'Frustration / Anger': 'bg-[#EF4444]/15 text-[#F87171] border-[#EF4444]/30',
  'Anxiety / Stress': 'bg-[#F59E0B]/15 text-[#FBBF24] border-[#F59E0B]/30',
  'Confusion': 'bg-[#8B5CF6]/15 text-[#C084FC] border-[#8B5CF6]/30',
  'Boredom / Disengagement': 'bg-[#94A3B8]/15 text-[#CBD5E1] border-[#94A3B8]/30',
};

export const TOPIC_COLORS: Record<string, string> = {
  'Teaching Style & Pedagogy': '#8B5CF6',
  'Curriculum & Course Content': '#06B6D4',
  'Assessment, Exams & Grading': '#EF4444',
  'Workload, Deadlines & Pacing': '#F59E0B',
  'Lab Infrastructure & Resources': '#22C55E',
  'Doubt Support & Mentorship': '#6366F1',
};

export const NEGATION_WORDS = new Set([
  'not',
  'no',
  'never',
  'neither',
  'nor',
  'zero',
  'without',
  'hardly',
  'barely',
  'lack',
  'lacks',
]);

export const SAMPLE_FEEDBACK_PRESETS = [
  {
    label: 'Joy / Pedagogy',
    emotion: 'Joy / Satisfaction',
    text: 'The professor explains complex algorithms with crystal clear intuition and engaging real-world analogies. Visualizing mathematical derivations step by step made learning effortless!',
  },
  {
    label: 'Frustration / Grading',
    emotion: 'Frustration / Anger',
    text: 'The grading rubric is completely arbitrary and opaque; points were deducted on the midterm without a single comment explaining why! Two identical implementations got wildly different scores.',
  },
  {
    label: 'Anxiety / Workload',
    emotion: 'Anxiety / Stress',
    text: 'Assigning three heavy coding projects, a research paper review, and a midterm in the same week is overwhelming and exhausting. I am constantly stressed about meeting the midnight lab deadlines.',
  },
  {
    label: 'Confusion / Lectures',
    emotion: 'Confusion',
    text: "The instructor doesn't explain how advanced mathematical proofs connect to code snippets, and the terminology is inconsistent with the textbook, leaving everyone bewildered.",
  },
  {
    label: 'Boredom / Syllabus',
    emotion: 'Boredom / Disengagement',
    text: 'Lectures consist entirely of reading verbatim from dense PowerPoint slides in a monotone voice for two straight hours with zero interaction or modern examples.',
  },
  {
    label: 'Gratitude / Mentorship',
    emotion: 'Appreciation / Gratitude',
    text: 'The teaching assistants went above and beyond during office hours, staying late to help me debug my tokenization pipeline. Truly grateful for such a supportive mentorship environment!',
  },
];

