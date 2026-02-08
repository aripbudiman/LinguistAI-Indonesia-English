
export interface Language {
  code: string;
  name: string;
  flag: string;
}

export type TranslationStyle = 'formal' | 'casual';
export type AppView = 'coach' | 'quiz';

export interface TranslationResult {
  originalText: string;
  correctedOriginal: string;
  translatedText: string;
  grammarNotes: string;
  detectedLanguage: string;
  usageTips: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  translation?: TranslationResult;
  style?: TranslationStyle;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  title: string;
  lastTimestamp: number;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface QuizState {
  questions: QuizQuestion[];
  userAnswers: Record<number, string>;
  isSubmitted: boolean;
}
