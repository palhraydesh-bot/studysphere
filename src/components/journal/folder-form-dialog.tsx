'use client';

import { useEffect, useState } from 'react';
import {
  Folder, BookOpen, Heart, Star, Briefcase, GraduationCap, Target, Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export const FOLDER_ICONS: Record<string, LucideIcon> = {
  Folder, BookOpen, Heart, Star, Briefcase, GraduationCap, Target, Sparkles,
};

export const FOLDER_COLORS: {
  id: string;
  swatchClass: string;
  ringClass: string;
  badgeClass: string;
  accentClass: string;
}[] = [
  { id: 'violet',  swatchClass: 'bg-violet-500',  ringClass: 'ring-violet-400',  badgeClass: 'bg-violet-500/15 text-violet-300 border-violet-500/30',   accentClass: 'border-l-violet-500' },
  { id: 'amber',   swatchClass: 'bg-amber-500',   ringClass: 'ring-amber-400',   badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30',     accentClass: 'border-l-amber-500' },
  { id: 'rose',    swatchClass: 'bg-rose-500',    ringClass: 'ring-rose-400',    badgeClass: 'bg-rose-500/15 text-rose-300 border-rose-500/30',        accentClass: 'border-l-rose-500' },
  { id: 'emerald', swatchClass: 'bg-emerald-500', ringClass: 'ring-emerald-400', badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30', accentClass: 'border-l-emerald-500' },
  { id: 'sky',     swatchClass: 'bg-sky-500',     ringClass: 'ring-sky-400',     badgeClass: 'bg-sky-500/15 text-sky-300 border-sky-500/30',           accentClass: 'border-l-sky-500' },
  { id: 'fuchsia', swatchClass: 'bg-fuchsia-500', ringClass: 'ring-fuchsia-400', badgeClass: 'bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30', accentClass: 'border-l-fuchsia-500' },
];

const ICON_IDS = Object.keys(FOLDER_ICONS);
const DEFAULT_COLOR = FOLDER_COLORS[0].id;
const DEFAULT_ICON = ICON_IDS[0];

export interface FolderFormValues {
  name: string;
  color: string;
  icon: string;
}

interface FolderFormDialogProps {
  open: boolean;
  mode: 'create' | 'rename';
  initialValues?: FolderFormValues;
  onClose: () => void;
  onSubmit: (values: FolderFormValues) => void;
}

export function FolderFormDialog({ open, mode, initialValues, onClose, onSubmit }: FolderFormDialogProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [icon, setIcon] = useState(DEFAULT_ICON);

  useEffect(() => {
    if (!open) return;
    setName(initialValues?.name ?? '');
    setColor(initialValues?.color ?? DEFAULT_COLOR);
    setIcon(initialValues?.icon ?? DEFAULT_ICON);
  }, [open, initialValues]);

  if (!open) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onSubmit({ name: trimmed, color, icon });
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="glass w-full max-w-sm space-y-4 rounded-2xl p-6"
      >
        <h2 className="text-lg font-bold">{mode === 'create' ? 'New folder' : 'Rename folder'}</h2>
        <p className="text-xs text-muted-foreground">
          {mode === 'create'
            ? 'Group related entries together, e.g. College, Personal, SSC Prep.'
            : "Update this folder's name, color, or icon."}
        </p>

        <div className="space-y-2">
          <Label htmlFor="folder-name">Folder name</Label>
          <Input
            id="folder-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. SSC Prep"
            autoFocus
          />
        </div>

        <div className="space-y-2">
          <Label>Color</Label>
          <div className="flex flex-wrap gap-2">
            {FOLDER_COLORS.map((c) => (
              <button
                key={c.id}
                type="button"
                aria-label={c.id}
                onClick={() => setColor(c.id)}
                className={cn(
                  'h-7 w-7 rounded-full transition-all',
                  c.swatchClass,
                  color === c.id
                    ? cn('ring-2 ring-offset-2 ring-offset-background', c.ringClass)
                    : 'opacity-60 hover:opacity-100'
                )}
              />
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Icon</Label>
          <div className="flex flex-wrap gap-2">
            {ICON_IDS.map((id) => {
              const Icon = FOLDER_ICONS[id];
              return (
                <button
                  key={id}
                  type="button"
                  aria-label={id}
                  onClick={() => setIcon(id)}
                  className={cn(
                    'grid h-9 w-9 place-items-center rounded-lg border transition-colors',
                    icon === id
                      ? 'border-primary bg-primary/15 text-primary'
                      : 'border-input text-muted-foreground hover:border-primary/40'
                  )}
                >
                  <Icon className="h-4 w-4" />
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="gradient" disabled={!name.trim()}>
            {mode === 'create' ? 'Create' : 'Save'}
          </Button>
        </div>
      </form>
    </div>
  );
}