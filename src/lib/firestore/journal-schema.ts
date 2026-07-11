import type { Timestamp } from 'firebase/firestore';

export const JOURNAL_COLLECTIONS = {
  journalEntries: 'journalEntries',
  journalFolders: 'journalFolders',
} as const;

export type Mood = 'great' | 'good' | 'okay' | 'low' | 'bad';

export const MOODS: { id: Mood; label: string; emoji: string }[] = [
  { id: 'great', label: 'Great', emoji: '😄' },
  { id: 'good',  label: 'Good',  emoji: '🙂' },
  { id: 'okay',  label: 'Okay',  emoji: '😐' },
  { id: 'low',   label: 'Low',   emoji: '😔' },
  { id: 'bad',   label: 'Bad',   emoji: '😞' },
];

export interface JournalEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  mood: Mood | null;
  gratitude: string[];
  reflection: string;
  locked: boolean;
  salt?: string;
  iv?: string;
  folderId?: string | null;
  weekKey?: string;
monthKey?: string;
  archived?: boolean;
  archivedAt?: Timestamp | null;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}

export type NewJournalEntry = Pick<
  JournalEntry,
  'date' | 'title' | 'content' | 'mood' | 'gratitude' | 'reflection' | 'locked' | 'salt' | 'iv' | 'folderId'
>;

export interface JournalFolder {
  id: string;
  userId: string;
  name: string;
  color: string;
  icon: string;
  order: number;
  entryCount: number;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}

export type NewJournalFolder = Pick<JournalFolder, 'userId' | 'name' | 'color' | 'icon' | 'order'>;