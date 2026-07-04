"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { GlassCard } from "@/components/dashboard/glass-card";
import { StatCard } from "@/components/dashboard/stat-card";
import { SectionHeader } from "@/components/dashboard/section-header";
import { PremiumButton } from "@/components/dashboard/premium-button";
import { PremiumProgress } from "@/components/dashboard/premium-progress";
import { AchievementCard } from "@/components/dashboard/achievement-card";

// ────────────────────────────────────────────────────────────────────────────
// Shared data
// ────────────────────────────────────────────────────────────────────────────

const INITIAL_TASKS = [
  { id: 1, title: "Physics: Laws of Motion", time: "45m", done: true },
  { id: 2, title: "Maths: Trigonometry", time: "60m", done: true },
  { id: 3, title: "Chemistry: Chemical Bonding", time: "45m", done: false },
  { id: 4, title: "Biology: Plant Kingdom", time: "30m", done: false },
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

// ────────────────────────────────────────────────────────────────────────────
// Desktop-only data (unchanged from the original dashboard)
// ────────────────────────────────────────────────────────────────────────────

const SUBJECTS = [
  { name: "Physics", pct: 78, color: "#3b82f6" },
  { name: "Mathematics", pct: 65, color: "#a855f7" },
  { name: "Chemistry", pct: 54, color: "#22c55e" },
  { name: "Biology", pct: 40, color: "#f97316" },
  { name: "English", pct: 30, color: "#eab308" },
];

const TOOLS = [
  { icon: "📅", title: "Smart Planner", desc: "AI powered study plan that adapts to you.", link: "/dashboard/planner", color: "#8b5cf6", cta: "Create Plan →" },
  { icon: "🔄", title: "Revision System", desc: "Spaced repetition & smart reminders.", link: "/dashboard/subjects", color: "#3b82f6", cta: "Start Revising →" },
  { icon: "📝", title: "Mock Tests", desc: "Chapter-wise & full length tests.", link: "/dashboard/mock-tests", color: "#22c55e", cta: "Attempt Test →" },
  { icon: "📚", title: "Question Bank", desc: "50000+ questions with solutions.", link: "/dashboard/question-bank", color: "#f97316", cta: "Explore →" },
  { icon: "🃏", title: "Flashcards", desc: "Quick revision with smart flashcards.", link: "/dashboard/flashcards", color: "#06b6d4", cta: "Open →" },
  { icon: "🤖", title: "AI Summarizer", desc: "Summarize notes & get key points.", link: "/dashboard/assistant", color: "#a855f7", cta: "Try Now →" },
];

const DESKTOP_QUICK_ACTIONS = [
  { icon: "🎯", label: "Start Focus", sub: "Deep work timer", link: "/dashboard/focus", color: "#8b5cf6" },
  { icon: "📝", label: "Mock Test", sub: "Test your skills", link: "/dashboard/mock-tests", color: "#3b82f6" },
  { icon: "🔄", label: "Revision", sub: "Revise weak topics", link: "/dashboard/subjects", color: "#f97316" },
  { icon: "📒", label: "Notes", sub: "Create / View notes", link: "/dashboard/notes", color: "#22c55e" },
  { icon: "📚", label: "Question Bank", sub: "Practice questions", link: "/dashboard/question-bank", color: "#ef4444" },
  { icon: "🃏", label: "Flashcards", sub: "Smart revision", link: "/dashboard/flashcards", color: "#06b6d4" },
];

const AI_SUGGESTIONS = ["Explain photosynthesis", "Solve this integral", "Newton's 3rd law", "Basic concepts of EMI"];

const DAILY_QUOTES = [
  { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln" },
  { text: "Small daily improvements lead to staggering long-term results.", author: "Robin Sharma" },
  { text: "The expert in anything was once a beginner.", author: "Helen Hayes" },
  { text: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
];

// ────────────────────────────────────────────────────────────────────────────
// Mobile-only data
// ────────────────────────────────────────────────────────────────────────────

const MOBILE_QUICK_ACTIONS = [
  { icon: "📅", label: "Planner", link: "/dashboard/planner", color: "#8b5cf6" },
  { icon: "📝", label: "Notes", link: "/dashboard/notes", color: "#22c55e" },
  { icon: "🃏", label: "Flashcards", link: "/dashboard/flashcards", color: "#06b6d4" },
  { icon: "🤖", label: "AI Assistant", link: "/dashboard/assistant", color: "#a855f7" },
  { icon: "📔", label: "Journal", link: "/dashboard/journal", color: "#f97316" },
];

// Level / XP — static placeholder, wire to real profile/XP tracking when available
const USER_LEVEL = 14;
const XP_CURRENT = 3250;
const XP_NEXT_LEVEL = 5000;

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

// ────────────────────────────────────────────────────────────────────────────
// Small chart / graphic helpers (desktop only)
// ────────────────────────────────────────────────────────────────────────────

function Sparkline({ color = "#a78bfa", up = true }: { color?: string; up?: boolean }) {
  const pts = up ? "0,28 10,22 20,24 30,14 40,18 50,8 60,12" : "0,12 10,18 20,14 30,24 40,20 50,28 60,22";
  return (
    <svg width="60" height="32" viewBox="0 0 60 32" fill="none">
      <polyline points={pts} stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function WeeklyChart() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const vals = [1.5, 2.2, 1.8, 3.5, 2.8, 4.2, 3.0];
  const max = 5;
  const w = 420, h = 120, pad = 24;
  const xs = vals.map((_, i) => pad + (i / (vals.length - 1)) * (w - pad * 2));
  const ys = vals.map((v) => h - pad - (v / max) * (h - pad * 2));
  const pts = xs.map((x, i) => `${x},${ys[i]}`).join(" ");
  const area = `M${xs[0]},${ys[0]} ` + xs.slice(1).map((x, i) => `L${x},${ys[i + 1]}`).join(" ") + ` L${xs[xs.length - 1]},${h - pad} L${xs[0]},${h - pad} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 120 }}>
      <defs>
        <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {[0, 2, 4].map((v) => {
        const y = h - pad - (v / max) * (h - pad * 2);
        return (
          <g key={v}>
            <line x1={pad} y1={y} x2={w - pad} y2={y} stroke="#ffffff10" strokeWidth="1" />
            <text x={pad - 4} y={y + 4} fill="#555" fontSize="9" textAnchor="end">{v}h</text>
          </g>
        );
      })}
      <path d={area} fill="url(#cg)" />
      <polyline points={pts} fill="none" stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {xs.map((x, i) => (
        <circle key={i} cx={x} cy={ys[i]} r="3.5" fill="#8b5cf6" stroke="#0d0d1a" strokeWidth="1.5" />
      ))}
      {days.map((d, i) => (
        <text key={d} x={xs[i]} y={h - 4} fill="#666" fontSize="9" textAnchor="middle">{d}</text>
      ))}
    </svg>
  );
}

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

// ────────────────────────────────────────────────────────────────────────────
// Page
// ────────────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();
  const [aiQuery, setAiQuery] = useState("");
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [quote, setQuote] = useState(DAILY_QUOTES[0]);
  const [user, setUser] = useState<{ name: string; photoURL: string | null } | null>(null);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  useEffect(() => {
    const saved = localStorage.getItem("ss_today_tasks");
    if (saved) setTasks(JSON.parse(saved));
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    setQuote(DAILY_QUOTES[dayOfYear % DAILY_QUOTES.length]);
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

  const handleAiSubmit = () => {
    if (!aiQuery.trim()) return;
    router.push(`/dashboard/assistant?q=${encodeURIComponent(aiQuery)}`);
  };

  // Daily study goal (static placeholder — wire to real tracking data when available)
  const STUDY_GOAL_MINUTES = 240; // 4h
  const STUDY_DONE_MINUTES = 165; // 2h45m
  const goalPct = Math.round((STUDY_DONE_MINUTES / STUDY_GOAL_MINUTES) * 100);

  const displayName = user?.name || "Hraydesh";
  const avatarLetter = (user?.name?.[0] || "H").toUpperCase();

  return (
    <div className="min-h-screen w-full max-w-full bg-[#0d0d1a] text-white overflow-x-hidden overscroll-y-contain">

      {/* ══════════════════════════════════════════════════════════════════
          MOBILE LAYOUT (< md) — compact, single column, bottom nav
      ══════════════════════════════════════════════════════════════════ */}
      <div className="md:hidden p-4 space-y-5 w-full pb-24">

        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={displayName}
                referrerPolicy="no-referrer"
                className="w-14 h-14 rounded-full object-cover flex-shrink-0 ring-2 ring-white/10"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-xl font-bold flex-shrink-0 ring-2 ring-white/10">
                {avatarLetter}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-gray-400 text-sm">{greeting},</p>
              <h1 className="text-xl font-bold text-white leading-tight truncate">
                {displayName}! <span>👋</span>
              </h1>
              <span className="inline-block mt-1 text-[11px] font-semibold bg-violet-600/30 text-violet-300 px-2 py-0.5 rounded-full">
                Lv {USER_LEVEL}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <PremiumButton size="sm" onClick={() => router.push("/dashboard/planner")}>
              <span>+</span> Quick Add
            </PremiumButton>
          </div>
        </div>

        <div className="-mt-2">
          <p className="text-[11px] text-gray-400">Level {USER_LEVEL} · {XP_CURRENT.toLocaleString()} / {XP_NEXT_LEVEL.toLocaleString()} XP</p>
          <div className="w-full h-1.5 bg-white/10 rounded-full mt-1 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full" style={{ width: `${xpPct}%` }} />
          </div>
        </div>

        {/* Stats 2x2 */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard icon="⏱️" label="Study Time" value="2h 45m" sub="↑ 28% vs yesterday" subClassName="text-green-400" />
          <StatCard icon="🔥" label="Streak" value="12 Days" sub="Keep it going!" subClassName="text-orange-400" />
          <StatCard icon="✅" label="Tasks Done" value={`${doneTasks}/${tasks.length}`} sub="Keep pushing!" subClassName="text-blue-400" />
          <StatCard icon="⚡" label="Focus Score" value="82/100" sub="Excellent! 🔥" subClassName="text-violet-400" />
        </div>

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

        {/* Focus Shield */}
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
            {MOBILE_QUICK_ACTIONS.map((q) => (
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

      {/* Bottom nav is already provided globally by <MobileBottomNav /> in the dashboard layout — not duplicated here */}

      {/* ══════════════════════════════════════════════════════════════════
          DESKTOP LAYOUT (>= md) — original dashboard, unchanged
      ══════════════════════════════════════════════════════════════════ */}
      <div className="hidden md:block p-6 max-w-[1400px] mx-auto space-y-5 w-full">

        {/* HERO HEADER */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-gray-400 text-sm">{greeting},</p>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              {displayName}! <span>👋</span>
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">Consistency today, success tomorrow.</p>
          </div>
          <PremiumButton onClick={() => router.push("/dashboard/planner")}>
            <span>+</span> Quick Add
          </PremiumButton>
        </div>

        {/* STAT CARDS */}
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
          <StatCard icon="⏱️" label="Study Time Today" value="2h 45m" sub="↑ 28% vs yesterday" subClassName="text-green-400" />
          <StatCard icon="🔥" label="Streak" value="12 Days" sub="Keep it going!" subClassName="text-orange-400" />
          <StatCard icon="⚡" label="Focus Score" value="82/100" sub="Excellent! 🔥" subClassName="text-violet-400" />
          <StatCard icon="✅" label="Tasks Done" value={`${doneTasks}/${tasks.length}`} sub="Keep pushing!" subClassName="text-blue-400" />
          <StatCard icon="⭐" label="XP Today" value="220 XP" sub="Total XP: 3250" subClassName="text-yellow-400" />
        </div>

        {/* DAILY QUOTE */}
        <GlassCard className="bg-gradient-to-r from-violet-950/40 to-blue-950/20 border-violet-500/20">
          <div className="flex items-start gap-3">
            <span className="text-2xl leading-none">💬</span>
            <div>
              <p className="text-sm italic text-gray-200 leading-relaxed">&ldquo;{quote.text}&rdquo;</p>
              <p className="text-xs text-violet-400 mt-1.5">— {quote.author}</p>
            </div>
          </div>
        </GlassCard>

        {/* CHART + SUBJECTS + AI TUTOR */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <GlassCard>
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-semibold text-white">Study Overview</h2>
              <span className="text-xs bg-white/10 text-gray-300 px-2 py-1 rounded-lg">This Week</span>
            </div>
            <p className="text-2xl font-bold text-white mt-1">18h 30m</p>
            <p className="text-xs text-green-400 mb-3">↑ 32% vs last week</p>
            <WeeklyChart />
          </GlassCard>

          <GlassCard>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-white">Subjects Progress</h2>
              <span className="text-violet-400 font-semibold text-sm">68%</span>
            </div>
            <div className="mb-4">
              <PremiumProgress value={68} label="Overall Progress" />
            </div>
            {SUBJECTS.map((s) => (
              <div key={s.name} className="mb-3">
                <PremiumProgress value={s.pct} label={s.name} color={s.color} barClassName="" />
              </div>
            ))}
          </GlassCard>

          <GlassCard className="flex flex-col">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center text-xl">🤖</div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-white">AI Tutor</h2>
                  <span className="text-xs bg-violet-600 text-white px-2 py-0.5 rounded-full">New</span>
                </div>
                <p className="text-xs text-gray-400">Ask anything. Get instant explanations.</p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-white/8 border border-white/10 rounded-xl px-3 py-2 mb-3">
              <input
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAiSubmit()}
                placeholder="Ask a question..."
                className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none"
              />
              <button
                onClick={handleAiSubmit}
                className="w-7 h-7 bg-violet-600 rounded-lg flex items-center justify-center text-xs hover:bg-violet-700 active:scale-95 transition-all"
              >➤</button>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
              {AI_SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => { setAiQuery(s); router.push(`/dashboard/assistant?q=${encodeURIComponent(s)}`); }}
                  className="text-xs bg-white/8 hover:bg-white/15 text-gray-300 px-2 py-1.5 rounded-lg text-left transition-colors border border-white/10 truncate">
                  {s}
                </button>
              ))}
            </div>

            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Quick Actions</p>
            <div className="grid grid-cols-3 gap-2">
              {DESKTOP_QUICK_ACTIONS.map((q) => (
                <Link key={q.label} href={q.link}
                  className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-white/5 hover:bg-white/12 border border-white/10 hover:border-white/20 transition-all group text-center">
                  <span className="text-xl">{q.icon}</span>
                  <p className="text-xs font-medium text-gray-300 group-hover:text-white leading-tight">{q.label}</p>
                </Link>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* FOCUS TIMER + STUDY GOAL + WEEKLY INSIGHTS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <GlassCard className="flex flex-col items-center text-center">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 self-start">Focus Timer</p>
            <div className="relative w-24 h-24 flex items-center justify-center mb-3">
              <svg className="w-24 h-24 -rotate-90">
                <circle cx="48" cy="48" r="40" stroke="#ffffff15" strokeWidth="6" fill="none" />
                <circle cx="48" cy="48" r="40" stroke="#8b5cf6" strokeWidth="6" fill="none"
                  strokeDasharray={2 * Math.PI * 40} strokeDashoffset={2 * Math.PI * 40 * 0.32} strokeLinecap="round" />
              </svg>
              <span className="absolute text-sm font-bold text-white">17:02</span>
            </div>
            <p className="text-xs text-gray-500 mb-3">Deep Focus Session</p>
            <Link href="/dashboard/focus" className="w-full">
              <PremiumButton size="sm" className="w-full">Resume Focus</PremiumButton>
            </Link>
          </GlassCard>

          <GlassCard>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Study Goal</p>
            <p className="text-2xl font-bold text-white">2h 45m <span className="text-sm font-normal text-gray-500">/ 4h</span></p>
            <p className="text-xs text-gray-500 mb-4">{goalPct}% of today&apos;s goal complete</p>
            <PremiumProgress value={goalPct} showValue={false} />
            <p className="text-xs text-violet-400 mt-3">🎯 1h 15m left to hit your goal</p>
          </GlassCard>

          <GlassCard>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Weekly Insights</p>
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-green-400">↑</span>
                <span className="text-gray-300">Most productive day: <span className="text-white font-medium">Saturday</span></span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-violet-400">⏰</span>
                <span className="text-gray-300">Peak focus time: <span className="text-white font-medium">4–6 PM</span></span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-orange-400">📚</span>
                <span className="text-gray-300">Top subject: <span className="text-white font-medium">Physics</span></span>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* STUDY TOOLS */}
        <div>
          <h2 className="font-bold text-white text-lg mb-3">Powerful Study Tools</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {TOOLS.map((t) => (
              <Link key={t.title} href={t.link}
                className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:border-violet-500/50 hover:bg-white/8 transition-all group block">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3" style={{ background: t.color + "22" }}>
                  {t.icon}
                </div>
                <p className="font-semibold text-white text-sm mb-1">{t.title}</p>
                <p className="text-xs text-gray-500 mb-3 leading-relaxed">{t.desc}</p>
                <span className="text-xs font-medium text-violet-400 group-hover:text-violet-300 transition-colors">{t.cta}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* BOTTOM GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <GlassCard>
            <SectionHeader title="Today's Plan" actionLabel="View Planner" actionHref="/dashboard/planner" />
            <div className="space-y-2.5">
              {tasks.map((t) => (
                <button key={t.id} onClick={() => toggleTask(t.id)}
                  className="flex items-center gap-3 w-full text-left group hover:bg-white/5 rounded-lg px-1 py-0.5 transition-colors">
                  <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${t.done ? "bg-green-500 border-green-500" : "border-gray-600 group-hover:border-violet-400"}`}>
                    {t.done && <span className="text-white text-xs">✓</span>}
                  </div>
                  <span className={`text-sm flex-1 truncate ${t.done ? "text-gray-500 line-through" : "text-gray-200"}`}>{t.title}</span>
                  <span className="text-xs text-gray-500 flex-shrink-0">{t.time}</span>
                </button>
              ))}
            </div>
            <div className="mt-4">
              <PremiumProgress value={pct} label={`${doneTasks}/${tasks.length} tasks completed`} />
            </div>
          </GlassCard>

          <GlassCard>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-white">Performance Analytics</h2>
              <span className="text-xs bg-white/10 text-gray-300 px-2 py-1 rounded-lg">This Month</span>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { label: "Accuracy", value: "78%", change: "+8%", color: "#8b5cf6" },
                { label: "Speed", value: "42 Q/h", change: "+12%", color: "#22c55e" },
                { label: "Consistency", value: "85%", change: "+15%", color: "#3b82f6" },
              ].map((m) => (
                <div key={m.label} className="text-center">
                  <p className="text-xs text-gray-400 mb-1">{m.label}</p>
                  <p className="text-base font-bold text-white">{m.value}</p>
                  <div className="flex justify-center mt-1"><Sparkline color={m.color} /></div>
                  <p className="text-xs text-green-400">{m.change}</p>
                </div>
              ))}
            </div>
            <Link href="/dashboard/subjects"
              className="block text-center text-xs text-violet-400 hover:text-violet-300 border border-white/10 hover:border-violet-500/40 rounded-lg py-2 transition-colors">
              View Detailed Analytics →
            </Link>
          </GlassCard>

          <GlassCard>
            <SectionHeader title="Revision Alert" actionLabel="View All" actionHref="/dashboard/subjects" />
            <div className="space-y-3">
              {REVISION_ALERTS.map((r) => (
                <Link key={r.topic} href="/dashboard/subjects"
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer block">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0" style={{ background: r.color + "22" }}>📖</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{r.topic}</p>
                    <p className="text-xs text-gray-500">{r.when}</p>
                  </div>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: r.color + "22", color: r.color }}>
                    {r.priority}
                  </span>
                </Link>
              ))}
            </div>
          </GlassCard>

          <GlassCard>
            <SectionHeader title="Achievements" actionLabel="View All" actionHref="/dashboard/achievements" />
            <div className="space-y-3">
              {ACHIEVEMENTS_LIST.map((a) => (
                <AchievementCard key={a.title} icon={a.icon} title={a.title} description={a.desc} href="/dashboard/achievements" />
              ))}
            </div>
          </GlassCard>
        </div>

        {/* BOTTOM STATS BAR */}
        <GlassCard>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {[
              { icon: "🎯", label: "Daily Goal", value: "2h 45m / 4h", link: "/dashboard/focus" },
              { icon: "📖", label: "Syllabus Progress", value: "53%", link: "/dashboard/subjects" },
              { icon: "📝", label: "Tests Taken", value: "12", link: "/dashboard/mock-tests" },
              { icon: "✅", label: "Accuracy", value: "78%", link: "/dashboard/mock-tests" },
              { icon: "🏆", label: "Rank", value: "#142", sub: "In leaderboard", link: "/dashboard/achievements" },
            ].map((s) => (
              <Link key={s.label} href={s.link} className="flex items-center gap-3 flex-1 min-w-[120px] group hover:opacity-80 transition-opacity">
                <span className="text-2xl">{s.icon}</span>
                <div>
                  <p className="text-xs text-gray-400">{s.label}</p>
                  <p className="font-bold text-white group-hover:text-violet-300 transition-colors">{s.value}</p>
                  {s.sub && <p className="text-xs text-gray-500">{s.sub}</p>}
                </div>
              </Link>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}