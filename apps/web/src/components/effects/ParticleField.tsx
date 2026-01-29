import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';

interface Particle {
  id: number;
  left: string;
  top: string;
  size: number;
  duration: number;
  delay: number;
  color: string;
}

interface Props {
  count?: number;
  color?: string;
}

export default function ParticleField({ count = 30, color = 'cyber-primary' }: Props) {
  const reducedMotion = useSelector((state: RootState) => state.settings.reducedMotion);

  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 15 + 10,
      delay: Math.random() * 10,
      color: color,
    }));
  }, [count, color]);

  if (reducedMotion) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    >
      {particles.map((p) => (
        <div
          key={p.id}
          className={`absolute rounded-full animate-particle-drift bg-${p.color}`}
          style={{
            left: p.left,
            top: p.top,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            opacity: 0.4,
          }}
        />
      ))}
    </div>
  );
}
