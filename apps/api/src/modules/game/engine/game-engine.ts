import { PrismaClient, GameStatus, PuzzleType } from "@prisma/client";
import { calculateScore, type ScoreParams } from "./scoring-engine.js";
import { getNextHint, shouldAutoSuggest, type HintConfig } from "./hint-system.js";
import { validateAnswer, type ValidationResult } from "./puzzle-validator.js";
import { notFound, badRequest } from "../../../utils/errors.js";

const prisma = new PrismaClient();

export interface GameState {
  userId: string;
  roomId: string;
  status: GameStatus;
  score: number;
  timeSpent: number;
  currentPuzzle: number;
  totalPuzzles: number;
  hintsUsed: number;
  puzzleState?: {
    puzzleId: string;
    title: string;
    type: PuzzleType;
    attempts: number;
    hintsUsed: number;
    startedAt: number;
    autoSuggestHint: boolean;
  };
}

export class GameEngine {
  async startRoom(userId: string, roomId: string): Promise<GameState> {
    const room = await prisma.room.findUnique({ where: { id: roomId }, include: { puzzles: { where: { isActive: true }, orderBy: { order: "asc" } } } });
    if (!room) throw notFound("Room not found");

    let progress = await prisma.gameProgress.findUnique({ where: { userId_roomId: { userId, roomId } } });
    if (!progress) {
      progress = await prisma.gameProgress.create({ data: { userId, roomId, status: "LOADING", startedAt: new Date() } });
    } else {
      progress = await prisma.gameProgress.update({ where: { id: progress.id }, data: { status: "LOADING", startedAt: new Date(), score: 0, timeSpent: 0, currentPuzzle: 0, hintsUsed: 0 } });
    }

    progress = await prisma.gameProgress.update({ where: { id: progress.id }, data: { status: "INTRO" } });

    return { userId, roomId, status: progress.status as GameStatus, score: progress.score, timeSpent: progress.timeSpent, currentPuzzle: progress.currentPuzzle, totalPuzzles: room.puzzles.length, hintsUsed: progress.hintsUsed };
  }

  async activatePuzzle(userId: string, roomId: string): Promise<GameState> {
    const progress = await this.getProgress(userId, roomId);
    const room = await prisma.room.findUnique({ where: { id: roomId }, include: { puzzles: { where: { isActive: true }, orderBy: { order: "asc" } } } });
    if (!room) throw notFound("Room not found");

    if (progress.currentPuzzle >= room.puzzles.length) {
      await prisma.gameProgress.update({ where: { id: progress.id }, data: { status: "ROOM_COMPLETE", completedAt: new Date() } });
      return this.getState(userId, roomId);
    }

    const puzzle = room.puzzles[progress.currentPuzzle];
    await prisma.gameProgress.update({ where: { id: progress.id }, data: { status: "PUZZLE_ACTIVE" } });

    return { userId, roomId, status: "PUZZLE_ACTIVE", score: progress.score, timeSpent: progress.timeSpent, currentPuzzle: progress.currentPuzzle, totalPuzzles: room.puzzles.length, hintsUsed: progress.hintsUsed, puzzleState: { puzzleId: puzzle.id, title: puzzle.title, type: puzzle.type, attempts: 0, hintsUsed: 0, startedAt: Date.now(), autoSuggestHint: false } };
  }

  async submitAnswer(userId: string, roomId: string, puzzleId: string, answer: unknown): Promise<{ state: GameState; result: ValidationResult; score: number }> {
    const progress = await this.getProgress(userId, roomId);
    if (progress.status !== "PUZZLE_ACTIVE") throw badRequest("No active puzzle");

    const puzzle = await prisma.puzzle.findUnique({ where: { id: puzzleId } });
    if (!puzzle) throw notFound("Puzzle not found");

    const previousAttempts = await prisma.puzzleAttempt.count({ where: { userId, puzzleId } });
    const result = validateAnswer(puzzle.type, answer, puzzle.answer as any, puzzle.config);

    const userStats = await prisma.userStats.findUnique({ where: { userId } });
    const streak = userStats?.currentStreak ?? 0;
    const timeSpent = Math.round((Date.now() - (progress.startedAt?.getTime() ?? Date.now())) / 1000);
    let earnedScore = 0;

    if (result.isCorrect) {
      const scoreParams: ScoreParams = { basePoints: puzzle.basePoints, timeSpent, timeLimit: puzzle.timeLimit, attempts: previousAttempts + 1, hintsUsed: progress.hintsUsed, streak };
      earnedScore = calculateScore(scoreParams);
    }

    await prisma.puzzleAttempt.create({ data: { userId, puzzleId, answer: answer as any, isCorrect: result.isCorrect, score: earnedScore, timeSpent, hintsUsed: progress.hintsUsed } });

    const newStatus = result.isCorrect ? "PUZZLE_FEEDBACK" : "PUZZLE_ACTIVE";
    const updateData: any = { status: newStatus };
    if (result.isCorrect) { updateData.score = progress.score + earnedScore; updateData.timeSpent = progress.timeSpent + timeSpent; updateData.currentPuzzle = progress.currentPuzzle + 1; }
    await prisma.gameProgress.update({ where: { id: progress.id }, data: updateData });

    const state = await this.getState(userId, roomId);
    return { state, result, score: earnedScore };
  }

