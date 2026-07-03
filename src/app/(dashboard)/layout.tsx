import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { MobileDrawer } from '@/components/layout/mobile-drawer';
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav';
import { BackButtonHandler } from '@/components/layout/back-button-handler';

/** Authenticated app shell. Access is guarded by src/middleware.ts. */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      <MobileDrawer />
      <BackButtonHandler />

      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar />
        <main className="flex-1 p-4 pb-24 md:p-6 md:pb-6">{children}</main>
      </div>

      <MobileBottomNav />
    </div>
  );
}