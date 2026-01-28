import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '@/lib/utils';

export const TooltipProvider = TooltipPrimitive.Provider;
export const Tooltip = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;

export function TooltipContent({ className, ...props }: TooltipPrimitive.TooltipContentProps) {
  return (
    <TooltipPrimitive.Content
      className={cn(
        'z-50 rounded-lg border border-cyber-border bg-cyber-card px-3 py-1.5 text-xs text-cyber-text shadow-md',
        className,
      )}
      sideOffset={4}
      {...props}
    />
  );
}
