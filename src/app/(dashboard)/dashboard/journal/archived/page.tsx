'use client';

import Link from 'next/link';
import { ArrowLeft, Archive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/shared/glass-card';
import { EntryCard } from '@/components/journal/entry-card';
import { useJournalSync } from '@/hooks/use-journal';
import { useJournalStore, filterEntriesByArchiveStatus } from '@/store/journal-store';

export default function ArchivedJournalPage() {
  useJournalSync();
  const { entries, loading } = useJournalStore();
  const archived = filterEntriesByArchiveStatus(entries, 'archived');

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between gap-3">
        <Link href="/dashboard/journal">
          <Button variant="ghost"><ArrowLeft className="h-4 w-4" /> Back to Journal</Button>
        </Link>
        <h1 className="flex items-center gap-2 text-xl font-bold">
          <Archive className="h-5 w-5 text-primary" /> Archived Entries
        </h1>
      </div>

      {loading && <p className="text-sm text-muted-foreground">Loading...</p>}
      {!loading && archived.length === 0 && (
        <GlassCard className="flex flex-col items-center gap-2 py-10 text-center">
          <Archive className="h-10 w-10 text-primary" />
          <p className="font-medium">No archived entries</p>
          <p className="text-sm text-muted-foreground">Entries you archive will show up here.</p>
        </GlassCard>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {archived.map((e, i) => <EntryCard key={e.id} entry={e} delay={i * 0.03} />)}
      </div>
    </div>
  );
}