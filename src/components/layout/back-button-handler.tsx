'use client';

import { useAndroidBackButton } from '@/hooks/use-android-back-button';

export function BackButtonHandler() {
  useAndroidBackButton();
  return null;
}