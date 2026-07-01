"use client";

import React, { useState } from 'react';
import { useGoalStore } from '@/store/goal-store';
import { Target, ChevronDown, ChevronRight, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { GlassCard } from '@/components/shared/glass-card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface GoalsTabProps {
  userId: string;
}

export function GoalsTab({ userId }: { userId: string }) {
  const { goals, milestones, addGoalLocal, removeGoalLocal, updateMilestoneLocal } = useGoalStore();
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [expandedGoals, setExpandedGoals] = useState<Record<string, boolean>>({});

  const toggleExpand = (goalId: string) => {
    setExpandedGoals(prev => ({ ...prev, [goalId]: !prev[goalId] }));
  };

  const handleAddGoal = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newGoalTitle.trim()) {
      toast.error('Goal title cannot be empty');
      return;
    }
    
    addGoalLocal({
      id: `goal_${Date.now()}`,
      userId,
      title: newGoalTitle.trim(),
      tier: 'short',
      targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      completed: false,
       progress: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    setNewGoalTitle('');
    toast.success('Macro goal added');
  };

  const handleToggleMilestone = (milestoneId: string, currentStatus: boolean) => {
    updateMilestoneLocal(milestoneId, { completed: !currentStatus });
    toast.success('Milestone updated');
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleAddGoal} className="flex gap-2 bg-card p-4 rounded-xl border items-center">
        <input
          type="text"
          placeholder="Enter a new macro academic life goal..."
          className="flex-1 px-4 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm text-foreground placeholder:text-muted-foreground"
          value={newGoalTitle}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewGoalTitle(e.target.value)}
        />
        <Button type="submit" variant="gradient" size="sm" className="gap-2">
          <Plus className="h-4 w-4" /> Add Goal
        </Button>
      </form>

      <div className="grid gap-4">
        {goals.length === 0 ? (
          <GlassCard>
            <p className="text-sm text-muted-foreground text-center py-4">No academic life goals created yet. Set your first focus target above!</p>
          </GlassCard>
        ) : (
          goals.map(goal => {
            const goalMilestones = milestones.filter(m => m.goalId === goal.id);
            const completedCount = goalMilestones.filter(m => m.completed).length;
            const progressPercent = goalMilestones.length > 0 ? Math.round((completedCount / goalMilestones.length) * 100) : 0;
            const isExpanded = !!expandedGoals[goal.id];

            return (
              <div key={goal.id} className="bg-card rounded-xl border overflow-hidden transition-all shadow-sm hover:shadow-md">
                <div className="p-4 flex items-center justify-between gap-4 border-b bg-muted/30">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <button 
                      type="button"
                      onClick={() => toggleExpand(goal.id)} 
                      className="p-1 hover:bg-muted rounded-md text-muted-foreground transition-colors"
                    >
                      {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </button>
                    <div className="p-2 bg-primary/10 text-primary rounded-lg shrink-0">
                      <Target className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate text-card-foreground">{goal.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-24 bg-secondary rounded-full h-1.5 overflow-hidden">
                          <div className="bg-primary h-full rounded-full transition-all duration-300" style={{ width: `${progressPercent}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground font-medium">{progressPercent}% done</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => {
                      removeGoalLocal(goal.id);
                      toast.success('Goal deleted');
                    }} 
                    className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {isExpanded && (
                  <div className="p-4 bg-background/50 divide-y divide-border/60">
                    {goalMilestones.length === 0 ? (
                      <div className="flex items-center justify-between py-2 text-xs text-muted-foreground italic">
                        <span>No milestones defined yet for this goal framework.</span>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          className="h-7 text-[10px]"
                          onClick={() => {
                            useGoalStore.getState().addMilestoneLocal({
                              id: `ms_${Date.now()}`,
                              goalId: goal.id,
                              userId,
                              title: 'Core Syllabus Focus Objective',
                              completed: false,
                              weight: 50,
                              order: goalMilestones.length,
                              createdAt: new Date()
                            });
                            toast.success('Baseline milestone generated');
                          }}
                        >
                          Quick Add Milestone
                        </Button>
                      </div>
                    ) : (
                      goalMilestones.map(ms => (
                        <div key={ms.id} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                          <button
                            type="button"
                            onClick={() => handleToggleMilestone(ms.id, ms.completed)}
                            className="flex items-center gap-2.5 text-left bg-transparent border-none p-0 cursor-pointer focus:outline-none"
                          >
                            <CheckCircle2 className={`h-4 w-4 transition-colors ${ms.completed ? 'text-primary' : 'text-muted-foreground/40'}`} />
                            <span className={`text-xs font-medium transition-all ${ms.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{ms.title}</span>
                          </button>
                          <span className="text-[10px] bg-secondary px-2 py-0.5 rounded-full text-muted-foreground font-bold border">Weight {ms.weight}%</span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}