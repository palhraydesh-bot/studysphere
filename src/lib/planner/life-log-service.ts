import { db } from '@/lib/firebase/client';
import { doc, setDoc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { LifeLog } from '@/types/life-os';

export const LifeLogService = {
  async saveLogEntry(userId: string, dateKey: string, updates: Partial<Omit<LifeLog, 'id' | 'userId' | 'date'>>): Promise<void> {
    const logRef = doc(db, `users/${userId}/lifeLogs`, dateKey);
    const docSnap = await getDoc(logRef);

    if (docSnap.exists()) {
      await updateDoc(logRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } else {
      const newLog: LifeLog = {
        id: dateKey,
        userId,
        date: dateKey,
        sleepHours: updates.sleepHours || 0,
        exerciseMinutes: updates.exerciseMinutes || 0,
        readingPages: updates.readingPages || 0,
        waterIntakeLiters: updates.waterIntakeLiters || 0,
        mood: updates.mood || 'neutral',
        updatedAt: new Date(),
      };
      await setDoc(logRef, {
        ...newLog,
        updatedAt: serverTimestamp()
      });
    }
  },

  async getLogEntry(userId: string, dateKey: string): Promise<LifeLog | null> {
    const logRef = doc(db, `users/${userId}/lifeLogs`, dateKey);
    const docSnap = await getDoc(logRef);
    if (docSnap.exists()) {
      return docSnap.data() as LifeLog;
    }
    return null;
  }
};