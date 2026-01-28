import { PrismaClient } from "@prisma/client";
import { notFound } from "../../../utils/errors.js";

const prisma = new PrismaClient();

export class PuzzleService {
  async getById(id: string) {
    const puzzle = await prisma.puzzle.findUnique({ where: { id }, select: { id: true, title: true, description: true, type: true, order: true, basePoints: true, timeLimit: true, config: true, hints: true, explanation: true, roomId: true } });
    if (!puzzle) throw notFound("Puzzle not found");
    return puzzle;
  }

  async getAttempts(userId: string, puzzleId: string) {
    return prisma.puzzleAttempt.findMany({ where: { userId, puzzleId }, orderBy: { createdAt: "desc" } });
  }
}
