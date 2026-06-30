"use client";

import React, { useState } from 'react';
import { useGoalStore } from '@/store/goal-store';
import { Target, ChevronDown, ChevronRight, Plus, Trash2, CheckCircle2 } from 'lucide-react';

export function GoalsTab({ userId }: { userId: string }) {
  const { goals, milestones, addGoalLocal, removeGoalLocal } = useGoalStore();
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [expandedGoals, setExpandedGoals] = useState<Record<string, boolean>>({});

  const toggleExpand = (goalId: string) => {
    setExpandedGoals(prev => ({ ...prev, [goalId]: !prev[goalId] }));
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim()) return;
    
    addGoalLocal({
      id: `goal_${Date.now()}`,
      userId,
      title: newGoalTitle,
      targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    setNewGoalTitle('');
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleAddGoal} className="flex gap-2 bg-card p-4 rounded-xl border">
        <input
          type="text"
          placeholder="Enter a new macro academic life goal..."
          className="flex-1 px-4 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          value={newGoalTitle}
          onChange={e => setNewGoalTitle(e.target.value)}
        />
        <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg flex items-center gap-2 text-sm font-medium hover:bg-primary/95 transition-all">
          <Plus className="h-4 w-4" /> Add Goal
        </button>
      </form>

      <div className="grid gap-4">
        {goals.map(goal => {
          const goalMilestones = milestones.filter(m => m.goalId === goal.id);
          const completedCount = goalMilestones.filter(m => m.completed).length;
          const progressPercent = goalMilestones.length > 0 ? Math.round((completedCount / goalMilestones.length) * 100) : 0;
          const isExpanded = !!expandedGoals[goal.id];

          return (
            <div key={goal.id} className="bg-card rounded-xl border overflow-hidden transition-all">
              <div className="p-4 flex items-center justify-between gap-4 border-b bg-muted/30">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <button onClick={() => toggleExpand(goal.id)} className="p-1 hover:bg-muted rounded-md text-muted-foreground transition-colors">
                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </button>
                  <div className="p-2 bg-primary/10 text-primary rounded-lg shrink-0">
                    <Target className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate">{goal.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-24 bg-secondary rounded-full h-1.5 overflow-hidden">
                        <div className="bg-primary h-full rounded-full transition-all duration-300" style={{ width: `${progressPercent}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground font-medium">{progressPercent}%</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => removeGoalLocal(goal.id)} className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {isExpanded && (
                <div className="p-4 bg-background/50 divide-y divide-border/60">
                  {goalMilestones.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-2 italic">No milestones defined yet for this macro target window.</p>
                  ) : (
                    goalMilestones.map(ms => (
                      <div key={ms.id} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                        <div className="flex items-center gap-2.5">
                          <CheckCircle2 className={`h-4 w-4 ${ms.completed ? 'text-primary' : 'text-muted-foreground/40'}`} />
                          <span className={`text-xs ${ms.completed ? 'line-through text-muted-foreground' : 'font-medium'}`}>{ms.title}</span>
                        </div>
                        <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground font-medium">Weight {ms.weight}%</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}