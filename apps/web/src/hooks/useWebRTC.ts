import { useState, useCallback, useRef, useEffect } from 'react';
import { Device } from 'mediasoup-client';
import { useSocket } from './useSocket';

type Transport = any;
type Producer = any;
type Consumer = any;

interface Peer {
  id: string;
  stream: MediaStream;
}

export function useWebRTC(roomId: string | null) {
  const { emit } = useSocket();
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [peers, setPeers] = useState<Peer[]>([]);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);

  const deviceRef = useRef<Device | null>(null);
  const sendTransportRef = useRef<Transport | null>(null);
  const recvTransportRef = useRef<Transport | null>(null);
  const producersRef = useRef<Map<string, Producer>>(new Map());
  const consumersRef = useRef<Map<string, Consumer>>(new Map());

  const init = useCallback(async () => {
    if (!roomId) return;

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
    setLocalStream(stream);

    const device = new Device();
    deviceRef.current = device;

    emit('getRouterRtpCapabilities', { roomId });
  }, [roomId, emit]);

  const toggleAudio = useCallback(() => {
    localStream?.getAudioTracks().forEach(t => { t.enabled = !t.enabled; });
    setAudioEnabled(prev => !prev);
  }, [localStream]);

  const toggleVideo = useCallback(() => {
    localStream?.getVideoTracks().forEach(t => { t.enabled = !t.enabled; });
    setVideoEnabled(prev => !prev);
  }, [localStream]);

  const cleanup = useCallback(() => {
    localStream?.getTracks().forEach(t => t.stop());
    producersRef.current.forEach(p => p.close());
    consumersRef.current.forEach(c => c.close());
    sendTransportRef.current?.close();
    recvTransportRef.current?.close();
    setLocalStream(null);
    setPeers([]);
  }, [localStream]);

  useEffect(() => { return cleanup; }, []);

  return {
    localStream,
    peers,
    audioEnabled,
    videoEnabled,
    init,
    toggleAudio,
    toggleVideo,
    cleanup,
  };
}
