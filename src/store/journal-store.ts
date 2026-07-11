import { create } from 'zustand';
import type { JournalEntry } from '@/lib/firestore/journal-schema';

export type ArchiveFilter = 'active' | 'archived' | 'all';

interface JournalState {
  entries: JournalEntry[];
  loading: boolean;
  search: string;
  archiveFilter: ArchiveFilter;
  setEntries: (entries: JournalEntry[]) => void;
  setSearch: (search: string) => void;
  setArchiveFilter: (filter: ArchiveFilter) => void;
}

export const useJournalStore = create<JournalState>((set) => ({
  entries: [],
  loading: true,
  search: '',
  archiveFilter: 'active',
  setEntries: (entries) => set({ entries, loading: false }),
  setSearch: (search) => set({ search }),
  setArchiveFilter: (archiveFilter) => set({ archiveFilter }),
}));

export function filterEntries(entries: JournalEntry[], q: string): JournalEntry[] {
  const term = q.trim().toLowerCase();
  if (!term) return entries;
  return entries.filter((e) => {
    if (e.title.toLowerCase().includes(term) || e.date.includes(term)) return true;
    return !e.locked && e.content.toLowerCase().includes(term);
  });
}

export function filterEntriesByFolder(
  entries: JournalEntry[],
  folderId: string | null | 'unfiled'
): JournalEntry[] {
  if (folderId === null) return entries;
  if (folderId === 'unfiled') return entries.filter((e) => !e.folderId);
  return entries.filter((e) => e.folderId === folderId);
}

export function filterEntriesByArchiveStatus(entries: JournalEntry[], filter: ArchiveFilter): JournalEntry[] {
  if (filter === 'all') return entries;
  if (filter === 'archived') return entries.filter((e) => e.archived === true);
  return entries.filter((e) => !e.archived);
}