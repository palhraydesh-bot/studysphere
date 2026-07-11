import { create } from 'zustand';
import type { JournalFolder } from '@/lib/firestore/journal-schema';

export type ActiveFolderId = string | null | 'unfiled';

interface JournalFolderState {
  folders: JournalFolder[];
  folderLoading: boolean;
  activeFolderId: ActiveFolderId;
  setFolders: (folders: JournalFolder[]) => void;
  setFolderLoading: (loading: boolean) => void;
  setActiveFolder: (folderId: ActiveFolderId) => void;
}

export const useJournalFolderStore = create<JournalFolderState>((set) => ({
  folders: [],
  folderLoading: true,
  activeFolderId: null,
  setFolders: (folders) => set({ folders, folderLoading: false }),
  setFolderLoading: (folderLoading) => set({ folderLoading }),
  setActiveFolder: (activeFolderId) => set({ activeFolderId }),
}));