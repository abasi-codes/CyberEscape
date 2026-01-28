import { PrismaClient } from "@prisma/client";
import Redis from "ioredis";
import { config } from "../../config/index.js";
import { evaluateBadges } from "./badge-evaluator.js";
import { notFound } from "../../utils/errors.js";

const prisma = new PrismaClient();
const redis = new Redis({ host: config.redis.host, port: config.redis.port, password: config.redis.password, lazyConnect: true });

export class GamificationService {
  async awardPoints(userId: string, points: number) {
    const stats = await prisma.userStats.upsert({ where: { userId }, create: { userId, totalScore: points, puzzlesSolved: 1 }, update: { totalScore: { increment: points }, puzzlesSolved: { increment: 1 } } });
    try { await redis.zadd("leaderboard:global", stats.totalScore, userId); const u = await prisma.user.findUnique({ where: { id: userId }, select: { organizationId: true } }); if (u) await redis.zadd(`leaderboard:org:${u.organizationId}`, stats.totalScore, userId); } catch {}
    const newBadges = await evaluateBadges(userId);
    return { stats, newBadges };
  }

  async getLeaderboard(scope: "global" | "organization", orgId?: string, limit = 20) {
    try {
      const key = scope === "global" ? "leaderboard:global" : `leaderboard:org:${orgId}`;
      const results = await redis.zrevrange(key, 0, limit - 1, "WITHSCORES");
      const entries = [];
      for (let i = 0; i < results.length; i += 2) { const user = await prisma.user.findUnique({ where: { id: results[i] }, select: { id: true, firstName: true, lastName: true, avatar: true } }); if (user) entries.push({ ...user, score: parseInt(results[i + 1], 10), rank: Math.floor(i / 2) + 1 }); }
      return entries;
    } catch {
      const where = scope === "organization" && orgId ? { user: { organizationId: orgId } } : {};
      const stats = await prisma.userStats.findMany({ where, orderBy: { totalScore: "desc" }, take: limit, include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } } });
      return stats.map((s, i) => ({ ...s.user, score: s.totalScore, rank: i + 1 }));
    }
  }

  async getBadges(userId: string) { return prisma.userBadge.findMany({ where: { userId }, include: { badge: true }, orderBy: { awardedAt: "desc" } }); }
  async getAllBadges() { return prisma.badge.findMany({ where: { isActive: true }, orderBy: [{ category: "asc" }, { tier: "asc" }] }); }

  async getUserProgress(userId: string) {
    const [stats, badges, progress] = await Promise.all([prisma.userStats.findUnique({ where: { userId } }), prisma.userBadge.count({ where: { userId } }), prisma.gameProgress.findMany({ where: { userId }, include: { room: { select: { id: true, name: true, slug: true } } } })]);
    if (\!stats) throw notFound("User stats not found");
    return { stats, badgeCount: badges, roomProgress: progress };
  }

  async updateStreak(userId: string) {
    const stats = await prisma.userStats.findUnique({ where: { userId } });
    if (\!stats) return;
    const now = new Date();
    let newStreak = 1;
    if (stats.lastPlayedAt) { const diffH = (now.getTime() - stats.lastPlayedAt.getTime()) / 3600000; if (diffH < 48) newStreak = stats.currentStreak + 1; }
    await prisma.userStats.update({ where: { userId }, data: { currentStreak: newStreak, longestStreak: Math.max(newStreak, stats.longestStreak), lastPlayedAt: now } });
    return newStreak;
  }

  async getStreaks(userId: string) {
    const stats = await prisma.userStats.findUnique({ where: { userId } });
    if (\!stats) throw notFound("User stats not found");
    return { currentStreak: stats.currentStreak, longestStreak: stats.longestStreak, lastPlayedAt: stats.lastPlayedAt };
  }
}
