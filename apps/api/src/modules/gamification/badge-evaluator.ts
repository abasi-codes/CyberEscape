import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface BadgeCriteria {
  puzzlesSolved?: number;
  roomsCompleted?: number;
  totalScore?: number;
  loginStreak?: number;
  perfectPuzzlesInRow?: number;
  roomPerfectAccuracy?: boolean;
  roomCompletedUnder?: number;
  puzzleCompletedUnder?: number;
  teamRoomsCompleted?: number;
  teamLeaderAllRooms?: boolean;
  roomMastered?: string;
}

export async function evaluateBadges(userId: string): Promise<string[]> {
  const stats = await prisma.userStats.findUnique({ where: { userId } });
  if (\!stats) return [];
  const badges = await prisma.badge.findMany({ where: { isActive: true } });
  const existing = new Set((await prisma.userBadge.findMany({ where: { userId }, select: { badgeId: true } })).map((b) => b.badgeId));
  const newBadges: string[] = [];

  for (const badge of badges) {
    if (existing.has(badge.id)) continue;
    const c = badge.criteria as BadgeCriteria;
    let earned = false;
    if (c.puzzlesSolved \!== undefined && stats.puzzlesSolved >= c.puzzlesSolved) earned = true;
    if (c.roomsCompleted \!== undefined && stats.roomsCompleted >= c.roomsCompleted) earned = true;
    if (c.totalScore \!== undefined && stats.totalScore >= c.totalScore) earned = true;
    if (c.loginStreak \!== undefined && stats.currentStreak >= c.loginStreak) earned = true;
    if (c.roomCompletedUnder \!== undefined) { const fast = await prisma.gameProgress.findFirst({ where: { userId, status: "ROOM_COMPLETE", timeSpent: { lte: c.roomCompletedUnder } } }); if (fast) earned = true; }
    if (c.puzzleCompletedUnder \!== undefined) { const fast = await prisma.puzzleAttempt.findFirst({ where: { userId, isCorrect: true, timeSpent: { lte: c.puzzleCompletedUnder } } }); if (fast) earned = true; }
    if (c.roomMastered \!== undefined) { const room = await prisma.room.findUnique({ where: { slug: c.roomMastered } }); if (room) { const prog = await prisma.gameProgress.findUnique({ where: { userId_roomId: { userId, roomId: room.id } } }); if (prog?.status === "ROOM_COMPLETE") earned = true; } }
    if (earned) { await prisma.userBadge.create({ data: { userId, badgeId: badge.id } }); newBadges.push(badge.id); }
  }
  return newBadges;
}
