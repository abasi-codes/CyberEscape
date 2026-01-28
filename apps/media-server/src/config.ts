import os from "os";
import type { RtpCodecCapability } from "mediasoup/node/lib/types.js";
import type { TransportListenInfo } from "mediasoup/node/lib/types.js";

const listenIp = process.env.LISTEN_IP || "0.0.0.0";
const announcedIp = process.env.ANNOUNCED_IP || "127.0.0.1";

export const config = {
  port: parseInt(process.env.MEDIA_PORT || "3002", 10),
  numWorkers: Math.min(os.cpus().length, 4),
  workerSettings: {
    logLevel: "warn" as const,
    logTags: ["info", "ice", "dtls", "rtp", "srtp", "rtcp"] as const,
    rtcMinPort: 10000,
    rtcMaxPort: 10100,
  },
  routerMediaCodecs: [
    {
      kind: "audio" as const,
      mimeType: "audio/opus",
      clockRate: 48000,
      channels: 2,
    },
    {
      kind: "video" as const,
      mimeType: "video/VP8",
      clockRate: 90000,
      parameters: {
        "x-google-start-bitrate": 1000,
      },
    },
    {
      kind: "video" as const,
      mimeType: "video/H264",
      clockRate: 90000,
      parameters: {
        "packetization-mode": 1,
        "profile-level-id": "4d0032",
        "level-asymmetry-allowed": 1,
        "x-google-start-bitrate": 1000,
      },
    },
  ] as RtpCodecCapability[],
  webRtcTransportOptions: {
    listenInfos: [
      {
        protocol: "udp" as const,
        ip: listenIp,
        announcedAddress: announcedIp,
      },
      {
        protocol: "tcp" as const,
        ip: listenIp,
        announcedAddress: announcedIp,
      },
    ] as TransportListenInfo[],
    enableUdp: true,
    enableTcp: true,
    preferUdp: true,
    maxIncomingBitrate: 1500000,
  },
};
