'use client';

import { useRouter } from 'next/navigation';
import { Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GlassCard } from '@/components/shared/glass-card';
import { EntryCard } from '@/components/journal/entry-card';
import { JournalCalendar } from '@/components/journal/journal-calendar';
import { JournalStats } from '@/components/journal/journal-stats';
import { useAuth } from '@/hooks/use-auth';
import { useJournalSync } from '@/hooks/use-journal';
import { useJournalStore, filterEntries } from '@/store/journal-store';
import { createEntry } from '@/lib/journal/journal-service';
import { summarizeJournal } from '@/lib/journal/stats';

export default function JournalPage() {
  useJournalSync();
  const router = useRouter();
  const { user } = useAuth();
  const { entries, loading, search, setSearch } = useJournalStore();
  const visible = filterEntries(entries, search);
  const stats = summarizeJournal(entries);

  async function newEntry() {
    if (!user) return;
    try {
      const today = new Date().toISOString().slice(0, 10);
      const id = await createEntry(user.uid, {
        date: today, title: '', content: '', mood: null, gratitude: [], reflection: '', locked: false
      });
      router.push(`/dashboard/journal/${id}`);
    } catch {
      toast.error('Could not create entry');
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Journal</h1>
          <p className="text-sm text-muted-foreground">Reflect daily, track your mood, and keep private entries safe.</p>
        </div>
        <Button variant="gradient" onClick={newEntry}><Plus className="h-4 w-4" /> New entry</Button>
      </div>

      <JournalStats stats={stats} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search entries..." className="pl-9" />
          </div>
          {loading && <p className="text-sm text-muted-foreground">Loading entries...</p>}
          {!loading && visible.length === 0 && (
            <p className="text-sm text-muted-foreground">{search ? 'No matching entries.' : 'No entries yet. Start journaling!'}</p>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {visible.map((e, i) => <EntryCard key={e.id} entry={e} delay={i * 0.03} />)}
          </div>
        </div>
        <GlassCard>
          <h2 className="mb-3 font-semibold">Calendar</h2>
          <JournalCalendar entries={entries} />
        </GlassCard>
      </div>
    </div>
  );
}
