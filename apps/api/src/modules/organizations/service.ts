import { PrismaClient } from "@prisma/client";
import { notFound, conflict } from "../../utils/errors.js";
import type { CreateOrgInput, UpdateOrgInput, UpdateBrandingInput } from "./schema.js";

const prisma = new PrismaClient();

export class OrganizationService {
  async create(data: CreateOrgInput) {
    const existing = await prisma.organization.findUnique({ where: { slug: data.slug } });
    if (existing) throw conflict("Organization slug already exists");
    return prisma.organization.create({ data });
  }

  async getById(id: string) {
    const org = await prisma.organization.findUnique({ where: { id }, include: { _count: { select: { users: true, groups: true } } } });
    if (\!org) throw notFound("Organization not found");
    return org;
  }

  async update(id: string, data: UpdateOrgInput) {
    const org = await prisma.organization.findUnique({ where: { id } });
    if (\!org) throw notFound("Organization not found");
    if (data.slug) {
      const existing = await prisma.organization.findFirst({ where: { slug: data.slug, NOT: { id } } });
      if (existing) throw conflict("Slug already taken");
    }
    return prisma.organization.update({ where: { id }, data });
  }

  async delete(id: string) {
    const org = await prisma.organization.findUnique({ where: { id } });
    if (\!org) throw notFound("Organization not found");
    await prisma.organization.delete({ where: { id } });
    return { success: true };
  }

  async getSettings(id: string) {
    const org = await prisma.organization.findUnique({ where: { id }, select: { id: true, settings: true, primaryColor: true, logoUrl: true } });
    if (\!org) throw notFound("Organization not found");
    return org;
  }

  async updateBranding(id: string, data: UpdateBrandingInput) {
    const org = await prisma.organization.findUnique({ where: { id } });
    if (\!org) throw notFound("Organization not found");
    return prisma.organization.update({
      where: { id },
      data: { logoUrl: data.logoUrl ?? org.logoUrl, primaryColor: data.primaryColor ?? org.primaryColor, settings: data.settings ? JSON.parse(JSON.stringify(data.settings)) : undefined },
    });
  }
}
