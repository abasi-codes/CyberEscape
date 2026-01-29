import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';

interface Props {
  children: React.ReactNode;
  active: boolean;
  intensity?: 'light' | 'medium' | 'heavy';
  duration?: number;
}

export default function ScreenShake({ children, active, intensity = 'medium', duration = 500 }: Props) {
  const reducedMotion = useSelector((state: RootState) => state.settings.reducedMotion);
  const [shaking, setShaking] = useState(false);

  useEffect(() => {
    if (!active || reducedMotion) return;

    setShaking(true);
    const timer = setTimeout(() => setShaking(false), duration);
    return () => clearTimeout(timer);
  }, [active, reducedMotion, duration]);

  const intensityClass = {
    light: 'animate-shake [--shake-intensity:2px]',
    medium: 'animate-shake',
    heavy: 'animate-shake [--shake-intensity:8px]',
  }[intensity];

  return (
    <div className={shaking ? intensityClass : ''}>
      {children}
    </div>
  );
}
