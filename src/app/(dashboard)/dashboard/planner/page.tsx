'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/shared/glass-card';
import { TaskItem } from '@/components/planner/task-item';
import { TaskDialog } from '@/components/planner/task-dialog';
import { WeeklyGrid } from '@/components/planner/weekly-grid';
import { MonthlyView } from '@/components/planner/monthly-view';
import { useAuth } from '@/hooks/use-auth';
import { useTasksSync } from '@/hooks/use-tasks';
import { usePlannerPlansSync } from '@/hooks/use-planner-plans';
import { usePlannerStore } from '@/store/planner-store';
import { createTask, deleteTask, toggleTask, updateTask } from '@/lib/planner/task-service';
import { awardXp } from '@/lib/gamification/xp-service';
import { generateWeeklyPlan } from '@/lib/planner/ai-generator';
import { saveWeeklyPlan } from '@/lib/planner/weekly-plan-service';
import { SUBJECTS, type NewTask, type Subject, type Task } from '@/lib/firestore/planner-schema';
import { cn } from '@/lib/utils';
import { AiSmartPlanner } from '@/components/planner/premium/ai-smart-planner';
import { usePlannerInsights } from '@/hooks/use-planner-insights';
import { PlannerHero } from '@/components/planner/premium/planner-hero';

// New Premium Life OS Tab Component Imports
import { GoalsTab } from '@/components/planner/premium/goals-tab';
import { HabitsTab } from '@/components/planner/premium/habits-tab';
import { ExamsTab } from '@/components/planner/premium/exams-tab';

// Extended tab union type to integrate Life OS horizons cleanly
type Tab = 'daily' | 'weekly' | 'monthly' | 'ai' | 'goals' | 'habits' | 'exams';

// Extended existing TABS configurations
const TABS: { id: Tab; label: string }[] = [
  { id: 'daily', label: 'Daily' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'ai', label: 'AI Planner' },
  { id: 'goals', label: 'Goals' },
  { id: 'habits', label: 'Habits' },
  { id: 'exams', label: 'Exams' }
];

