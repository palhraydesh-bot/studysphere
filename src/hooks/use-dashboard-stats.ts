'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { subscribeSessions } from '@/lib/pomodoro/session-service';
import { useTasksSync } from '@/hooks/use-tasks';
import { usePlannerStore } from '@/store/planner-store';
import type { PomodoroSession } from '@/lib/firestore/pomodoro-schema';

export interface DashboardStats {
  dailySeconds: number;
  weeklySeconds: number;
  monthlySeconds: number;
  streakDays: number;
  productivityScore: number; // 0-100
  pomodoroCount: number; // completed focus sessions today
  goalProgress: number; // 0-100, share of tasks completed
}

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

/** endedAt is a Firestore Timestamp; guard for optimistic/local records. */
function toDate(s: PomodoroSession): Date | null {
  const ts = s.endedAt as unknown as { toDate?: () => Date } | null;
  return ts?.toDate ? ts.toDate() : null;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Count consecutive days (ending today) that have at least one completed focus
 * session. Today not counting yet does not break the streak unless yesterday is
 * also missing.
 */
function computeStreak(focusDays: Set<number>): number {
  const today = startOfDay(new Date()).getTime();
  let streak = 0;
  // Allow the streak to be anchored at today or yesterday.
  let cursor = focusDays.has(today) ? today : today - DAY_MS;
  while (focusDays.has(cursor)) {
    streak += 1;
    cursor -= DAY_MS;
  }
  return streak;
}

function aggregate(sessions: PomodoroSession[], goalProgress: number): DashboardStats {
  const today = startOfDay(new Date());
  const todayMs = today.getTime();
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 6);
  const monthAgo = new Date(today);
  monthAgo.setDate(monthAgo.getDate() - 29);

  let dailySeconds = 0;
  let weeklySeconds = 0;
  let monthlySeconds = 0;
  let pomodoroCount = 0;
  let weekSessions = 0;
  let weekCompletedFully = 0;
  const focusDays = new Set<number>();

  for (const s of sessions) {
    if (s.phase !== 'focus' || !s.completed) continue;
    const d = toDate(s);
    if (!d) continue;
    focusDays.add(startOfDay(d).getTime());

    if (d >= monthAgo) monthlySeconds += s.completedSeconds;
    if (d >= weekAgo) {
      weeklySeconds += s.completedSeconds;
      weekSessions += 1;
      if (s.completedSeconds >= s.durationSeconds) weekCompletedFully += 1;
    }
    if (d.getTime() >= todayMs) {
      dailySeconds += s.completedSeconds;
      pomodoroCount += 1;
    }
  }

  // Productivity = share of this week's focus sessions that ran to full duration.
  const productivityScore =
    weekSessions === 0 ? 0 : Math.round((weekCompletedFully / weekSessions) * 100);

  return {
    dailySeconds,
    weeklySeconds,
    monthlySeconds,
    streakDays: computeStreak(focusDays),
    productivityScore,
    pomodoroCount,
    goalProgress
  };
}

/**
 * Live dashboard stats derived from the user's Firestore pomodoro sessions and
 * planner tasks. Returns zeroed stats until data loads.
 */
export function useDashboardStats(): { stats: DashboardStats; loading: boolean } {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<PomodoroSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);

  // Tasks come through the shared planner store/subscription.
  useTasksSync();
  const tasks = usePlannerStore((s) => s.tasks);
  const tasksLoading = usePlannerStore((s) => s.loading);

  useEffect(() => {
    if (!user) return;
    setSessionsLoading(true);
    const unsub = subscribeSessions(user.uid, (next) => {
      setSessions(next);
      setSessionsLoading(false);
    });
    return () => unsub();
  }, [user]);

  const goalProgress = useMemo(() => {
    if (tasks.length === 0) return 0;
    const done = tasks.filter((t) => t.completed).length;
    return Math.round((done / tasks.length) * 100);
  }, [tasks]);

  const stats = useMemo(() => aggregate(sessions, goalProgress), [sessions, goalProgress]);

  return { stats, loading: sessionsLoading || tasksLoading };
}
