'use client';

import { GlassCard } from '@/components/shared/glass-card';
import { cn } from '@/lib/utils';
import { Flame, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

interface StreakCalendarCardProps {
  delay?: number;
}

const WEEK_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const STORAGE_KEY = 'streak-calendar-v1';

function toKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

function loadMarkedDays(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return new Set(JSON.parse(raw) as string[]);
  } catch {
    /* ignore */
  }
  return new Set();
}

function saveMarkedDays(days: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(days)));
  } catch {
    /* ignore */
  }
}

/** Computes the current consecutive-day streak ending today (or yesterday, if today isn't marked yet). */
function computeStreak(days: Set<string>): number {
  let streak = 0;
  const cursor = new Date();
  // Allow the streak to still count if today simply hasn't been marked yet.
  if (!days.has(toKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (days.has(toKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

/** Click-to-toggle activity grid for the last 4 weeks, ending today. Persists to localStorage. */
export function StreakCalendarCard({ delay }: StreakCalendarCardProps) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [markedDays, setMarkedDays] = useState<Set<string>>(new Set());

  useEffect(() => {
    setMarkedDays(loadMarkedDays());
  }, []);

  const toggleDay = useCallback((key: string, isFuture: boolean) => {
    if (isFuture) return;
    setMarkedDays((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      saveMarkedDays(next);
      return next;
    });
  }, []);

  const streakDays = useMemo(() => computeStreak(markedDays), [markedDays]);

  const weeks = useMemo(() => {
    const today = new Date();
    const dow = (today.getDay() + 6) % 7; // 0 = Monday
    const thisMonday = new Date(today);
    thisMonday.setDate(today.getDate() - dow + weekOffset * 7);

    const grid: { date: Date; key: string; active: boolean; future: boolean }[][] = [];
    for (let w = 3; w >= 0; w--) {
      const row: { date: Date; key: string; active: boolean; future: boolean }[] = [];
      for (let d = 0; d < 7; d++) {
        const day = new Date(thisMonday);
        day.setDate(thisMonday.getDate() - w * 7 + d);
        const key = toKey(day);
        row.push({
          date: day,
          key,
          active: markedDays.has(key),
          future: day > today,
        });
      }
      grid.push(row);
    }
    return grid;
  }, [markedDays, weekOffset]);

  return (
    <GlassCard delay={delay} className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Streak Calendar</h3>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Previous month"
            onClick={() => setWeekOffset((o) => o - 4)}
            className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-secondary"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Next month"
            onClick={() => setWeekOffset((o) => Math.min(0, o + 4))}
            className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-secondary disabled:opacity-30"
            disabled={weekOffset >= 0}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-sm font-medium">
        <Flame className="h-4 w-4 text-orange-500" />
        <span>{streakDays} Days</span>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {WEEK_LABELS.map((label, i) => (
          <span key={i} className="text-center text-[11px] text-muted-foreground">
            {label}
          </span>
        ))}
        {weeks.flat().map((cell) => (
          <button
            key={cell.key}
            type="button"
            title={cell.key}
            onClick={() => toggleDay(cell.key, cell.future)}
            disabled={cell.future}
            className={cn(
              'aspect-square rounded-md transition-colors',
              cell.future
                ? 'cursor-default bg-transparent'
                : cell.active
                  ? 'bg-gradient-brand hover:opacity-80'
                  : 'bg-secondary/60 hover:bg-secondary'
            )}
          />
        ))}
      </div>

      <div className="flex items-center justify-end gap-1.5 text-[11px] text-muted-foreground">
        <span>Less</span>
        <div className="h-2.5 w-2.5 rounded-sm bg-secondary/60" />
        <div className="h-2.5 w-2.5 rounded-sm bg-primary/40" />
        <div className="h-2.5 w-2.5 rounded-sm bg-primary/70" />
        <div className="h-2.5 w-2.5 rounded-sm bg-gradient-brand" />
        <span>More</span>
      </div>
    </GlassCard>
  );
}