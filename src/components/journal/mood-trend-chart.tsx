'use client';

import { MOODS } from '@/lib/firestore/journal-schema';
import type { JournalInsights } from '@/lib/journal/insights';
import { GlassCard } from '@/components/shared/glass-card';

const MOOD_HEIGHT: Record<string, number> = { great: 100, good: 75, okay: 50, low: 25, bad: 10 };

export function MoodTrendChart({ moodTrend }: { moodTrend: JournalInsights['moodTrend'] }) {
  const recent = moodTrend.slice(-30);

  return (
    <GlassCard>
      <h2 className="mb-3 font-semibold">Mood Trend (last 30 entries)</h2>
      {recent.length === 0 ? (
        <p className="text-sm text-muted-foreground">Not enough data yet.</p>
      ) : (
        <div className="flex h-24 items-end gap-1">
          {recent.map((point, i) => {
            const moodInfo = MOODS.find((m) => m.id === point.mood);
            const height = point.mood ? MOOD_HEIGHT[point.mood] : 5;
            return (
              <div
                key={i}
                title={`${point.date}: ${moodInfo?.label ?? 'No mood'}`}
                className="flex-1 rounded-t bg-primary/40 transition-all hover:bg-primary/70"
                style={{ height: `${height}%` }}
              />
            );
          })}
        </div>
      )}
    </GlassCard>
  );
}