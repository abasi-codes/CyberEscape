import { PrismaClient } from "@prisma/client";
import { notFound } from "../../utils/errors.js";
import type { CreateGroupInput, UpdateGroupInput } from "./schema.js";

const prisma = new PrismaClient();

export class GroupService {
  async create(orgId: string, data: CreateGroupInput) {
    return prisma.group.create({ data: { ...data, organizationId: orgId } });
  }

  async list(orgId: string) {
    return prisma.group.findMany({ where: { organizationId: orgId }, include: { _count: { select: { userGroups: true } } }, orderBy: { name: "asc" } });
  }

  async getById(id: string) {
    const group = await prisma.group.findUnique({ where: { id }, include: { _count: { select: { userGroups: true } } } });
    if (!group) throw notFound("Group not found");
    return group;
  }

  async update(id: string, data: UpdateGroupInput) {
    const group = await prisma.group.findUnique({ where: { id } });
    if (!group) throw notFound("Group not found");
    return prisma.group.update({ where: { id }, data });
  }

  async delete(id: string) {
    const group = await prisma.group.findUnique({ where: { id } });
    if (!group) throw notFound("Group not found");
    await prisma.group.delete({ where: { id } });
    return { success: true };
  }

  async assignUsers(groupId: string, userIds: string[]) {
    const group = await prisma.group.findUnique({ where: { id: groupId } });
    if (!group) throw notFound("Group not found");
    const ops = userIds.map((userId) => prisma.userGroup.upsert({ where: { userId_groupId: { userId, groupId } }, update: {}, create: { userId, groupId } }));
    await prisma.$transaction(ops);
    return { success: true, assigned: userIds.length };
  }

  async removeUser(groupId: string, userId: string) {
    await prisma.userGroup.delete({ where: { userId_groupId: { userId, groupId } } });
    return { success: true };
  }

  async getMembers(groupId: string) {
    const group = await prisma.group.findUnique({ where: { id: groupId } });
    if (!group) throw notFound("Group not found");
    const members = await prisma.userGroup.findMany({ where: { groupId }, include: { user: { select: { id: true, email: true, firstName: true, lastName: true, role: true, status: true, avatar: true } } } });
    return members.map((m) => ({ ...m.user, assignedAt: m.assignedAt }));
  }
}
