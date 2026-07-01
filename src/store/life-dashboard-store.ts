import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { DailyLifeLog } from '@/types/life-os';

interface LifeDashboardState {
  dailyLogs: Record<string, DailyLifeLog>; // Keyed by date YYYY-MM-DD
  isLoading: boolean;
  setDailyLog: (dateKey: string, log: DailyLifeLog) => void;
  setLogsLoading: (loading: boolean) => void;
  resetDashboardStore: () => void;
}

export const useLifeDashboardStore = create<LifeDashboardState>()(
  devtools(
    (set) => ({
      dailyLogs: {},
      isLoading: false,
      setDailyLog: (dateKey, log) =>
        set((state) => ({
          dailyLogs: { ...state.dailyLogs, [dateKey]: log },
          isLoading: false,
        })),
      setLogsLoading: (isLoading) => set({ isLoading }),
      resetDashboardStore: () => set({ dailyLogs: {}, isLoading: false }),
    }),
    { name: 'StudySphere-LifeDashboardStore' }
  )
);