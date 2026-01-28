import type { PuzzleType } from "@prisma/client";

export interface ValidationResult {
  isCorrect: boolean;
  feedback: string;
  partialScore?: number;
}

export function validateAnswer(type: PuzzleType, answer: unknown, correctAnswer: unknown, config: unknown): ValidationResult {
  switch (type) {
    case "PASSWORD_STRENGTH": return validatePasswordStrength(answer as string, correctAnswer as { minScore: number });
    case "PHISHING_CLASSIFICATION": return validatePhishingClassification(answer as string, correctAnswer as { correct: string });
    case "MULTIPLE_CHOICE": return validateMultipleChoice(answer as number, correctAnswer as { correct: number });
    case "DRAG_DROP": return validateDragDrop(answer as number[], correctAnswer as { mapping: number[] });
    case "SEQUENCE": return validateSequence(answer as number[], correctAnswer as { order: number[] });
    case "MATCHING": return validateMatching(answer as number[][], correctAnswer as { pairs: number[][] });
    case "CODE_ENTRY": return validateCodeEntry(answer as string, correctAnswer as { code: string });
    case "SIMULATION": return validateSimulation(answer as Record<string, unknown>, correctAnswer as Record<string, unknown>);
    default: return { isCorrect: false, feedback: "Unknown puzzle type" };
  }
}

function validatePasswordStrength(password: string, criteria: { minScore: number }): ValidationResult {
  let score = 0;
  if (password.length >= 12) score += 25; else if (password.length >= 8) score += 10;
  if (/[A-Z]/.test(password)) score += 20;
  if (/[a-z]/.test(password)) score += 15;
  if (/[0-9]/.test(password)) score += 20;
  if (/[^A-Za-z0-9]/.test(password)) score += 20;
  if (/^(password|123456|qwerty)/i.test(password)) score = Math.max(0, score - 50);
  if (/(.)\1{2,}/.test(password)) score = Math.max(0, score - 15);
  const isCorrect = score >= criteria.minScore;
  return { isCorrect, feedback: isCorrect ? `Password score: ${score}/100` : `Score ${score}/100, need ${criteria.minScore}. Add more complexity.`, partialScore: score };
}

function validatePhishingClassification(answer: string, correct: { correct: string }): ValidationResult {
  const isCorrect = answer.toLowerCase() === correct.correct.toLowerCase();
  return { isCorrect, feedback: isCorrect ? "Correct classification!" : `Incorrect. Answer was: ${correct.correct}` };
}

function validateMultipleChoice(answer: number, correct: { correct: number }): ValidationResult {
  const isCorrect = answer === correct.correct;
  return { isCorrect, feedback: isCorrect ? "Correct!" : "Incorrect. Review the explanation." };
}

function validateDragDrop(answer: number[], correct: { mapping: number[] }): ValidationResult {
  if (answer.length !== correct.mapping.length) return { isCorrect: false, feedback: "Please match all items." };
  let ct = 0;
  for (let i = 0; i < answer.length; i++) if (answer[i] === correct.mapping[i]) ct++;
  const isCorrect = ct === answer.length;
  return { isCorrect, feedback: isCorrect ? "All items correct!" : `${ct}/${answer.length} correct.`, partialScore: Math.round((ct / answer.length) * 100) };
}

function validateSequence(answer: number[], correct: { order: number[] }): ValidationResult {
  if (answer.length !== correct.order.length) return { isCorrect: false, feedback: "Please order all items." };
  const isCorrect = answer.every((v, i) => v === correct.order[i]);
  if (isCorrect) return { isCorrect: true, feedback: "Perfect sequence!" };
  let ct = 0;
  for (let i = 0; i < answer.length; i++) if (answer[i] === correct.order[i]) ct++;
  return { isCorrect: false, feedback: `${ct}/${answer.length} in correct position.`, partialScore: Math.round((ct / answer.length) * 100) };
}

function validateMatching(answer: number[][], correct: { pairs: number[][] }): ValidationResult {
  const correctSet = new Set(correct.pairs.map((p) => p.join(",")));
  let ct = 0;
  for (const pair of answer) if (correctSet.has(pair.join(","))) ct++;
  const isCorrect = ct === correct.pairs.length && answer.length === correct.pairs.length;
  return { isCorrect, feedback: isCorrect ? "All pairs correct!" : `${ct}/${correct.pairs.length} correct.`, partialScore: Math.round((ct / correct.pairs.length) * 100) };
}

function validateCodeEntry(answer: string, correct: { code: string }): ValidationResult {
  const isCorrect = answer.trim() === correct.code.trim();
  return { isCorrect, feedback: isCorrect ? "Code accepted!" : "Incorrect code." };
}

function validateSimulation(answer: Record<string, unknown>, correct: Record<string, unknown>): ValidationResult {
  let matched = 0, total = 0;
  for (const key of Object.keys(correct)) { total++; if (JSON.stringify(answer[key]) === JSON.stringify(correct[key])) matched++; }
  const isCorrect = matched === total;
  return { isCorrect, feedback: isCorrect ? "Simulation complete!" : `${matched}/${total} objectives correct.`, partialScore: Math.round((matched / total) * 100) };
}
