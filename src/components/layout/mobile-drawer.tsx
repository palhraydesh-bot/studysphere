'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { LogOut, Settings, X } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { signOut } from '@/lib/auth/service';
import { useMobileNavStore } from '@/store/use-mobile-nav-store';
import { NAV } from '@/config/nav';
import { cn } from '@/lib/utils';

// Static placeholders — matches values currently shown in src/app/(dashboard)/page.tsx.
// TODO: replace with a real gamification hook/store once one exists.
const TOTAL_XP = 3250;
const STREAK_DAYS = 12;
const LEVEL = Math.floor(TOTAL_XP / 250) + 1;

export function MobileDrawer() {
  const { drawerOpen, closeDrawer } = useMobileNavStore();
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    closeDrawer();
    await signOut();
    router.push('/login');
  }

  const initials = (user?.displayName ?? user?.email ?? 'S')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <AnimatePresence>
      {drawerOpen && (
        <>
          {/* Overlay */}
          <motion.div
            key="drawer-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
            onClick={closeDrawer}
          />

          {/* Panel */}
          <motion.aside
            key="drawer-panel"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="fixed inset-y-0 left-0 z-50 flex w-[82%] max-w-xs flex-col border-r border-white/10 bg-[#0d0d1a]/95 backdrop-blur-xl shadow-2xl md:hidden"
            style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Menu</span>
              <button
                onClick={closeDrawer}
                aria-label="Close menu"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Profile */}
            <div className="flex items-center gap-3 px-4 py-4 mt-1">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-brand text-sm font-bold text-white shrink-0 overflow-hidden">
                {user?.photoURL ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.photoURL} alt={user.displayName ?? 'Profile'} className="h-full w-full object-cover" />
                ) : (
                  initials
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold text-white">{user?.displayName ?? 'Student'}</p>
                <p className="text-xs text-gray-400">Level {LEVEL} • {TOTAL_XP.toLocaleString()} XP</p>
              </div>
            </div>

            {/* XP / Streak strip */}
            <div className="mx-4 mb-2 grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                <p className="text-[10px] uppercase tracking-wide text-gray-500">Streak</p>
                <p className="text-sm font-bold text-orange-400">🔥 {STREAK_DAYS} Days</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                <p className="text-[10px] uppercase tracking-wide text-gray-500">Level</p>
                <p className="text-sm font-bold text-violet-400">⭐ {LEVEL}</p>
              </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
              {NAV.map(({ href, label, icon: Icon, ready }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={ready ? href : '#'}
                    onClick={closeDrawer}
                    aria-disabled={!ready}
                    className={cn(
                      'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                      active
                        ? 'bg-gradient-brand text-white shadow'
                        : 'text-gray-300 hover:bg-white/10 hover:text-white',
                      !ready && 'pointer-events-none opacity-50'
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" /> {label}
                    {!ready && <span className="ml-auto text-[10px] uppercase">soon</span>}
                  </Link>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="border-t border-white/10 px-2 py-2 space-y-0.5">
              <Link
                href="/dashboard/settings"
                onClick={closeDrawer}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
              >
                <Settings className="h-4 w-4" /> Settings
              </Link>
              <button
                onClick={handleSignOut}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}