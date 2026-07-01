"use client";

import React, { useMemo } from 'react';
import { useGoalStore } from '@/store/goal-store';
import { useHabitStore } from '@/store/habit-store';
import { useExamStore } from '@/store/exam-store';
import { usePlannerStore } from '@/store/planner-store';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/shared/glass-card';
import { Sparkles, Target, Flame, GraduationCap, Zap, Trophy, ShieldCheck, Activity } from 'lucide-react';

export function AiLifeDashboardTab() {
  const { goals } = useGoalStore();
  const { habits } = useHabitStore();
  const { exams } = useExamStore();
  const { tasks } = usePlannerStore();

  const metrics = useMemo(() => {
    const completedTasks = tasks.filter(t => t.completed).length;
    const productivityScore = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 75;
    
    let highestStreak = 0;
    habits.forEach(h => { if (h.streak > highestStreak) highestStreak = h.streak; });

    const totalExams = exams.length;
    const averageReadiness = totalExams > 0 ? Math.round(exams.reduce((acc, curr) => acc + curr.readinessScore, 0) / totalExams) : 0;

    return { productivityScore, highestStreak, averageReadiness, liveTasksCount: tasks.length };
  }, [tasks, habits, exams]);

  return (
    <div className="space-y-6 text-slate-200">
      {/* Upper Context Dashboard Summary Panels */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard className="p-4 border border-white/5 bg-neutral-900/60 backdrop-blur-xl flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 text-primary rounded-xl border border-primary/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground block">Life OS Score</span>
            <span className="text-xl font-black text-white">{Math.round((metrics.productivityScore + metrics.averageReadiness) / 2 || 80)}/100</span>
          </div>
        </GlassCard>

        <GlassCard className="p-4 border border-white/5 bg-neutral-900/60 backdrop-blur-xl flex items-center gap-3">
          <div className="p-2.5 bg-violet-500/10 text-violet-400 rounded-xl border border-violet-500/20">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground block">Productivity Index</span>
            <span className="text-xl font-black text-white">{metrics.productivityScore}%</span>
          </div>
        </GlassCard>

        <GlassCard className="p-4 border border-white/5 bg-neutral-900/60 backdrop-blur-xl flex items-center gap-3">
          <div className="p-2.5 bg-orange-500/10 text-orange-400 rounded-xl border border-orange-500/20">
            <Flame className="h-5 w-5 fill-orange-500/5" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground block">Active Streaks</span>
            <span className="text-xl font-black text-white">{metrics.highestStreak} Days</span>
          </div>
        </GlassCard>

        <GlassCard className="p-4 border border-white/5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
          <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground block">Syllabus Readiness</span>
            <span className="text-xl font-black text-white">{metrics.averageReadiness}%</span>
          </div>
        </GlassCard>
      </div>

      {/* Main Framework Control Interface Split Screen Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <GlassCard className="p-5 border border-white/5 bg-neutral-900/40">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" /> Integrated Performance Trends
            </h3>
            <div className="space-y-3">
              <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                  <Target className="h-4 w-4 text-primary" /> Long-Term Goal Objectives
                </div>
                <span className="text-xs font-black text-white">{goals.length} Tracked</span>
              </div>
              <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                  <GraduationCap className="h-4 w-4 text-violet-400" /> Active Examination Boards
                </div>
                <span className="text-xs font-black text-white">{exams.length} Pending</span>
              </div>
            </div>
          </GlassCard>
        </div>

        <div>
          <GlassCard className="p-5 border border-white/5 bg-neutral-900/40 h-full flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                <Trophy className="h-4 w-4 text-yellow-500" /> System Gamification Status
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                Complete daily missions and preserve habits to unlock progression experience multipliers. Next tier reward unlocks at level 15.
              </p>
            </div>
            <div className="mt-4 bg-primary/5 text-primary border border-primary/10 px-3 py-2 rounded-xl text-center text-xs font-bold uppercase tracking-wider">
              Multiplier Mode Status: 1.5x Focus Active
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}