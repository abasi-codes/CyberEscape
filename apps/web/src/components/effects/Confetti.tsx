import { useEffect, useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';

interface ConfettiPiece {
  id: number;
  left: number;
  color: string;
  delay: number;
  duration: number;
  rotation: number;
}

interface Props {
  active: boolean;
  count?: number;
  duration?: number;
  onComplete?: () => void;
}

const COLORS = [
  '#00d4ff', // cyber-primary
  '#00ff88', // cyber-accent
  '#ffaa00', // cyber-warning
  '#ff3355', // cyber-danger
  '#a855f7', // purple
  '#ffffff', // white
];

export default function Confetti({ active, count = 50, duration = 3000, onComplete }: Props) {
  const reducedMotion = useSelector((state: RootState) => state.settings.reducedMotion);
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  const generatedPieces = useMemo(() => {
    if (!active) return [];
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      delay: Math.random() * 0.5,
      duration: 2 + Math.random() * 2,
      rotation: Math.random() * 360,
    }));
  }, [active, count]);

  useEffect(() => {
    if (!active || reducedMotion) {
      setPieces([]);
      return;
    }

    setPieces(generatedPieces);

    const timer = setTimeout(() => {
      setPieces([]);
      onComplete?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [active, reducedMotion, generatedPieces, duration, onComplete]);

  if (!pieces.length) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
      aria-hidden="true"
    >
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute top-0 animate-confetti-fall"
          style={{
            left: `${piece.left}%`,
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
          }}
        >
          <div
            className="h-3 w-2 rounded-sm"
            style={{
              backgroundColor: piece.color,
              transform: `rotate(${piece.rotation}deg)`,
            }}
          />
        </div>
      ))}
    </div>
  );
}
