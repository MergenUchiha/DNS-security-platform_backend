import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedClients = new Set<string>();

  handleConnection(client: Socket) {
    this.connectedClients.add(client.id);
    console.log(`✅ Client connected: ${client.id} (Total: ${this.connectedClients.size})`);
    
    client.emit('connected', {
      message: 'Connected to DNS Security Platform WebSocket',
      clientId: client.id,
    });
  }

  handleDisconnect(client: Socket) {
    this.connectedClients.delete(client.id);
    console.log(`❌ Client disconnected: ${client.id} (Total: ${this.connectedClients.size})`);
  }

  // Broadcast simulation update
  broadcastSimulationUpdate(simulation: any) {
    this.server.emit('simulationUpdate', simulation);
  }

  // Broadcast new DNS query
  broadcastDNSQuery(query: any) {
    this.server.emit('dnsQuery', query);
  }

  // Broadcast metrics update
  broadcastMetricsUpdate(metrics: any) {
    this.server.emit('metricsUpdate', metrics);
  }

  // Broadcast attack event
  broadcastAttackEvent(event: any) {
    this.server.emit('attackEvent', event);
  }

  @SubscribeMessage('ping')
  handlePing(client: Socket) {
    return { event: 'pong', data: { timestamp: new Date().toISOString() } };
  }

  getConnectedClientsCount(): number {
    return this.connectedClients.size;
  }
}