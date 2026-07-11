'use client';

import type { LucideIcon } from 'lucide-react';
import { Folder as FolderIcon, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useJournalFolderStore } from '@/store/journal-folder-store';
import { FOLDER_ICONS, FOLDER_COLORS } from '@/components/journal/folder-form-dialog';

interface FolderBadgeProps {
  folderId?: string | null;
  showUnfiled?: boolean;
  className?: string;
}

export function FolderBadge({ folderId, showUnfiled = false, className }: FolderBadgeProps) {
  const folders = useJournalFolderStore((s) => s.folders);

  if (!folderId) {
    if (!showUnfiled) return null;
    return (
      <span className={cn(
        'inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-muted-foreground',
        className
      )}>
        <Inbox className="h-3 w-3" /> Unfiled
      </span>
    );
  }

  const folder = folders.find((f) => f.id === folderId);
  if (!folder) return null;

  const Icon: LucideIcon = FOLDER_ICONS[folder.icon] ?? FolderIcon;
  const badgeClass = FOLDER_COLORS.find((c) => c.id === folder.color)?.badgeClass
    ?? 'bg-primary/15 text-primary border-primary/30';

  return (
    <span className={cn(
      'inline-flex max-w-full items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium',
      badgeClass, className
    )}>
      <Icon className="h-3 w-3 shrink-0" />
      <span className="truncate">{folder.name}</span>
    </span>
  );
}