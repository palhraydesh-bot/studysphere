'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { GlassCard } from '@/components/shared/glass-card';
import { FolderPickerDropdown } from '@/components/journal/folder-picker-dropdown';
import { FolderBadge } from '@/components/journal/folder-badge';
import { FOLDER_COLORS } from '@/components/journal/folder-form-dialog';
import { useJournalFolderStore } from '@/store/journal-folder-store';
import { cn } from '@/lib/utils';
import { MOODS, type JournalEntry } from '@/lib/firestore/journal-schema';

export function EntryCard({ entry, delay }: { entry: JournalEntry; delay?: number }) {
  const mood = MOODS.find((m) => m.id === entry.mood);
  const preview = entry.locked ? 'Locked entry' : entry.content.replace(/[#*`>_-]/g, '').slice(0, 100);

  const folders = useJournalFolderStore((s) => s.folders);
  const folder = folders.find((f) => f.id === entry.folderId);
  const accentClass = folder ? FOLDER_COLORS.find((c) => c.id === folder.color)?.accentClass : undefined;

  return (
    <motion.div layout>
      <Link href={`/dashboard/journal/${entry.id}`}>
        <GlassCard
          delay={delay}
          className={cn('h-full transition-transform hover:-translate-y-1', accentClass && `border-l-2 ${accentClass}`)}
        >
          <div className="mb-1 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{entry.date}</span>
            <div className="flex items-center gap-1">
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