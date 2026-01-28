import { Server, Socket } from "socket.io";
import { createWebRtcTransport, createRouter, getRouter } from "./mediasoup-server.js";
import { logger } from "../utils/logger.js";
import type { types as MT } from "mediasoup";

const transports = new Map<string, MT.WebRtcTransport>();
const producers = new Map<string, MT.Producer>();
const consumers = new Map<string, MT.Consumer>();

export function registerSignalingHandlers(io: Server, socket: Socket) {
  socket.on("media:getRouterCapabilities", async (_, cb) => { try { const r = await createRouter(); cb({ rtpCapabilities: r.rtpCapabilities }); } catch (e) { cb({ error: (e as Error).message }); } });

  socket.on("media:createTransport", async (_data: { direction: string }, cb) => { try { const { transport, params } = await createWebRtcTransport(); transports.set(transport.id, transport); cb(params); } catch (e) { cb({ error: (e as Error).message }); } });

  socket.on("media:connectTransport", async (data: { transportId: string; dtlsParameters: any }, cb) => { try { const t = transports.get(data.transportId); if (!t) throw new Error("Transport not found"); await t.connect({ dtlsParameters: data.dtlsParameters }); cb({ connected: true }); } catch (e) { cb({ error: (e as Error).message }); } });

  socket.on("media:produce", async (data: { transportId: string; kind: MT.MediaKind; rtpParameters: MT.RtpParameters }, cb) => { try { const t = transports.get(data.transportId); if (!t) throw new Error("Transport not found"); const p = await t.produce({ kind: data.kind, rtpParameters: data.rtpParameters }); producers.set(p.id, p); p.on("transportclose", () => producers.delete(p.id)); socket.broadcast.emit("media:newProducer", { producerId: p.id, kind: data.kind }); cb({ producerId: p.id }); } catch (e) { cb({ error: (e as Error).message }); } });

  socket.on("media:consume", async (data: { transportId: string; producerId: string; rtpCapabilities: MT.RtpCapabilities }, cb) => { try { const r = getRouter(); if (!r) throw new Error("No router"); if (!r.canConsume({ producerId: data.producerId, rtpCapabilities: data.rtpCapabilities })) throw new Error("Cannot consume"); const t = transports.get(data.transportId); if (!t) throw new Error("Transport not found"); const c = await t.consume({ producerId: data.producerId, rtpCapabilities: data.rtpCapabilities, paused: true }); consumers.set(c.id, c); c.on("transportclose", () => consumers.delete(c.id)); cb({ consumerId: c.id, producerId: data.producerId, kind: c.kind, rtpParameters: c.rtpParameters }); } catch (e) { cb({ error: (e as Error).message }); } });

  socket.on("media:resume", async (data: { consumerId: string }, cb) => { try { const c = consumers.get(data.consumerId); if (!c) throw new Error("Consumer not found"); await c.resume(); cb({ resumed: true }); } catch (e) { cb({ error: (e as Error).message }); } });

  socket.on("disconnect", () => logger.debug({ socketId: socket.id }, "Media socket disconnected"));
}
