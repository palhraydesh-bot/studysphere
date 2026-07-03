'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { GraduationCap } from 'lucide-react';
import { NAV } from '@/config/nav';

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="glass flex w-64 shrink-0 flex-col gap-1 rounded-none p-4">
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