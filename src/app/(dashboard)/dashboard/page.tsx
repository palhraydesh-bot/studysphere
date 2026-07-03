"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { GlassCard } from "@/components/dashboard/glass-card";
import { StatCard } from "@/components/dashboard/stat-card";
import { SectionHeader } from "@/components/dashboard/section-header";
import { PremiumButton } from "@/components/dashboard/premium-button";
import { PremiumProgress } from "@/components/dashboard/premium-progress";
import { AchievementCard } from "@/components/dashboard/achievement-card";

// ── Static placeholder data — wire to real Firestore/Zustand data when available ──

const INITIAL_TASKS = [
  { id: 1, title: "Physics: Laws of Motion", time: "45m", done: true },
  { id: 2, title: "Maths: Trigonometry", time: "60m", done: true },
  { id: 3, title: "Chemistry: Chemical Bonding", time: "45m", done: false },
  { id: 4, title: "Biology: Plant Kingdom", time: "30m", done: false },
];

const QUICK_ACTIONS = [
  { icon: "📅", label: "Planner", link: "/dashboard/planner", color: "#8b5cf6" },
  { icon: "📝", label: "Notes", link: "/dashboard/notes", color: "#22c55e" },
  { icon: "🃏", label: "Flashcards", link: "/dashboard/flashcards", color: "#06b6d4" },
  { icon: "🤖", label: "AI Assistant", link: "/dashboard/assistant", color: "#a855f7" },
  { icon: "📔", label: "Journal", link: "/dashboard/journal", color: "#f97316" },
];

const REVISION_ALERTS = [
  { topic: "Chemical Bonding", priority: "High", color: "#ef4444", when: "Due today" },
  { topic: "Vectors", priority: "Medium", color: "#f97316", when: "Due tomorrow" },
  { topic: "Thermodynamics", priority: "Low", color: "#22c55e", when: "Due in 2 days" },
];

const ACHIEVEMENTS_LIST = [
  { icon: "🌅", title: "Early Bird", desc: "Study before 7 AM" },
  { icon: "🎯", title: "Focus Master", desc: "50 Deep Focus Sessions" },
  { icon: "⚔️", title: "Week Warrior", desc: "7 Day Streak" },
];

const BOTTOM_NAV = [
  { icon: "🏠", label: "Home", href: "/dashboard" },
  { icon: "📅", label: "Planner", href: "/dashboard/planner" },
  { icon: "🎯", label: "Focus", href: "/dashboard/focus" },
  { icon: "📝", label: "Notes", href: "/dashboard/notes" },
  { icon: "✨", label: "AI", href: "/dashboard/assistant" },
];

// Level / XP — static placeholder, wire to real profile/XP tracking when available
const USER_LEVEL = 14;
const XP_CURRENT = 3250;
const XP_NEXT_LEVEL = 5000;
const NOTIFICATION_COUNT = 3;

// Focus Shield — static placeholder, wire to real app-blocking state when available
const FOCUS_SHIELD_ON = true;
const FOCUS_SESSION_MINUTES = 25;
const FOCUS_BLOCKED_APPS = ["Instagram", "Reels", "Shorts"];

// Study Progress (exam tracking) — static placeholder, wire to real exam data when available
const EXAM_NAME = "SSC CHSL 2026";
const EXAM_PROGRESS_PCT = 53;
const EXAM_DAYS_LEFT = 98;
const MOCK_TESTS_DONE = 12;
const MOCK_TESTS_TOTAL = 25;
const NOTES_COUNT = 150;
const WEAK_TOPICS_COUNT = 18;

