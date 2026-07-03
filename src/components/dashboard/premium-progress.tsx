import * as React from 'react';
import { cn } from '@/lib/utils';

export interface PremiumProgressProps {
  value: number; // 0-100
  label?: string;
  showValue?: boolean;
  color?: string; // any valid CSS color, defaults to violet-blue gradient
  className?: string;
  barClassName?: string;
}

/** Slim labeled progress bar used for subjects, tasks, and goal tracking. */
export function PremiumProgress({
  value,
  label,
  showValue = true,
  color,
  className,
  barClassName,
}: PremiumProgressProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={cn('w-full', className)}>
      {(label || showValue) && (
        <div className="mb-1 flex justify-between text-xs">
          {label && <span className="text-gray-300">{label}</span>}
          {showValue && <span className="text-gray-400">{clamped}%</span>}
        </div>
      )}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            !color && 'bg-gradient-to-r from-violet-500 to-blue-500',
            barClassName
          )}
          style={{ width: `${clamped}%`, ...(color ? { background: color } : {}) }}
        />
      </div>
    </div>
  );
}