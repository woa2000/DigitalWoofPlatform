import { WebSocket, WebSocketServer } from 'ws';
import { CalendarItem, CalendarUpdateEvent } from '../../shared/types/calendar.js';
import { CalendarRepository } from '../repositories/CalendarRepository.js';

export interface ConnectedClient {
  id: string;
  accountId: string;
  userId: string;
  socket: WebSocket;
  lastActivity: Date;
  metadata?: Record<string, any>;
}

export interface WebSocketMessage {
  type: 'subscribe' | 'unsubscribe' | 'calendar_update' | 'ping' | 'pong' | 'error';
  payload?: any;
  timestamp: Date;
  clientId?: string;
  requestId?: string;
}

export interface SubscriptionFilters {
  accountId: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  contentTypes?: string[];
  campaigns?: string[];
  tags?: string[];
}

export interface CalendarSubscription {
  clientId: string;
  accountId: string;
  filters: SubscriptionFilters;
  subscribedAt: Date;
}

export class WebSocketService {
  private wss: WebSocketServer;
  private clients: Map<string, ConnectedClient> = new Map();
  private subscriptions: Map<string, CalendarSubscription> = new Map();
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(
    private calendarRepository: CalendarRepository,
    private port: number = 8080
  ) {
    this.wss = new WebSocketServer({ port: this.port });
    this.setupWebSocketServer();
    this.startHeartbeat();
    this.startCleanup();
    
    console.log(`[WebSocketService] WebSocket server started on port ${this.port}`);
  }

  private setupWebSocketServer(): void {
    this.wss.on('connection', (socket: WebSocket, request) => {
      console.log(`[WebSocketService] New connection from ${request.socket.remoteAddress}`);
      
      const clientId = this.generateClientId();
      
      // Initialize client without account info (will be set on first message)
      const client: ConnectedClient = {
        id: clientId,
        accountId: '',
        userId: '',
        socket,
        lastActivity: new Date(),
        metadata: {
          remoteAddress: request.socket.remoteAddress,
          userAgent: request.headers['user-agent']
        }
      };

      this.clients.set(clientId, client);

      // Setup message handling
      socket.on('message', (data) => {
        this.handleMessage(clientId, data);
      });

      // Handle disconnection
      socket.on('close', () => {
        this.handleDisconnection(clientId);
      });

      // Handle errors
      socket.on('error', (error) => {
        console.error(`[WebSocketService] Client ${clientId} error:`, error);
        this.handleDisconnection(clientId);
      });

      // Send welcome message
      this.sendMessage(clientId, {
        type: 'ping',
        payload: { clientId, message: 'Connection established' },
        timestamp: new Date()
      });
    });

    this.wss.on('error', (error) => {
      console.error('[WebSocketService] WebSocket server error:', error);
    });
  }

  private handleMessage(clientId: string, data: any): void {
    try {
      const message: WebSocketMessage = JSON.parse(data.toString());
      const client = this.clients.get(clientId);
      
      if (!client) {
        console.warn(`[WebSocketService] Message from unknown client: ${clientId}`);
        return;
      }

      // Update client activity
      client.lastActivity = new Date();

      console.log(`[WebSocketService] Message from ${clientId}:`, message.type);

      switch (message.type) {
        case 'subscribe':
          this.handleSubscription(clientId, message);
          break;
          
        case 'unsubscribe':
          this.handleUnsubscription(clientId, message);
          break;
          
        case 'calendar_update':
          this.handleCalendarUpdate(clientId, message);
          break;
          
        case 'ping':
          this.handlePing(clientId, message);
          break;
          
        case 'pong':
          // Client responded to our ping, nothing to do
          break;
          
        default:
          console.warn(`[WebSocketService] Unknown message type: ${message.type}`);
          this.sendError(clientId, `Unknown message type: ${message.type}`, message.requestId);
      }
    } catch (error) {
      console.error(`[WebSocketService] Error parsing message from ${clientId}:`, error);
      this.sendError(clientId, 'Invalid message format');
    }
  }

