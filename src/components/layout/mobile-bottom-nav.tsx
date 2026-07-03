'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { BOTTOM_NAV } from '@/config/nav';

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-white/10 bg-[#0d0d1a]/80 backdrop-blur-xl md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {BOTTOM_NAV.map(({ href, label, icon: Icon }) => {
        const active = href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-1 flex-col items-center gap-0.5 py-2.5 transition-colors"
          >
            <Icon className={cn('h-5 w-5 transition-colors', active ? 'text-violet-400' : 'text-gray-500')} />
            <span className={cn('text-[10px] font-medium transition-colors', active ? 'text-violet-400' : 'text-gray-500')}>
              {label}
            </span>
            {active && <span className="mt-0.5 h-1 w-1 rounded-full bg-violet-400" />}
          </Link>
        );
      })}
    </nav>
  );
}