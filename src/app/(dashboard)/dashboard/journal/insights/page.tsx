'use client';

import Link from 'next/link';
import { ArrowLeft, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InsightsDashboard } from '@/components/journal/insights-dashboard';
import { useJournalSync, useFolderSync } from '@/hooks/use-journal';

export default function JournalInsightsPage() {
  useJournalSync();
  useFolderSync();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between gap-3">
        <Link href="/dashboard/journal">
          <Button variant="ghost"><ArrowLeft className="h-4 w-4" /> Back to Journal</Button>
        </Link>
        <h1 className="flex items-center gap-2 text-xl font-bold">
          <BarChart3 className="h-5 w-5 text-primary" /> Journal Insights
        </h1>
      </div>
      <InsightsDashboard />
    </div>
  );
}