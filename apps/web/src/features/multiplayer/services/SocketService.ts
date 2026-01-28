import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;

  connect(token: string): Socket {
    if (this.socket?.connected) return this.socket;
    this.socket = io('/', { auth: { token }, transports: ['websocket', 'polling'] });
    return this.socket;
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }

  emit(event: string, data?: any) {
    this.socket?.emit(event, data);
  }

  on(event: string, handler: (...args: any[]) => void) {
    this.socket?.on(event, handler);
  }

  off(event: string, handler?: (...args: any[]) => void) {
    this.socket?.off(event, handler);
  }

  get connected() {
    return this.socket?.connected ?? false;
  }
}

export const socketService = new SocketService();
