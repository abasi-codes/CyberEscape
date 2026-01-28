import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { cn } from '@/lib/utils';

export function Avatar({ className, src, fallback }: { className?: string; src?: string; fallback: string }) {
  return (
    <AvatarPrimitive.Root className={cn('relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full', className)}>
      <AvatarPrimitive.Image src={src} className="aspect-square h-full w-full" />
      <AvatarPrimitive.Fallback className="flex h-full w-full items-center justify-center rounded-full bg-cyber-primary/20 text-sm font-medium text-cyber-primary">
        {fallback}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );
}
