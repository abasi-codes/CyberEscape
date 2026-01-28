export interface ScoreParams {
  basePoints: number;
  timeSpent: number;
  timeLimit: number;
  attempts: number;
  hintsUsed: number;
  streak: number;
}

export function calculateScore(params: ScoreParams): number {
  const { basePoints, timeSpent, timeLimit, attempts, hintsUsed, streak } = params;

  // Time bonus: up to 50% extra for fast completion
  const timeRatio = Math.max(0, 1 - timeSpent / timeLimit);
  const timeBonus = basePoints * 0.5 * timeRatio;

  // Accuracy penalty: -20% per extra attempt (first attempt is free)
  const extraAttempts = Math.max(0, attempts - 1);
  const accuracyPenalty = basePoints * 0.2 * extraAttempts;

  // Hint penalty: -15% per hint used
  const hintPenalty = basePoints * 0.15 * hintsUsed;

  // Streak multiplier: 1.0 + 0.1 per streak level (max 2.0)
  const streakMultiplier = Math.min(2.0, 1.0 + streak * 0.1);

  // Calculate final score
  const rawScore = (basePoints + timeBonus - accuracyPenalty - hintPenalty) * streakMultiplier;

  // Floor at 10% of base points minimum, round to integer
  return Math.max(Math.round(basePoints * 0.1), Math.round(rawScore));
}
