import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { LifeGoal, LifeMilestone } from '@/types/life-os';

interface GoalState {
  goals: LifeGoal[];
  milestones: LifeMilestone[];
  isLoading: boolean;
  error: string | null;
  setGoals: (goals: LifeGoal[]) => void;
  setMilestones: (milestones: LifeMilestone[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  addGoalLocal: (goal: LifeGoal) => void;
  updateGoalLocal: (goalId: string, updates: Partial<LifeGoal>) => void;
  removeGoalLocal: (goalId: string) => void;
  addMilestoneLocal: (milestone: LifeMilestone) => void;
  updateMilestoneLocal: (milestoneId: string, updates: Partial<LifeMilestone>) => void;
  removeMilestoneLocal: (milestoneId: string) => void;
  resetGoalStore: () => void;
}

export const useGoalStore = create<GoalState>()(
  devtools(
    (set) => ({
      goals: [],
      milestones: [],
      isLoading: false,
      error: null,
      setGoals: (goals) => set({ goals, isLoading: false }),
      setMilestones: (milestones) => set({ milestones }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      addGoalLocal: (goal) => set((state) => ({ goals: [goal, ...state.goals] })),
      updateGoalLocal: (goalId, updates) =>
        set((state) => ({
          goals: state.goals.map((g) => (g.id === goalId ? { ...g, ...updates, updatedAt: new Date() } : g)),
        })),
      removeGoalLocal: (goalId) =>
        set((state) => ({
          goals: state.goals.filter((g) => g.id !== goalId),
          milestones: state.milestones.filter((m) => m.goalId !== goalId),
        })),
      addMilestoneLocal: (milestone) =>
        set((state) => ({ milestones: [...state.milestones, milestone].sort((a, b) => a.order - b.order) })),
      updateMilestoneLocal: (milestoneId, updates) =>
        set((state) => ({
          milestones: state.milestones.map((m) => (m.id === milestoneId ? { ...m, ...updates } : m)),
        })),
      removeMilestoneLocal: (milestoneId) =>
        set((state) => ({ milestones: state.milestones.filter((m) => m.id !== milestoneId) })),
      resetGoalStore: () => set({ goals: [], milestones: [], isLoading: false, error: null }),
    }),
    { name: 'StudySphere-GoalStore' }
  )
);