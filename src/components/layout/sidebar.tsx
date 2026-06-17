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
  { href: '/dashboard/assistant', label: 'AI Assistant', icon: Sparkles, ready: true },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="glass hidden w-64 shrink-0 flex-col gap-1 rounded-none p-4 md:flex">
      <Link href="/dashboard" className="mb-6 flex items-center gap-2 px-2 font-bold">
        <GraduationCap className="h-6 w-6 text-primary" /> StudySphere
      </Link>
      <nav className="flex flex-col gap-1">
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
    </aside>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  const mobileNav = [
    { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
    { href: '/dashboard/planner', label: 'Planner', icon: CalendarCheck },
    { href: '/dashboard/pomodoro', label: 'Pomodoro', icon: Timer },
    { href: '/dashboard/notes', label: 'Notes', icon: NotebookPen },
    { href: '/dashboard/assistant', label: 'AI', icon: Sparkles },
  ];
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t bg-background px-2 py-2 md:hidden">
      {mobileNav.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex flex-col items-center gap-1 px-2 py-1 text-xs',
              active ? 'text-primary font-semibold' : 'text-muted-foreground'
            )}
          >
            <Icon className="h-5 w-5" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}