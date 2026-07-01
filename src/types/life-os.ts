import { Timestamp } from 'firebase/firestore';

export interface LifeGoal {
  id: string;
  userId: string;
  title: string;
  description?: string;
  tier: 'short' | 'long';
  targetDate: string; // YYYY-MM-DD
  completed: boolean;
  progress: number;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

export interface LifeMilestone {
  id: string;
  goalId: string;
  userId: string;
  title: string;
  completed: boolean;
  weight: number; // 0 to 100
  order: number;
  createdAt: Timestamp | Date;
}

export interface Habit {
  id: string;
  userId: string;
  name: string;
  description?: string;
  frequency: 'daily' | 'weekly';
  streak: number;
  longestStreak: number;
  lastCompletedDate: string | null; // YYYY-MM-DD
  createdAt: Timestamp | Date;
}

export interface SyllabusTopic {
  id: string;
  name: string;
  status: 'unstarted' | 'studying' | 'mastered';
  weight: number; // 1 to 5
}

export interface Exam {
  id: string;
  userId: string;
  title: string;
  subjectId: string;
  examDate: string; // YYYY-MM-DD
  syllabusTopics: SyllabusTopic[];
  readinessScore: number; // 0 to 100
  createdAt: Timestamp | Date;
}

export interface FocusSession {
  id: string;
  userId: string;
  taskId?: string | null;
  durationMinutes: number;
  distractionCount: number;
  timestamp: Timestamp | Date;
}

export interface DailyLifeLog {
  id: string; // YYYY-MM-DD
  userId: string;
  date: string; // YYYY-MM-DD
  sleepHours: number;
  exerciseMinutes: number;
  readingPages: number;
  waterIntakeMl: number;
  updatedAt: Timestamp | Date;
}