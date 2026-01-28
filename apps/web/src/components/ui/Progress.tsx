import * as ProgressPrimitive from '@radix-ui/react-progress';
import { cn } from '@/lib/utils';

interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
  indicatorClassName?: string;
}

export function Progress({ value, max = 100, className, indicatorClassName }: ProgressProps) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <ProgressPrimitive.Root
      className={cn('relative h-2 w-full overflow-hidden rounded-full bg-cyber-surface', className)}
      value={value}
      max={max}
    >
      <ProgressPrimitive.Indicator
        className={cn('h-full rounded-full bg-cyber-primary transition-all', indicatorClassName)}
        style={{ width: `${pct}%` }}
      />
    </ProgressPrimitive.Root>
  );
}
