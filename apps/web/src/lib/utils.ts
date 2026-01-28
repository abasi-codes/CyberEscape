import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function formatPoints(points: number): string {
  return points.toLocaleString();
}

export function calculateLevel(xp: number): number {
  return Math.floor(xp / 500) + 1;
}

export function xpForNextLevel(xp: number): { current: number; needed: number } {
  const level = calculateLevel(xp);
  const currentLevelXP = (level - 1) * 500;
  return { current: xp - currentLevelXP, needed: 500 };
}
