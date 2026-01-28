import { PrismaClient } from "@prisma/client";
import { notFound, badRequest, conflict } from "../../utils/errors.js";
import { generateJoinCode } from "../../utils/helpers.js";
import type { CreateTeamInput } from "./schema.js";

const prisma = new PrismaClient();

export class TeamService {
  async create(userId: string, data: CreateTeamInput) {
    let joinCode = "";
    for (let i = 0; i < 10; i++) { joinCode = generateJoinCode(); const exists = await prisma.team.findUnique({ where: { joinCode } }); if (!exists) break; if (i === 9) throw badRequest("Failed to generate unique code"); }
    return prisma.team.create({ data: { name: data.name, joinCode, maxSize: data.maxSize, members: { create: { userId, role: "leader" } } }, include: { members: { include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } } } } });
  }

  async joinByCode(userId: string, joinCode: string) {
    const team = await prisma.team.findUnique({ where: { joinCode }, include: { members: true } });
    if (!team) throw notFound("Team not found");
    if (team.status !== "LOBBY") throw badRequest("Team not accepting members");
    if (team.members.length >= team.maxSize) throw badRequest("Team is full");
    if (team.members.find((m) => m.userId === userId)) throw conflict("Already a member");
    await prisma.teamMember.create({ data: { teamId: team.id, userId } });
    return prisma.team.findUnique({ where: { id: team.id }, include: { members: { include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } } } } });
  }

  async leave(userId: string, teamId: string) {
    const member = await prisma.teamMember.findUnique({ where: { teamId_userId: { teamId, userId } } });
    if (!member) throw notFound("Not a member");
    await prisma.teamMember.delete({ where: { id: member.id } });
    const remaining = await prisma.teamMember.count({ where: { teamId } });
    if (remaining === 0) { await prisma.team.update({ where: { id: teamId }, data: { status: "DISBANDED" } }); }
    else if (member.role === "leader") { const next = await prisma.teamMember.findFirst({ where: { teamId }, orderBy: { joinedAt: "asc" } }); if (next) await prisma.teamMember.update({ where: { id: next.id }, data: { role: "leader" } }); }
    return { success: true };
  }

  async setReady(userId: string, teamId: string, isReady: boolean) {
    const member = await prisma.teamMember.findUnique({ where: { teamId_userId: { teamId, userId } } });
    if (!member) throw notFound("Not a member");
    await prisma.teamMember.update({ where: { id: member.id }, data: { isReady } });
    return { success: true };
  }

  async assignRole(teamId: string, userId: string, role: string) {
    const member = await prisma.teamMember.findUnique({ where: { teamId_userId: { teamId, userId } } });
    if (!member) throw notFound("Not a member");
    await prisma.teamMember.update({ where: { id: member.id }, data: { role } });
    return { success: true };
  }

  async startGame(teamId: string, roomId: string) {
    const team = await prisma.team.findUnique({ where: { id: teamId }, include: { members: true } });
    if (!team) throw notFound("Team not found");
    if (team.status !== "LOBBY") throw badRequest("Not in lobby");
    if (!team.members.every((m) => m.isReady || m.role === "leader")) throw badRequest("Not all ready");
    await prisma.team.update({ where: { id: teamId }, data: { status: "IN_GAME" } });
    const session = await prisma.teamSession.create({ data: { teamId, roomId } });
    return { team: { ...team, status: "IN_GAME" }, session };
  }

  async getById(teamId: string) {
    const team = await prisma.team.findUnique({ where: { id: teamId }, include: { members: { include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } } } } });
    if (!team) throw notFound("Team not found");
    return team;
  }

  async findMatchmaking(userId: string) {
    const teams = await prisma.team.findMany({ where: { status: "LOBBY", members: { none: { userId } } }, include: { members: true, _count: { select: { members: true } } }, orderBy: { createdAt: "desc" }, take: 10 });
    return teams.filter((t) => t._count.members < t.maxSize);
  }
}
