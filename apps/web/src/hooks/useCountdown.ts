import { useEffect, useRef } from 'react';
import { getTimeMilestone } from './useUrgency';

export function useCountdown(
  seconds: number,
  onTick: () => void,
  onZero: () => void,
  active: boolean,
  onMilestone?: (milestone: string) => void
) {
  const tickRef = useRef(onTick);
  const zeroRef = useRef(onZero);
  const milestoneRef = useRef(onMilestone);
  const previousTimeRef = useRef(seconds);

  tickRef.current = onTick;
  zeroRef.current = onZero;
  milestoneRef.current = onMilestone;

  useEffect(() => {
    if (!active) return;

    const interval = setInterval(() => {
      tickRef.current();
    }, 1000);

    return () => clearInterval(interval);
  }, [active]);

  // Check for milestones when seconds change
  useEffect(() => {
    if (!active) return;

    const milestone = getTimeMilestone(seconds, previousTimeRef.current);
    if (milestone && milestoneRef.current) {
      milestoneRef.current(milestone);
    }

    previousTimeRef.current = seconds;

    if (seconds <= 0 && zeroRef.current) {
      zeroRef.current();
    }
  }, [seconds, active]);
}

// Hook for components that just want milestone events
export function useTimeMilestones(
  seconds: number,
  active: boolean,
  onMilestone: (milestone: string) => void
) {
  const previousTimeRef = useRef(seconds);
  const callbackRef = useRef(onMilestone);
  callbackRef.current = onMilestone;

  useEffect(() => {
    if (!active) return;

    const milestone = getTimeMilestone(seconds, previousTimeRef.current);
    if (milestone) {
      callbackRef.current(milestone);
    }

    previousTimeRef.current = seconds;
  }, [seconds, active]);
}
