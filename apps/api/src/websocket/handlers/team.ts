import { Server, Socket } from "socket.io";
import { TeamService } from "../../modules/teams/service.js";
import type { JwtPayload } from "../../middleware/auth.js";

const teamService = new TeamService();

export function registerTeamHandlers(io: Server, socket: Socket, user: JwtPayload) {
  socket.on("team:join", async (data: { teamId: string }) => { socket.join("team:" + data.teamId); io.to("team:" + data.teamId).emit("team:update", await teamService.getById(data.teamId)); });
  socket.on("team:leave", async (data: { teamId: string }) => { try { await teamService.leave(user.userId, data.teamId); socket.leave("team:" + data.teamId); io.to("team:" + data.teamId).emit("team:member:left", { userId: user.userId }); } catch (e) { socket.emit("team:error", { message: (e as Error).message }); } });
  socket.on("team:ready", async (data: { teamId: string; isReady: boolean }) => { try { await teamService.setReady(user.userId, data.teamId, data.isReady); io.to("team:" + data.teamId).emit("team:member:ready", { userId: user.userId, isReady: data.isReady }); } catch (e) { socket.emit("team:error", { message: (e as Error).message }); } });
  socket.on("team:role:assign", async (data: { teamId: string; targetUserId: string; role: string }) => { try { await teamService.assignRole(data.teamId, data.targetUserId, data.role); io.to("team:" + data.teamId).emit("team:role:updated", { userId: data.targetUserId, role: data.role }); } catch (e) { socket.emit("team:error", { message: (e as Error).message }); } });
  socket.on("team:vote", (data: { teamId: string; option: string }) => { io.to("team:" + data.teamId).emit("team:vote:cast", { userId: user.userId, option: data.option }); });
}
