'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { subscribeEntries, subscribeFolders } from '@/lib/journal/journal-service';
import { useJournalStore } from '@/store/journal-store';
import { useJournalFolderStore } from '@/store/journal-folder-store';

export function useJournalSync() {
  const { user } = useAuth();
  const setEntries = useJournalStore((s) => s.setEntries);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeEntries(user.uid, setEntries);
    return () => unsub();
  }, [user, setEntries]);
}

export function useFolderSync() {
  const { user } = useAuth();
  const setFolders = useJournalFolderStore((s) => s.setFolders);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeFolders(user.uid, setFolders);
    return () => unsub();
  }, [user, setFolders]);
}