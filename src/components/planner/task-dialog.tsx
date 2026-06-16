'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SUBJECTS, type NewTask, type Priority, type Subject, type Task } from '@/lib/firestore/planner-schema';

interface TaskDialogProps {
  open: boolean;
  initial?: Task | null;
  onClose: () => void;
  onSubmit: (data: NewTask) => void;
}

const PRIORITIES: Priority[] = ['low', 'medium', 'high'];
const todayIso = () => new Date().toISOString().slice(0, 10);

/** Modal form for creating or editing a task (lightweight, no extra deps). */
export function TaskDialog({ open, initial, onClose, onSubmit }: TaskDialogProps) {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState<Subject | ''>('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState(todayIso());

  useEffect(() => {
    if (open) {
      setTitle(initial?.title ?? '');
      setSubject(initial?.subject ?? '');
      setPriority(initial?.priority ?? 'medium');
      setDueDate(initial?.dueDate ?? todayIso());
    }
  }, [open, initial]);

  if (!open) return null;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({ title: title.trim(), subject: (subject || null) as Subject | null, priority, dueDate });
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        className="glass w-full max-w-md space-y-4 rounded-2xl p-6"
      >
        <h2 className="text-lg font-bold">{initial ? 'Edit task' : 'New task'}</h2>

        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Revise integration" autoFocus />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <select
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value as Subject)}
              className="h-10 w-full rounded-md border border-input bg-background/60 px-3 text-sm"
            >
              <option value="">None</option>
              {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="due">Due date</Label>
            <Input id="due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Priority</Label>
          <div className="flex gap-2">
            {PRIORITIES.map((p) => (
              <Button
                key={p}
                type="button"
                variant={priority === p ? 'gradient' : 'outline'}
                size="sm"
                className="flex-1 capitalize"
                onClick={() => setPriority(p)}
              >
                {p}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="gradient">{initial ? 'Save' : 'Create'}</Button>
        </div>
      </form>
    </div>
  );
}
