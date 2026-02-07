import { Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PremiumBadgeProps {
  className?: string;
  size?: 'sm' | 'md';
}

export function PremiumBadge({ className, size = 'sm' }: PremiumBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-bold rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 shadow-sm',
        size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-1',
        className
      )}
    >
      <Crown className={size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
      PRO
    </span>
  );
}
