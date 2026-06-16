import { doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { COLLECTIONS } from '@/lib/firestore/schema';
import { PLANNER_COLLECTIONS, type MonthlyGoal, type MonthlyPlan } from '@/lib/firestore/planner-schema';
import { monthKey } from '@/lib/planner/date-keys';

function monthlyDoc(uid: string, key: string) {
  return doc(db, COLLECTIONS.users, uid, PLANNER_COLLECTIONS.monthlyPlan, key);
}

function newGoalId() {
  return `goal_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

/** Live-subscribe to a month's plan; emits an empty goal list when none exists. */
export function subscribeMonthlyPlan(
  uid: string,
  cb: (goals: MonthlyGoal[]) => void,
  key: string = monthKey()
) {
  return onSnapshot(monthlyDoc(uid, key), (snap) => {
    const data = snap.exists() ? (snap.data() as MonthlyPlan) : null;
    cb(data?.goals ?? []);
  });
}

/** Overwrite the full goal list for a month. */
async function writeGoals(uid: string, goals: MonthlyGoal[], key: string) {
  await setDoc(
    monthlyDoc(uid, key),
    { id: key, goals, updatedAt: serverTimestamp() },
    { merge: true }
  );
}

/** Add a goal (e.g. an exam date) to a month's plan. */
export async function addMonthlyGoal(
  uid: string,
  current: MonthlyGoal[],
  goal: Omit<MonthlyGoal, 'id' | 'done'>,
  key: string = monthKey()
) {
  const next = [...current, { ...goal, id: newGoalId(), done: false }];
  await writeGoals(uid, next, key);
}

/** Toggle a goal's done flag. */
export async function toggleMonthlyGoal(
  uid: string,
  current: MonthlyGoal[],
  goalId: string,
  done: boolean,
  key: string = monthKey()
) {
  const next = current.map((g) => (g.id === goalId ? { ...g, done } : g));
  await writeGoals(uid, next, key);
}

/** Remove a goal from a month's plan. */
export async function removeMonthlyGoal(
  uid: string,
  current: MonthlyGoal[],
  goalId: string,
  key: string = monthKey()
) {
  const next = current.filter((g) => g.id !== goalId);
  await writeGoals(uid, next, key);
}
