import { WebSocket, WebSocketServer } from 'ws';
import { nanoid } from 'nanoid';
import { Logger } from 'pino';
import { EventEmitter } from 'events';

export class WebSocketService {
  private wsServer!: WebSocketServer;

  constructor(
    private readonly logger: Logger,
    private readonly eventEmitter: EventEmitter,
    private readonly port: number
  ) {}

  public initialize() {
    this.wsServer = new WebSocketServer({ port: this.port });

    this.wsServer.on('connection', (ws: WebSocket) => {
      const sessionId = nanoid();
      this.logger.info({ sessionId }, 'New client connected.');

      ws.on('message', (data: any) => {
        const message = JSON.parse(data.toString());
        this.logger.debug({ sessionId, message }, 'Received message from client.');
        this.eventEmitter.emit('websocket:message', { sessionId, message, ws });
      });

      ws.on('close', () => {
        this.logger.info({ sessionId }, 'Client disconnected.');
      });

      ws.on('error', (error: Error) => {
        this.logger.error({ sessionId, error }, 'WebSocket error.');
      });
    });

    this.logger.info(`WebSocket server initialized on port ${this.port}.`);
  }
}
