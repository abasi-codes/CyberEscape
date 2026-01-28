import { PrismaClient } from "@prisma/client";
import crypto from "node:crypto";
import { notFound } from "../../utils/errors.js";
import { logger } from "../../utils/logger.js";

const prisma = new PrismaClient();

export class IntegrationService {
  async listWebhooks(orgId: string) { return prisma.webhookConfig.findMany({ where: { organizationId: orgId } }); }
  async createWebhook(orgId: string, data: any) { return prisma.webhookConfig.create({ data: { organizationId: orgId, ...data } }); }
  async updateWebhook(id: string, data: any) { const w = await prisma.webhookConfig.findUnique({ where: { id } }); if (!w) throw notFound("Not found"); return prisma.webhookConfig.update({ where: { id }, data }); }
  async deleteWebhook(id: string) { await prisma.webhookConfig.delete({ where: { id } }); return { success: true }; }

  async dispatchWebhook(orgId: string, event: string, payload: any) {
    const whs = await prisma.webhookConfig.findMany({ where: { organizationId: orgId, isActive: true } });
    for (const wh of whs) {
      const evts = wh.events as string[];
      if (!evts.includes(event) && !evts.includes("*")) continue;
      const body = JSON.stringify({ event, timestamp: new Date().toISOString(), data: payload });
      const sig = crypto.createHmac("sha256", wh.secret).update(body).digest("hex");
      try { await fetch(wh.url, { method: "POST", headers: { "Content-Type": "application/json", "X-Webhook-Signature": sig }, body }); await prisma.webhookConfig.update({ where: { id: wh.id }, data: { lastTriggeredAt: new Date() } }); }
      catch (e) { logger.error({ id: wh.id, error: e }, "Webhook failed"); }
    }
  }

  async generateScormPackage(orgId: string, name: string, roomIds: string[]) {
    const rooms = await prisma.room.findMany({ where: { id: { in: roomIds } } });
    const items = rooms.map((r, i) => `<item identifier="I${i}" identifierref="R${i}"><title>${r.name}</title></item>`).join("");
    const resources = rooms.map((_, i) => `<resource identifier="R${i}" type="webcontent" href="room${i}/index.html"><file href="room${i}/index.html"/></resource>`).join("");
    const manifest = `<?xml version="1.0"?><manifest xmlns="http://www.imsglobal.org/xsd/imscp_v1p1"><metadata><schema>ADL SCORM</schema><schemaversion>2004 4th Edition</schemaversion></metadata><organizations default="O1"><organization identifier="O1"><title>${name}</title>${items}</organization></organizations><resources>${resources}</resources></manifest>`;
    const pkg = await prisma.sCORMPackage.create({ data: { organizationId: orgId, name, version: "2004", roomIds } });
    return { ...pkg, manifest };
  }

  async sendXApiStatement(endpoint: string, auth: { key: string; secret: string }, stmt: any) {
    const creds = Buffer.from(auth.key + ":" + auth.secret).toString("base64");
    try { const r = await fetch(endpoint + "/statements", { method: "POST", headers: { "Content-Type": "application/json", Authorization: "Basic " + creds, "X-Experience-API-Version": "1.0.3" }, body: JSON.stringify(stmt) }); return { success: r.ok }; }
    catch (e) { return { success: false, error: (e as Error).message }; }
  }

  async getScormPackages(orgId: string) { return prisma.sCORMPackage.findMany({ where: { organizationId: orgId } }); }
}