function ProgressRing({ pct, size = 96, stroke = 8 }: { pct: number; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} className="-rotate-90 flex-shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} stroke="#ffffff15" strokeWidth={stroke} fill="none" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke="#a855f7"
        strokeWidth={stroke}
        fill="none"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - pct / 100)}
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [user, setUser] = useState<{ name: string; photoURL: string | null } | null>(null);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  useEffect(() => {
    const saved = localStorage.getItem("ss_today_tasks");
    if (saved) setTasks(JSON.parse(saved));
  }, []);

  // Real logged-in user's name/photo from Firebase Auth (Google Sign-in)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          name: firebaseUser.displayName?.split(" ")[0] || "Student",
          photoURL: firebaseUser.photoURL,
        });
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const toggleTask = (id: number) => {
    const updated = tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
    setTasks(updated);
    localStorage.setItem("ss_today_tasks", JSON.stringify(updated));
  };

  const doneTasks = tasks.filter((t) => t.done).length;
  const pct = Math.round((doneTasks / tasks.length) * 100);
  const xpPct = Math.round((XP_CURRENT / XP_NEXT_LEVEL) * 100);

  return (
    <div className="min-h-screen w-full bg-[#0d0d1a] text-white overflow-x-hidden">
      <div className="p-4 md:p-6 max-w-[1400px] mx-auto space-y-5 w-full pb-24 md:pb-6">

        {/* ── HEADER ── */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.name}
                referrerPolicy="no-referrer"
                className="w-14 h-14 rounded-full object-cover flex-shrink-0 ring-2 ring-white/10"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-xl font-bold flex-shrink-0 ring-2 ring-white/10">
                {(user?.name?.[0] || "S").toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-gray-400 text-sm">{greeting},</p>
              <h1 className="text-xl md:text-2xl font-bold text-white leading-tight">
                {user?.name || "Student"}! <span>👋</span>
              </h1>
              <span className="inline-block mt-1 text-[11px] font-semibold bg-violet-600/30 text-violet-300 px-2 py-0.5 rounded-full">
                Lv {USER_LEVEL}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              <button
                aria-label="Notifications"
                className="relative w-9 h-9 rounded-full bg-white/8 border border-white/10 flex items-center justify-center hover:bg-white/15 transition-colors"
              >
                🔔
                {NOTIFICATION_COUNT > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-violet-600 text-[10px] flex items-center justify-center font-semibold">
                    {NOTIFICATION_COUNT}
                  </span>
                )}
              </button>
              <PremiumButton size="sm" onClick={() => router.push("/dashboard/planner")}>
                <span>+</span> Quick Add
              </PremiumButton>
            </div>
            <div className="hidden sm:flex flex-col items-end w-40">
              <p className="text-[11px] text-gray-400">{XP_CURRENT.toLocaleString()} / {XP_NEXT_LEVEL.toLocaleString()} XP</p>
              <div className="w-full h-1.5 bg-white/10 rounded-full mt-1 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full" style={{ width: `${xpPct}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* XP bar on mobile (below header row, since it doesn't fit inline on small screens) */}
        <div className="sm:hidden -mt-2">
          <p className="text-[11px] text-gray-400">Level {USER_LEVEL} · {XP_CURRENT.toLocaleString()} / {XP_NEXT_LEVEL.toLocaleString()} XP</p>
          <div className="w-full h-1.5 bg-white/10 rounded-full mt-1 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full" style={{ width: `${xpPct}%` }} />
          </div>
        </div>

        {/* ── STAT CARDS (2x2 mobile / 4 col desktop) ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard icon="⏱️" label="Study Time" value="2h 45m" sub="↑ 28% vs yesterday" subClassName="text-green-400" />
          <StatCard icon="🔥" label="Streak" value="12 Days" sub="Keep it going!" subClassName="text-orange-400" />
          <StatCard icon="✅" label="Tasks Done" value={`${doneTasks}/${tasks.length}`} sub="Keep pushing!" subClassName="text-blue-400" />
          <StatCard icon="⚡" label="Focus Score" value="82/100" sub="Excellent! 🔥" subClassName="text-violet-400" />
        </div>

        {/* ── TWO-COLUMN AREA (stacks in spec order on mobile, splits on desktop) ── */}
        <div className="flex flex-col gap-5 lg:grid lg:grid-cols-3 lg:gap-5 lg:items-start">

          <div className="flex flex-col gap-5 lg:col-span-2">

            {/* Today's Plan */}
            <GlassCard>
              <SectionHeader title="Today's Plan" actionLabel="View All" actionHref="/dashboard/planner" />
              <div className="space-y-2.5">
                {tasks.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => toggleTask(t.id)}
                    className="flex items-center gap-3 w-full text-left group hover:bg-white/5 rounded-lg px-1 py-0.5 transition-colors"
                  >
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                        t.done ? "bg-green-500 border-green-500" : "border-gray-600 group-hover:border-violet-400"
                      }`}
                    >
                      {t.done && <span className="text-white text-xs">✓</span>}
                    </div>
                    <span className={`text-sm flex-1 truncate ${t.done ? "text-gray-500 line-through" : "text-gray-200"}`}>
                      {t.title}
                    </span>
                    <span className="text-xs text-gray-500 flex-shrink-0">{t.time}</span>
                  </button>
                ))}
              </div>
              <div className="mt-4">
                <PremiumProgress value={pct} label={`${doneTasks}/${tasks.length} tasks completed`} />
              </div>
            </GlassCard>

            {/* Focus Shield (compact) */}
            <GlassCard>
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-violet-600/20 flex items-center justify-center text-lg flex-shrink-0">🛡️</div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-white text-sm">Focus Shield</p>
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                          FOCUS_SHIELD_ON ? "bg-green-500/20 text-green-400" : "bg-white/10 text-gray-400"
                        }`}
                      >
                        {FOCUS_SHIELD_ON ? "ON" : "OFF"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">
                      Session: {FOCUS_SESSION_MINUTES} min · Blocking: {FOCUS_BLOCKED_APPS.join(", ")}
                    </p>
                  </div>
                </div>
                <Link href="/dashboard/focus" className="flex-shrink-0">
                  <PremiumButton size="sm">Start Focus</PremiumButton>
                </Link>
              </div>
            </GlassCard>

            {/* Quick Actions */}
            <GlassCard>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Quick Actions</p>
              <div className="grid grid-cols-5 gap-2">
                {QUICK_ACTIONS.map((q) => (
                  <Link
                    key={q.label}
                    href={q.link}
                    className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-white/5 hover:bg-white/12 border border-white/10 hover:border-white/20 transition-all group text-center"
                  >
                    <span className="text-xl">{q.icon}</span>
                    <p className="text-[10px] font-medium text-gray-300 group-hover:text-white leading-tight">{q.label}</p>
                  </Link>
                ))}
              </div>
            </GlassCard>

          </div>

          <div className="flex flex-col gap-5">

            {/* Study Progress */}
            <GlassCard>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-white text-sm">Study Progress</h2>
                <Link href="/dashboard/subjects" className="text-xs text-violet-400 hover:text-violet-300">
                  View Details
                </Link>
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className="relative flex items-center justify-center flex-shrink-0">
                  <ProgressRing pct={EXAM_PROGRESS_PCT} />
                  <span className="absolute text-base font-bold text-white">{EXAM_PROGRESS_PCT}%</span>
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-white text-sm truncate">{EXAM_NAME}</p>
                  <p className="text-xs text-violet-400 mt-0.5">{EXAM_DAYS_LEFT} Days Left</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-sm font-bold text-white">{MOCK_TESTS_DONE}/{MOCK_TESTS_TOTAL}</p>
                  <p className="text-[10px] text-gray-500">Mock Tests</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{NOTES_COUNT}</p>
                  <p className="text-[10px] text-gray-500">Notes</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{WEAK_TOPICS_COUNT}</p>
                  <p className="text-[10px] text-gray-500">Weak Topics</p>
                </div>
              </div>
            </GlassCard>

            {/* Upcoming Revision */}
            <GlassCard>
              <SectionHeader title="Upcoming Revision" actionLabel="View All" actionHref="/dashboard/subjects" />
              <div className="space-y-3">
                {REVISION_ALERTS.map((r) => (
                  <Link
                    key={r.topic}
                    href="/dashboard/subjects"
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer block"
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                      style={{ background: r.color + "22" }}
                    >
                      📖
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{r.topic}</p>
                      <p className="text-xs text-gray-500">{r.when}</p>
                    </div>
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{ background: r.color + "22", color: r.color }}
                    >
                      {r.priority}
                    </span>
                  </Link>
                ))}
              </div>
            </GlassCard>

            {/* Achievements */}
            <GlassCard>
              <SectionHeader title="Achievements" actionLabel="View All" actionHref="/dashboard/achievements" />
              <div className="space-y-3">
                {ACHIEVEMENTS_LIST.map((a) => (
                  <AchievementCard key={a.title} icon={a.icon} title={a.title} description={a.desc} href="/dashboard/achievements" />
                ))}
              </div>
            </GlassCard>

          </div>
        </div>
      </div>

      {/* ── BOTTOM NAVIGATION (mobile only) ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0d0d1a]/95 backdrop-blur-xl border-t border-white/10 z-50">
        <div className="flex items-center justify-around px-2 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
          {BOTTOM_NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${
                  active ? "text-violet-400" : "text-gray-500"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}