
export type AppView = 'dashboard' | 'corrector' | 'generator' | 'image-studio' | 'video-creator' | 'voice' | 'maps' | 'history' | 'student-portal';

export type UserRole = 'teacher' | 'student';

export interface User {
  email: string;
  role: UserRole;
  name: string;
}

export interface CorrectionResult {
  score: number;
  maxScore: number;
  positivePoints: string[];
  improvements: string[];
  correctedText: string;
  generalFeedback: string;
}

export interface QuizQuestion {
  question: string;
  options?: string[];
  answer: string;
  explanation: string;
  timeLimit?: number; // Temps en secondes
}

export interface QuizResult {
  title: string;
  questions: QuizQuestion[];
}

export interface HistoryItem {
  id: string;
  type: 'correction' | 'quiz' | 'image' | 'video' | 'maps';
  title: string;
  date: string;
  subject?: string;
  level?: string;
  data: any;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  studentName: string;
  score: number;
  totalQuestions: number;
  date: string;
  answers: string[];
}
