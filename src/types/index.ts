export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  flagged?: boolean;
  flagReason?: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
  hasFlaggedContent?: boolean;
}

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  mood: Mood;
  tags: string[];
  createdAt: number;
  updatedAt: number;
  flagged?: boolean;
  flagReason?: string;
  // Module 2 – Behavioral Insight fields
  sentiment?: 'positive' | 'negative' | 'neutral';
  emotion?: 'sad' | 'anxious' | 'angry' | 'happy' | 'hopeful' | 'numb';
  summary?: string;
  suggestion?: string;
  themes?: string[];
}

export type Mood = 'great' | 'good' | 'neutral' | 'bad' | 'awful';

export interface MoodEntry {
  id: string;
  mood: Mood;
  note: string;
  date: number;
  source?: 'chatbot' | 'manual';
}

export interface Quote {
  text: string;
  author: string;
}

export interface UserProfile {
  name: string;
  isAdmin?: boolean;
  mood: {
    current: Mood;
    history: MoodEntry[];
  };
  journals: JournalEntry[];
  conversations: Conversation[];
  settings: {
    theme: 'light' | 'dark';
    notifications: boolean;
    fontSize: 'small' | 'medium' | 'large';
  };
}

export interface FlaggedContent {
  id: string;
  type: 'chat' | 'journal';
  content: string;
  reason: string;
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
  timestamp: number;
  reviewed?: boolean;
  reviewedAt?: number;
  reviewedBy?: string;
}

// Module 1 – Crisis Detection
export interface EmergencyContact {
  id: string;
  name: string;
  phone_number: string;
}

export interface CrisisData {
  risk_level: 'HIGH' | 'MEDIUM' | 'LOW';
  trigger_words: string[];
  sentiment_score: number;
}

export interface CrisisEvent {
  id: string;
  timestamp: string;
  risk_level: string;
  trigger_words: string[];
  message_snippet: string;
  user_id?: string;
  conversation_id?: string;
}

// Module 2 – Behavioral Insight Engine
export interface DiaryInsight {
  entry_id?: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  emotion: 'sad' | 'anxious' | 'angry' | 'happy' | 'hopeful' | 'numb';
  summary: string;
  suggestion: string;
  themes: string[];
  analyzed_at?: string;
}

export interface WeeklyInsights {
  most_frequent_emotion: string | null;
  mood_trend: Array<{ date: string; sentiment: string; emotion: string }>;
  repeated_triggers: Array<{ theme: string; count: number }>;
  emotion_frequency: Array<{ emotion: string; count: number }>;
  entry_count: number;
}