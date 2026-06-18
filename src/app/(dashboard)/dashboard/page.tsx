'use client';

import { Clock, Flame, Gauge, Timer, Plus, Sparkles } from 'lucide-react';
import { StatCard } from '@/components/shared/stat-card';
import { TodayTasksCard } from '@/components/dashboard/today-tasks-card';
import { RecentNotesCard } from '@/components/dashboard/recent-notes-card';
import { StudyTimeChart } from '@/components/dashboard/study-time-chart';
import { SubjectsProgressCard } from '@/components/dashboard/subjects-progress-card';
import { AchievementsCard } from '@/components/dashboard/achievements-card';
import { useDashboardStats } from '@/hooks/use-dashboard-stats';
import { useAuth } from '@/hooks/use-auth';
import { formatDuration } from '@/lib/utils';
import Link from 'next/link';

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

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard label="Today" value={formatDuration(stats.dailySeconds)} icon={Clock} hint="Study time today" delay={0} />
        <StatCard label="Streak" value={`${stats.streakDays} days`} icon={Flame} hint="Keep it going!" delay={0.05} />
        <StatCard label="Focus Score" value={`${stats.productivityScore}`} icon={Gauge} hint="Excellent!" delay={0.1} />
        <StatCard label="Pomodoros" value={`${stats.pomodoroCount}`} icon={Timer} hint="Sessions today" delay={0.15} />
        <StatCard label="XP Today" value={`${stats.pomodoroCount * 10} XP`} icon={Sparkles} hint={`Total XP: ${stats.pomodoroCount * 50}`} delay={0.2} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <StudyTimeChart weeklySeconds={stats.weeklySeconds} />
        <SubjectsProgressCard />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Goal Tracker */}
        <Link href="/dashboard/planner" className="rounded-xl border bg-card p-4 hover:bg-accent block">
          <h2 className="font-semibold mb-2">🎯 Goal Tracker</h2>
          <p className="text-3xl font-bold">{stats.goalProgress}%</p>
          <p className="text-sm text-muted-foreground">Weekly goal progress</p>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden mt-3">
            <div className="h-2 rounded-full bg-primary" style={{ width: `${stats.goalProgress}%` }} />
          </div>
        </Link>

        {/* Focus Shield */}
        <Link href="/dashboard/focus" className="rounded-xl border bg-card p-4 hover:bg-accent block">
          <h2 className="font-semibold mb-2">🛡️ Focus Shield</h2>
          <p className="text-sm text-muted-foreground mb-3">Block distractions and stay focused</p>
          <div className="bg-primary text-white text-center rounded-lg py-2 text-sm font-medium">
            Activate Focus Shield
          </div>
        </Link>

        {/* AI Assistant */}
        <div className="rounded-xl border bg-card p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">AI Assistant</h2>
          </div>
          <p className="text-sm text-muted-foreground">How can I help you today?</p>
          <div className="grid grid-cols-2 gap-2">
            <Link href="/dashboard/assistant" className="text-xs bg-muted rounded-lg p-2 hover:bg-accent text-center">📖 Explain a topic</Link>
            <Link href="/dashboard/assistant" className="text-xs bg-muted rounded-lg p-2 hover:bg-accent text-center">📝 Summarize notes</Link>
            <Link href="/dashboard/assistant" className="text-xs bg-muted rounded-lg p-2 hover:bg-accent text-center">❓ Quiz me</Link>
            <Link href="/dashboard/assistant" className="text-xs bg-muted rounded-lg p-2 hover:bg-accent text-center">📅 Generate plan</Link>
          </div>
          <Link href="/dashboard/assistant" className="block w-full text-center text-xs bg-primary text-white rounded-lg p-2">
            Open AI Assistant →
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <TodayTasksCard delay={0.4} />
        <RecentNotesCard delay={0.45} />
        <AchievementsCard />
      </div>
    </div>
  );
}