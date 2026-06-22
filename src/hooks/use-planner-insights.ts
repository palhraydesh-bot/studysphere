import { useMemo } from 'react';

export function usePlannerInsights() {
  return useMemo(
    () => ({
      tasksToday: [],
      tasksTodayDone: 0,
      missionPct: 0,
      focusScore: 0,
      dashboardStats: {
        dailySeconds: 0,
        streakDays: 0,
      },
      gamification: {
        badges: [],
        level: {
          level: 1,
          progress: 0,
          xpIntoLevel: 0,
          xpForNext: 100,
        },
        profile: {
          totalXp: 0,
        },
      },
    }),
    []
  );
}