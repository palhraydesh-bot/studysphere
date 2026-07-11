import {
  addDoc, collection, deleteDoc, doc, getDoc, getDocs, increment, onSnapshot,
  orderBy, query, runTransaction, serverTimestamp, updateDoc, where, writeBatch
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { COLLECTIONS } from '@/lib/firestore/schema';
import {
  JOURNAL_COLLECTIONS,
  type JournalEntry, type NewJournalEntry,
  type JournalFolder, type NewJournalFolder
} from '@/lib/firestore/journal-schema';

function entriesCol(uid: string) {
  return collection(db, COLLECTIONS.users, uid, JOURNAL_COLLECTIONS.journalEntries);
}

function foldersCol(uid: string) {
  return collection(db, COLLECTIONS.users, uid, JOURNAL_COLLECTIONS.journalFolders);
}

// ---------------------------------------------------------------------------
// Journal Entries
// ---------------------------------------------------------------------------

export function subscribeEntries(uid: string, cb: (entries: JournalEntry[]) => void) {
  const q = query(entriesCol(uid), orderBy('date', 'desc'));
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as JournalEntry)));
}

export async function getEntry(uid: string, entryId: string): Promise<JournalEntry | null> {
  const snap = await getDoc(doc(entriesCol(uid), entryId));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as JournalEntry) : null;
}

export async function createEntry(uid: string, data: NewJournalEntry): Promise<string> {
  const entryRef = doc(entriesCol(uid));
  const folderId = data.folderId ?? null;

  await runTransaction(db, async (tx) => {
    if (folderId) {
      tx.update(doc(foldersCol(uid), folderId), { entryCount: increment(1) });
    }
    tx.set(entryRef, { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  });

  return entryRef.id;
}

export async function updateEntry(uid: string, entryId: string, patch: Partial<NewJournalEntry>) {
  await updateDoc(doc(entriesCol(uid), entryId), { ...patch, updatedAt: serverTimestamp() });
}

export async function deleteEntry(uid: string, entryId: string) {
  const entryRef = doc(entriesCol(uid), entryId);

  await runTransaction(db, async (tx) => {
    const entrySnap = await tx.get(entryRef);
    if (!entrySnap.exists()) return;

    const folderId = (entrySnap.data() as JournalEntry).folderId ?? null;
    if (folderId) {
      tx.update(doc(foldersCol(uid), folderId), { entryCount: increment(-1) });
    }
    tx.delete(entryRef);
  });
}

// ---------------------------------------------------------------------------
// Journal Folders
// ---------------------------------------------------------------------------

export function subscribeFolders(uid: string, cb: (folders: JournalFolder[]) => void) {
  const q = query(foldersCol(uid), orderBy('order', 'asc'));
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as JournalFolder)));
}

export async function createFolder(uid: string, data: NewJournalFolder): Promise<string> {
  const ref = await addDoc(foldersCol(uid), {
    ...data,
    entryCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function renameFolder(uid: string, folderId: string, name: string): Promise<void> {
  await updateDoc(doc(foldersCol(uid), folderId), { name, updatedAt: serverTimestamp() });
}

export async function deleteFolder(uid: string, folderId: string): Promise<void> {
  const q = query(entriesCol(uid), where('folderId', '==', folderId));
  const snap = await getDocs(q);

  const batch = writeBatch(db);
  snap.docs.forEach((d) => {
    batch.update(d.ref, { folderId: null, updatedAt: serverTimestamp() });
  });
  batch.delete(doc(foldersCol(uid), folderId));
  await batch.commit();
}

export async function moveEntryToFolder(
  uid: string,
  entryId: string,
  folderId: string | null
): Promise<void> {
  const entryRef = doc(entriesCol(uid), entryId);

  await runTransaction(db, async (tx) => {
    const entrySnap = await tx.get(entryRef);
    if (!entrySnap.exists()) throw new Error('Entry not found');

    const prevFolderId = (entrySnap.data() as JournalEntry).folderId ?? null;
    if (prevFolderId === folderId) return;

    if (prevFolderId) {
      tx.update(doc(foldersCol(uid), prevFolderId), { entryCount: increment(-1) });
    }
    if (folderId) {
      tx.update(doc(foldersCol(uid), folderId), { entryCount: increment(1) });
    }
    tx.update(entryRef, { folderId, updatedAt: serverTimestamp() });
  });
}

export async function reorderFolders(uid: string, orderedFolderIds: string[]): Promise<void> {
  const batch = writeBatch(db);
  orderedFolderIds.forEach((folderId, index) => {
    batch.update(doc(foldersCol(uid), folderId), { order: index, updatedAt: serverTimestamp() });
  });
  await batch.commit();
}