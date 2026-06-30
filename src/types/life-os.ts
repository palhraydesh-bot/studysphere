import { Timestamp } from 'firebase/firestore';

export interface LifeGoal {
  id: string;
  userId: string;
  title: string;
  description?: string;
  subjectId?: string | null;
  targetDate: string; // YYYY-MM-DD
  completed: boolean;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

export interface LifeMilestone {
  id: string;
  goalId: string;
  userId: string;
  title: string;
  completed: boolean;
  weight: number; // Percentage contribution (0-100)
  order: number;
  createdAt: Timestamp | Date;
}

export interface LifeOsTaskExtension {
  milestoneId?: string | null;
  timeBlock?: {
    startTime: string; // HH:mm
    durationMinutes: number;
  } | null;
  missionType?: 'daily' | 'weekly' | 'monthly' | 'none';
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

export interface HabitLog {
  id: string;
  habitId: string;
  userId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  timestamp: Timestamp | Date;
}

export interface SyllabusTopic {
  id: string;
  name: string;
  status: 'unstarted' | 'studying' | 'mastered';
  weight: number; // Priority multiplier (1-5)
}

export interface Exam {
  id: string;
  userId: string;
  title: string;
  subjectId: string;
  examDate: string; // YYYY-MM-DD
  syllabusTopics: SyllabusTopic[];
  readinessScore: number; // 0-100
  createdAt: Timestamp | Date;
}

export interface LifeLog {
  id: string; // YYYY-MM-DD
  userId: string;
  date: string; // YYYY-MM-DD
  sleepHours: number;
  exerciseMinutes: number;
  readingPages: number;
  waterIntakeLiters: number;
  mood?: 'excellent' | 'good' | 'neutral' | 'tired' | 'stressed';
  updatedAt: Timestamp | Date;
}