import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const premiumButtonVariants = cva(
  'inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-xl font-medium transition-all active:scale-95 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-violet-600 text-white shadow-lg shadow-violet-900/40 hover:bg-violet-700',
        outline: 'border border-white/15 text-gray-200 hover:bg-white/10',
        ghost: 'text-violet-400 hover:bg-white/10',
      },
      size: {
        default: 'h-10 px-4 text-sm',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-12 px-6 text-base',
      },
    },
    defaultVariants: { variant: 'primary', size: 'default' },
  }
);

export interface PremiumButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof premiumButtonVariants> {}

export const PremiumButton = React.forwardRef<HTMLButtonElement, PremiumButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(premiumButtonVariants({ variant, size, className }))} {...props} />
  )
);
PremiumButton.displayName = 'PremiumButton';