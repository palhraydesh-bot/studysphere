"use client";

import React, { useState } from 'react';
import { useHabitStore } from '@/store/habit-store';
import { HabitService } from '@/lib/planner/habit-service';
import { Habit } from '@/types/life-os';
import { Flame, Check, Plus, Trash2 } from 'lucide-react';
import { GlassCard } from '@/components/shared/glass-card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface HabitsTabProps {
  userId: string;
}

export function HabitsTab({ userId }: { userId: string }) {
  const { habits, habitHistory } = useHabitStore();
  const [name, setName] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily');

  const todayStr = new Date().toISOString().split('T')[0];

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Routine tracker description required');
      return;
    }
    await HabitService.createHabit(userId, name.trim(), frequency);
    setName('');
    toast.success('Routine identity locked into tracking grid');
  };

  const handleToggle = async (habit: Habit) => {
    const isCompleted = (habitHistory[todayStr] || []).includes(habit.id);
    try {
      await HabitService.toggleHabit(userId, habit, todayStr, !isCompleted);
      toast.success(!isCompleted ? 'Habit routine executed (+15 XP awarded)' : 'Log trace removed');
    } catch {
      toast.error('Could not synchronize habit status');
    }
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFrequency(e.target.value as 'daily' | 'weekly');
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleCreate} className="flex gap-2 bg-card p-4 rounded-xl border items-center">
        <input
          type="text"
          placeholder="Create a recurrent routine identity track..."
          className="flex-1 px-4 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm text-foreground shadow-sm placeholder:text-muted-foreground"
          value={name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
        />
        <select
          className="bg-background border border-input rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm text-foreground font-medium"
          value={frequency}
          onChange={handleSelectChange}
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
        </select>
        <Button type="submit" variant="gradient" size="sm" className="gap-2 shrink-0">
          <Plus className="h-4 w-4" /> Trace Routine
        </Button>
      </form>

      <div className="grid sm:grid-cols-2 gap-4">
        {habits.length === 0 ? (
          <div className="sm:col-span-2">
            <GlassCard>
              <p className="text-sm text-muted-foreground text-center py-4">No atomic habits established yet. Keep a consistent streak alive by creating one!</p>
            </GlassCard>
          </div>
        ) : (
          habits.map((habit) => {
            const isDoneToday = (habitHistory[todayStr] || []).includes(habit.id);

            return (
              <div key={habit.id} className="bg-card p-4 rounded-xl border flex items-center justify-between gap-4 hover:shadow-sm transition-all border-border/80">
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    type="button"
                    onClick={() => handleToggle(habit)}
                    className={`h-9 w-9 rounded-xl flex items-center justify-center transition-all border shrink-0 focus:outline-none focus:ring-2 focus:ring-primary/40 ${
                      isDoneToday 
                        ? 'bg-primary/10 border-primary text-primary shadow-inner' 
                        : 'bg-background border-input hover:border-primary/40 text-transparent'
                  }`}
                  >
                    <Check className="h-5 w-5 stroke-[3]" />
                  </button>
                  <div className="min-w-0">
                    <h4 className={`font-semibold text-sm truncate ${isDoneToday ? 'text-muted-foreground line-through' : 'text-card-foreground'}`}>{habit.name}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-primary bg-primary/5 px-2 py-0.5 rounded-md border border-primary/10">{habit.frequency}</span>
                      <div className="flex items-center gap-1 text-orange-500 font-medium text-xs">
                        <Flame className="h-3.5 w-3.5 fill-current" />
                        <span>{habit.streak} day streak</span>
                      </div>
                    </div>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={async () => {
                    await HabitService.deleteHabit(userId, habit.id);
                    toast.success('Habit track deleted');
                  }} 
                  className="p-2 text-muted-foreground hover:text-destructive rounded-lg hover:bg-destructive/5 transition-colors focus:outline-none"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}