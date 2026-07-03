import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface AchievementCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  href?: string;
  className?: string;
}

/** Icon + title + description row used in the Achievements list. */
export function AchievementCard({ icon, title, description, href, className }: AchievementCardProps) {
  const content = (
    <div className={cn('flex items-center gap-3 rounded-xl bg-white/5 p-2.5 transition-colors hover:bg-white/10', className)}>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 text-lg">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-white">{title}</p>
        <p className="truncate text-xs text-gray-500">{description}</p>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }
  return content;
}