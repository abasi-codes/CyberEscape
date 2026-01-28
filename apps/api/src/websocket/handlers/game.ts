import { Server, Socket } from "socket.io";
import { GameEngine } from "../../modules/game/engine/game-engine.js";
import { GamificationService } from "../../modules/gamification/service.js";
import type { JwtPayload } from "../../middleware/auth.js";

const engine = new GameEngine();
const gamification = new GamificationService();

export function registerGameHandlers(io: Server, socket: Socket, user: JwtPayload) {
  socket.on("game:join", async (data: { roomId: string }) => {
    try { socket.join("room:" + data.roomId); const state = await engine.startRoom(user.userId, data.roomId); socket.emit("game:state:update", state); }
    catch (e) { socket.emit("game:error", { message: (e as Error).message }); }
  });

  socket.on("game:leave", (data: { roomId: string }) => { socket.leave("room:" + data.roomId); });

  socket.on("puzzle:start", async (data: { roomId: string }) => {
    try { socket.emit("game:state:update", await engine.activatePuzzle(user.userId, data.roomId)); }
    catch (e) { socket.emit("game:error", { message: (e as Error).message }); }
  });

  socket.on("puzzle:submit", async (data: { roomId: string; puzzleId: string; answer: unknown }) => {
    try {
      const result = await engine.submitAnswer(user.userId, data.roomId, data.puzzleId, data.answer);
      socket.emit("game:state:update", result.state);
      socket.emit("puzzle:result", { isCorrect: result.result.isCorrect, feedback: result.result.feedback, score: result.score });
      if (result.result.isCorrect) {
        const g = await gamification.awardPoints(user.userId, result.score);
        await gamification.updateStreak(user.userId);
        if (g.newBadges.length > 0) socket.emit("badges:new", g.newBadges);
        io.to("room:" + data.roomId).emit("game:score:update", { userId: user.userId, score: result.state.score });
      }
    } catch (e) { socket.emit("game:error", { message: (e as Error).message }); }
  });

  socket.on("game:timer:tick", (data: { roomId: string; elapsed: number }) => {
    io.to("room:" + data.roomId).emit("game:timer:sync", { elapsed: data.elapsed });
  });

  socket.on("game:timeout", async (data: { roomId: string }) => {
    try { socket.emit("game:state:update", await engine.handleTimeout(user.userId, data.roomId)); }
    catch (e) { socket.emit("game:error", { message: (e as Error).message }); }
  });
}
