'use client';

import { useRouter } from 'next/navigation';
import { LogOut, User as UserIcon } from 'lucide-react';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { signOut } from '@/lib/auth/service';

export function Topbar() {
  const { user } = useAuth();
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.push('/login');
  }

  return (
    <header className="glass sticky top-0 z-10 flex h-16 items-center justify-between rounded-none px-4 md:px-6">
      <div>
        <p className="text-sm text-muted-foreground">Welcome back,</p>
        <p className="font-semibold">{user?.displayName ?? 'Student'}</p>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Button variant="ghost" size="icon" aria-label="Profile"><UserIcon className="h-5 w-5" /></Button>
        <Button variant="ghost" size="icon" aria-label="Sign out" onClick={handleSignOut}>
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
