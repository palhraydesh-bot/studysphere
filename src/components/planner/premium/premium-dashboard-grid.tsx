"use client";

import React from 'react';
import { Target, Flame, GraduationCap, Trophy, Zap, Activity, BarChart3, LineChart } from 'lucide-react';
import { useGoalStore } from '@/store/goal-store';
import { useHabitStore } from '@/store/habit-store';
import { useExamStore } from '@/store/exam-store';

export function PremiumDashboardGrid({ children }: { children: React.ReactNode }) {
  const { goals } = useGoalStore();
  const { habits } = useHabitStore();
  const { exams } = useExamStore();

  return (
    <div className="w-full space-y-6">
      {/* Upper Context Rows */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Mission Matrix Module */}
        <div className="bg-card p-4 rounded-xl border flex flex-col justify-between space-y-3">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
            <Zap className="h-4 w-4" /> Operational Mission Status
          </div>
          <p className="text-xs text-muted-foreground font-medium leading-relaxed">
            Your system logs register daily milestones active. Complete scheduled blocks to maximize multiplier gains.
          </p>
          <div className="text-xs font-semibold bg-muted px-3 py-1.5 rounded-lg border text-muted-foreground/80">
            Active Multiplier: <span className="text-primary font-bold">1.5x XP</span>
          </div>
        </div>

        {/* AI Assistant Insight Hub */}
        <div className="bg-card p-4 rounded-xl border flex flex-col justify-between space-y-3">
          <div className="flex items-center gap-2 text-violet-500 font-bold text-xs uppercase tracking-wider">
            <BarChart3 className="h-4 w-4" /> AI Study Coach Diagnostics
          </div>
          <p className="text-xs text-muted-foreground font-medium leading-relaxed">
            Optimal work intervals detected between 09:00 - 11:30. Fatigue limits are within safe nominal margins.
          </p>
          <div className="text-xs bg-violet-500/5 text-violet-600 border border-violet-500/10 px-3 py-1.5 rounded-lg font-semibold">
            Status: <span className="font-bold">Focus Peak</span>
          </div>
        </div>

        {/* Global Structural Metrics summary mapping points */}
        <div className="bg-card p-4 rounded-xl border flex flex-col justify-between space-y-3">
          <div className="flex items-center gap-2 text-emerald-500 font-bold text-xs uppercase tracking-wider">
            <Target className="h-4 w-4" /> Objective Target Density
          </div>
          <div className="grid grid-cols-3 gap-2 text-center pt-1">
            <div className="bg-muted/40 p-2 rounded-lg border">
              <span className="block font-bold text-base text-foreground">{goals.length}</span>
              <span className="text-[9px] font-bold uppercase text-muted-foreground">Goals</span>
            </div>
            <div className="bg-muted/40 p-2 rounded-lg border">
              <span className="block font-bold text-base text-foreground">{habits.length}</span>
              <span className="text-[9px] font-bold uppercase text-muted-foreground">Habits</span>
            </div>
            <div className="bg-muted/40 p-2 rounded-lg border">
              <span className="block font-bold text-base text-foreground">{exams.length}</span>
              <span className="text-[9px] font-bold uppercase text-muted-foreground">Exams</span>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Workspace Framework Layout Area */}
      <div className="grid lg:grid-cols-4 gap-6">
        {/* Left Interactive Timeline Arena Column */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-card border rounded-2xl p-4 md:p-6 shadow-sm">
            {children}
          </div>
        </div>

        {/* Right Metric Diagnostics Command Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Track Indicators */}
          <div className="bg-card p-4 rounded-xl border space-y-3">
            <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-muted-foreground border-b pb-2">
              <GraduationCap className="h-4 w-4 text-primary" /> Pending Milestones
            </div>
            {exams.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">No exams recorded.</p>
            ) : (
              <div className="space-y-2">
                {exams.slice(0, 3).map(e => (
                  <div key={e.id} className="flex justify-between items-center text-xs bg-muted/30 p-2.5 rounded-lg border border-border/40">
                    <span className="font-semibold text-card-foreground/90 truncate max-w-[120px]">{e.title}</span>
                    <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded">{e.readinessScore}% Score</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Activity Logs feed list references */}
          <div className="bg-card p-4 rounded-xl border space-y-3">
            <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-muted-foreground border-b pb-2">
              <Activity className="h-4 w-4 text-orange-500" /> Live Stream Sync
            </div>
            <div className="space-y-2 text-[11px] text-muted-foreground font-medium">
              <div className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1 shrink-0" />
                <span>Life OS UI integration layers compiled and ready.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1 shrink-0" />
                <span>State stores connected and bound securely.</span>
              </div>
            </div>
          </div>

          {/* Achievements badge matrix log display area */}
          <div className="bg-card p-4 rounded-xl border space-y-3">
            <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-muted-foreground border-b pb-2">
              <Trophy className="h-4 w-4 text-yellow-500" /> Earned Rank Badges
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="text-[10px] font-bold bg-yellow-500/10 text-yellow-600 border border-yellow-500/20 px-2 py-1 rounded-md">Architect Level 1</span>
              <span className="text-[10px] font-bold bg-blue-500/10 text-blue-600 border border-blue-500/20 px-2 py-1 rounded-md">Consistency Lock</span>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Evaluation Row Footer */}
      <div className="grid md:grid-cols-3 gap-4 border-t pt-4">
        <div className="bg-card p-4 rounded-xl border flex items-center gap-3">
          <LineChart className="h-5 w-5 text-primary" />
          <div>
            <span className="block text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Productivity Score</span>
            <span className="text-sm font-bold text-card-foreground">Nominal 94.2%</span>
          </div>
        </div>
        <div className="bg-card p-4 rounded-xl border flex items-center gap-3">
          <Flame className="h-5 w-5 text-orange-500" />
          <div>
            <span className="block text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Streak Retain Limit</span>
            <span className="text-sm font-bold text-card-foreground">Fully Active Grid</span>
          </div>
        </div>
        <div className="bg-card p-4 rounded-xl border flex items-center gap-3">
          <Activity className="h-5 w-5 text-emerald-500" />
          <div>
            <span className="block text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Shield Focus Efficiency</span>
            <span className="text-sm font-bold text-card-foreground">Optimal Protection</span>
          </div>
        </div>
      </div>
    </div>
  );
}