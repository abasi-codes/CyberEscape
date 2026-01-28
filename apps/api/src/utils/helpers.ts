import crypto from "node:crypto";

export function generateJoinCode(length = 6): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    code += chars[bytes[i] % chars.length];
  }
  return code;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function paginate(page = 1, limit = 20): { skip: number; take: number } {
  const p = Math.max(1, page);
  const l = Math.min(100, Math.max(1, limit));
  return { skip: (p - 1) * l, take: l };
}

export function buildPaginatedResult<T>(data: T[], total: number, page = 1, limit = 20): PaginatedResult<T> {
  return {
    data,
    total,
    page: Math.max(1, page),
    limit: Math.min(100, Math.max(1, limit)),
    totalPages: Math.ceil(total / Math.min(100, Math.max(1, limit))),
  };
}

export function buildWhereClause(filters: Record<string, unknown>): Record<string, unknown> {
  const where: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === null || value === "") continue;
    if (typeof value === "string" && \!key.endsWith("Id") && key \!== "role" && key \!== "status") {
      where[key] = { contains: value, mode: "insensitive" };
    } else {
      where[key] = value;
    }
  }
  return where;
}
