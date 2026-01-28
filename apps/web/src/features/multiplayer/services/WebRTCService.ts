import { Device } from 'mediasoup-client';
import type { Transport, Producer, Consumer, RtpCapabilities } from 'mediasoup-client/lib/types';
import { socketService } from './SocketService';

class WebRTCService {
  private device: Device | null = null;
  private sendTransport: Transport | null = null;
  private recvTransport: Transport | null = null;
  private producers: Map<string, Producer> = new Map();
  private consumers: Map<string, Consumer> = new Map();

  async loadDevice(routerRtpCapabilities: RtpCapabilities) {
    this.device = new Device();
    await this.device.load({ routerRtpCapabilities });
  }

  async createSendTransport(transportParams: any): Promise<Transport> {
    if (!this.device) throw new Error('Device not loaded');
    this.sendTransport = this.device.createSendTransport(transportParams);

    this.sendTransport.on('connect', ({ dtlsParameters }, callback) => {
      socketService.emit('connectTransport', { transportId: this.sendTransport!.id, dtlsParameters });
      socketService.on('transportConnected', callback);
    });

    this.sendTransport.on('produce', ({ kind, rtpParameters }, callback) => {
      socketService.emit('produce', { transportId: this.sendTransport!.id, kind, rtpParameters });
      socketService.on('produced', ({ id }: { id: string }) => callback({ id }));
    });

    return this.sendTransport;
  }

  async createRecvTransport(transportParams: any): Promise<Transport> {
    if (!this.device) throw new Error('Device not loaded');
    this.recvTransport = this.device.createRecvTransport(transportParams);

    this.recvTransport.on('connect', ({ dtlsParameters }, callback) => {
      socketService.emit('connectTransport', { transportId: this.recvTransport!.id, dtlsParameters });
      socketService.on('transportConnected', callback);
    });

    return this.recvTransport;
  }

  async produce(track: MediaStreamTrack): Promise<Producer> {
    if (!this.sendTransport) throw new Error('Send transport not created');
    const producer = await this.sendTransport.produce({ track });
    this.producers.set(producer.id, producer);
    return producer;
  }

  async consume(consumerParams: any): Promise<{ consumer: Consumer; stream: MediaStream }> {
    if (!this.recvTransport) throw new Error('Recv transport not created');
    const consumer = await this.recvTransport.consume(consumerParams);
    this.consumers.set(consumer.id, consumer);
    const stream = new MediaStream([consumer.track]);
    return { consumer, stream };
  }

  get rtpCapabilities() {
    return this.device?.rtpCapabilities;
  }

  close() {
    this.producers.forEach(p => p.close());
    this.consumers.forEach(c => c.close());
    this.sendTransport?.close();
    this.recvTransport?.close();
    this.producers.clear();
    this.consumers.clear();
    this.device = null;
  }
}

export const webRTCService = new WebRTCService();
