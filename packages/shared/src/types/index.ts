import {
  UserRole, UserStatus, RoomType, PuzzleType, GameStatus, GamePhase,
  TeamStatus, BadgeTier, BadgeCategory, AlertSeverity, CampaignStatus,
  ReportType, AuditAction,
} from '../constants/index.js';

// ─── Organization ────────────────────────────────────────

export interface Organization {
  id: string;
  name: string;
  settings: OrgSettings;
  branding: OrgBranding;
  createdAt: Date;
}

export interface OrgSettings {
  gamificationEnabled: boolean;
  leaderboardEnabled: boolean;
  badgesEnabled: boolean;
  timezone: string;
  defaultLanguage: string;
  allowSelfRegistration: boolean;
}

export interface OrgBranding {
  logoUrl?: string;
  primaryColor?: string;
  accentColor?: string;
}

// ─── User ────────────────────────────────────────────────

export interface User {
  id: string;
  orgId: string;
  email: string;
  passwordHash?: string;
  name: string;
  role: UserRole;
  groupId?: string;
  status: UserStatus;
  ssoProvider?: string;
  ssoId?: string;
  preferences: UserPreferences;
  lastLogin?: Date;
  createdAt: Date;
}

export interface UserPreferences {
  theme: 'dark' | 'light';
  language: string;
  leaderboardOptOut: boolean;
  emailNotifications: boolean;
}

export type PublicUser = Pick<User, 'id' | 'name' | 'role' | 'orgId'>;

// ─── Group ───────────────────────────────────────────────

export interface Group {
  id: string;
  orgId: string;
  name: string;
  parentGroupId?: string;
  managerId?: string;
}

export interface UserGroup {
  userId: string;
  groupId: string;
}

// ─── Room ────────────────────────────────────────────────

export interface Room {
  id: string;
  number: number;
  name: string;
  description: string;
  type: RoomType;
  timeLimit: number;
  maxPlayers: number;
  orderIndex: number;
  published: boolean;
  config: Record<string, unknown>;
}

// ─── Puzzle ──────────────────────────────────────────────

export interface Puzzle {
  id: string;
  roomId: string;
  type: PuzzleType;
  orderIndex: number;
  title: string;
  description: string;
  content: PuzzleContent;
  solution: PuzzleSolution;
  hints: PuzzleHint[];
  points: number;
  difficulty: number;
}

export interface PuzzleContent {
  [key: string]: unknown;
}

export interface PuzzleSolution {
  [key: string]: unknown;
}

export interface PuzzleHint {
  index: number;
  text: string;
  cost: number;
}

// ─── Game Progress ───────────────────────────────────────

export interface GameProgress {
  id: string;
  userId: string;
  roomId: string;
  status: GameStatus;
  currentPuzzleId?: string;
  completedPuzzleIds: string[];
  totalPoints: number;
  hintsUsed: number;
  startedAt?: Date;
  completedAt?: Date;
  totalDuration?: number;
  gameState: GameState;
}

export interface GameState {
  phase: GamePhase;
  currentPuzzleIndex: number;
  puzzleStates: Record<string, PuzzleState>;
  timeRemaining: number;
}

export interface PuzzleState {
  attempts: number;
  hintsRevealed: number;
  startedAt?: number;
  completedAt?: number;
  pointsAwarded: number;
}

// ─── Puzzle Attempt ──────────────────────────────────────

export interface PuzzleAttempt {
  id: string;
  gameProgressId: string;
  puzzleId: string;
  attemptNumber: number;
  answer: Record<string, unknown>;
  correct: boolean;
  pointsAwarded: number;
  timeSpent: number;
}

// ─── Team ────────────────────────────────────────────────

export interface Team {
  id: string;
  orgId: string;
  name?: string;
  roomId: string;
  joinCode: string;
  status: TeamStatus;
  hostUserId: string;
  createdAt: Date;
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  role?: string;
  ready: boolean;
  joinedAt: Date;
}

export interface TeamSession {
  id: string;
  teamId: string;
  roomId: string;
  startedAt: Date;
  endedAt?: Date;
  completed: boolean;
  score: number;
}

// ─── Gamification ────────────────────────────────────────

export interface UserStats {
  userId: string;
  totalXP: number;
  currentLevel: number;
  totalPoints: number;
  lifetimePoints: number;
  roomsCompleted: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate?: Date;
  totalPlayTime: number;
}

export interface Badge {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: BadgeCategory;
  icon: string;
  tier: BadgeTier;
  criteria: BadgeCriteria;
  secret: boolean;
  enabled: boolean;
}

export interface BadgeCriteria {
  type: string;
  count?: number;
  condition?: string;
  roomId?: string;
  minScore?: number;
  maxTime?: number;
  [key: string]: unknown;
}

export interface UserBadge {
  userId: string;
  badgeId: string;
  earnedAt: Date;
}

export interface DailyChallenge {
  id: string;
  date: Date;
  puzzleContent: PuzzleContent;
  points: number;
}

export interface UserDailyChallenge {
  userId: string;
  challengeId: string;
  completed: boolean;
  score: number;
}

// ─── Admin ───────────────────────────────────────────────

export interface Campaign {
  id: string;
  orgId: string;
  name: string;
  startDate: Date;
  dueDate: Date;
  targetGroups: string[];
  settings: CampaignSettings;
  status: CampaignStatus;
}

export interface CampaignSettings {
  requiredRooms: number[];
  reminderDays: number[];
  allowLateCompletion: boolean;
}

export interface Alert {
  id: string;
  orgId: string;
  type: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  metadata: Record<string, unknown>;
  acknowledged: boolean;
  createdAt: Date;
}

export interface AuditLog {
  id: string;
  orgId: string;
  adminUserId: string;
  action: AuditAction;
  targetType: string;
  targetId: string;
  details: Record<string, unknown>;
  timestamp: Date;
}

export interface Report {
  id: string;
  orgId: string;
  type: ReportType;
  filters: Record<string, unknown>;
  generatedAt: Date;
  fileUrl?: string;
  scheduleCron?: string;
}

// ─── Auth ────────────────────────────────────────────────

export interface RefreshToken {
  id: string;
  token: string;
  userId: string;
  expiresAt: Date;
  revokedAt?: Date;
}

export interface SSOConfig {
  id: string;
  orgId: string;
  provider: string;
  entityId: string;
  ssoUrl: string;
  certificate: string;
  metadata: Record<string, unknown>;
}

// ─── Integrations ────────────────────────────────────────

export interface WebhookConfig {
  id: string;
  orgId: string;
  url: string;
  events: string[];
  secret: string;
  enabled: boolean;
}

export interface SCORMPackage {
  id: string;
  orgId: string;
  version: string;
  config: Record<string, unknown>;
}

// ─── API Types ───────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  statusCode: number;
  error: string;
  message: string;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  points: number;
  level: number;
}

export interface ScoreBreakdown {
  basePoints: number;
  timeBonus: number;
  accuracyPenalty: number;
  hintPenalty: number;
  streakMultiplier: number;
  totalPoints: number;
}

// ─── Socket Types ────────────────────────────────────────

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: number;
}

export interface CursorPosition {
  userId: string;
  x: number;
  y: number;
}

export interface TeamVote {
  puzzleId: string;
  userId: string;
  answer: unknown;
}

export interface TeamVoteResult {
  puzzleId: string;
  answers: Record<string, number>;
  winner: unknown;
}

export interface JWTPayload {
  userId: string;
  orgId: string;
  role: UserRole;
  email: string;
}
