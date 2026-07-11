'use client';

import { useEffect, useRef, useState } from 'react';
import { Reorder, useDragControls } from 'framer-motion';
import { toast } from 'sonner';
import {
  ChevronDown, ChevronUp, Folder as FolderIcon, GripVertical,
  Inbox, Layers, MoreVertical, Pencil, Plus, Trash2,
} from 'lucide-react';
import { GlassCard } from '@/components/shared/glass-card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { useJournalStore, filterEntriesByFolder } from '@/store/journal-store';
import { useJournalFolderStore, type ActiveFolderId } from '@/store/journal-folder-store';
import { createFolder, renameFolder, deleteFolder, reorderFolders } from '@/lib/journal/journal-service';
import { FolderFormDialog, FOLDER_ICONS, FOLDER_COLORS, type FolderFormValues } from './folder-form-dialog';
import type { JournalFolder } from '@/lib/firestore/journal-schema';
import { FolderAnalyticsBar } from './folder-analytics-bar';
function colorDotClass(colorId: string): string {
  return FOLDER_COLORS.find((c) => c.id === colorId)?.swatchClass ?? 'bg-primary';
}

interface FolderRowProps {
  folder: JournalFolder;
  index: number;
  total: number;
  active: boolean;
  menuOpen: boolean;
  onSelect: () => void;
  onToggleMenu: () => void;
  onRename: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

function FolderRow({
  folder, index, total, active, menuOpen,
  onSelect, onToggleMenu, onRename, onDelete, onMoveUp, onMoveDown,
}: FolderRowProps) {
  const controls = useDragControls();
  const Icon = FOLDER_ICONS[folder.icon] ?? FolderIcon;

  return (
    <Reorder.Item value={folder} dragListener={false} dragControls={controls} className="group relative">
      <div
        className={cn(
          'flex w-full items-center gap-1 rounded-lg pl-1 pr-2 py-1 text-sm transition-colors',
          active ? 'bg-primary/15 text-primary font-medium' : 'text-foreground hover:bg-accent'
        )}
      >
        <span
          onPointerDown={(e) => controls.start(e)}
          aria-label="Drag to reorder"
          className="touch-none cursor-grab p-1 text-muted-foreground/50 active:cursor-grabbing"
        >
          <GripVertical className="h-3.5 w-3.5" />
        </span>

        <button
          type="button"
          onClick={onSelect}
          className="flex min-w-0 flex-1 items-center justify-between gap-2 rounded-md px-1 py-1"
        >
          <span className="flex min-w-0 items-center gap-2">
            <span className={cn('h-2 w-2 shrink-0 rounded-full', colorDotClass(folder.color))} />
            <Icon className="h-4 w-4 shrink-0" />
            <span className="truncate">{folder.name}</span>
          </span>
          <span className="shrink-0 text-xs text-muted-foreground">{folder.entryCount}</span>
        </button>

        <div className="flex shrink-0 flex-col">
          <button
            type="button"
            aria-label="Move folder up"
            disabled={index === 0}
            onClick={onMoveUp}
            className="grid h-4 w-4 place-items-center text-muted-foreground hover:text-foreground disabled:opacity-20"
          >
            <ChevronUp className="h-3 w-3" />
          </button>
          <button
            type="button"
            aria-label="Move folder down"
            disabled={index === total - 1}
            onClick={onMoveDown}
            className="grid h-4 w-4 place-items-center text-muted-foreground hover:text-foreground disabled:opacity-20"
          >
            <ChevronDown className="h-3 w-3" />
          </button>
        </div>

        <button
          type="button"
          aria-label="Folder options"
          onClick={(e) => { e.stopPropagation(); onToggleMenu(); }}
          className="shrink-0 rounded-md p-1 text-muted-foreground opacity-0 hover:bg-accent group-hover:opacity-100"
        >
          <MoreVertical className="h-3.5 w-3.5" />
        </button>
      </div>

      {menuOpen && (
        <div
          className="glass absolute right-2 top-9 z-10 w-36 space-y-1 rounded-lg p-1.5 text-sm"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={onRename}
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent"
          >
            <Pencil className="h-3.5 w-3.5" /> Rename
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </button>
        </div>
      )}
    </Reorder.Item>
  );
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

  const [localFolders, setLocalFolders] = useState<JournalFolder[]>(folders);
  const draggingRef = useRef(false);
  const reorderTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!draggingRef.current) setLocalFolders(folders);
  }, [folders]);

  useEffect(() => {
    return () => {
      if (reorderTimeout.current) clearTimeout(reorderTimeout.current);
    };
  }, []);

  const allCount = entries.length;
  const unfiledCount = filterEntriesByFolder(entries, 'unfiled').length;

  async function persistOrder(ordered: JournalFolder[]) {
    if (!user) return;
    try {
      await reorderFolders(user.uid, ordered.map((f) => f.id));
    } catch {
      toast.error('Could not save folder order');
    } finally {
      draggingRef.current = false;
    }
  }

  function moveFolder(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= localFolders.length) return;
    const next = [...localFolders];
    [next[index], next[target]] = [next[target], next[index]];
    setLocalFolders(next);
    draggingRef.current = true;
    persistOrder(next);
  }

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
        {!folderLoading && localFolders.length === 0 && (
          <p className="px-3 text-xs text-muted-foreground">No folders yet.</p>
        )}

        <Reorder.Group
          axis="y"
          values={localFolders}
          onReorder={(next) => {
            draggingRef.current = true;
            setLocalFolders(next);
            if (reorderTimeout.current) clearTimeout(reorderTimeout.current);
            reorderTimeout.current = setTimeout(() => {
              persistOrder(next);
            }, 400);
          }}
          className="space-y-1"
        >
          {localFolders.map((folder, index) => (
            <FolderRow
              key={folder.id}
              folder={folder}
              index={index}
              total={localFolders.length}
              active={isActive(folder.id)}
              menuOpen={openMenuId === folder.id}
              onSelect={() => setActiveFolder(folder.id)}
              onToggleMenu={() => setOpenMenuId(openMenuId === folder.id ? null : folder.id)}
              onRename={() => { setDialog({ mode: 'rename', folder }); setOpenMenuId(null); }}
              onDelete={() => handleDelete(folder)}
              onMoveUp={() => moveFolder(index, -1)}
              onMoveDown={() => moveFolder(index, 1)}
            />
          ))}
        </Reorder.Group>
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