'use client';

import {
  Clock, CalendarRange, CalendarDays, Flame, Gauge,
  GraduationCap, ListChecks, Timer
} from 'lucide-react';
import { StatCard } from '@/components/shared/stat-card';
import { GlassCard } from '@/components/shared/glass-card';
import { TodayTasksCard } from '@/components/dashboard/today-tasks-card';
import { RecentNotesCard } from '@/components/dashboard/recent-notes-card';
import { useDashboardStats } from '@/hooks/use-dashboard-stats';
import { formatDuration } from '@/lib/utils';

/**
 * Dashboard overview. Stats are derived live from the user's Firestore pomodoro
 * sessions and planner tasks via useDashboardStats (Milestone 2).
 */
export default function DashboardPage() {
  const { stats } = useDashboardStats();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Your study overview at a glance.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Today" value={formatDuration(stats.dailySeconds)} icon={Clock} hint="Study time today" delay={0} />
        <StatCard label="This week" value={formatDuration(stats.weeklySeconds)} icon={CalendarRange} hint="+8% vs last week" delay={0.05} />
        <StatCard label="This month" value={formatDuration(stats.monthlySeconds)} icon={CalendarDays} hint="Monthly total" delay={0.1} />
        <StatCard label="Streak" value={`${stats.streakDays} days`} icon={Flame} hint="Keep it going!" delay={0.15} />
        <StatCard label="Productivity" value={`${stats.productivityScore}/100`} icon={Gauge} hint="Focus quality" delay={0.2} />
        <StatCard label="Pomodoros" value={`${stats.pomodoroCount}`} icon={Timer} hint="Sessions today" delay={0.25} />
        <StatCard label="Goal progress" value={`${stats.goalProgress}%`} icon={ListChecks} hint="Weekly goal" delay={0.3} />
        <StatCard label="Next exam" value="5 days" icon={GraduationCap} hint="Physics midterm" delay={0.35} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <TodayTasksCard delay={0.4} />
        <RecentNotesCard delay={0.45} />
      </div>
    </div>
  );
}
