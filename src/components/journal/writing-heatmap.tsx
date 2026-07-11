'use client';

import { cn } from '@/lib/utils';
import type { HeatmapCell } from '@/lib/journal/insights';
import { GlassCard } from '@/components/shared/glass-card';

function intensityClass(count: number): string {
  if (count === 0) return 'bg-white/5';
  if (count === 1) return 'bg-primary/30';
  if (count === 2) return 'bg-primary/60';
  return 'bg-primary';
}

export function WritingHeatmap({ heatmap }: { heatmap: HeatmapCell[] }) {
  const weeks: HeatmapCell[][] = [];
  for (let i = 0; i < heatmap.length; i += 7) {
    weeks.push(heatmap.slice(i, i + 7));
  }

  return (
    <GlassCard>
      <h2 className="mb-3 font-semibold">Writing Heatmap (last 12 weeks)</h2>
      <div className="flex gap-1 overflow-x-auto pb-2">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((cell) => (
              <div
                key={cell.date}
                title={`${cell.date}: ${cell.count} ${cell.count === 1 ? 'entry' : 'entries'}`}
                className={cn('h-3 w-3 rounded-sm', intensityClass(cell.count))}
              />
            ))}
          </div>
        ))}
      </div>
    </GlassCard>
  );
}