import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
  {
    variants: {
      variant: {
        default: 'bg-cyber-primary/20 text-cyber-primary',
        success: 'bg-cyber-accent/20 text-cyber-accent',
        warning: 'bg-cyber-warning/20 text-cyber-warning',
        danger: 'bg-cyber-danger/20 text-cyber-danger',
        muted: 'bg-cyber-border text-cyber-muted',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
