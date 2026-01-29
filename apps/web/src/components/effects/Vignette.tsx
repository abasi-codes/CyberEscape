import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import { cn } from '@/lib/utils';

interface Props {
  intensity?: number;
  color?: string;
  pulse?: boolean;
  className?: string;
}

export default function Vignette({
  intensity = 0.5,
  color = 'rgba(255, 51, 85, 0.6)',
  pulse = false,
  className,
}: Props) {
  const reducedMotion = useSelector((state: RootState) => state.settings.reducedMotion);

  if (intensity <= 0) return null;

  // Reduce intensity if reduced motion is preferred
  const effectiveIntensity = reducedMotion ? intensity * 0.3 : intensity;

  return (
    <div
      className={cn(
        'pointer-events-none fixed inset-0 z-40',
        pulse && !reducedMotion && 'animate-vignette-pulse',
        className
      )}
      aria-hidden="true"
      style={{
        background: `radial-gradient(ellipse at center, transparent 40%, ${color.replace(')', `, ${effectiveIntensity})`)} 100%)`,
      }}
    />
  );
}
