import type { Timestamp } from 'firebase/firestore';

export const JOURNAL_ARCHIVE_COLLECTION = 'journalArchives';

export interface JournalArchive {
  id: string;
  userId: string;
  folderId: string | null;
  type: 'weekly' | 'monthly';
  periodKey: string;
  entryIds: string[];
  aiSummary: string;
  aiHighlights: string[];
  generatedAt: Timestamp | null;
  model: string;
}