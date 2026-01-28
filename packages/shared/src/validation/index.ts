import { z } from 'zod';
import {
  UserRole, UserStatus, RoomType, PuzzleType, GameStatus,
  AlertSeverity, CampaignStatus, ReportType, BadgeTier, BadgeCategory,
} from '../constants/index.js';

// ─── Auth ────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[a-z]/, 'Password must contain a lowercase letter')
    .regex(/[0-9]/, 'Password must contain a number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain a special character'),
  confirmPassword: z.string(),
  orgId: z.string().uuid().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});

// ─── Users ───────────────────────────────────────────────

export const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  role: z.nativeEnum(UserRole).optional(),
  status: z.nativeEnum(UserStatus).optional(),
  groupId: z.string().uuid().nullable().optional(),
  preferences: z.object({
    theme: z.enum(['dark', 'light']).optional(),
    language: z.string().optional(),
    leaderboardOptOut: z.boolean().optional(),
    emailNotifications: z.boolean().optional(),
  }).optional(),
});
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  role: z.nativeEnum(UserRole).optional(),
  status: z.nativeEnum(UserStatus).optional(),
  groupId: z.string().uuid().optional(),
  sortBy: z.enum(['name', 'email', 'createdAt', 'lastLogin']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;

// ─── Organizations ───────────────────────────────────────

export const createOrganizationSchema = z.object({
  name: z.string().min(2).max(200),
  settings: z.object({
    gamificationEnabled: z.boolean().default(true),
    leaderboardEnabled: z.boolean().default(true),
    badgesEnabled: z.boolean().default(true),
    timezone: z.string().default('UTC'),
    defaultLanguage: z.string().default('en'),
    allowSelfRegistration: z.boolean().default(false),
  }).optional(),
});
export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;

// ─── Groups ──────────────────────────────────────────────

export const createGroupSchema = z.object({
  name: z.string().min(2).max(100),
  parentGroupId: z.string().uuid().optional(),
  managerId: z.string().uuid().optional(),
});
export type CreateGroupInput = z.infer<typeof createGroupSchema>;

// ─── Rooms ───────────────────────────────────────────────

export const createRoomSchema = z.object({
  number: z.number().int().min(1).max(6),
  name: z.string().min(2).max(100),
  description: z.string().max(1000),
  type: z.nativeEnum(RoomType),
  timeLimit: z.number().int().positive(),
  maxPlayers: z.number().int().positive().max(6),
  orderIndex: z.number().int(),
  published: z.boolean().default(false),
  config: z.record(z.unknown()).default({}),
});
export type CreateRoomInput = z.infer<typeof createRoomSchema>;

// ─── Puzzles ─────────────────────────────────────────────

export const createPuzzleSchema = z.object({
  roomId: z.string().uuid(),
  type: z.nativeEnum(PuzzleType),
  orderIndex: z.number().int(),
  title: z.string().min(2).max(200),
  description: z.string().max(2000),
  content: z.record(z.unknown()),
  solution: z.record(z.unknown()),
  hints: z.array(z.object({
    index: z.number().int(),
    text: z.string(),
    cost: z.number().int().positive(),
  })).max(3),
  points: z.number().int().positive(),
  difficulty: z.number().int().min(1).max(5),
});
export type CreatePuzzleInput = z.infer<typeof createPuzzleSchema>;

export const submitAnswerSchema = z.object({
  puzzleId: z.string().uuid(),
  answer: z.record(z.unknown()),
});
export type SubmitAnswerInput = z.infer<typeof submitAnswerSchema>;

// ─── Teams ───────────────────────────────────────────────

export const createTeamSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  roomId: z.string().uuid(),
});
export type CreateTeamInput = z.infer<typeof createTeamSchema>;

export const joinTeamSchema = z.object({
  joinCode: z.string().length(6),
});
export type JoinTeamInput = z.infer<typeof joinTeamSchema>;

// ─── Campaigns ───────────────────────────────────────────

export const createCampaignSchema = z.object({
  name: z.string().min(2).max(200),
  startDate: z.coerce.date(),
  dueDate: z.coerce.date(),
  targetGroups: z.array(z.string().uuid()).min(1),
  settings: z.object({
    requiredRooms: z.array(z.number().int().min(1).max(6)),
    reminderDays: z.array(z.number().int().positive()),
    allowLateCompletion: z.boolean().default(false),
  }),
}).refine((data) => data.dueDate > data.startDate, {
  message: 'Due date must be after start date',
  path: ['dueDate'],
});
export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;

// ─── Alerts ──────────────────────────────────────────────

export const createAlertSchema = z.object({
  type: z.string().min(1),
  severity: z.nativeEnum(AlertSeverity),
  title: z.string().min(2).max(200),
  message: z.string().max(2000),
  metadata: z.record(z.unknown()).default({}),
});
export type CreateAlertInput = z.infer<typeof createAlertSchema>;

// ─── Reports ─────────────────────────────────────────────

export const createReportSchema = z.object({
  type: z.nativeEnum(ReportType),
  filters: z.object({
    dateFrom: z.coerce.date().optional(),
    dateTo: z.coerce.date().optional(),
    groupIds: z.array(z.string().uuid()).optional(),
    roomIds: z.array(z.string().uuid()).optional(),
    userIds: z.array(z.string().uuid()).optional(),
  }).default({}),
  scheduleCron: z.string().optional(),
});
export type CreateReportInput = z.infer<typeof createReportSchema>;

// ─── Gamification Queries ────────────────────────────────

export const leaderboardQuerySchema = z.object({
  period: z.enum(['daily', 'weekly', 'alltime']).default('alltime'),
  groupId: z.string().uuid().optional(),
  limit: z.coerce.number().int().positive().max(100).default(25),
});
export type LeaderboardQuery = z.infer<typeof leaderboardQuerySchema>;

// ─── Integrations ────────────────────────────────────────

export const webhookConfigSchema = z.object({
  url: z.string().url(),
  events: z.array(z.string()).min(1),
  secret: z.string().min(16),
  enabled: z.boolean().default(true),
});
export type WebhookConfigInput = z.infer<typeof webhookConfigSchema>;

// ─── Pagination ──────────────────────────────────────────

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});
export type PaginationInput = z.infer<typeof paginationSchema>;

// ─── ID Param ────────────────────────────────────────────

export const idParamSchema = z.object({
  id: z.string().uuid(),
});
export type IdParam = z.infer<typeof idParamSchema>;
