import type { JournalFolder } from '@/lib/firestore/journal-schema';

export interface FolderAnalyticsSummary {
  totalFolders: number;
  totalFoldEntries: number;
  largestFolder: JournalFolder | null;
  lastUpdatedFolder: JournalFolder | null;
}

function toMillis(value: unknown): number {
  if (value && typeof value === 'object' && 'toMillis' in (value as any)) {
    return (value as { toMillis: () => number }).toMillis();
  }
  return 0;
}

export function computeFolderAnalytics(folders: JournalFolder[]): FolderAnalyticsSummary {
  if (folders.length === 0) {
    return { totalFolders: 0, totalFoldEntries: 0, largestFolder: null, lastUpdatedFolder: null };
  }

  const totalFoldEntries = folders.reduce((sum, f) => sum + (f.entryCount ?? 0), 0);

  const largestFolder = folders.reduce((largest, f) =>
    !largest || f.entryCount > largest.entryCount ? f : largest
  , folders[0]);

  const lastUpdatedFolder = folders.reduce((latest, f) =>
    !latest || toMillis(f.updatedAt) > toMillis(latest.updatedAt) ? f : latest
  , folders[0]);

  return { totalFolders: folders.length, totalFoldEntries, largestFolder, lastUpdatedFolder };
}