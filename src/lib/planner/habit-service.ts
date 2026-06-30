import { db } from '@/lib/firebase/client';
import { collection, doc, setDoc, deleteDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Habit } from '@/types/life-os';
import { useHabitStore } from '@/store/habit-store';
import { awardXp } from '@/lib/gamification/xp-service';

export const HabitService = {
  async createHabit(userId: string, name: string, frequency: 'daily' | 'weekly', description?: string): Promise<Habit> {
    const habitRef = doc(collection(db, 'users', userId, 'habits'));
    const newHabit: Habit = {
      id: habitRef.id,
      userId,
      name,
      frequency,
      streak: 0,
      longestStreak: 0,
      lastCompletedDate: null,
      createdAt: new Date(),
    };
    if (description) newHabit.description = description;

    await setDoc(habitRef, {
      ...newHabit,
      createdAt: serverTimestamp()
    });
    useHabitStore.getState().addHabitLocal(newHabit);
    return newHabit;
  },

  async toggleHabit(userId: string, habit: Habit, dateKey: string, isChecking: boolean): Promise<void> {
    const logId = `${habit.id}_${dateKey}`;
    const logRef = doc(db, 'users', userId, 'habitHistory', logId);
    const habitRef = doc(db, 'users', userId, 'habits', habit.id);

    if (isChecking) {
      await setDoc(logRef, {
        id: logId,
        habitId: habit.id,
        userId,
        date: dateKey,
        completed: true,
        timestamp: serverTimestamp(),
      });

      const todayStr = new Date().toISOString().split('T')[0];
      let updates: Partial<Habit> = { lastCompletedDate: dateKey };

      if (dateKey === todayStr && habit.lastCompletedDate !== todayStr) {
        const nextStreak = habit.streak + 1;
        updates.streak = nextStreak;
        if (nextStreak > habit.longestStreak) {
          updates.longestStreak = nextStreak;
        }
      }

      await updateDoc(habitRef, updates);
      useHabitStore.getState().toggleHabitStatusLocal(dateKey, habit.id, true);
      if (updates.streak !== undefined) {
        useHabitStore.getState().updateHabitLocal(habit.id, updates);
      }

      await awardXp(userId, 'completeHabit');
    } else {
      await deleteDoc(logRef);
      let updates: Partial<Habit> = {};
      if (habit.lastCompletedDate === dateKey && habit.streak > 0) {
        updates.streak = habit.streak - 1;
        updates.lastCompletedDate = null;
      }

      await updateDoc(habitRef, updates);
      useHabitStore.getState().toggleHabitStatusLocal(dateKey, habit.id, false);
      if (updates.streak !== undefined) {
        useHabitStore.getState().updateHabitLocal(habit.id, updates);
      }
    }
  },

  async deleteHabit(userId: string, habitId: string): Promise<void> {
    await deleteDoc(doc(db, 'users', userId, 'habits', habitId));
    useHabitStore.getState().removeHabitLocal(habitId);
  }
};