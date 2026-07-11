'use client';

import { toast } from 'sonner';
import { Archive, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { bulkArchiveEntries } from '@/lib/journal/journal-service';

interface BulkArchiveBarProps {
  selectedIds: string[];
  onDone: () => void;
}

export function BulkArchiveBar({ selectedIds, onDone }: BulkArchiveBarProps) {
  const { user } = useAuth();
  if (selectedIds.length === 0) return null;

  async function handleArchive() {
    if (!user) return;
    try {
      await bulkArchiveEntries(user.uid, selectedIds);
      toast.success(`${selectedIds.length} ${selectedIds.length === 1 ? 'entry' : 'entries'} archived`);
      onDone();
    } catch {
      toast.error('Could not archive selected entries');
    }
  }

  return (
    <div className="fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
      <div className="glass flex items-center gap-3 rounded-full px-4 py-2 shadow-lg">
        <span className="text-sm">{selectedIds.length} selected</span>
        <Button size="sm" variant="gradient" onClick={handleArchive}>
          <Archive className="h-3.5 w-3.5" /> Archive
        </Button>
        <Button size="sm" variant="ghost" onClick={onDone}>
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}