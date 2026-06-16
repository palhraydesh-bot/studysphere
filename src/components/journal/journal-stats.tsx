'use client';

import { GlassCard } from '@/components/shared/glass-card';
import { MOODS } from '@/lib/firestore/journal-schema';
import type { JournalStatsSummary } from '@/lib/journal/stats';

/** Compact journal statistics: totals, streak and mood distribution. */
export function JournalStats({ stats }: { stats: JournalStatsSummary }) {
  const totalMoods = Object.values(stats.moodCounts).reduce((a, b) => a + b, 0) || 1;
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <GlassCard className="flex flex-col gap-1">
        <span className="text-sm text-muted-foreground">Total entries</span>
        <span className="text-2xl font-bold">{stats.totalEntries}</span>
      </GlassCard>
      <GlassCard className="flex flex-col gap-1">
        <span className="text-sm text-muted-foreground">Current streak</span>
        <span className="text-2xl font-bold">{stats.currentStreak} day{stats.currentStreak === 1 ? '' : 's'}</span>
      </GlassCard>
      <GlassCard className="sm:col-span-1">
        <span className="text-sm text-muted-foreground">Mood mix</span>
        <div className="mt-2 space-y-1">
          {MOODS.map((m) => {
            const pct = Math.round((stats.moodCounts[m.id] / totalMoods) * 100);
            return (
              <div key={m.id} className="flex items-center gap-2 text-xs">
                <span>{m.emoji}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-gradient-brand" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-8 text-right text-muted-foreground">{pct}%</span>
              </div>
            );
          })}
        </div>
      </GlassCard>
    </div>
  );
}
