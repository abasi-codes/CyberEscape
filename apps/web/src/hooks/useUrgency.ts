import { useMemo } from 'react';

export type UrgencyLevel = 'normal' | 'warning' | 'urgent' | 'critical';

interface UrgencyConfig {
  level: UrgencyLevel;
  timerClass: string;
  showVignette: boolean;
  vignetteIntensity: number;
  playWarningSound: boolean;
  playAlarm: boolean;
  playHeartbeat: boolean;
}

const URGENCY_THRESHOLDS = {
  warning: 300, // 5 minutes
  urgent: 60,   // 1 minute
  critical: 30, // 30 seconds
};

export function useUrgency(timeRemaining: number, timeLimit: number): UrgencyConfig {
  return useMemo(() => {
    // For very short time limits, adjust thresholds proportionally
    const adjustedWarning = Math.min(URGENCY_THRESHOLDS.warning, timeLimit * 0.25);
    const adjustedUrgent = Math.min(URGENCY_THRESHOLDS.urgent, timeLimit * 0.1);
    const adjustedCritical = Math.min(URGENCY_THRESHOLDS.critical, timeLimit * 0.05);

    if (timeRemaining <= adjustedCritical) {
      return {
        level: 'critical',
        timerClass: 'text-cyber-danger animate-pulse-urgent',
        showVignette: true,
        vignetteIntensity: 0.8,
        playWarningSound: false,
        playAlarm: true,
        playHeartbeat: true,
      };
    }

    if (timeRemaining <= adjustedUrgent) {
      return {
        level: 'urgent',
        timerClass: 'text-cyber-warning',
        showVignette: true,
        vignetteIntensity: 0.5,
        playWarningSound: true,
        playAlarm: false,
        playHeartbeat: false,
      };
    }

    if (timeRemaining <= adjustedWarning) {
      return {
        level: 'warning',
        timerClass: 'text-cyber-warning',
        showVignette: true,
        vignetteIntensity: 0.3,
        playWarningSound: false,
        playAlarm: false,
        playHeartbeat: false,
      };
    }

    return {
      level: 'normal',
      timerClass: 'text-cyber-text',
      showVignette: false,
      vignetteIntensity: 0,
      playWarningSound: false,
      playAlarm: false,
      playHeartbeat: false,
    };
  }, [timeRemaining, timeLimit]);
}

// Specific time milestones for triggering one-shot effects
export function getTimeMilestone(timeRemaining: number, previousTime: number): string | null {
  const milestones = [300, 60, 30, 10, 5];

  for (const milestone of milestones) {
    if (previousTime > milestone && timeRemaining <= milestone) {
      return `${milestone}s`;
    }
  }

  return null;
}
