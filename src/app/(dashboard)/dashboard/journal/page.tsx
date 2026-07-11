'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GlassCard } from '@/components/shared/glass-card';
import { EntryCard } from '@/components/journal/entry-card';
import { JournalCalendar } from '@/components/journal/journal-calendar';
import { JournalStats } from '@/components/journal/journal-stats';
import { FolderSidebar } from '@/components/journal/folder-sidebar';
import { FolderEmptyState } from '@/components/journal/folder-empty-state';
import { useAuth } from '@/hooks/use-auth';
import { useJournalSync, useFolderSync } from '@/hooks/use-journal';
import { useJournalStore, filterEntries, filterEntriesByFolder } from '@/store/journal-store';
import { useJournalFolderStore } from '@/store/journal-folder-store';
import { createEntry, updateEntry } from '@/lib/journal/journal-service';
import { summarizeJournal } from '@/lib/journal/stats';
import type { Mood } from '@/lib/firestore/journal-schema';
import Link from 'next/link';

const QUICK_ACTIONS = [
  { label: 'New Entry', icon: '✏️', href: '#', action: true },
  { label: 'Planner', icon: '📅', href: '/dashboard/planner' },
  { label: 'Pomodoro', icon: '⏱️', href: '/dashboard/pomodoro' },
  { label: 'AI Assistant', icon: '🤖', href: '/dashboard/assistant' },
];

export default function JournalPage() {
  useJournalSync();
  useFolderSync();
  const router = useRouter();
  const { user } = useAuth();
  const { entries, loading, search, setSearch } = useJournalStore();
  const { activeFolderId, folders } = useJournalFolderStore();

  const byFolder = filterEntriesByFolder(entries, activeFolderId);
  const visible = filterEntries(byFolder, search);
  const stats = summarizeJournal(entries);

  const activeFolder = typeof activeFolderId === 'string' && activeFolderId !== 'unfiled'
    ? folders.find((f) => f.id === activeFolderId) ?? null
    : null;
  const activeFolderLabel = activeFolderId === 'unfiled' ? 'Unfiled' : activeFolder?.name ?? null;
  const activeRealFolderId = activeFolder?.id ?? null;

  const [todayMood, setTodayMood] = useState<Mood | null>(null);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const todayEntry = entries.find((e) => e.date === today);
    if (todayEntry?.mood) setTodayMood(todayEntry.mood);
  }, [entries]);

  async function newEntry() {
    if (!user) return;
    try {
      const today = new Date().toISOString().slice(0, 10);
      const id = await createEntry(user.uid, {
        date: today, title: '', content: '', mood: null,
        gratitude: [], reflection: '', locked: false,
        folderId: activeRealFolderId,
      });
      router.push(`/dashboard/journal/${id}`);
    } catch {
      toast.error('Could not create entry');
    }
  }

  async function handleMoodSelect(mood: Mood) {
    setTodayMood(mood);
    if (!user) return;
    try {
      const today = new Date().toISOString().slice(0, 10);
      const todayEntry = entries.find((e) => e.date === today);
      if (todayEntry) {
        await updateEntry(user.uid, todayEntry.id, { mood });
      } else {
        await createEntry(user.uid, {
          date: today, title: '', content: '', mood,
          gratitude: [], reflection: '', locked: false,
          folderId: null,
        });
      }
      toast.success('Mood saved!');
    } catch {
      toast.error('Could not save mood');
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Journal</h1>
          <p className="text-sm text-muted-foreground">Reflect daily, grow consistently.</p>
        </div>
        <Button variant="gradient" onClick={newEntry}>
          <Plus className="h-4 w-4 mr-1" />
          {activeFolderLabel ? `New Entry in ${activeFolderLabel}` : 'New Entry'}
        </Button>
      </div>

      <JournalStats
        stats={stats}
        todayMood={todayMood}
        onMoodSelect={handleMoodSelect}
      />

      <GlassCard>
        <h2 className="font-semibold mb-3">Quick Actions</h2>
        <div className="grid grid-cols-4 gap-2">
          {QUICK_ACTIONS.map((a) =>
            a.action ? (
              <button key={a.label} onClick={newEntry}
                className="flex flex-col items-center gap-1 rounded-lg bg-primary/20 p-2 hover:bg-primary/30">
                <span className="text-xl">{a.icon}</span>
                <span className="text-xs text-center">{a.label}</span>
              </button>
            ) : (
              <Link key={a.label} href={a.href}
                className="flex flex-col items-center gap-1 rounded-lg bg-muted p-2 hover:bg-accent">
                <span className="text-xl">{a.icon}</span>
                <span className="text-xs text-center">{a.label}</span>
              </Link>
            )
          )}
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Recent Entries</h2>
            <div className="relative max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search entries..." className="pl-9" />
            </div>
          </div>
          {loading && <p className="text-sm text-muted-foreground">Loading entries...</p>}
          {!loading && visible.length === 0 && (
            search ? (
              <p className="text-sm text-muted-foreground">No matching entries.</p>
            ) : activeFolderId !== null ? (
              <FolderEmptyState folderName={activeFolderLabel ?? 'this folder'} onCreateEntry={newEntry} />
            ) : (
              <p className="text-sm text-muted-foreground">No entries yet. Start journaling!</p>
            )
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {visible.map((e, i) => <EntryCard key={e.id} entry={e} delay={i * 0.03} />)}
          </div>
        </div>

        <div className="space-y-4">
          <FolderSidebar />
          <GlassCard>
            <h2 className="mb-3 font-semibold">Calendar</h2>
            <JournalCalendar entries={entries} />
          </GlassCard>
        </div>
      </div>
    </div>
  );
}