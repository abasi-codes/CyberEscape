import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { parse } from "csv-parse/sync";
import { notFound, badRequest } from "../../utils/errors.js";
import { paginate, buildPaginatedResult, buildWhereClause } from "../../utils/helpers.js";
import type { UpdateUserInput, ListUsersInput } from "./schema.js";

const prisma = new PrismaClient();

export class UserService {
  async list(orgId: string, filters: ListUsersInput) {
    const { page, limit, search, groupId, ...rest } = filters;
    const { skip, take } = paginate(page, limit);

    const where: Prisma.UserWhereInput = { organizationId: orgId, ...buildWhereClause(rest) };

    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
      ];
    }
    if (groupId) { where.userGroups = { some: { groupId } }; }

    const [data, total] = await Promise.all([
      prisma.user.findMany({
        where, skip, take,
        select: { id: true, email: true, firstName: true, lastName: true, role: true, status: true, avatar: true, createdAt: true, lastLoginAt: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    return buildPaginatedResult(data, total, page, limit);
  }

  async getById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true, email: true, firstName: true, lastName: true, role: true, status: true, avatar: true, locale: true,
        organizationId: true, createdAt: true, lastLoginAt: true, stats: true,
        userGroups: { include: { group: { select: { id: true, name: true } } } },
        userBadges: { include: { badge: true }, orderBy: { awardedAt: "desc" }, take: 10 },
      },
    });
    if (!user) throw notFound("User not found");
    return user;
  }

  async update(id: string, data: UpdateUserInput) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw notFound("User not found");
    return prisma.user.update({ where: { id }, data, select: { id: true, email: true, firstName: true, lastName: true, role: true, status: true, avatar: true, locale: true } });
  }

  async delete(id: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw notFound("User not found");
    await prisma.user.delete({ where: { id } });
    return { success: true };
  }

  async importCsv(orgId: string, csvContent: string) {
    const records = parse(csvContent, { columns: true, skip_empty_lines: true, trim: true });
    const results = { created: 0, skipped: 0, errors: [] as string[] };

    for (const record of records) {
      try {
        const { email, firstName, lastName, role, password } = record as any;
        if (!email || !firstName || !lastName) { results.errors.push(`Missing fields for: ${email || "unknown"}`); results.skipped++; continue; }
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) { results.skipped++; continue; }
        const passwordHash = await bcrypt.hash(password || "ChangeMe123!", 12);
        await prisma.user.create({ data: { email, firstName, lastName, passwordHash, role: role || "LEARNER", organizationId: orgId, stats: { create: {} } } });
        results.created++;
      } catch (e) { results.errors.push(`Error: ${(e as Error).message}`); results.skipped++; }
    }
    return results;
  }

  async getProfile(userId: string) { return this.getById(userId); }
}
