'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, CalendarCheck, Timer, ShieldCheck, NotebookPen,
  BookOpen, Sparkles, GraduationCap, BookHeart, Layers
} from 'lucide-react';

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, ready: true },
  { href: '/dashboard/planner', label: 'Planner', icon: CalendarCheck, ready: true },
  { href: '/dashboard/pomodoro', label: 'Pomodoro', icon: Timer, ready: true },
  { href: '/dashboard/focus', label: 'Focus Shield', icon: ShieldCheck, ready: true },
  { href: '/dashboard/notes', label: 'Notes', icon: NotebookPen, ready: true },
  { href: '/dashboard/subjects', label: 'Subjects', icon: BookOpen, ready: true },
  { href: '/dashboard/journal', label: 'Journal', icon: BookHeart, ready: true },
  { href: '/dashboard/flashcards', label: 'Flashcards', icon: Layers, ready: true },
  { href: '/dashboard/bushido', label: 'Bushido', icon: ShieldCheck, ready: true },
  { href: '/dashboard/assistant', label: 'AI Assistant', icon: Sparkles, ready: true }
];

const QUOTE = {
  text: "Discipline today, freedom tomorrow.",
  author: "Miyamoto Musashi"
};

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="glass hidden w-64 shrink-0 flex-col rounded-none p-4 md:flex">
      <Link href="/dashboard" className="mb-6 flex items-center gap-2 px-2 font-bold">
        <GraduationCap className="h-6 w-6 text-primary" /> StudySphere
      </Link>

      <nav className="flex flex-col gap-1 flex-1">
        {NAV.map(({ href, label, icon: Icon, ready }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={ready ? href : '#'}
              aria-disabled={!ready}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                active ? 'bg-gradient-brand text-white shadow' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                !ready && 'pointer-events-none opacity-50'
              )}
            >
              <Icon className="h-4 w-4" /> {label}
              {!ready && <span className="ml-auto text-[10px] uppercase">soon</span>}
            </Link>
          );
        })}
      </nav>

      {/* Level & XP */}
      <div className="mt-4 rounded-lg bg-primary/10 p-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">⚡</span>
          <div>
            <p className="text-xs text-muted-foreground">Level 7</p>
            <p className="text-sm font-bold">Samurai</p>
          </div>
        </div>
        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
          <div className="h-1.5 rounded-full bg-primary" style={{ width: '69%' }} />
        </div>
        <p className="text-xs text-muted-foreground mt-1">1,250 / 1,800 XP</p>
        <p className="text-xs text-orange-400 mt-1">🔥 14 Day Streak</p>
      </div>

      {/* Quote */}
      <div className="mt-3 rounded-lg bg-muted/50 p-3">
        <p className="text-xs italic text-muted-foreground">"{QUOTE.text}"</p>
        <p className="text-xs text-primary mt-1">— {QUOTE.author}</p>
      </div>
    </aside>
  );
}