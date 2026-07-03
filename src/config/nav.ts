import {
  LayoutDashboard, CalendarCheck, Timer, ShieldCheck, NotebookPen,
  BookOpen, Sparkles, BookHeart, Layers, Home
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  ready: boolean;
}

export const NAV: NavItem[] = [
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

// Subset shown in the fixed bottom tab bar (image reference: Home / Planner / Focus / Notes / AI)
export const BOTTOM_NAV: NavItem[] = [
  { href: '/dashboard', label: 'Home', icon: Home, ready: true },
  { href: '/dashboard/planner', label: 'Planner', icon: CalendarCheck, ready: true },
  { href: '/dashboard/focus', label: 'Focus', icon: Timer, ready: true },
  { href: '/dashboard/notes', label: 'Notes', icon: NotebookPen, ready: true },
  { href: '/dashboard/assistant', label: 'AI', icon: Sparkles, ready: true },
];