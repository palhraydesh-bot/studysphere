"use client";

import React, { useState } from 'react';
import { useLifeDashboardStore } from '@/store/life-dashboard-store';
import { GlassCard } from '@/components/shared/glass-card';
import { Button } from '@/components/ui/button';
import { Moon, Dumbbell, Droplet, BookOpen, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export function LifeDashboardTab() {
  const { dailyLogs, setDailyLog } = useLifeDashboardStore();
  const todayKey = new Date().toISOString().split('T')[0];
  const activeLog = dailyLogs[todayKey];

  const [sleep, setSleep] = useState(activeLog?.sleepHours?.toString() || '7');
  const [exercise, setExercise] = useState(activeLog?.exerciseMinutes?.toString() || '30');
  const [water, setWater] = useState(activeLog?.waterIntakeMl?.toString() || '2000');
  const [reading, setReading] = useState(activeLog?.readingPages?.toString() || '10');

  const handleCommitLogs = (e: React.FormEvent) => {
    e.preventDefault();
    setDailyLog(todayKey, {
      id: todayKey,
      userId: 'dev_user',
      date: todayKey,
      sleepHours: Number(sleep) || 0,
      exerciseMinutes: Number(exercise) || 0,
      waterIntakeMl: Number(water) || 0,
      readingPages: Number(reading) || 0,
      updatedAt: new Date()
    });
    toast.success('Lifestyle metrics synchronized with Life OS container');
  };

  return (
    <div className="space-y-6 text-slate-200">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <GlassCard className="p-4 border border-white/5 bg-white/5 flex items-center gap-3">
          <Moon className="h-5 w-5 text-indigo-400" />
          <div>
            <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider block">Sleep duration</span>
            <span className="text-base font-black text-white">{activeLog?.sleepHours || 0} Hrs</span>
          </div>
        </GlassCard>
        <GlassCard className="p-4 border border-white/5 bg-white/5 flex items-center gap-3">
          <Dumbbell className="h-5 w-5 text-emerald-400" />
          <div>
            <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider block">Fitness log</span>
            <span className="text-base font-black text-white">{activeLog?.exerciseMinutes || 0} Mins</span>
          </div>
        </GlassCard>
        <GlassCard className="p-4 border border-white/5 bg-white/5 flex items-center gap-3">
          <Droplet className="h-5 w-5 text-sky-400" />
          <div>
            <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider block">Hydration matrix</span>
            <span className="text-base font-black text-white">{activeLog?.waterIntakeMl || 0} ML</span>
          </div>
        </GlassCard>
        <GlassCard className="p-4 border border-white/5 bg-white/5 flex items-center gap-3">
          <BookOpen className="h-5 w-5 text-pink-400" />
          <div>
            <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider block">Reading metrics</span>
            <span className="text-base font-black text-white">{activeLog?.readingPages || 0} Pages</span>
          </div>
        </GlassCard>
      </div>

      <GlassCard className="p-5 border border-white/5 bg-neutral-900/40">
        <h3 className="font-bold text-sm mb-4 flex items-center gap-2 text-white">
          <Sparkles className="h-4 w-4 text-primary" /> Synchronize Biometric Logs
        </h3>
        <form onSubmit={handleCommitLogs} className="grid grid-cols-2 md:grid-cols-5 gap-3 items-end">
          <input type="number" className="px-3 py-1.5 bg-background border border-white/10 rounded-lg text-xs" value={sleep} onChange={e => setSleep(e.target.value)} placeholder="Sleep hours" />
          <input type="number" className="px-3 py-1.5 bg-background border border-white/10 rounded-lg text-xs" value={exercise} onChange={e => setExercise(e.target.value)} placeholder="Fitness minutes" />
          <input type="number" className="px-3 py-1.5 bg-background border border-white/10 rounded-lg text-xs" value={water} onChange={e => setWater(e.target.value)} placeholder="Water ML" />
          <input type="number" className="px-3 py-1.5 bg-background border border-white/10 rounded-lg text-xs" value={reading} onChange={e => setReading(e.target.value)} placeholder="Reading pages" />
          <Button type="submit" variant="gradient" className="h-9 text-xs font-bold">Commit Entry</Button>
        </form>
      </GlassCard>
    </div>
  );
}