import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';

interface Props {
  trigger: boolean;
  color?: string;
  duration?: number;
}

export default function WarningFlash({ trigger, color = 'rgba(255, 51, 85, 0.3)', duration = 500 }: Props) {
  const reducedMotion = useSelector((state: RootState) => state.settings.reducedMotion);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!trigger || reducedMotion) return;

    setActive(true);
    const timer = setTimeout(() => setActive(false), duration);
    return () => clearTimeout(timer);
  }, [trigger, reducedMotion, duration]);

  if (!active) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-50 animate-warning-flash"
      aria-hidden="true"
      style={{ backgroundColor: color }}
    />
  );
}
