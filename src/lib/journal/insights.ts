import type { JournalEntry, Mood } from '@/lib/firestore/journal-schema';
import type { JournalFolder } from '@/lib/firestore/journal-schema';
import { computeFolderAnalytics } from '@/lib/journal/folder-analytics';

export interface HeatmapCell {
  date: string;
  count: number;
}

export interface JournalInsights {
  currentStreak: number;
  longestStreak: number;
  moodCounts: Record<Mood, number>;
  moodTrend: { date: string; mood: Mood | null }[];
  consistencyScore: number;
  mostActiveFolderName: string | null;
  heatmap: HeatmapCell[];
  totalWords: number;
  lockedEntryCount: number;
}

function toDateOnly(dateStr: string): number {
  return new Date(dateStr + 'T00:00:00').getTime();
}

function computeStreaks(sortedDatesDesc: string[]): { current: number; longest: number } {
  if (sortedDatesDesc.length === 0) return { current: 0, longest: 0 };
  const unique = Array.from(new Set(sortedDatesDesc)).sort((a, b) => toDateOnly(b) - toDateOnly(a));

  const oneDay = 86400000;
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - oneDay).toISOString().slice(0, 10);

  let current = 0;
  if (unique[0] === today || unique[0] === yesterday) {
    current = 1;
    for (let i = 0; i < unique.length - 1; i++) {
      const diff = toDateOnly(unique[i]) - toDateOnly(unique[i + 1]);
      if (diff === oneDay) current++;
      else break;
    }
  }

  let longest = 1;
  let run = 1;
  for (let i = 0; i < unique.length - 1; i++) {
    const diff = toDateOnly(unique[i]) - toDateOnly(unique[i + 1]);
    if (diff === oneDay) { run++; longest = Math.max(longest, run); }
    else run = 1;
  }

  return { current, longest: unique.length ? longest : 0 };
}

function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export function computeJournalInsights(entries: JournalEntry[], folders: JournalFolder[]): JournalInsights {
  const dates = entries.map((e) => e.date);
  const { current, longest } = computeStreaks(dates);

  const moodCounts: Record<Mood, number> = { great: 0, good: 0, okay: 0, low: 0, bad: 0 };
  entries.forEach((e) => { if (e.mood) moodCounts[e.mood]++; });

  const moodTrend = [...entries]
    .sort((a, b) => toDateOnly(a.date) - toDateOnly(b.date))
    .map((e) => ({ date: e.date, mood: e.mood }));

  const now = new Date();
  const daysInMonthSoFar = now.getDate();
  const entriesThisMonth = entries.filter((e) => e.date.startsWith(now.toISOString().slice(0, 7))).length;
  const consistencyScore = Math.min(100, Math.round((entriesThisMonth / daysInMonthSoFar) * 100));

  const { largestFolder } = computeFolderAnalytics(folders);

  const heatmapMap = new Map<string, number>();
  for (let i = 0; i < 84; i++) {
    const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
    heatmapMap.set(d, 0);
  }
  entries.forEach((e) => {
    if (heatmapMap.has(e.date)) heatmapMap.set(e.date, (heatmapMap.get(e.date) ?? 0) + 1);
  });
  const heatmap: HeatmapCell[] = Array.from(heatmapMap.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => toDateOnly(a.date) - toDateOnly(b.date));

  const totalWords = entries
    .filter((e) => !e.locked)
    .reduce((sum, e) => sum + countWords(e.content), 0);

  const lockedEntryCount = entries.filter((e) => e.locked).length;

  return {
    currentStreak: current,
    longestStreak: longest,
    moodCounts,
    moodTrend,
    consistencyScore,
    mostActiveFolderName: largestFolder?.name ?? null,
    heatmap,
    totalWords,
    lockedEntryCount,
  };
}