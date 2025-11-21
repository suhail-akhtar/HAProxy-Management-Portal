import WebSocket from 'ws';
import { Server as HTTPServer } from 'http';
import { dataStore } from './dataStore';
import { Stats } from '../models/types';

export class WebSocketService {
  private wss: WebSocket.Server;
  private updateInterval: NodeJS.Timeout | null = null;

  constructor(server: HTTPServer) {
    this.wss = new WebSocket.Server({ server, path: '/ws' });
    this.setupWebSocket();
    this.startRealTimeUpdates();
  }

  private setupWebSocket() {
    this.wss.on('connection', (ws: WebSocket) => {
      console.log('Client connected to WebSocket');

      ws.on('message', (message: string) => {
        try {
          const data = JSON.parse(message.toString());
          this.handleMessage(ws, data);
        } catch (error) {
          console.error('WebSocket message error:', error);
        }
      });

      ws.on('close', () => {
        console.log('Client disconnected from WebSocket');
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
      });

      // Send initial state
      this.sendInitialState(ws);
    });
  }

  private sendInitialState(ws: WebSocket) {
    const state = dataStore.getState();
    this.sendToClient(ws, {
      type: 'INITIAL_STATE',
      data: {
        frontends: state.frontends,
        backends: state.backends,
        statsHistory: state.statsHistory,
        logs: state.logs.slice(0, 10),
        systemHealth: state.systemHealth,
      },
    });
  }

  private handleMessage(ws: WebSocket, message: any) {
    switch (message.type) {
      case 'PING':
        this.sendToClient(ws, { type: 'PONG' });
        break;
      case 'SUBSCRIBE':
        // Handle subscription to specific data streams
        break;
      default:
        console.log('Unknown message type:', message.type);
    }
  }

  private sendToClient(ws: WebSocket, data: any) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  }

  private broadcast(data: any) {
    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  }

  private startRealTimeUpdates() {
    // Generate new stats every second
    this.updateInterval = setInterval(() => {
      const currentStats = dataStore.getStats();
      const currentFrontends = dataStore.getFrontends();
      
      // Generate new stat point
      const now = Date.now();
      const baseRps = 150;
      const variance = Math.floor(Math.random() * 40) - 20;
      const newRps = Math.max(0, baseRps + variance);
      
      const newStat: Stats = {
        timestamp: now,
        timeLabel: new Date(now).toLocaleTimeString([], { 
          hour12: false, 
          hour: '2-digit', 
          minute: '2-digit', 
          second: '2-digit' 
        }),
        requestsPerSec: newRps,
        responseTime: Math.max(5, 25 + (Math.random() * 20 - 10)),
        errorRate: Math.random() > 0.95 ? Math.random() * 5 : 0,
        activeConnections: Math.floor(newRps * 2.5),
      };

      dataStore.addStats(newStat);

      // Update frontends
      currentFrontends.forEach((fe) => {
        if (fe.status === 'active') {
          dataStore.updateFrontend(fe.id, {
            requestsPerSec: Math.floor(newRps / currentFrontends.length) + (Math.floor(Math.random() * 10) - 5),
            sessions: fe.sessions + Math.floor(Math.random() * 5),
          });
        }
      });

      // Generate random log
      if (Math.random() > 0.7) {
        const levels = ['info', 'info', 'info', 'success', 'warn', 'error'] as const;
        const sources = ['web_front', 'api_gateway', 'app_servers', 'System', 'Security'];
        const messages = [
          'Connection established',
          'SSL Handshake successful',
          'Request proxied to backend',
          'Health check passed',
          'Response time threshold exceeded',
          'Connection refused',
          'ACL denied request'
        ];
        
        dataStore.addLog({
          timestamp: new Date().toISOString(),
          level: levels[Math.floor(Math.random() * levels.length)],
          source: sources[Math.floor(Math.random() * sources.length)],
          message: messages[Math.floor(Math.random() * messages.length)]
        });
      }

      // Broadcast updates to all connected clients
      this.broadcast({
        type: 'STATS_UPDATE',
        data: {
          stat: newStat,
          frontends: dataStore.getFrontends(),
          logs: dataStore.getLogs().slice(0, 10),
        },
      });
    }, 1000);
  }

  public stop() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    this.wss.close();
  }
}
