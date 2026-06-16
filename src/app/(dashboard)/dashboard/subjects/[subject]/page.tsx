'use client';

import { useParams } from 'next/navigation';
import { GlassCard } from '@/components/shared/glass-card';
import { NoteCard } from '@/components/notes/note-card';
import { useNotesSync } from '@/hooks/use-notes';
import { useNotesStore } from '@/store/notes-store';

export default function SubjectDetailPage() {
  useNotesSync();
  const { subject } = useParams<{ subject: string }>();
  const decoded = decodeURIComponent(subject);
  const notes = useNotesStore((s) => s.notes).filter((n) => n.subject === decoded);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{decoded}</h1>
        <p className="text-sm text-muted-foreground">Notes, materials and important topics for {decoded}.</p>
      </div>

      <section className="space-y-3">
        <h2 className="font-semibold">Notes</h2>
        {notes.length === 0 ? (
          <GlassCard><p className="text-sm text-muted-foreground">No notes tagged with {decoded} yet.</p></GlassCard>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {notes.map((n, i) => <NoteCard key={n.id} note={n} delay={i * 0.03} />)}
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <GlassCard>
          <h2 className="mb-1 font-semibold">Study materials & PDFs</h2>
          <p className="text-sm text-muted-foreground">Attach PDFs to notes; they surface here. Flashcards arrive in Milestone 6.</p>
        </GlassCard>
        <GlassCard>
          <h2 className="mb-1 font-semibold">Important topics</h2>
          <p className="text-sm text-muted-foreground">Curated topic lists integrate with Exam Prep in Milestone 7.</p>
        </GlassCard>
      </section>
    </div>
  );
}
