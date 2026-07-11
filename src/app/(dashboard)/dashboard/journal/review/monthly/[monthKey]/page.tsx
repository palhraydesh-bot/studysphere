'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EntryCard } from '@/components/journal/entry-card';
import { AiReviewCard } from '@/components/journal/ai-review-card';
import { useAuth } from '@/hooks/use-auth';
import { getEntriesForMonth } from '@/lib/journal/journal-service';
import { generateReview } from '@/lib/journal/journal-ai-service';
import type { JournalEntry } from '@/lib/firestore/journal-schema';
import type { JournalArchive } from '@/lib/firestore/journal-archive-schema';

export default function MonthlyReviewPage() {
  const { monthKey } = useParams<{ monthKey: string }>();
  const { user } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [archive, setArchive] = useState<JournalArchive | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      const monthEntries = await getEntriesForMonth(user.uid, monthKey);
      setEntries(monthEntries);
      const review = await generateReview(user.uid, 'monthly', monthKey, null, monthEntries, {});
      setArchive(review);
      setLoading(false);
    })();
  }, [user, monthKey]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between gap-3">
        <Link href="/dashboard/journal">
          <Button variant="ghost"><ArrowLeft className="h-4 w-4" /> Back to Journal</Button>
        </Link>
        <h1 className="text-xl font-bold">{monthKey}</h1>
      </div>

      <AiReviewCard archive={loading ? null : archive} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {entries.map((e, i) => <EntryCard key={e.id} entry={e} delay={i * 0.03} />)}
      </div>
    </div>
  );
}