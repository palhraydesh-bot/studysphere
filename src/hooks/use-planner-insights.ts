import { useMemo } from 'react';
import { usePlannerStore } from '@/store/planner-store';
import { useGamification } from '@/hooks/use-gamification';

export function usePlannerInsights() {
  const tasks = usePlannerStore((s) => s.tasks);
  const gamification = useGamification();

  const today = new Date().toISOString().slice(0, 10);

  const tasksToday = useMemo(
    () => tasks.filter((t) => t.dueDate === today),
    [tasks, today]
  );

  const tasksTodayDone = useMemo(
    () => tasksToday.filter((t) => t.completed).length,
    [tasksToday]
  );

  const missionPct =
    tasksToday.length === 0
      ? 0
      : Math.round((tasksTodayDone / tasksToday.length) * 100);

  return {
    tasksToday,
    tasksTodayDone,
    missionPct,
    focusScore: missionPct,
    dashboardStats: {
      dailySeconds: 0,
      streakDays: 1
    },
    gamification
  };
}