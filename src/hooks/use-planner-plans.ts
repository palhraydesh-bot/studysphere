'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { subscribeWeeklyPlan } from '@/lib/planner/weekly-plan-service';
import { subscribeMonthlyPlan } from '@/lib/planner/monthly-plan-service';
import { usePlannerStore } from '@/store/planner-store';

/**
 * Subscribes the planner store to the current user's weekly plan and monthly
 * goals for the current period. Mount once on the planner page.
 */
export function usePlannerPlansSync() {
  const { user } = useAuth();
  const setWeeklySlots = usePlannerStore((s) => s.setWeeklySlots);
  const setWeeklyLoading = usePlannerStore((s) => s.setWeeklyLoading);
  const setMonthlyGoals = usePlannerStore((s) => s.setMonthlyGoals);
  const setMonthlyLoading = usePlannerStore((s) => s.setMonthlyLoading);

  useEffect(() => {
    if (!user) return;
    setWeeklyLoading(true);
    setMonthlyLoading(true);
    const unsubWeekly = subscribeWeeklyPlan(user.uid, (plan) => setWeeklySlots(plan?.slots ?? []));
    const unsubMonthly = subscribeMonthlyPlan(user.uid, (goals) => setMonthlyGoals(goals));
    return () => {
      unsubWeekly();
      unsubMonthly();
    };
  }, [user, setWeeklySlots, setWeeklyLoading, setMonthlyGoals, setMonthlyLoading]);
}
