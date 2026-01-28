import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => (
    <div className="space-y-1">
      {label && <label htmlFor={id} className="text-sm font-medium text-cyber-muted">{label}</label>}
      <input
        id={id}
        ref={ref}
        className={cn(
          'flex h-10 w-full rounded-lg border bg-cyber-surface px-3 py-2 text-sm text-cyber-text',
          'placeholder:text-cyber-muted/50 focus:outline-none focus:ring-2 focus:ring-cyber-primary',
          error ? 'border-cyber-danger' : 'border-cyber-border',
          className,
        )}
        {...props}
      />
      {error && <p className="text-xs text-cyber-danger">{error}</p>}
    </div>
  ),
);
Input.displayName = 'Input';

export { Input };
