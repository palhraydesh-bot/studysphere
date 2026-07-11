'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Folder as FolderIcon, Inbox, Layers, MoreVertical, Pencil, Plus, Trash2 } from 'lucide-react';
import { GlassCard } from '@/components/shared/glass-card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { useJournalStore, filterEntriesByFolder } from '@/store/journal-store';
import { useJournalFolderStore, type ActiveFolderId } from '@/store/journal-folder-store';
import { createFolder, renameFolder, deleteFolder } from '@/lib/journal/journal-service';
import { FolderFormDialog, FOLDER_ICONS, FOLDER_COLORS, type FolderFormValues } from './folder-form-dialog';
import type { JournalFolder } from '@/lib/firestore/journal-schema';

function colorDotClass(colorId: string): string {
  return FOLDER_COLORS.find((c) => c.id === colorId)?.swatchClass ?? 'bg-primary';
}

interface FolderSidebarProps {
  className?: string;
}

export function FolderSidebar({ className }: FolderSidebarProps) {
  const { user } = useAuth();
  const { entries } = useJournalStore();
  const { folders, folderLoading, activeFolderId, setActiveFolder } = useJournalFolderStore();

  const [dialog, setDialog] = useState<null | { mode: 'create' } | { mode: 'rename'; folder: JournalFolder }>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const allCount = entries.length;
  const unfiledCount = filterEntriesByFolder(entries, 'unfiled').length;

  async function handleCreate(values: FolderFormValues) {
    if (!user) return;
    try {
      await createFolder(user.uid, {
        userId: user.uid,
        name: values.name,
        color: values.color,
        icon: values.icon,
        order: folders.length,
      });
      toast.success('Folder created');
      setDialog(null);
    } catch {
      toast.error('Could not create folder');
    }
  }

  async function handleRename(folderId: string, values: FolderFormValues) {
    if (!user) return;
    try {
      await renameFolder(user.uid, folderId, values.name);
      toast.success('Folder renamed');
      setDialog(null);
    } catch {
      toast.error('Could not rename folder');
    }
  }

  async function handleDelete(folder: JournalFolder) {
    if (!user) return;
    const ok = window.confirm(`Delete "${folder.name}"? Entries inside move to Unfiled — nothing is deleted.`);
    if (!ok) return;
    try {
      await deleteFolder(user.uid, folder.id);
      if (activeFolderId === folder.id) setActiveFolder(null);
      toast.success('Folder deleted');
    } catch {
      toast.error('Could not delete folder');
    } finally {
      setOpenMenuId(null);
    }
  }

  function isActive(id: ActiveFolderId) {
    return activeFolderId === id;
  }

  return (
    <GlassCard className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Folders</h2>
        <Button variant="ghost" size="icon" aria-label="New folder" onClick={() => setDialog({ mode: 'create' })}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <nav className="space-y-1">
        <button
          type="button"
          onClick={() => setActiveFolder(null)}
          className={cn(
            'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors',
            isActive(null) ? 'bg-primary/15 text-primary font-medium' : 'text-foreground hover:bg-accent'
          )}
        >
          <span className="flex items-center gap-2"><Layers className="h-4 w-4" /> All Entries</span>
          <span className="text-xs text-muted-foreground">{allCount}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFolder('unfiled')}
          className={cn(
            'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors',
            isActive('unfiled') ? 'bg-primary/15 text-primary font-medium' : 'text-foreground hover:bg-accent'
          )}
        >
          <span className="flex items-center gap-2"><Inbox className="h-4 w-4" /> Unfiled</span>
          <span className="text-xs text-muted-foreground">{unfiledCount}</span>
        </button>

        <div className="my-2 border-t border-white/5" />

        {folderLoading && <p className="px-3 text-xs text-muted-foreground">Loading folders...</p>}
        {!folderLoading && folders.length === 0 && (
          <p className="px-3 text-xs text-muted-foreground">No folders yet.</p>
        )}

        {folders.map((folder) => {
          const Icon = FOLDER_ICONS[folder.icon] ?? FolderIcon;
          return (
            <motion.div key={folder.id} layout className="group relative">
              <button
                type="button"
                onClick={() => setActiveFolder(folder.id)}
                className={cn(
                  'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors',
                  isActive(folder.id) ? 'bg-primary/15 text-primary font-medium' : 'text-foreground hover:bg-accent'
                )}
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span className={cn('h-2 w-2 shrink-0 rounded-full', colorDotClass(folder.color))} />
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{folder.name}</span>
                </span>
                <span className="text-xs text-muted-foreground">{folder.entryCount}</span>
              </button>

              <button
                type="button"
                aria-label="Folder options"
                onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === folder.id ? null : folder.id); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground opacity-0 hover:bg-accent group-hover:opacity-100"
              >
                <MoreVertical className="h-3.5 w-3.5" />
              </button>

              {openMenuId === folder.id && (
                <div
                  className="glass absolute right-2 top-9 z-10 w-36 space-y-1 rounded-lg p-1.5 text-sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => { setDialog({ mode: 'rename', folder }); setOpenMenuId(null); }}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Rename
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(folder)}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>
              )}
            </motion.div>
          );
        })}
      </nav>

      <FolderFormDialog
        open={dialog !== null}
        mode={dialog?.mode ?? 'create'}
        initialValues={
          dialog?.mode === 'rename'
            ? { name: dialog.folder.name, color: dialog.folder.color, icon: dialog.folder.icon }
            : undefined
        }
        onClose={() => setDialog(null)}
        onSubmit={(values) => {
          if (dialog?.mode === 'rename') handleRename(dialog.folder.id, values);
          else handleCreate(values);
        }}
      />
    </GlassCard>
  );
}