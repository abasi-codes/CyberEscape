import { PrismaClient, AlertSeverity } from "@prisma/client";
import { notFound } from "../../utils/errors.js";
import type { CreateAlertInput } from "./schema.js";

const prisma = new PrismaClient();

export class AlertService {
  async list(orgId: string, acknowledged?: boolean) {
    const where: any = { organizationId: orgId };
    if (acknowledged !== undefined) where.isAcknowledged = acknowledged;
    return prisma.alert.findMany({ where, orderBy: { createdAt: "desc" }, take: 100 });
  }

  async create(orgId: string, data: CreateAlertInput) {
    return prisma.alert.create({ data: { organizationId: orgId, title: data.title, message: data.message, severity: data.severity as AlertSeverity, metadata: (data.metadata ?? {}) as any } });
  }

  async acknowledge(id: string, userId: string) {
    const alert = await prisma.alert.findUnique({ where: { id } });
    if (!alert) throw notFound("Alert not found");
    return prisma.alert.update({ where: { id }, data: { isAcknowledged: true, acknowledgedBy: userId, acknowledgedAt: new Date() } });
  }

  async triggerAlertIfNeeded(orgId: string, type: string, data: Record<string, unknown>) {
    if (type === "low_engagement") {
      const count = data.count as number;
      if (count > 10) await this.create(orgId, { title: "Low Engagement Alert", message: `${count} users inactive for 14+ days.`, severity: count > 50 ? "HIGH" : "MEDIUM", metadata: data });
    } else if (type === "security_score_drop") {
      await this.create(orgId, { title: "Security Score Drop", message: `Score dropped by ${data.dropPercent}%.`, severity: (data.dropPercent as number) > 20 ? "CRITICAL" : "HIGH", metadata: data });
    }
  }
}
