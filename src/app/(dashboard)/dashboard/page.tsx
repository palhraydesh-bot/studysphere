'use client';

import { Clock, Flame, Gauge, Timer, Plus } from 'lucide-react';
import { StatCard } from '@/components/shared/stat-card';
import { TodayTasksCard } from '@/components/dashboard/today-tasks-card';
import { RecentNotesCard } from '@/components/dashboard/recent-notes-card';
import { StudyTimeChart } from '@/components/dashboard/study-time-chart';
import { SubjectsProgressCard } from '@/components/dashboard/subjects-progress-card';
import { AchievementsCard } from '@/components/dashboard/achievements-card';
import { StreakCalendarCard } from '@/components/dashboard/streak-calendar-card';
import { FocusShieldWidget } from '@/components/dashboard/focus-shield-widget';
import { AiAssistantWidget } from '@/components/dashboard/ai-assistant-widget';
import { XpCard } from '@/components/dashboard/xp-card';
import { useDashboardStats } from '@/hooks/use-dashboard-stats';
import { useAuth } from '@/hooks/use-auth';
import { formatDuration } from '@/lib/utils';

export default function DashboardPage() {
  const { stats } = useDashboardStats();
  const { user } = useAuth();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  const name = user?.displayName?.split(' ')[0] ?? 'Student';

  // Focus Shield state is not yet lifted to a shared hook; default to inactive on the dashboard
  // preview until that refactor happens. The full Focus Shield page remains the source of truth.
  const focusActive = false;
  const focusEndsAt: number | null = null;
  const focusBlockedCount = 0;

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

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard label="Today" value={formatDuration(stats.dailySeconds)} icon={Clock} hint="Study time today" delay={0} />
        <StatCard label="Streak" value={`${stats.streakDays} days`} icon={Flame} hint="Keep it going!" delay={0.05} />
        <StatCard label="Focus Score" value={`${stats.productivityScore}`} icon={Gauge} hint="Excellent!" delay={0.1} />
        <StatCard label="Pomodoros" value={`${stats.pomodoroCount}`} icon={Timer} hint="Sessions today" delay={0.15} />
        <XpCard xpToday={0} totalXp={0} delay={0.2} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <StudyTimeChart weeklySeconds={stats.weeklySeconds} />
        </div>
        <SubjectsProgressCard />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <StreakCalendarCard streakDays={stats.streakDays} delay={0.25} />
        <FocusShieldWidget active={focusActive} endsAt={focusEndsAt} blockedCount={focusBlockedCount} delay={0.3} />
        <AiAssistantWidget delay={0.35} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <TodayTasksCard delay={0.4} />
        <RecentNotesCard delay={0.45} />
        <AchievementsCard />
      </div>
    </div>
  );
}