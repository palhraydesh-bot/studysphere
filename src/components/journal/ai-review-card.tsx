'use client';

import { Sparkles } from 'lucide-react';
import { GlassCard } from '@/components/shared/glass-card';
import type { JournalArchive } from '@/lib/firestore/journal-archive-schema';

export function AiReviewCard({ archive }: { archive: JournalArchive | null }) {
  if (!archive) {
    return (
      <GlassCard className="flex flex-col items-center gap-2 py-8 text-center">
        <Sparkles className="h-8 w-8 text-primary" />
        <p className="text-sm text-muted-foreground">Generating your AI review...</p>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="space-y-3">
      <h2 className="flex items-center gap-2 font-semibold text-primary">
        <Sparkles className="h-4 w-4" /> AI Reflection
      </h2>
      <p className="text-sm text-muted-foreground">{archive.aiSummary}</p>
      {archive.aiHighlights.length > 0 && (
        <ul className="space-y-1">
          {archive.aiHighlights.map((h, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <span className="text-primary">•</span> {h}
            </li>
          ))}
        </ul>
      )}
    </GlassCard>
  );
}