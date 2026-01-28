import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!socket) {
      const token = localStorage.getItem('accessToken');
      socket = io('/', {
        auth: { token },
        transports: ['websocket', 'polling'],
      });
    }
    socketRef.current = socket;

    return () => {
      // Keep connection alive across component mounts
    };
  }, []);

  const emit = useCallback((event: string, data?: any) => {
    socketRef.current?.emit(event, data);
  }, []);

  const on = useCallback((event: string, handler: (...args: any[]) => void) => {
    socketRef.current?.on(event, handler);
    return () => { socketRef.current?.off(event, handler); };
  }, []);

  const disconnect = useCallback(() => {
    socket?.disconnect();
    socket = null;
  }, []);

  return { socket: socketRef.current, emit, on, disconnect };
}
