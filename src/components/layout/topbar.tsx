'use client';

import { useRouter } from 'next/navigation';
import { LogOut, User as UserIcon, Bell, Search, Menu } from 'lucide-react';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { signOut } from '@/lib/auth/service';
import { useMobileNavStore } from '@/store/use-mobile-nav-store';

export function Topbar() {
  const { user } = useAuth();
  const router = useRouter();
  const { openDrawer } = useMobileNavStore();

  async function handleSignOut() {
    await signOut();
    router.push('/login');
  }

  return (
    <header className="glass sticky top-0 z-20 flex h-12 md:h-16 items-center justify-between rounded-none px-3 md:px-6 bg-[#0d0d1a]/90 md:bg-transparent backdrop-blur-xl">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden h-8 w-8 text-white"
          aria-label="Open menu"
          onClick={openDrawer}
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="hidden md:flex items-center gap-2 bg-muted rounded-lg px-3 py-2 w-64">
          <Search className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Search anything...</span>
          <span className="ml-auto text-xs text-muted-foreground border rounded px-1">Ctrl K</span>
        </div>
      </div>

      <div className="flex items-center gap-1 md:gap-2 ml-auto">
        <div className="hidden md:block">
          <ThemeToggle />
        </div>
        <Button variant="ghost" size="icon" className="hidden md:flex h-8 w-8 md:h-10 md:w-10 text-white" aria-label="Notifications">
          <Bell className="h-4 w-4 md:h-5 md:w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="hidden md:flex" aria-label="Profile">
          <UserIcon className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="hidden md:flex" aria-label="Sign out" onClick={handleSignOut}>
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}