  async requestHint(userId: string, roomId: string, puzzleId: string): Promise<{ hint: string | null; cost: number }> {
    const progress = await this.getProgress(userId, roomId);
    const puzzle = await prisma.puzzle.findUnique({ where: { id: puzzleId } });
    if (!puzzle) throw notFound("Puzzle not found");

    const hints = puzzle.hints as string[];
    const previousAttempts = await prisma.puzzleAttempt.count({ where: { userId, puzzleId } });
    const timeSpent = Math.round((Date.now() - (progress.startedAt?.getTime() ?? Date.now())) / 1000);

    const hintConfig: HintConfig = { hints, hintsUsed: progress.hintsUsed, timeSpent, timeLimit: puzzle.timeLimit, attempts: previousAttempts };
    const nextHint = getNextHint(hintConfig);
    if (!nextHint) return { hint: null, cost: 0 };

    await prisma.gameProgress.update({ where: { id: progress.id }, data: { hintsUsed: progress.hintsUsed + 1 } });
    const cost = Math.round(puzzle.basePoints * 0.15 * (nextHint.index + 1));
    return { hint: nextHint.hint, cost };
  }

  async getState(userId: string, roomId: string): Promise<GameState> {
    const progress = await this.getProgress(userId, roomId);
    const room = await prisma.room.findUnique({ where: { id: roomId }, include: { puzzles: { where: { isActive: true }, orderBy: { order: "asc" } } } });
    if (!room) throw notFound("Room not found");

    const state: GameState = { userId, roomId, status: progress.status as GameStatus, score: progress.score, timeSpent: progress.timeSpent, currentPuzzle: progress.currentPuzzle, totalPuzzles: room.puzzles.length, hintsUsed: progress.hintsUsed };

    if (progress.status === "PUZZLE_ACTIVE" && progress.currentPuzzle < room.puzzles.length) {
      const puzzle = room.puzzles[progress.currentPuzzle];
      const attempts = await prisma.puzzleAttempt.count({ where: { userId, puzzleId: puzzle.id } });
      const ts = Math.round((Date.now() - (progress.startedAt?.getTime() ?? Date.now())) / 1000);
      const hints = puzzle.hints as string[];
      state.puzzleState = { puzzleId: puzzle.id, title: puzzle.title, type: puzzle.type, attempts, hintsUsed: progress.hintsUsed, startedAt: progress.startedAt?.getTime() ?? Date.now(), autoSuggestHint: shouldAutoSuggest({ hints, hintsUsed: progress.hintsUsed, timeSpent: ts, timeLimit: puzzle.timeLimit, attempts }) };
    }
    return state;
  }

  async handleTimeout(userId: string, roomId: string): Promise<GameState> {
    const progress = await this.getProgress(userId, roomId);
    await prisma.gameProgress.update({ where: { id: progress.id }, data: { status: "ROOM_FAILED", completedAt: new Date() } });
    return this.getState(userId, roomId);
  }

  async moveToDebrief(userId: string, roomId: string): Promise<GameState> {
    const progress = await this.getProgress(userId, roomId);
    await prisma.gameProgress.update({ where: { id: progress.id }, data: { status: "DEBRIEF" } });
    return this.getState(userId, roomId);
  }

  private async getProgress(userId: string, roomId: string) {
    const progress = await prisma.gameProgress.findUnique({ where: { userId_roomId: { userId, roomId } } });
    if (!progress) throw notFound("No game progress found. Start the room first.");
    return progress;
  }
}
