import { useEffect, useRef } from 'react';

export function useCountdown(seconds: number, onTick: () => void, onZero: () => void, active: boolean) {
  const tickRef = useRef(onTick);
  const zeroRef = useRef(onZero);
  tickRef.current = onTick;
  zeroRef.current = onZero;

  useEffect(() => {
    if (!active) return;
    const interval = setInterval(() => {
      tickRef.current();
      if (seconds <= 1) zeroRef.current();
    }, 1000);
    return () => clearInterval(interval);
  }, [active, seconds]);
}