  private handleSubscription(clientId: string, message: WebSocketMessage): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    try {
      const { accountId, userId, filters } = message.payload;
      
      if (!accountId || !userId) {
        this.sendError(clientId, 'accountId and userId are required for subscription', message.requestId);
        return;
      }

      // Update client info
      client.accountId = accountId;
      client.userId = userId;

      // Create or update subscription
      const subscription: CalendarSubscription = {
        clientId,
        accountId,
        filters: {
          accountId,
          ...filters
        },
        subscribedAt: new Date()
      };

      this.subscriptions.set(clientId, subscription);

      console.log(`[WebSocketService] Client ${clientId} subscribed to account ${accountId}`);

      // Send confirmation
      this.sendMessage(clientId, {
        type: 'subscribe',
        payload: { 
          success: true, 
          accountId, 
          filters: subscription.filters 
        },
        timestamp: new Date(),
        requestId: message.requestId
      });

      // Send initial calendar data if requested
      if (message.payload.sendInitialData) {
        this.sendInitialCalendarData(clientId, subscription);
      }

    } catch (error) {
      console.error(`[WebSocketService] Error handling subscription:`, error);
      this.sendError(clientId, 'Failed to process subscription', message.requestId);
    }
  }

  private async sendInitialCalendarData(clientId: string, subscription: CalendarSubscription): Promise<void> {
    try {
      const filters = subscription.filters;
      const items = await this.calendarRepository.getByDateRange(
        filters.accountId,
        filters.dateRange?.start || new Date(),
        filters.dateRange?.end || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        {
          content_types: filters.contentTypes as any,
          campaigns: filters.campaigns,
          tags: filters.tags
        }
      );

      this.sendMessage(clientId, {
        type: 'calendar_update',
        payload: {
          operation: 'initial_load',
          items,
          count: items.length
        },
        timestamp: new Date()
      });

    } catch (error) {
      console.error(`[WebSocketService] Error sending initial data:`, error);
      this.sendError(clientId, 'Failed to load initial calendar data');
    }
  }

  private handleUnsubscription(clientId: string, message: WebSocketMessage): void {
    this.subscriptions.delete(clientId);
    
    console.log(`[WebSocketService] Client ${clientId} unsubscribed`);

    this.sendMessage(clientId, {
      type: 'unsubscribe',
      payload: { success: true },
      timestamp: new Date(),
      requestId: message.requestId
    });
  }

  private async handleCalendarUpdate(clientId: string, message: WebSocketMessage): Promise<void> {
    try {
      const { operation, item, itemId } = message.payload;
      const client = this.clients.get(clientId);
      
      if (!client || !client.accountId) {
        this.sendError(clientId, 'Client not properly authenticated', message.requestId);
        return;
      }

      // Validate the operation
      if (!['create', 'update', 'delete', 'move'].includes(operation)) {
        this.sendError(clientId, `Invalid operation: ${operation}`, message.requestId);
        return;
      }

      // Process the calendar update
      let result: any;
      
      switch (operation) {
        case 'create':
          if (!item) {
            this.sendError(clientId, 'Item data required for create operation', message.requestId);
            return;
          }
          result = await this.calendarRepository.create({
            ...item,
            account_id: client.accountId,
            user_id: client.userId
          });
          break;
          
        case 'update':
          if (!item || !itemId) {
            this.sendError(clientId, 'Item data and itemId required for update operation', message.requestId);
            return;
          }
          result = await this.calendarRepository.update(client.accountId, itemId, item);
          break;
          
        case 'delete':
          if (!itemId) {
            this.sendError(clientId, 'itemId required for delete operation', message.requestId);
            return;
          }
          result = await this.calendarRepository.delete(client.accountId, itemId);
          break;
          
        case 'move':
          if (!itemId || !item.scheduled_for) {
            this.sendError(clientId, 'itemId and new scheduled_for required for move operation', message.requestId);
            return;
          }
          result = await this.calendarRepository.move(client.accountId, itemId, item.scheduled_for);
          break;
      }

      // Send confirmation to the requesting client
      this.sendMessage(clientId, {
        type: 'calendar_update',
        payload: {
          operation,
          result,
          success: true
        },
        timestamp: new Date(),
        requestId: message.requestId
      });

      // Broadcast the update to other subscribed clients
      this.broadcastUpdate(client.accountId, {
        type: 'calendar_update',
        account_id: client.accountId,
        operation,
        item: result,
        affected_dates: [item?.scheduled_for || new Date()],
        timestamp: new Date()
      }, clientId); // Exclude the sender

    } catch (error) {
      console.error(`[WebSocketService] Error handling calendar update:`, error);
      this.sendError(clientId, 'Failed to process calendar update', message.requestId);
    }
  }

  private handlePing(clientId: string, message: WebSocketMessage): void {
    this.sendMessage(clientId, {
      type: 'pong',
      payload: message.payload,
      timestamp: new Date(),
      requestId: message.requestId
    });
  }

  private handleDisconnection(clientId: string): void {
    const client = this.clients.get(clientId);
    if (client) {
      console.log(`[WebSocketService] Client ${clientId} (account: ${client.accountId}) disconnected`);
    }

    this.clients.delete(clientId);
    this.subscriptions.delete(clientId);
  }

  // Public methods for external calendar updates
  public async broadcastCalendarUpdate(event: CalendarUpdateEvent): Promise<void> {
    this.broadcastUpdate(event.account_id, event);
  }

  public broadcastToAccount(accountId: string, eventType: string, data: any): void {
    const event: CalendarUpdateEvent = {
      type: 'calendar_update',
      account_id: accountId,
      operation: 'create', // Default operation
      timestamp: new Date(),
      ...data
    };
    this.broadcastUpdate(accountId, event);
  }

  private broadcastUpdate(accountId: string, event: CalendarUpdateEvent, excludeClientId?: string): void {
    const relevantClients = Array.from(this.subscriptions.values())
      .filter(sub => sub.accountId === accountId && sub.clientId !== excludeClientId)
      .map(sub => sub.clientId);

    console.log(`[WebSocketService] Broadcasting update to ${relevantClients.length} clients for account ${accountId}`);

    for (const clientId of relevantClients) {
      const subscription = this.subscriptions.get(clientId);
      if (!subscription) continue;

      // Check if the event matches the client's filters
      if (this.eventMatchesFilters(event, subscription.filters)) {
        this.sendMessage(clientId, {
          type: 'calendar_update',
          payload: event,
          timestamp: new Date()
        });
      }
    }
  }

  private eventMatchesFilters(event: CalendarUpdateEvent, filters: SubscriptionFilters): boolean {
    // Check date range
    if (filters.dateRange && event.affected_dates) {
      const eventDates = event.affected_dates;
      const hasDateInRange = eventDates.some(date => 
        date >= filters.dateRange!.start && date <= filters.dateRange!.end
      );
      if (!hasDateInRange) return false;
    }

    // Check content types
    if (filters.contentTypes && event.item) {
      if (!filters.contentTypes.includes(event.item.content_type)) return false;
    }

    // Check campaigns
    if (filters.campaigns && event.item) {
      if (event.item.campaign_id && !filters.campaigns.includes(event.item.campaign_id)) return false;
    }

    // Check tags
    if (filters.tags && event.item) {
      if (!event.item.tags || !event.item.tags.some(tag => filters.tags!.includes(tag))) return false;
    }

    return true;
  }

  private sendMessage(clientId: string, message: WebSocketMessage): void {
    const client = this.clients.get(clientId);
    if (!client || client.socket.readyState !== WebSocket.OPEN) {
      console.warn(`[WebSocketService] Cannot send message to ${clientId}: client not available or socket not open`);
      return;
    }

    try {
      const messageString = JSON.stringify(message);
      client.socket.send(messageString);
    } catch (error) {
      console.error(`[WebSocketService] Error sending message to ${clientId}:`, error);
      this.handleDisconnection(clientId);
    }
  }

  private sendError(clientId: string, error: string, requestId?: string): void {
    this.sendMessage(clientId, {
      type: 'error',
      payload: { error },
      timestamp: new Date(),
      requestId
    });
  }

  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      this.sendHeartbeat();
    }, 30000); // Every 30 seconds
  }

  private sendHeartbeat(): void {
    const now = new Date();
    Array.from(this.clients.entries()).forEach(([clientId, client]) => {
      if (client.socket.readyState === WebSocket.OPEN) {
        this.sendMessage(clientId, {
          type: 'ping',
          payload: { heartbeat: true },
          timestamp: now
        });
      }
    });
  }

  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupStaleConnections();
    }, 60000); // Every minute
  }

  private cleanupStaleConnections(): void {
    const now = new Date();
    const staleThreshold = 5 * 60 * 1000; // 5 minutes

    Array.from(this.clients.entries()).forEach(([clientId, client]) => {
      const timeSinceActivity = now.getTime() - client.lastActivity.getTime();
      
      if (timeSinceActivity > staleThreshold || client.socket.readyState !== WebSocket.OPEN) {
        console.log(`[WebSocketService] Cleaning up stale connection: ${clientId}`);
        this.handleDisconnection(clientId);
      }
    });
  }

  // Management methods
  public getConnectedClients(): ConnectedClient[] {
    return Array.from(this.clients.values());
  }

  public getSubscriptions(): CalendarSubscription[] {
    return Array.from(this.subscriptions.values());
  }

  public getClientsByAccount(accountId: string): ConnectedClient[] {
    return Array.from(this.clients.values())
      .filter(client => client.accountId === accountId);
  }

  public getAccountStatus(accountId: string): { connectedClients: number; activeSubscriptions: number } {
    const connectedClients = this.getClientsByAccount(accountId).length;
    const activeSubscriptions = Array.from(this.subscriptions.values())
      .filter(sub => sub.accountId === accountId).length;

    return {
      connectedClients,
      activeSubscriptions
    };
  }

  public async shutdown(): Promise<void> {
    console.log('[WebSocketService] Shutting down WebSocket service...');

    // Clear intervals
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    // Close all client connections
    Array.from(this.clients.entries()).forEach(([clientId, client]) => {
      try {
        this.sendMessage(clientId, {
          type: 'error',
          payload: { error: 'Server shutting down' },
          timestamp: new Date()
        });
        client.socket.close();
      } catch (error) {
        console.error(`[WebSocketService] Error closing client ${clientId}:`, error);
      }
    });

    // Close WebSocket server
    return new Promise((resolve) => {
      this.wss.close(() => {
        console.log('[WebSocketService] WebSocket server closed');
        resolve();
      });
    });
  }
}