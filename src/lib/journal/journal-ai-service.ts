import { collection, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { COLLECTIONS } from '@/lib/firestore/schema';
import { JOURNAL_ARCHIVE_COLLECTION, type JournalArchive } from '@/lib/firestore/journal-archive-schema';
import type { JournalEntry } from '@/lib/firestore/journal-schema';

function archivesCol(uid: string) {
  return collection(db, COLLECTIONS.users, uid, JOURNAL_ARCHIVE_COLLECTION);
}

function buildAiContext(entries: JournalEntry[], unlockedContent: Record<string, string>): string {
  return entries
    .filter((e) => !e.locked || unlockedContent[e.id])
    .map((e) => {
      const content = e.locked ? unlockedContent[e.id] : e.content;
      return `Date: ${e.date}\nTitle: ${e.title || 'Untitled'}\nMood: ${e.mood ?? 'unset'}\nContent: ${content}\nReflection: ${e.reflection}`;
    })
    .join('\n\n---\n\n');
}

async function callClaudeForSummary(prompt: string): Promise<{ summary: string; highlights: string[] }> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: `You are a warm, encouraging journaling coach. Based on these journal entries, write a short reflective summary (3-4 sentences) and 3 short highlight bullet points about patterns, growth, or notable moments. Respond ONLY as JSON: {"summary": "...", "highlights": ["...", "...", "..."]}\n\nEntries:\n${prompt}`,
      }],
    }),
  });
  const data = await response.json();
  const text = data.content?.find((b: any) => b.type === 'text')?.text ?? '{}';
  try {
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    return { summary: parsed.summary ?? '', highlights: parsed.highlights ?? [] };
  } catch {
    return { summary: 'Could not generate a summary right now.', highlights: [] };
  }
}

function archiveId(folderId: string | null, periodKey: string): string {
  return `${folderId ?? 'all'}_${periodKey}`;
}

export async function getArchive(uid: string, folderId: string | null, periodKey: string): Promise<JournalArchive | null> {
  const snap = await getDoc(doc(archivesCol(uid), archiveId(folderId, periodKey)));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as JournalArchive) : null;
}

export async function generateReview(
  uid: string,
  type: 'weekly' | 'monthly',
  periodKey: string,
  folderId: string | null,
  entries: JournalEntry[],
  unlockedContent: Record<string, string> = {}
): Promise<JournalArchive> {
  const existing = await getArchive(uid, folderId, periodKey);
  if (existing) return existing;

  const context = buildAiContext(entries, unlockedContent);
  const { summary, highlights } = context
    ? await callClaudeForSummary(context)
    : { summary: 'No entries this period yet.', highlights: [] };

  const archive: Omit<JournalArchive, 'id' | 'generatedAt'> = {
    userId: uid,
    folderId,
    type,
    periodKey,
    entryIds: entries.map((e) => e.id),
    aiSummary: summary,
    aiHighlights: highlights,
    model: 'claude-sonnet-4-6',
  };

  const ref = doc(archivesCol(uid), archiveId(folderId, periodKey));
  await setDoc(ref, { ...archive, generatedAt: serverTimestamp() });

  return { id: ref.id, ...archive, generatedAt: null };
}