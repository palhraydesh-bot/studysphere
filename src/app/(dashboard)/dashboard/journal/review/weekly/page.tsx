'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EntryCard } from '@/components/journal/entry-card';
import { AiReviewCard } from '@/components/journal/ai-review-card';
import { useAuth } from '@/hooks/use-auth';
import { getEntriesForWeek } from '@/lib/journal/journal-service';
import { generateReview } from '@/lib/journal/journal-ai-service';
import type { JournalEntry } from '@/lib/firestore/journal-schema';
import type { JournalArchive } from '@/lib/firestore/journal-archive-schema';

export default function WeeklyReviewPage() {
  const { weekKey } = useParams<{ weekKey: string }>();
  const { user } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [archive, setArchive] = useState<JournalArchive | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      const weekEntries = await getEntriesForWeek(user.uid, weekKey);
      setEntries(weekEntries);
      const review = await generateReview(user.uid, 'weekly', weekKey, null, weekEntries, {});
      setArchive(review);
      setLoading(false);
    })();
  }, [user, weekKey]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between gap-3">
        <Link href="/dashboard/journal">
          <Button variant="ghost"><ArrowLeft className="h-4 w-4" /> Back to Journal</Button>
        </Link>
        <h1 className="text-xl font-bold">Week {weekKey}</h1>
      </div>

      <AiReviewCard archive={loading ? null : archive} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {entries.map((e, i) => <EntryCard key={e.id} entry={e} delay={i * 0.03} />)}
      </div>
    </div>
  );
}