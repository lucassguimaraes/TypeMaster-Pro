
export interface TypingStats {
  wpm: number;
  accuracy: number;
  errors: number;
  timeElapsed: number;
  charsTyped: number;
  history: { wpm: number; time: number }[];
  keyMap: Record<string, { errors: number; total: number }>;
  timestamp: number;
}

export type Theme = 'default' | 'cyberpunk' | 'nord' | 'minimal';
export type KeyboardLayout = 'abnt2' | 'us';
export type SoundProfile = 'clicky' | 'linear' | 'tactile';

export interface Lesson {
  id: string;
  title: string;
  description: string;
  content: string;
  category: 'basico' | 'intermediario' | 'avancado' | 'personalizado';
}

export interface UserProgress {
  totalLessons: number;
  avgWpm: number;
  bestWpm: number;
  streak: number;
  lastPracticeDate: string | null;
  totalChars: number;
}
