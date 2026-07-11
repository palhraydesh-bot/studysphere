'use client';

import { Flame, Trophy, Target, FolderHeart, BookOpenText, Lock } from 'lucide-react';
import { GlassCard } from '@/components/shared/glass-card';
import { MoodTrendChart } from '@/components/journal/mood-trend-chart';
import { WritingHeatmap } from '@/components/journal/writing-heatmap';
import { useJournalStore, filterEntriesByArchiveStatus } from '@/store/journal-store';
import { useJournalFolderStore } from '@/store/journal-folder-store';
import { computeJournalInsights } from '@/lib/journal/insights';

function StatTile({ icon: Icon, label, value }: { icon: typeof Flame; label: string; value: string | number }) {
  return (
    <GlassCard className="flex flex-col items-center gap-1 py-4 text-center">
      <Icon className="h-5 w-5 text-primary" />
      <span className="text-xl font-bold">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </GlassCard>
  );
}

export function InsightsDashboard() {
  const { entries } = useJournalStore();
  const { folders } = useJournalFolderStore();
  const active = filterEntriesByArchiveStatus(entries, 'active');
  const insights = computeJournalInsights(active, folders);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile icon={Flame} label="Current Streak" value={`${insights.currentStreak}d`} />
        <StatTile icon={Trophy} label="Longest Streak" value={`${insights.longestStreak}d`} />
        <StatTile icon={Target} label="Consistency" value={`${insights.consistencyScore}%`} />
        <StatTile icon={BookOpenText} label="Total Words" value={insights.totalWords.toLocaleString()} />
      </div>

      {insights.mostActiveFolderName && (
        <GlassCard className="flex items-center gap-2">
          <FolderHeart className="h-4 w-4 text-primary" />
          <p className="text-sm text-muted-foreground">
            Most active folder: <span className="text-foreground font-medium">{insights.mostActiveFolderName}</span>
          </p>
        </GlassCard>
      )}

      {insights.lockedEntryCount > 0 && (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Lock className="h-3 w-3" /> {insights.lockedEntryCount} locked {insights.lockedEntryCount === 1 ? 'entry is' : 'entries are'} excluded from word count.
        </p>
      )}

      <MoodTrendChart moodTrend={insights.moodTrend} />
      <WritingHeatmap heatmap={insights.heatmap} />
    </div>
  );
}