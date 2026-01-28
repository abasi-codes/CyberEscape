import * as mediasoup from "mediasoup";
import { config } from "../config/index.js";
import { logger } from "../utils/logger.js";

const mediaCodecs: mediasoup.types.RtpCodecCapability[] = [
  { kind: "audio", mimeType: "audio/opus", clockRate: 48000, channels: 2, preferredPayloadType: 100 },
  { kind: "video", mimeType: "video/VP8", clockRate: 90000, preferredPayloadType: 101 },
];

let worker: mediasoup.types.Worker | null = null;
let router: mediasoup.types.Router | null = null;

export async function createWorker(): Promise<mediasoup.types.Worker> {
  if (worker) return worker;
  worker = await mediasoup.createWorker({ logLevel: "warn", rtcMinPort: 10000, rtcMaxPort: 10100 });
  worker.on("died", () => { logger.error("Mediasoup worker died"); worker = null; router = null; });
  logger.info("Mediasoup worker created");
  return worker;
}

export async function createRouter(): Promise<mediasoup.types.Router> {
  if (router) return router;
  const w = await createWorker();
  router = await w.createRouter({ mediaCodecs });
  logger.info("Mediasoup router created");
  return router;
}

export async function createWebRtcTransport() {
  const r = await createRouter();
  const transport = await r.createWebRtcTransport({ listenIps: [{ ip: config.mediasoup.listenIp, announcedIp: config.mediasoup.announcedIp }], enableUdp: true, enableTcp: true, preferUdp: true });
  return { transport, params: { id: transport.id, iceParameters: transport.iceParameters, iceCandidates: transport.iceCandidates, dtlsParameters: transport.dtlsParameters } };
}

export function getRouter() { return router; }
