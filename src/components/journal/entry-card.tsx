'use client';

import Link from 'next/link';
import type { MouseEvent } from 'react';
import { motion } from 'framer-motion';
import { Lock, Archive, ArchiveRestore } from 'lucide-react';
import { toast } from 'sonner';
import { GlassCard } from '@/components/shared/glass-card';
import { FolderPickerDropdown } from '@/components/journal/folder-picker-dropdown';
import { FolderBadge } from '@/components/journal/folder-badge';
import { FOLDER_COLORS } from '@/components/journal/folder-form-dialog';
import { useJournalFolderStore } from '@/store/journal-folder-store';
import { useAuth } from '@/hooks/use-auth';
import { archiveEntry, restoreEntry } from '@/lib/journal/journal-service';
import { cn } from '@/lib/utils';
import { MOODS, type JournalEntry } from '@/lib/firestore/journal-schema';

interface EntryCardProps {
  entry: JournalEntry;
  delay?: number;
  selectable?: boolean;
  selected?: boolean;
  onToggleSelect?: (entryId: string) => void;
}

export function EntryCard({ entry, delay, selectable, selected, onToggleSelect }: EntryCardProps) {
  const { user } = useAuth();
  const mood = MOODS.find((m) => m.id === entry.mood);
  const preview = entry.locked ? 'Locked entry' : entry.content.replace(/[#*`>_-]/g, '').slice(0, 100);

  const folders = useJournalFolderStore((s) => s.folders);
  const folder = folders.find((f) => f.id === entry.folderId);
  const accentClass = folder ? FOLDER_COLORS.find((c) => c.id === folder.color)?.accentClass : undefined;

  async function handleArchiveToggle(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    try {
      if (entry.archived) {
        await restoreEntry(user.uid, entry.id);
        toast.success('Entry restored');
      } else {
        await archiveEntry(user.uid, entry.id);
        toast.success('Entry archived');
      }
    } catch {
      toast.error('Could not update entry');
    }
  }

  return (
    <motion.div layout className="relative">
      {selectable && (
        <button
          type="button"
          aria-label={selected ? 'Deselect entry' : 'Select entry'}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleSelect?.(entry.id); }}
          className={cn(
            'absolute left-2 top-2 z-10 h-5 w-5 rounded-full border-2 transition-colors',
            selected ? 'border-primary bg-primary' : 'border-white/30 bg-background/60'
          )}
        />
      )}
      <Link href={`/dashboard/journal/${entry.id}`}>
        <GlassCard
          delay={delay}
          className={cn(
            'h-full transition-transform hover:-translate-y-1',
            accentClass && `border-l-2 ${accentClass}`,
            entry.archived && 'opacity-60'
          )}
        >
          <div className="mb-1 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{entry.date}</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label={entry.archived ? 'Restore entry' : 'Archive entry'}
                onClick={handleArchiveToggle}
                className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                {entry.archived ? <ArchiveRestore className="h-3.5 w-3.5" /> : <Archive className="h-3.5 w-3.5" />}
              </button>
              <span onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                <FolderPickerDropdown
                  entryId={entry.id}
                  currentFolderId={entry.folderId}
                  triggerVariant="icon"
                />
              </span>
              <span className="text-lg">{entry.locked ? <Lock className="h-4 w-4" /> : mood?.emoji}</span>
            </div>
          </div>
          <h3 className="truncate font-semibold">{entry.title || 'Untitled entry'}</h3>
          {entry.archived && (
            <span className="mt-1 inline-flex w-fit items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-muted-foreground">
              <Archive className="h-2.5 w-2.5" /> Archived
            </span>
          )}
          {entry.folderId && (
            <div className="mt-1">
              <FolderBadge folderId={entry.folderId} />
            </div>
          )}
          <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">{preview}</p>
        </GlassCard>
      </Link>
    </motion.div>
  );
}