'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { toast } from 'sonner';
import { useMobileNavStore } from '@/store/use-mobile-nav-store';

const ROOT_PATH = '/dashboard';
const EXIT_WINDOW_MS = 2000;

/** Wires the Android hardware back button to: close drawer -> back navigate -> double-tap exit on root. */
export function useAndroidBackButton() {
  const router = useRouter();
  const pathname = usePathname();
  const { drawerOpen, closeDrawer } = useMobileNavStore();
  const lastBackPress = useRef<number>(0);
  const pathnameRef = useRef(pathname);
  const drawerOpenRef = useRef(drawerOpen);

  useEffect(() => { pathnameRef.current = pathname; }, [pathname]);
  useEffect(() => { drawerOpenRef.current = drawerOpen; }, [drawerOpen]);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const listenerPromise = App.addListener('backButton', () => {
      // 1. Drawer open -> close it first
      if (drawerOpenRef.current) {
        closeDrawer();
        return;
      }

      // 2. On dashboard root -> double-tap to exit
      if (pathnameRef.current === ROOT_PATH) {
        const now = Date.now();
        if (now - lastBackPress.current < EXIT_WINDOW_MS) {
          App.exitApp();
        } else {
          lastBackPress.current = now;
          toast('Press back again to exit', { duration: EXIT_WINDOW_MS });
        }
        return;
      }

      // 3. Any nested page -> normal back navigation
      router.back();
    });

    return () => {
      listenerPromise.then((listener) => listener.remove());
    };
  }, [router, closeDrawer]);
}