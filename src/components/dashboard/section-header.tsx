import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
  right?: React.ReactNode;
}

/** "Title + optional View All" pattern used above most dashboard sections. */
export function SectionHeader({
  title,
  subtitle,
  actionLabel,
  actionHref,
  onAction,
  className,
  right,
}: SectionHeaderProps) {
  return (
    <div className={cn('mb-3 flex items-start justify-between gap-3', className)}>
      <div>
        <h2 className="font-semibold text-white">{title}</h2>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      </div>

      {right}

      {actionLabel && actionHref && (
        <Link href={actionHref} className="shrink-0 text-xs text-violet-400 hover:text-violet-300 transition-colors">
          {actionLabel}
        </Link>
      )}
      {actionLabel && onAction && !actionHref && (
        <button onClick={onAction} className="shrink-0 text-xs text-violet-400 hover:text-violet-300 transition-colors">
          {actionLabel}
        </button>
      )}
    </div>
  );
}