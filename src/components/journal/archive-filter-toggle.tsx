'use client';

import { Archive, Layers, ListChecks } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useJournalStore, type ArchiveFilter } from '@/store/journal-store';

const OPTIONS: { id: ArchiveFilter; label: string; icon: typeof Archive }[] = [
  { id: 'active', label: 'Active', icon: ListChecks },
  { id: 'archived', label: 'Archived', icon: Archive },
  { id: 'all', label: 'All', icon: Layers },
];

export function ArchiveFilterToggle() {
  const { archiveFilter, setArchiveFilter } = useJournalStore();

  return (
    <div className="inline-flex rounded-lg border border-white/10 bg-white/5 p-0.5">
      {OPTIONS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => setArchiveFilter(id)}
          className={cn(
            'flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors',
            archiveFilter === id ? 'bg-primary/20 text-primary font-medium' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Icon className="h-3 w-3" /> {label}
        </button>
      ))}
    </div>
  );
}