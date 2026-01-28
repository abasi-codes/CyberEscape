import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import { config } from "../../config/index.js";
import { unauthorized, conflict, notFound, badRequest } from "../../utils/errors.js";
import type { RegisterInput, LoginInput } from "./schema.js";
import type { JwtPayload } from "../../middleware/auth.js";

const prisma = new PrismaClient();

export class AuthService {
  async register(input: RegisterInput) {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) throw conflict("Email already registered");

    const passwordHash = await bcrypt.hash(input.password, 12);
    const user = await prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        firstName: input.firstName,
        lastName: input.lastName,
        role: input.role as any,
        organizationId: input.organizationId,
        stats: { create: {} },
      },
      select: { id: true, email: true, firstName: true, lastName: true, role: true, organizationId: true },
    });

    const tokens = await this.generateTokens({
      userId: user.id, email: user.email, role: user.role, organizationId: user.organizationId,
    });

    return { user, ...tokens };
  }

  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    if (!user || !user.passwordHash) throw unauthorized("Invalid email or password");
    if (user.status !== "ACTIVE") throw unauthorized("Account is not active");

    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) throw unauthorized("Invalid email or password");

    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

    const tokens = await this.generateTokens({
      userId: user.id, email: user.email, role: user.role, organizationId: user.organizationId,
    });

    return {
      user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role, organizationId: user.organizationId },
      ...tokens,
    };
  }

  async refresh(refreshToken: string) {
    const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw unauthorized("Invalid or expired refresh token");
    }

    const user = await prisma.user.findUnique({ where: { id: stored.userId } });
    if (!user) throw notFound("User not found");

    await prisma.refreshToken.update({ where: { id: stored.id }, data: { revokedAt: new Date() } });

    return this.generateTokens({
      userId: user.id, email: user.email, role: user.role, organizationId: user.organizationId,
    });
  }

  async logout(refreshToken: string) {
    const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
    if (stored) {
      await prisma.refreshToken.update({ where: { id: stored.id }, data: { revokedAt: new Date() } });
    }
  }

  async googleCallback(code: string) {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code, client_id: config.google.clientId, client_secret: config.google.clientSecret,
        redirect_uri: config.google.callbackUrl, grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) throw badRequest("Failed to exchange Google auth code");
    const tokenData = await tokenRes.json() as { access_token: string };

    const profileRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!profileRes.ok) throw badRequest("Failed to get Google profile");
    const profile = await profileRes.json() as { id: string; email: string; given_name: string; family_name: string; picture: string };

    let user = await prisma.user.findUnique({ where: { googleId: profile.id } });
    if (!user) {
      user = await prisma.user.findUnique({ where: { email: profile.email } });
      if (user) {
        user = await prisma.user.update({ where: { id: user.id }, data: { googleId: profile.id, avatar: profile.picture } });
      } else {
        const defaultOrg = await prisma.organization.findFirst();
        if (!defaultOrg) throw badRequest("No organization available for sign-up");
        user = await prisma.user.create({
          data: {
            email: profile.email, firstName: profile.given_name || "User", lastName: profile.family_name || "",
            googleId: profile.id, avatar: profile.picture, organizationId: defaultOrg.id, stats: { create: {} },
          },
        });
      }
    }

    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

    const tokens = await this.generateTokens({
      userId: user.id, email: user.email, role: user.role, organizationId: user.organizationId,
    });

    return { user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role }, ...tokens };
  }

  private async generateTokens(payload: JwtPayload) {
    const accessToken = jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.accessExpiresIn as any });
    const refreshToken = crypto.randomBytes(40).toString("hex");

    await prisma.refreshToken.create({
      data: { token: refreshToken, userId: payload.userId, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
    });

    return { accessToken, refreshToken };
  }
}
