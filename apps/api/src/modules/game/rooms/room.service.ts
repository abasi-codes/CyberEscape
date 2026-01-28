import { PrismaClient } from "@prisma/client";
import { notFound } from "../../../utils/errors.js";

const prisma = new PrismaClient();

export class RoomService {
  async list() {
    return prisma.room.findMany({ where: { isActive: true }, include: { _count: { select: { puzzles: true } } }, orderBy: { order: "asc" } });
  }

  async getById(id: string) {
    const room = await prisma.room.findUnique({ where: { id }, include: { puzzles: { where: { isActive: true }, orderBy: { order: "asc" }, select: { id: true, title: true, description: true, type: true, order: true, basePoints: true, timeLimit: true } } } });
    if (\!room) throw notFound("Room not found");
    return room;
  }

  async getBySlug(slug: string) {
    const room = await prisma.room.findUnique({ where: { slug }, include: { puzzles: { where: { isActive: true }, orderBy: { order: "asc" }, select: { id: true, title: true, description: true, type: true, order: true, basePoints: true, timeLimit: true } } } });
    if (\!room) throw notFound("Room not found");
    return room;
  }

  async getUserProgress(userId: string, roomId: string) {
    return prisma.gameProgress.findUnique({ where: { userId_roomId: { userId, roomId } } });
  }

  async getAllUserProgress(userId: string) {
    return prisma.gameProgress.findMany({ where: { userId }, include: { room: { select: { id: true, name: true, slug: true, type: true, order: true } } }, orderBy: { room: { order: "asc" } } });
  }
}
