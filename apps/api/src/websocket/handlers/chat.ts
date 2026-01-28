import { Server, Socket } from "socket.io";
import type { JwtPayload } from "../../middleware/auth.js";

interface ChatMessage { id: string; userId: string; userName: string; text: string; timestamp: string; }

const roomMessages = new Map<string, ChatMessage[]>();
const MAX_HISTORY = 100;

export function registerChatHandlers(io: Server, socket: Socket, user: JwtPayload) {
  socket.on("chat:message", (data: { roomId: string; text: string }) => {
    const msg: ChatMessage = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), userId: user.userId, userName: user.email.split("@")[0], text: data.text.slice(0, 500), timestamp: new Date().toISOString() };
    const key = "room:" + data.roomId;
    if (!roomMessages.has(key)) roomMessages.set(key, []);
    const msgs = roomMessages.get(key)!;
    msgs.push(msg);
    if (msgs.length > MAX_HISTORY) msgs.shift();
    io.to(key).emit("chat:message", msg);
  });

  socket.on("chat:history", (data: { roomId: string }) => {
    socket.emit("chat:history", roomMessages.get("room:" + data.roomId) || []);
  });
}
