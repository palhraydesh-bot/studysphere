'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, Lock, LockOpen, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GlassCard } from '@/components/shared/glass-card';
import { MoodPicker } from '@/components/journal/mood-picker';
import { LockDialog } from '@/components/journal/lock-dialog';
import { useAuth } from '@/hooks/use-auth';
import { deleteEntry, getEntry, updateEntry } from '@/lib/journal/journal-service';
import { decryptText, encryptText } from '@/lib/journal/journal-crypto';
import type { JournalEntry, Mood } from '@/lib/firestore/journal-schema';

export default function JournalEntryPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<Mood | null>(null);
  const [gratitude, setGratitude] = useState('');
  const [reflection, setReflection] = useState('');
  const [locked, setLocked] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [dialog, setDialog] = useState<null | 'lock' | 'unlock'>(null);
  const [saving, setSaving] = useState(false);
  // Passphrase held in memory for the current session so a locked entry can be
  // re-encrypted on save without prompting again. Never persisted.
  const [sessionPass, setSessionPass] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    const e = await getEntry(user.uid, id);
    if (!e) { toast.error('Entry not found'); router.push('/dashboard/journal'); return; }
    setEntry(e);
    setTitle(e.title); setMood(e.mood); setGratitude(e.gratitude.join('\n')); setReflection(e.reflection);
    setLocked(e.locked);
    if (!e.locked) { setContent(e.content); setUnlocked(true); }
    else { setUnlocked(false); setContent(''); }
  }, [user, id, router]);

  useEffect(() => { load(); }, [load]);

  async function persist(extra: Partial<JournalEntry>) {
    if (!user) return;
    await updateEntry(user.uid, id, {
      title: title.trim(),
      mood,
      gratitude: gratitude.split('\n').map((g) => g.trim()).filter(Boolean),
      reflection,
      ...extra
    });
  }

  async function save() {
    if (!user || (locked && !unlocked)) return;
    setSaving(true);
    try {
      if (locked && sessionPass) {
        // Entry was locked and unlocked this session: re-encrypt so it stays private.
        const { ciphertext, salt, iv } = await encryptText(content, sessionPass);
        await persist({ content: ciphertext, locked: true, salt, iv });
      } else {
        // Unlocked/plain entry: store plaintext.
        await persist({ content, locked: false });
      }
      toast.success('Entry saved');
      await load();
    } catch {
      toast.error('Could not save');
    } finally {
      setSaving(false);
    }
  }

  async function handleLock(passphrase: string) {
    if (!user) return;
    const { ciphertext, salt, iv } = await encryptText(content, passphrase);
    await persist({ content: ciphertext, locked: true, salt, iv });
    setSessionPass(passphrase);
    setLocked(true);
    setUnlocked(true);
    setDialog(null);
    toast.success('Entry locked & encrypted');
    await load();
  }

  async function handleUnlock(passphrase: string) {
    if (!entry?.salt || !entry?.iv) return;
    try {
      const plain = await decryptText({ ciphertext: entry.content, salt: entry.salt, iv: entry.iv }, passphrase);
      setContent(plain);
      setUnlocked(true);
      setSessionPass(passphrase);
      setDialog(null);
      toast.success('Unlocked');
    } catch {
      toast.error('Wrong passphrase');
    }
  }

  async function remove() {
    if (!user) return;
    await deleteEntry(user.uid, id);
    toast.success('Entry deleted');
    router.push('/dashboard/journal');
  }

  if (!entry) return <p className="text-sm text-muted-foreground">Loading entry...</p>;

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button variant="ghost" onClick={() => router.push('/dashboard/journal')}><ArrowLeft className="h-4 w-4" /> Back</Button>
        <div className="flex gap-2">
          {locked && !unlocked ? (
            <Button variant="outline" onClick={() => setDialog('unlock')}><LockOpen className="h-4 w-4" /> Unlock</Button>
          ) : (
            <Button variant="outline" onClick={() => setDialog('lock')}><Lock className="h-4 w-4" /> {locked ? 'Re-lock' : 'Lock'}</Button>
          )}
          <Button variant="destructive" onClick={remove}><Trash2 className="h-4 w-4" /> Delete</Button>
          <Button variant="gradient" onClick={save} disabled={saving || (locked && !unlocked)}><Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save'}</Button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Entry title" className="text-lg font-semibold" />
        <span className="shrink-0 text-sm text-muted-foreground">{entry.date}</span>
      </div>

      <MoodPicker value={mood} onChange={setMood} />

      {locked && !unlocked ? (
        <GlassCard className="flex flex-col items-center gap-3 py-10 text-center">
          <Lock className="h-10 w-10 text-primary" />
          <p className="text-sm text-muted-foreground">This entry is encrypted. Unlock it to read or edit.</p>
          <Button variant="gradient" onClick={() => setDialog('unlock')}>Unlock</Button>
        </GlassCard>
      ) : (
        <>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write about your day (Markdown supported)..."
            className="min-h-[240px] w-full rounded-xl border border-input bg-background/60 p-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <GlassCard>
              <h2 className="mb-2 font-semibold">Gratitude</h2>
              <textarea
                value={gratitude}
                onChange={(e) => setGratitude(e.target.value)}
                placeholder="One per line..."
                className="min-h-[120px] w-full rounded-lg border border-input bg-background/60 p-3 text-sm"
              />
            </GlassCard>
            <GlassCard>
              <h2 className="mb-2 font-semibold">Reflection</h2>
              <textarea
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                placeholder="What did you learn today?"
                className="min-h-[120px] w-full rounded-lg border border-input bg-background/60 p-3 text-sm"
              />
            </GlassCard>
          </div>
        </>
      )}

      <LockDialog
        open={dialog !== null}
        mode={dialog ?? 'lock'}
        onClose={() => setDialog(null)}
        onSubmit={dialog === 'lock' ? handleLock : handleUnlock}
      />
    </div>
  );
}
