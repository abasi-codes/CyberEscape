import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class AnalyticsService {
  async getOrgOverview(orgId: string) {
    const [totalUsers, activeUsers, totalCompletions, avgScore] = await Promise.all([
      prisma.user.count({ where: { organizationId: orgId } }),
      prisma.user.count({ where: { organizationId: orgId, status: "ACTIVE", lastLoginAt: { gte: new Date(Date.now() - 30 * 86400000) } } }),
      prisma.gameProgress.count({ where: { user: { organizationId: orgId }, status: "ROOM_COMPLETE" } }),
      prisma.gameProgress.aggregate({ where: { user: { organizationId: orgId }, status: "ROOM_COMPLETE" }, _avg: { score: true } }),
    ]);
    const roomStats = await prisma.gameProgress.groupBy({ by: ["roomId"], where: { user: { organizationId: orgId } }, _count: { _all: true }, _avg: { score: true, timeSpent: true } });
    return { totalUsers, activeUsers, totalCompletions, avgScore: avgScore._avg.score ?? 0, roomStats };
  }

  async getByGroup(orgId: string, groupId: string) {
    const userIds = (await prisma.userGroup.findMany({ where: { groupId }, select: { userId: true } })).map((m) => m.userId);
    const [completions, avgScore, userProgress] = await Promise.all([
      prisma.gameProgress.count({ where: { userId: { in: userIds }, status: "ROOM_COMPLETE" } }),
      prisma.gameProgress.aggregate({ where: { userId: { in: userIds }, status: "ROOM_COMPLETE" }, _avg: { score: true } }),
      prisma.userStats.findMany({ where: { userId: { in: userIds } }, include: { user: { select: { id: true, firstName: true, lastName: true } } }, orderBy: { totalScore: "desc" } }),
    ]);
    return { groupId, memberCount: userIds.length, completions, avgScore: avgScore._avg.score ?? 0, userProgress };
  }

  async getByRoom(orgId: string, roomId: string) {
    const [completions, attempts, avgScore, avgTime, puzzleStats] = await Promise.all([
      prisma.gameProgress.count({ where: { roomId, user: { organizationId: orgId }, status: "ROOM_COMPLETE" } }),
      prisma.gameProgress.count({ where: { roomId, user: { organizationId: orgId } } }),
      prisma.gameProgress.aggregate({ where: { roomId, user: { organizationId: orgId }, status: "ROOM_COMPLETE" }, _avg: { score: true } }),
      prisma.gameProgress.aggregate({ where: { roomId, user: { organizationId: orgId }, status: "ROOM_COMPLETE" }, _avg: { timeSpent: true } }),
      prisma.puzzleAttempt.groupBy({ by: ["puzzleId"], where: { puzzle: { roomId }, user: { organizationId: orgId } }, _count: { _all: true }, _avg: { score: true } }),
    ]);
    return { roomId, completions, attempts, completionRate: attempts > 0 ? (completions / attempts) * 100 : 0, avgScore: avgScore._avg.score ?? 0, avgTime: avgTime._avg.timeSpent ?? 0, puzzleStats };
  }

  async getByUser(userId: string) {
    const [stats, progress, recentAttempts, badges] = await Promise.all([
      prisma.userStats.findUnique({ where: { userId } }),
      prisma.gameProgress.findMany({ where: { userId }, include: { room: { select: { name: true, slug: true } } } }),
      prisma.puzzleAttempt.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 20, include: { puzzle: { select: { title: true, type: true } } } }),
      prisma.userBadge.findMany({ where: { userId }, include: { badge: true } }),
    ]);
    return { stats, progress, recentAttempts, badges };
  }

  async getRiskUsers(orgId: string) {
    return prisma.user.findMany({
      where: { organizationId: orgId, status: "ACTIVE", OR: [{ lastLoginAt: { lt: new Date(Date.now() - 14 * 86400000) } }, { lastLoginAt: null }, { stats: { totalScore: { lt: 100 }, roomsCompleted: { lt: 1 } } }] },
      select: { id: true, email: true, firstName: true, lastName: true, lastLoginAt: true, stats: { select: { totalScore: true, roomsCompleted: true } } },
      orderBy: { lastLoginAt: "asc" }, take: 50,
    });
  }
}
