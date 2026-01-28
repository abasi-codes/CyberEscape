export interface HintConfig {
  hints: string[];
  hintsUsed: number;
  timeSpent: number;
  timeLimit: number;
  attempts: number;
}

export function getNextHint(config: HintConfig): { hint: string; index: number } | null {
  const { hints, hintsUsed } = config;
  if (hintsUsed >= hints.length) return null;
  return { hint: hints[hintsUsed], index: hintsUsed };
}

export function calculateHintCost(basePoints: number, hintIndex: number): number {
  return Math.round(basePoints * 0.15 * (hintIndex + 1));
}

export function shouldAutoSuggest(config: HintConfig): boolean {
  const { hintsUsed, hints, timeSpent, timeLimit, attempts } = config;
  if (hintsUsed >= hints.length) return false;
  const timeThreshold = timeSpent / timeLimit > 0.6;
  const attemptThreshold = attempts >= 3;
  return timeThreshold || attemptThreshold;
}
