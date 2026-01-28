import * as DropdownPrimitive from '@radix-ui/react-dropdown-menu';
import { cn } from '@/lib/utils';

export const DropdownMenu = DropdownPrimitive.Root;
export const DropdownMenuTrigger = DropdownPrimitive.Trigger;

export function DropdownMenuContent({ className, ...props }: DropdownPrimitive.DropdownMenuContentProps) {
  return (
    <DropdownPrimitive.Portal>
      <DropdownPrimitive.Content
        className={cn(
          'z-50 min-w-[8rem] rounded-lg border border-cyber-border bg-cyber-card p-1 shadow-xl',
          className,
        )}
        sideOffset={4}
        {...props}
      />
    </DropdownPrimitive.Portal>
  );
}

export function DropdownMenuItem({ className, ...props }: DropdownPrimitive.DropdownMenuItemProps) {
  return (
    <DropdownPrimitive.Item
      className={cn(
        'relative flex cursor-pointer select-none items-center rounded-md px-2 py-1.5 text-sm outline-none',
        'hover:bg-cyber-surface data-[highlighted]:bg-cyber-surface',
        className,
      )}
      {...props}
    />
  );
}

export function DropdownMenuSeparator({ className, ...props }: DropdownPrimitive.DropdownMenuSeparatorProps) {
  return <DropdownPrimitive.Separator className={cn('-mx-1 my-1 h-px bg-cyber-border', className)} {...props} />;
}
