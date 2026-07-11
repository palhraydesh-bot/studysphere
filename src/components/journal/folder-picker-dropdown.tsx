'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Check, ChevronDown, FolderInput, Inbox, Folder as FolderIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { useJournalFolderStore } from '@/store/journal-folder-store';
import { moveEntryToFolder } from '@/lib/journal/journal-service';
import { FOLDER_ICONS } from '@/components/journal/folder-form-dialog';

interface FolderPickerDropdownProps {
  entryId: string;
  currentFolderId?: string | null;
  triggerVariant?: 'icon' | 'button';
  onMoved?: (folderId: string | null) => void;
}

export function FolderPickerDropdown({
  entryId,
  currentFolderId,
  triggerVariant = 'button',
  onMoved,
}: FolderPickerDropdownProps) {
  const { user } = useAuth();
  const folders = useJournalFolderStore((s) => s.folders);
  const [open, setOpen] = useState(false);
  const [moving, setMoving] = useState(false);

  const currentFolder = folders.find((f) => f.id === currentFolderId);

  async function handleSelect(folderId: string | null) {
    if (!user || moving) return;
    if ((folderId ?? null) === (currentFolderId ?? null)) { setOpen(false); return; }
    setMoving(true);
    try {
      await moveEntryToFolder(user.uid, entryId, folderId);
      toast.success(folderId ? 'Entry moved' : 'Moved to Unfiled');
      onMoved?.(folderId);
    } catch {
      toast.error('Could not move entry');
    } finally {
      setMoving(false);
      setOpen(false);
    }
  }

  return (
    <div className="relative inline-block text-left">
      {triggerVariant === 'icon' ? (
        <button
          type="button"
          aria-label="Move to folder"
          onClick={() => setOpen((v) => !v)}
          className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <FolderInput className="h-3.5 w-3.5" />
        </button>
      ) : (
        <Button type="button" variant="outline" onClick={() => setOpen((v) => !v)}>
          <FolderInput className="h-4 w-4" />
          {currentFolder ? currentFolder.name : 'Unfiled'}
          <ChevronDown className="h-3.5 w-3.5 opacity-60" />
        </Button>
      )}

      {open && (
        <div className="glass absolute right-0 top-full z-20 mt-1 w-48 space-y-1 rounded-lg p-1.5 text-sm">
          <button
            type="button"
            onClick={() => handleSelect(null)}
            className={cn(
              'flex w-full items-center justify-between rounded-md px-2 py-1.5 hover:bg-accent',
              !currentFolderId && 'text-primary'
            )}
          >
            <span className="flex items-center gap-2"><Inbox className="h-3.5 w-3.5" /> Unfiled</span>
            {!currentFolderId && <Check className="h-3.5 w-3.5" />}
          </button>

          {folders.length > 0 && <div className="my-1 border-t border-white/5" />}

          {folders.map((folder) => {
            const Icon = FOLDER_ICONS[folder.icon] ?? FolderIcon;
            const active = currentFolderId === folder.id;
            return (
              <button
                key={folder.id}
                type="button"
                onClick={() => handleSelect(folder.id)}
                className={cn(
                  'flex w-full items-center justify-between rounded-md px-2 py-1.5 hover:bg-accent',
                  active && 'text-primary'
                )}
              >
                <span className="flex min-w-0 items-center gap-2">
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{folder.name}</span>
                </span>
                {active && <Check className="h-3.5 w-3.5 shrink-0" />}
              </button>
            );
          })}

          {folders.length === 0 && (
            <p className="px-2 py-1.5 text-xs text-muted-foreground">No folders yet.</p>
          )}
        </div>
      )}
    </div>
  );
}