import * as React from 'react';
import { cn } from '@/lib/utils';
import { GlassCard } from './glass-card';

export interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  subClassName?: string;
  className?: string;
}

/** Compact metric card used in the horizontally-scrolling stats row. */
export function StatCard({ icon, label, value, sub, subClassName, className }: StatCardProps) {
  return (
    <GlassCard className={cn('min-w-[140px] flex-1', className)}>
      <div className="mb-2 flex items-center gap-2">
        <span className="text-lg leading-none">{icon}</span>
        <span className="truncate text-xs text-gray-400">{label}</span>
      </div>
      <p className="text-xl font-bold text-white">{value}</p>
      {sub && <p className={cn('mt-1 text-xs', subClassName ?? 'text-gray-400')}>{sub}</p>}
    </GlassCard>
  );
}