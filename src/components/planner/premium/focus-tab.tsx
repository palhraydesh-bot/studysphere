"use client";

import React, { useEffect } from 'react';
import { useFocusStore } from '@/store/focus-store';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/shared/glass-card';
import { Play, Pause, RotateCcw, AlertTriangle, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

export function FocusTab() {
  const { isActive, timeLeft, distractionsThisSession, setIsActive, setTimeLeft, incrementDistractions, resetSessionState } = useFocusStore();

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      toast.success('Deep Work Pomodoro Block Completed! (+25 XP)');
      resetSessionState();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, setTimeLeft, setIsActive, resetSessionState]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-md mx-auto space-y-6 text-center">
      <GlassCard className="p-8 border border-white/5 bg-neutral-900/40 relative overflow-hidden">
        <span className="text-[10px] uppercase font-bold tracking-widest text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">Focus Shield Pro Active</span>
        
        <div className="my-8">
          <h2 className="text-6xl font-black tracking-tighter text-white tabular-nums font-mono">{formatTime(timeLeft)}</h2>
        </div>

        <div className="flex justify-center gap-3">
          <Button size="sm" variant={isActive ? 'outline' : 'default'} onClick={() => setIsActive(!isActive)}>
            {isActive ? <Pause className="h-4 w-4 mr-1.5" /> : <Play className="h-4 w-4 mr-1.5" />} {isActive ? 'Pause' : 'Start Focus'}
          </Button>
          <Button size="sm" variant="outline" onClick={() => setTimeLeft(1500)}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </GlassCard>

      <GlassCard className="p-4 border border-white/5 bg-neutral-900/60 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
          <AlertTriangle className="h-4 w-4 text-amber-500" /> Distraction Counter Loop
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-black text-white">{distractionsThisSession} Caught</span>
          <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={incrementDistractions}>
            Log Distraction
          </Button>
        </div>
      </GlassCard>
    </div>
  );
}