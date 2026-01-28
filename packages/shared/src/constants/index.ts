// ─── Enums ───────────────────────────────────────────────

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ORG_ADMIN = 'ORG_ADMIN',
  GROUP_MANAGER = 'GROUP_MANAGER',
  LEARNER = 'LEARNER',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING',
}

export enum RoomType {
  SOLO = 'SOLO',
  TEAM = 'TEAM',
}

export enum PuzzleType {
  PASSWORD_STRENGTH = 'PASSWORD_STRENGTH',
  PHISHING_INBOX = 'PHISHING_INBOX',
  DRAG_DROP_CLASSIFICATION = 'DRAG_DROP_CLASSIFICATION',
  MATCHING = 'MATCHING',
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  SPOT_DIFFERENCE = 'SPOT_DIFFERENCE',
  NETWORK_MAZE = 'NETWORK_MAZE',
  ROLE_PLAY_SCENARIO = 'ROLE_PLAY_SCENARIO',
  INCIDENT_RESPONSE = 'INCIDENT_RESPONSE',
}

export enum GameStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export enum GamePhase {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  INTRO = 'INTRO',
  PUZZLE_ACTIVE = 'PUZZLE_ACTIVE',
  PUZZLE_FEEDBACK = 'PUZZLE_FEEDBACK',
  ROOM_COMPLETE = 'ROOM_COMPLETE',
  ROOM_FAILED = 'ROOM_FAILED',
  DEBRIEF = 'DEBRIEF',
}

export enum TeamStatus {
  LOBBY = 'LOBBY',
  READY = 'READY',
  IN_GAME = 'IN_GAME',
  FINISHED = 'FINISHED',
  DISBANDED = 'DISBANDED',
}

export enum BadgeTier {
  BRONZE = 'BRONZE',
  SILVER = 'SILVER',
  GOLD = 'GOLD',
  PLATINUM = 'PLATINUM',
}

export enum BadgeCategory {
  COMPLETION = 'COMPLETION',
  PERFORMANCE = 'PERFORMANCE',
  STREAK = 'STREAK',
  COLLABORATION = 'COLLABORATION',
  SPEED = 'SPEED',
  MASTERY = 'MASTERY',
  SPECIAL = 'SPECIAL',
}

export enum AlertSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL',
}

export enum CampaignStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED',
}

export enum ReportType {
  COMPLETION = 'COMPLETION',
  PERFORMANCE = 'PERFORMANCE',
  GROUP_COMPARISON = 'GROUP_COMPARISON',
  USER_DETAIL = 'USER_DETAIL',
  CAMPAIGN = 'CAMPAIGN',
  RISK_ASSESSMENT = 'RISK_ASSESSMENT',
}

export enum AuditAction {
  USER_CREATED = 'USER_CREATED',
  USER_UPDATED = 'USER_UPDATED',
  USER_DELETED = 'USER_DELETED',
  USER_IMPORTED = 'USER_IMPORTED',
  GROUP_CREATED = 'GROUP_CREATED',
  GROUP_UPDATED = 'GROUP_UPDATED',
  GROUP_DELETED = 'GROUP_DELETED',
  CAMPAIGN_CREATED = 'CAMPAIGN_CREATED',
  CAMPAIGN_UPDATED = 'CAMPAIGN_UPDATED',
  REPORT_GENERATED = 'REPORT_GENERATED',
  SETTINGS_UPDATED = 'SETTINGS_UPDATED',
  SSO_CONFIGURED = 'SSO_CONFIGURED',
  WEBHOOK_CONFIGURED = 'WEBHOOK_CONFIGURED',
}

// ─── Game Constants ──────────────────────────────────────

export const SCORING = {
  BASE_POINTS_MIN: 100,
  BASE_POINTS_MAX: 200,
  TIME_BONUS_MAX: 50,
  ACCURACY_PENALTY_PER_ATTEMPT: 5,
  HINT_COSTS: [10, 15, 25] as const,
  STREAK_MULTIPLIERS: {
    3: 1.1,
    5: 1.2,
    10: 1.3,
    20: 1.5,
  } as const,
} as const;

