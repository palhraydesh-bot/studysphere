'use client';

import { GlassCard } from '@/components/shared/glass-card';
import { cn } from '@/lib/utils';
import { Flame, ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';

interface StreakCalendarCardProps {
  /** Set of day-keys (YYYY-MM-DD) on which the user studied. */
  activeDays?: Set<string>;
  streakDays?: number;
  delay?: number;
}

const WEEK_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function toKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

/** GitHub-style activity grid for the last 4 weeks, ending today. */
export function StreakCalendarCard({ activeDays, streakDays = 0, delay }: StreakCalendarCardProps) {
  const [weekOffset, setWeekOffset] = useState(0);

  const weeks = useMemo(() => {
    const today = new Date();
    // Find the Monday of the current week, then shift by weekOffset weeks.
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
          active: activeDays?.has(key) ?? false,
          future: day > today,
        });
      }
      grid.push(row);
    }
    return grid;
  }, [activeDays, weekOffset]);

  return (
    <GlassCard delay={delay} className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">Streak Calendar</h3>
        </div>
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
          <div
            key={cell.key}
            title={cell.key}
            className={cn(
              'aspect-square rounded-md',
              cell.future
                ? 'bg-transparent'
                : cell.active
                  ? 'bg-gradient-brand'
                  : 'bg-secondary/60'
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