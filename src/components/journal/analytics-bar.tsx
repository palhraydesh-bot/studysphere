'use client';

import { Clock, TrendingUp } from 'lucide-react';
import { useJournalFolderStore } from '@/store/journal-folder-store';
import { computeFolderAnalytics } from '@/lib/journal/folder-analytics';

function relativeTime(value: unknown): string {
  const ms = value && typeof value === 'object' && 'toMillis' in (value as any)
    ? (value as { toMillis: () => number }).toMillis()
    : 0;
  if (!ms) return '';
  const diffMin = Math.round((Date.now() - ms) / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${Math.round(diffHr / 24)}d ago`;
}

export function FolderAnalyticsBar() {
  const folders = useJournalFolderStore((s) => s.folders);
  const { totalFolders, largestFolder, lastUpdatedFolder } = computeFolderAnalytics(folders);

  if (totalFolders === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {largestFolder && (
        <div className="flex min-w-[130px] flex-1 items-center gap-1.5 rounded-lg border border-white/5 bg-white/5 px-2 py-1.5 text-[11px]">
          <TrendingUp className="h-3 w-3 shrink-0 text-primary" />
          <span className="min-w-0 truncate text-muted-foreground">
            Largest: <span className="text-foreground">{largestFolder.name}</span> ({largestFolder.entryCount})
          </span>
        </div>
      )}
      {lastUpdatedFolder && (
        <div className="flex min-w-[130px] flex-1 items-center gap-1.5 rounded-lg border border-white/5 bg-white/5 px-2 py-1.5 text-[11px]">
          <Clock className="h-3 w-3 shrink-0 text-primary" />
          <span className="min-w-0 truncate text-muted-foreground">
            Active: <span className="text-foreground">{lastUpdatedFolder.name}</span>
            {relativeTime(lastUpdatedFolder.updatedAt) && ` · ${relativeTime(lastUpdatedFolder.updatedAt)}`}
          </span>
        </div>
      )}
    </div>
  );
}