export const GAME = {
  MAX_HINTS_PER_PUZZLE: 3,
  IDLE_HINT_SUGGEST_SECONDS: 60,
  MAX_TEAM_SIZE: 6,
  MIN_TEAM_SIZE: 2,
  JOIN_CODE_LENGTH: 6,
  DEFAULT_ROOM_TIME_LIMIT: 1800, // 30 minutes in seconds
} as const;

export const LEVELS = {
  XP_PER_LEVEL: 500,
  MAX_LEVEL: 50,
} as const;

export const STREAK_BADGE_MILESTONES = [3, 5, 7, 14, 30] as const;

// ─── Room Definitions ────────────────────────────────────

export const ROOMS = [
  {
    number: 1,
    name: 'Password & Authentication',
    description: 'Master the art of creating strong passwords and understanding multi-factor authentication.',
    type: RoomType.SOLO,
    timeLimit: 1800,
    maxPlayers: 1,
  },
  {
    number: 2,
    name: 'Phishing Defense',
    description: 'Learn to identify and defend against phishing attacks as a team.',
    type: RoomType.TEAM,
    timeLimit: 2400,
    maxPlayers: 4,
  },
  {
    number: 3,
    name: 'Data Protection',
    description: 'Understand data classification, secure handling, and privacy best practices.',
    type: RoomType.SOLO,
    timeLimit: 1800,
    maxPlayers: 1,
  },
  {
    number: 4,
    name: 'Network Security',
    description: 'Navigate network threats and configure security controls collaboratively.',
    type: RoomType.TEAM,
    timeLimit: 2400,
    maxPlayers: 4,
  },
  {
    number: 5,
    name: 'Insider Threat',
    description: 'Investigate suspicious activities and identify insider threats through role-play scenarios.',
    type: RoomType.TEAM,
    timeLimit: 3000,
    maxPlayers: 6,
  },
  {
    number: 6,
    name: 'Incident Response',
    description: 'Coordinate a full incident response under time pressure with your team.',
    type: RoomType.TEAM,
    timeLimit: 3600,
    maxPlayers: 6,
  },
] as const;

// ─── Socket Events ───────────────────────────────────────

export const SOCKET_EVENTS = {
  // Client -> Server
  GAME_JOIN: 'game:join',
  GAME_LEAVE: 'game:leave',
  GAME_STATE_UPDATE: 'game:state:update',
  PUZZLE_START: 'puzzle:start',
  PUZZLE_SUBMIT: 'puzzle:submit',
  PUZZLE_ACTION: 'puzzle:action',
  TEAM_JOIN: 'team:join',
  TEAM_LEAVE: 'team:leave',
  TEAM_READY: 'team:ready',
  TEAM_ROLE_ASSIGN: 'team:role:assign',
  TEAM_VOTE: 'team:vote',
  CHAT_MESSAGE: 'chat:message',
  CURSOR_MOVE: 'cursor:move',

  // Server -> Client
  GAME_JOINED: 'game:joined',
  GAME_STATE_SYNC: 'game:state:sync',
  GAME_TIMER_TICK: 'game:timer:tick',
  GAME_TIMEOUT: 'game:timeout',
  PUZZLE_STARTED: 'puzzle:started',
  PUZZLE_SUBMITTED: 'puzzle:submitted',
  PUZZLE_SOLVED: 'puzzle:solved',
  PUZZLE_FEEDBACK: 'puzzle:feedback',
  TEAM_MEMBER_JOINED: 'team:member:joined',
  TEAM_MEMBER_LEFT: 'team:member:left',
  TEAM_MEMBER_READY: 'team:member:ready',
  TEAM_ROLE_ASSIGNED: 'team:role:assigned',
  TEAM_VOTE_CAST: 'team:vote:cast',
  TEAM_VOTE_RESULT: 'team:vote:result',
  CHAT_MESSAGE_RECEIVED: 'chat:message',
  CURSOR_UPDATE: 'cursor:update',
  NOTIFICATION: 'notification',
} as const;
