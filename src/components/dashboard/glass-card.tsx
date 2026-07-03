import * as React from 'react';
import { cn } from '@/lib/utils';

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Removes default padding when the card manages its own inner spacing. */
  noPadding?: boolean;
}

/** Base translucent card used across the premium dashboard. */
export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, noPadding, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-2xl border border-white/10 bg-white/5 shadow-sm transition-colors hover:border-white/15',
        !noPadding && 'p-5',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);
GlassCard.displayName = 'GlassCard';