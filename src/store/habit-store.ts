import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Habit } from '@/types/life-os';

interface HabitState {
  habits: Habit[];
  habitHistory: Record<string, string[]>;
  isLoading: boolean;
  error: string | null;
  setHabits: (habits: Habit[]) => void;
  setHabitHistory: (history: Record<string, string[]>) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  addHabitLocal: (habit: Habit) => void;
  updateHabitLocal: (habitId: string, updates: Partial<Habit>) => void;
  removeHabitLocal: (habitId: string) => void;
  toggleHabitStatusLocal: (dateKey: string, habitId: string, isCompleted: boolean) => void;
  resetHabitStore: () => void;
}

export const useHabitStore = create<HabitState>()(
  devtools(
    (set) => ({
      habits: [],
      habitHistory: {},
      isLoading: false,
      error: null,
      setHabits: (habits) => set({ habits, isLoading: false }),
      setHabitHistory: (habitHistory) => set({ habitHistory }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      addHabitLocal: (habit) => set((state) => ({ habits: [habit, ...state.habits] })),
      updateHabitLocal: (habitId, updates) =>
        set((state) => ({
          habits: state.habits.map((h) => (h.id === habitId ? { ...h, ...updates } : h)),
        })),
      removeHabitLocal: (habitId) =>
        set((state) => ({
          habits: state.habits.filter((h) => h.id !== habitId),
          habitHistory: Object.keys(state.habitHistory).reduce((acc, date) => {
            acc[date] = state.habitHistory[date].filter((id) => id !== habitId);
            return acc;
          }, {} as Record<string, string[]>),
        })),
      toggleHabitStatusLocal: (dateKey, habitId, isCompleted) =>
        set((state) => {
          const currentDayLogs = state.habitHistory[dateKey] || [];
          const updatedDayLogs = isCompleted
            ? currentDayLogs.includes(habitId) ? currentDayLogs : [...currentDayLogs, habitId]
            : currentDayLogs.filter((id) => id !== habitId);
          return {
            habitHistory: { ...state.habitHistory, [dateKey]: updatedDayLogs },
          };
        }),
      resetHabitStore: () => set({ habits: [], habitHistory: {}, isLoading: false, error: null }),
    }),
    { name: 'StudySphere-HabitStore' }
  )
);