export default function PlannerPage() {
  useTasksSync();
  usePlannerPlansSync();
  const { user } = useAuth();
  const { tasks, loading } = usePlannerStore();
  const weeklySlots = usePlannerStore((s) => s.weeklySlots);
  const weeklyLoading = usePlannerStore((s) => s.weeklyLoading);
  const insights = usePlannerInsights();

  // Preserved exact variable state mapping logic strings
  const [tab, setTab] = useState<Tab>('daily');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);

  // AI planner local state parameters untouched
  const [picked, setPicked] = useState<Subject[]>(['Mathematics', 'Physics']);
  const [weeklyHours, setWeeklyHours] = useState(14);
  const [generating, setGenerating] = useState(false);

  const userId = user?.uid || 'dev_sandbox';

  const grouped = useMemo(() => {
    const pending = tasks.filter((t) => !t.completed);
    const done = tasks.filter((t) => t.completed);
    return { pending, done };
  }, [tasks]);

  async function handleSubmit(data: NewTask) {
    if (!user) return;
    try {
      if (editing) await updateTask(user.uid, editing.id, data);
      else await createTask(user.uid, data);
      toast.success(editing ? 'Task updated' : 'Task created');
    } catch {
      toast.error('Could not save task');
    } finally {
      setDialogOpen(false);
      setEditing(null);
    }
  }

  async function handleToggle(task: Task) {
    if (!user) return;
    const nowCompleted = !task.completed;
    await toggleTask(user.uid, task.id, nowCompleted);
    if (nowCompleted) void awardXp(user.uid, 'completeTask');
  }

  async function handleDelete(task: Task) {
    if (!user) return;
    await deleteTask(user.uid, task.id);
    toast.success('Task deleted');
  }

  function togglePicked(s: Subject) {
    setPicked((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  }

  return (
    <div className="space-y-6 animate-fade-in text-slate-200">
      <PlannerHero insights={insights} />
      <AiSmartPlanner weeklySlots={weeklySlots} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Study Planner</h1>
          <p className="text-sm text-muted-foreground">Plan daily tasks, weekly schedules and let AI balance your week.</p>
        </div>
        {tab === 'daily' && (
          <Button variant="gradient" onClick={() => { setEditing(null); setDialogOpen(true); }}>
            <Plus className="h-4 w-4" /> New task
          </Button>
        )}
      </div>

      <div className="flex w-fit gap-1 rounded-xl bg-secondary p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'rounded-lg px-4 py-1.5 text-sm font-medium transition-colors',
              tab === t.id ? 'bg-gradient-brand text-white shadow' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="w-full">
        {tab === 'daily' && (
          <div className="space-y-4">
            {loading && <p className="text-sm text-muted-foreground">Loading tasks...</p>}
            {!loading && tasks.length === 0 && (
              <GlassCard><p className="text-sm text-muted-foreground">No tasks yet. Create your first one!</p></GlassCard>
            )}
            {grouped.pending.length > 0 && (
              <div className="space-y-2">
                {grouped.pending.map((t) => (
                  <TaskItem key={t.id} task={t} onToggle={handleToggle} onEdit={(task) => { setEditing(task); setDialogOpen(true); }} onDelete={handleDelete} />
                ))}
              </div>
            )}
            {grouped.done.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase text-muted-foreground">Completed</p>
                {grouped.done.map((t) => (
                  <TaskItem key={t.id} task={t} onToggle={handleToggle} onEdit={(task) => { setEditing(task); setDialogOpen(true); }} onDelete={handleDelete} />
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'weekly' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Your saved weekly schedule. Use the AI Planner tab to regenerate.</p>
            {weeklyLoading ? (
              <p className="text-sm text-muted-foreground">Loading weekly plan...</p>
            ) : weeklySlots.length === 0 ? (
              <GlassCard><p className="text-sm text-muted-foreground">No plan yet. Generate one in the AI Planner tab.</p></GlassCard>
            ) : (
              <WeeklyGrid slots={weeklySlots} />
            )}
          </div>
        )}

        {tab === 'monthly' && <MonthlyView />}

        {tab === 'ai' && (
          <div className="space-y-4">
            <GlassCard className="space-y-4">
              <h2 className="font-semibold">AI Smart Planner</h2>
              <div>
                <p className="mb-2 text-sm text-muted-foreground">Pick subjects (tap to toggle weak ones get more time):</p>
                <div className="flex flex-wrap gap-2">
                  {SUBJECTS.map((s) => (
                    <button
                      key={s}
                      onClick={() => togglePicked(s)}
                      className={cn(
                        'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                        picked.includes(s) ? 'border-primary bg-primary/15 text-primary' : 'border-input text-muted-foreground'
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm text-muted-foreground">Weekly hours</label>
                <input
                  type="range" min={4} max={40} value={weeklyHours}
                  onChange={(e) => setWeeklyHours(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="w-12 text-right text-sm font-semibold">{weeklyHours}h</span>
              </div>
              <Button
                variant="gradient"
                disabled={generating || !user}
                onClick={async () => {
                  if (!user) return;
                  setGenerating(true);
                  try {
                    const result = generateWeeklyPlan({ subjects: picked, weeklyHours, weakSubjects: picked.slice(0, 1) });
                    await saveWeeklyPlan(user.uid, result);
                    setTab('weekly');
                    toast.success('Study plan generated and saved');
                  } catch {
                    toast.error('Could not save the generated plan');
                  } finally {
                    setGenerating(false);
                  }
                }}
              >
                {generating ? 'Generating...' : 'Generate plan'}
              </Button>
            </GlassCard>
          </div>
        )}

        {/* Premium Core Life OS Module Tabs Integration */}
        {tab === 'goals' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <GoalsTab userId="temp-user" />
          </div>
        )}

        {tab === 'habits' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <HabitsTab userId="temp-user" />
          </div>
        )}

        {tab === 'exams' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <ExamsTab userId="temp-user" />
          </div>
        )}
      </div>

      <TaskDialog
        open={dialogOpen}
        initial={editing}
        onClose={() => { setDialogOpen(false); setEditing(null); }}
        onSubmit={handleSubmit}
      />
    </div>
  );
}