import { useEffect, useRef } from 'react';
import { useWebRTC } from '@/hooks/useWebRTC';
import { Button } from '@/components/ui/Button';
import { Mic, MicOff, Video, VideoOff } from 'lucide-react';

interface Props {
  roomId: string | null;
}

export default function VideoGrid({ roomId }: Props) {
  const { localStream, peers, audioEnabled, videoEnabled, init, toggleAudio, toggleVideo } = useWebRTC(roomId);
  const localVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  return (
    <div className="rounded-xl border border-cyber-border bg-cyber-card p-4">
      <h4 className="mb-3 font-semibold">Video Chat</h4>
      <div className="grid grid-cols-2 gap-2">
        <div className="relative overflow-hidden rounded-lg bg-cyber-surface">
          <video ref={localVideoRef} autoPlay muted playsInline className="h-40 w-full object-cover" />
          <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1 text-xs">You</span>
        </div>
        {peers.map(peer => (
          <PeerVideo key={peer.id} stream={peer.stream} label={peer.id} />
        ))}
      </div>
      <div className="mt-3 flex justify-center gap-2">
        <Button variant={audioEnabled ? 'secondary' : 'destructive'} size="icon" onClick={toggleAudio}>
          {audioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
        </Button>
        <Button variant={videoEnabled ? 'secondary' : 'destructive'} size="icon" onClick={toggleVideo}>
          {videoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}

function PeerVideo({ stream, label }: { stream: MediaStream; label: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => { if (ref.current) ref.current.srcObject = stream; }, [stream]);
  return (
    <div className="relative overflow-hidden rounded-lg bg-cyber-surface">
      <video ref={ref} autoPlay playsInline className="h-40 w-full object-cover" />
      <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1 text-xs">{label}</span>
    </div>
  );
}
