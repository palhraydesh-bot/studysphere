'use client';

import { Clock, Flame, Gauge, Timer, Plus } from 'lucide-react';
import { StatCard } from '@/components/shared/stat-card';
import { TodayTasksCard } from '@/components/dashboard/today-tasks-card';
import { RecentNotesCard } from '@/components/dashboard/recent-notes-card';
import { StudyTimeChart } from '@/components/dashboard/study-time-chart';
import { useDashboardStats } from '@/hooks/use-dashboard-stats';
import { useAuth } from '@/hooks/use-auth';
import { formatDuration } from '@/lib/utils';

export default function DashboardPage() {
  const { stats } = useDashboardStats();
  const { user } = useAuth();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  const name = user?.displayName?.split(' ')[0] ?? 'Student';

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{greeting},</p>
          <h1 className="text-3xl font-bold">{name} 👋</h1>
          <p className="text-sm text-muted-foreground mt-1">Consistency today, success tomorrow.</p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium">
          <Plus className="h-4 w-4" /> Quick Add
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Today" value={formatDuration(stats.dailySeconds)} icon={Clock} hint="Study time today" delay={0} />
        <StatCard label="Streak" value={`${stats.streakDays} days`} icon={Flame} hint="Keep it going!" delay={0.05} />
        <StatCard label="Focus Score" value={`${stats.productivityScore}`} icon={Gauge} hint="Excellent!" delay={0.1} />
        <StatCard label="Pomodoros" value={`${stats.pomodoroCount}`} icon={Timer} hint="Sessions today" delay={0.15} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <StudyTimeChart weeklySeconds={stats.weeklySeconds} />
        <TodayTasksCard delay={0.4} />
      </div>

      <div className="grid grid-cols-1 gap-4">
        <RecentNotesCard delay={0.45} />
      </div>
    </div>
  );
}