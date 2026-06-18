'use client';

import { useRouter } from 'next/navigation';
import { Plus, Search, BarChart2, BookOpen, Flame } from 'lucide-react';
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
import Link from 'next/link';

const MOODS = [
  { label: 'Amazing', emoji: '😁', color: 'text-green-400' },
  { label: 'Good', emoji: '😊', color: 'text-blue-400' },
  { label: 'Neutral', emoji: '😐', color: 'text-yellow-400' },
  { label: 'Tough', emoji: '😟', color: 'text-orange-400' },
  { label: 'Awful', emoji: '😢', color: 'text-red-400' },
];

const QUICK_ACTIONS = [
  { label: 'New Entry', icon: '✏️', href: '#', action: true },
  { label: 'Planner', icon: '📅', href: '/dashboard/planner' },
  { label: 'Pomodoro', icon: '⏱️', href: '/dashboard/pomodoro' },
  { label: 'AI Assistant', icon: '🤖', href: '/dashboard/assistant' },
];

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
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Journal</h1>
          <p className="text-sm text-muted-foreground">Reflect daily, grow consistently.</p>
        </div>
        <Button variant="gradient" onClick={newEntry}><Plus className="h-4 w-4 mr-1" /> New Entry</Button>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Today's Mood */}
        <GlassCard>
          <h2 className="font-semibold mb-3">Today's Mood</h2>
          <div className="flex gap-2 flex-wrap">
            {MOODS.map((m) => (
              <button key={m.label} className="flex flex-col items-center gap-1 rounded-lg p-2 hover:bg-muted transition-colors">
                <span className="text-2xl">{m.emoji}</span>
                <span className={`text-xs ${m.color}`}>{m.label}</span>
              </button>
            ))}
          </div>
        </GlassCard>

        {/* Streak */}
        <GlassCard>
          <h2 className="font-semibold mb-3">Current Streak</h2>
          <div className="flex items-center gap-3">
            <span className="text-4xl">🔥</span>
            <div>
              <p className="text-3xl font-bold">{stats.streak ?? 0} days</p>
              <p className="text-xs text-muted-foreground">Keep it up!</p>
            </div>
          </div>
        </GlassCard>

        {/* Quick Actions */}
        <GlassCard>
          <h2 className="font-semibold mb-3">Quick Actions</h2>
          <div className="grid grid-cols-4 gap-2">
            {QUICK_ACTIONS.map((a) => (
              a.action ? (
                <button key={a.label} onClick={newEntry} className="flex flex-col items-center gap-1 rounded-lg bg-primary/20 p-2 hover:bg-primary/30">
                  <span className="text-xl">{a.icon}</span>
                  <span className="text-xs text-center">{a.label}</span>
                </button>
              ) : (
                <Link key={a.label} href={a.href} className="flex flex-col items-center gap-1 rounded-lg bg-muted p-2 hover:bg-accent">
                  <span className="text-xl">{a.icon}</span>
                  <span className="text-xs text-center">{a.label}</span>
                </Link>
              )
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Stats */}
      <JournalStats stats={stats} />

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Recent Entries</h2>
            <div className="relative max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search entries..." className="pl-9" />
            </div>
          </div>
          {loading && <p className="text-sm text-muted-foreground">Loading entries...</p>}
          {!loading && visible.length === 0 && (
            <p className="text-sm text-muted-foreground">{search ? 'No matching entries.' : 'No entries yet. Start journaling!'}</p>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {visible.map((e, i) => <EntryCard key={e.id} entry={e} delay={i * 0.03} />)}
          </div>
        </div>

        <div className="space-y-4">
          <GlassCard>
            <h2 className="mb-3 font-semibold">Calendar</h2>
            <JournalCalendar entries={entries} />
          </GlassCard>
        </div>
      </div>
    </div>
  );
}