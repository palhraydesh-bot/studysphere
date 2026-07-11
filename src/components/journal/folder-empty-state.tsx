'use client';

import { FolderOpen, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/shared/glass-card';

interface FolderEmptyStateProps {
  folderName: string;
  onCreateEntry: () => void;
}

export function FolderEmptyState({ folderName, onCreateEntry }: FolderEmptyStateProps) {
  return (
    <GlassCard className="flex flex-col items-center gap-3 py-10 text-center">
      <FolderOpen className="h-10 w-10 text-primary" />
      <div className="space-y-1">
        <p className="font-medium">No entries in {folderName} yet</p>
        <p className="text-sm text-muted-foreground">Start writing to fill this folder up.</p>
      </div>
      <Button variant="gradient" onClick={onCreateEntry}>
        <Plus className="h-4 w-4" /> New entry here
      </Button>
    </GlassCard>
  );
}