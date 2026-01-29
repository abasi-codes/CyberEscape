import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';

interface Props {
  opacity?: number;
}

export default function ScanlineOverlay({ opacity = 0.03 }: Props) {
  const reducedMotion = useSelector((state: RootState) => state.settings.reducedMotion);

  if (reducedMotion) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
      aria-hidden="true"
    >
      {/* Scanline effect */}
      <div
        className="absolute inset-0 animate-scan-line"
        style={{
          background: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 212, 255, ${opacity}) 2px,
            rgba(0, 212, 255, ${opacity}) 4px
          )`,
          backgroundSize: '100% 4px',
        }}
      />
      {/* CRT flicker overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.15) 100%)',
        }}
      />
    </div>
  );
}
