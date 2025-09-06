import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { WebSocket, WebSocketServer } from 'ws';
import { WebSocketService } from '../../../server/services/WebSocketService';
import { CalendarRepository } from '../../../server/repositories/CalendarRepository';
import { CalendarItem, CalendarUpdateEvent } from '../../../shared/types/calendar';

// Mock dependencies
vi.mock('ws');
vi.mock('../../../server/repositories/CalendarRepository');

describe('WebSocketService', () => {
  let webSocketService: WebSocketService;
  let mockCalendarRepository: Partial<CalendarRepository>;
  let mockWebSocketServer: any;
  let mockWebSocket: any;

  beforeEach(() => {
    // Mock CalendarRepository
    mockCalendarRepository = {
      getByDateRange: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      move: vi.fn(),
    };

    // Mock WebSocketServer
    mockWebSocketServer = {
      on: vi.fn(),
      close: vi.fn(),
    };

    // Mock WebSocket
    mockWebSocket = {
      on: vi.fn(),
      send: vi.fn(),
      close: vi.fn(),
      readyState: WebSocket.OPEN,
      ping: vi.fn(),
    };

    // Mock WebSocketServer constructor
    vi.mocked(WebSocketServer).mockImplementation(() => mockWebSocketServer);

    webSocketService = new WebSocketService(mockCalendarRepository as CalendarRepository, 8080);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize WebSocket server with correct port', () => {
      expect(WebSocketServer).toHaveBeenCalledWith({ port: 8080 });
      expect(mockWebSocketServer.on).toHaveBeenCalledWith('connection', expect.any(Function));
    });

    it('should set up connection handler', () => {
      expect(mockWebSocketServer.on).toHaveBeenCalledWith('connection', expect.any(Function));
    });
  });

  describe('client connection', () => {
    it('should handle new client connections', () => {
      const connectionHandler = mockWebSocketServer.on.mock.calls.find(
        (call: any) => call[0] === 'connection'
      )?.[1];

      expect(connectionHandler).toBeDefined();

      // Simulate connection
      connectionHandler(mockWebSocket);

      expect(mockWebSocket.on).toHaveBeenCalledWith('message', expect.any(Function));
      expect(mockWebSocket.on).toHaveBeenCalledWith('close', expect.any(Function));
      expect(mockWebSocket.on).toHaveBeenCalledWith('error', expect.any(Function));
      expect(mockWebSocket.on).toHaveBeenCalledWith('pong', expect.any(Function));
    });

    it('should generate unique client IDs', () => {
      const connectionHandler = mockWebSocketServer.on.mock.calls.find(
        (call: any) => call[0] === 'connection'
      )?.[1];

      // Connect multiple clients
      connectionHandler(mockWebSocket);
      connectionHandler({ ...mockWebSocket });

      const clients = webSocketService.getConnectedClients();
      expect(clients.length).toBe(2);
      expect(clients[0].id).not.toBe(clients[1].id);
    });
  });

  describe('message handling', () => {
    let messageHandler: Function;
    let clientId: string;

    beforeEach(() => {
      const connectionHandler = mockWebSocketServer.on.mock.calls.find(
        (call: any) => call[0] === 'connection'
      )?.[1];

      connectionHandler(mockWebSocket);
      
      messageHandler = mockWebSocket.on.mock.calls.find(
        (call: any) => call[0] === 'message'
      )?.[1];

      clientId = webSocketService.getConnectedClients()[0].id;
    });

    it('should handle subscription messages', () => {
      const subscriptionMessage = JSON.stringify({
        type: 'subscribe',
        payload: {
          accountId: 'account-1',
          userId: 'user-1',
          filters: {
            accountId: 'account-1',
            dateRange: {
              start: new Date('2024-01-01'),
              end: new Date('2024-01-31')
            }
          }
        },
        timestamp: new Date(),
        requestId: 'req-1'
      });

      messageHandler(Buffer.from(subscriptionMessage));

      // Verify subscription was created
      const subscriptions = webSocketService.getSubscriptions();
      expect(subscriptions.length).toBe(1);
      expect(subscriptions[0].accountId).toBe('account-1');
      expect(subscriptions[0].clientId).toBe(clientId);

      // Verify confirmation message was sent
      expect(mockWebSocket.send).toHaveBeenCalledWith(
        expect.stringContaining('"type":"subscribe"')
      );
      expect(mockWebSocket.send).toHaveBeenCalledWith(
        expect.stringContaining('"success":true')
      );
    });

    it('should handle unsubscription messages', () => {
      // First subscribe
      const subscriptionMessage = JSON.stringify({
        type: 'subscribe',
        payload: {
          accountId: 'account-1',
          userId: 'user-1'
        },
        timestamp: new Date()
      });

      messageHandler(Buffer.from(subscriptionMessage));

      // Then unsubscribe
      const unsubscriptionMessage = JSON.stringify({
        type: 'unsubscribe',
        payload: {},
        timestamp: new Date(),
        requestId: 'req-2'
      });

      messageHandler(Buffer.from(unsubscriptionMessage));

      // Verify subscription was removed
      const subscriptions = webSocketService.getSubscriptions();
      expect(subscriptions.length).toBe(0);

      // Verify confirmation message was sent
      expect(mockWebSocket.send).toHaveBeenCalledWith(
        expect.stringContaining('"type":"unsubscribe"')
      );
    });

    it('should handle calendar update messages', async () => {
      // Setup subscription first
      const subscriptionMessage = JSON.stringify({
        type: 'subscribe',
        payload: {
          accountId: 'account-1',
          userId: 'user-1'
        },
        timestamp: new Date()
      });

      messageHandler(Buffer.from(subscriptionMessage));

      // Mock repository response
      const mockCalendarItem: CalendarItem = {
        id: 'item-1',
        account_id: 'account-1',
        user_id: 'user-1',
        title: 'Test Post',
        content_type: 'educativo',
        scheduled_for: new Date(),
        timezone: 'America/Sao_Paulo',
        priority: 'high',
        status: 'draft',
        channels: ['instagram'],
        created_at: new Date(),
        updated_at: new Date()
      };

      (mockCalendarRepository.create as any)?.mockResolvedValue(mockCalendarItem);

      // Send calendar update
      const updateMessage = JSON.stringify({
        type: 'calendar_update',
        payload: {
          operation: 'create',
          item: mockCalendarItem
        },
        timestamp: new Date(),
        requestId: 'req-3'
      });

      await messageHandler(Buffer.from(updateMessage));

      // Verify repository method was called
      expect(mockCalendarRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ...mockCalendarItem,
          account_id: 'account-1',
          user_id: 'user-1'
        })
      );

      // Verify confirmation message was sent
      expect(mockWebSocket.send).toHaveBeenCalledWith(
        expect.stringContaining('"success":true')
      );
    });

    it('should handle ping messages', () => {
      const pingMessage = JSON.stringify({
        type: 'ping',
        payload: { timestamp: new Date() },
        timestamp: new Date(),
        requestId: 'req-4'
      });

      messageHandler(Buffer.from(pingMessage));

      // Verify pong response was sent
      expect(mockWebSocket.send).toHaveBeenCalledWith(
        expect.stringContaining('"type":"pong"')
      );
    });

    it('should handle invalid JSON messages gracefully', () => {
      const invalidMessage = 'invalid json';

      messageHandler(Buffer.from(invalidMessage));

      // Verify error message was sent
      expect(mockWebSocket.send).toHaveBeenCalledWith(
        expect.stringContaining('"type":"error"')
      );
    });

    it('should validate required fields in subscription', () => {
      const invalidSubscriptionMessage = JSON.stringify({
        type: 'subscribe',
        payload: {
          // Missing accountId and userId
        },
        timestamp: new Date(),
        requestId: 'req-5'
      });

      messageHandler(Buffer.from(invalidSubscriptionMessage));

      // Verify error message was sent
      expect(mockWebSocket.send).toHaveBeenCalledWith(
        expect.stringContaining('"type":"error"')
      );
    });
  });

  describe('broadcasting', () => {
    it('should broadcast calendar updates to subscribed clients', async () => {
      // Setup two clients with subscriptions
      const connectionHandler = mockWebSocketServer.on.mock.calls.find(
        (call: any) => call[0] === 'connection'
      )?.[1];

      const mockWebSocket2 = { ...mockWebSocket, send: vi.fn() };
      
      connectionHandler(mockWebSocket);
      connectionHandler(mockWebSocket2);

      const clients = webSocketService.getConnectedClients();
      expect(clients.length).toBe(2);

      // Subscribe both clients to same account
      const messageHandler1 = mockWebSocket.on.mock.calls.find(
        (call: any) => call[0] === 'message'
      )?.[1];

      const messageHandler2 = mockWebSocket2.on.mock.calls.find(
        (call: any) => call[0] === 'message'
      )?.[1];

      const subscriptionMessage = JSON.stringify({
        type: 'subscribe',
        payload: {
          accountId: 'account-1',
          userId: 'user-1'
        },
        timestamp: new Date()
      });

      messageHandler1(Buffer.from(subscriptionMessage));
      messageHandler2(Buffer.from(subscriptionMessage));

      // Create calendar update event
      const updateEvent: CalendarUpdateEvent = {
        type: 'calendar_update',
        account_id: 'account-1',
        operation: 'create',
        item: {
          id: 'item-1',
          account_id: 'account-1',
          user_id: 'user-1',
          title: 'Test Post',
          content_type: 'educativo',
          scheduled_for: new Date(),
          timezone: 'America/Sao_Paulo',
          priority: 'high',
          status: 'draft',
          channels: ['instagram'],
          created_at: new Date(),
          updated_at: new Date()
        },
        affected_dates: [new Date()],
        timestamp: new Date()
      };

      // Broadcast update
      await webSocketService.broadcastCalendarUpdate(updateEvent);

      // Verify both clients received the update
      expect(mockWebSocket.send).toHaveBeenCalledWith(
        expect.stringContaining('"type":"calendar_update"')
      );
      expect(mockWebSocket2.send).toHaveBeenCalledWith(
        expect.stringContaining('"type":"calendar_update"')
      );
    });

    it('should only broadcast to clients in the same account', async () => {
      // Setup clients with different accounts
      const connectionHandler = mockWebSocketServer.on.mock.calls.find(
        (call: any) => call[0] === 'connection'
      )?.[1];

      const mockWebSocket2 = { ...mockWebSocket, send: vi.fn() };
      
      connectionHandler(mockWebSocket);
      connectionHandler(mockWebSocket2);

      // Subscribe to different accounts
      const messageHandler1 = mockWebSocket.on.mock.calls.find(
        (call: any) => call[0] === 'message'
      )?.[1];

      const messageHandler2 = mockWebSocket2.on.mock.calls.find(
        (call: any) => call[0] === 'message'
      )?.[1];

      messageHandler1(Buffer.from(JSON.stringify({
        type: 'subscribe',
        payload: {
          accountId: 'account-1',
          userId: 'user-1'
        },
        timestamp: new Date()
      })));

      messageHandler2(Buffer.from(JSON.stringify({
        type: 'subscribe',
        payload: {
          accountId: 'account-2',
          userId: 'user-2'
        },
        timestamp: new Date()
      })));

      // Broadcast to account-1 only
      const updateEvent: CalendarUpdateEvent = {
        type: 'calendar_update',
        account_id: 'account-1',
        operation: 'create',
        item: {} as CalendarItem,
        affected_dates: [new Date()],
        timestamp: new Date()
      };

      await webSocketService.broadcastCalendarUpdate(updateEvent);

      // Verify only account-1 client received the update
      expect(mockWebSocket.send).toHaveBeenCalledWith(
        expect.stringContaining('"type":"calendar_update"')
      );
      expect(mockWebSocket2.send).not.toHaveBeenCalledWith(
        expect.stringContaining('"type":"calendar_update"')
      );
    });
  });

  describe('client management', () => {
    it('should track connected clients', () => {
      const connectionHandler = mockWebSocketServer.on.mock.calls.find(
        (call: any) => call[0] === 'connection'
      )?.[1];

      expect(webSocketService.getConnectedClients()).toHaveLength(0);

      connectionHandler(mockWebSocket);
      expect(webSocketService.getConnectedClients()).toHaveLength(1);

      connectionHandler({ ...mockWebSocket });
      expect(webSocketService.getConnectedClients()).toHaveLength(2);
    });

    it('should filter clients by account', () => {
      const connectionHandler = mockWebSocketServer.on.mock.calls.find(
        (call: any) => call[0] === 'connection'
      )?.[1];

      connectionHandler(mockWebSocket);
      connectionHandler({ ...mockWebSocket });

      // Subscribe clients to different accounts
      const messageHandler1 = mockWebSocket.on.mock.calls.find(
        (call: any) => call[0] === 'message'
      )?.[1];

      messageHandler1(Buffer.from(JSON.stringify({
        type: 'subscribe',
        payload: {
          accountId: 'account-1',
          userId: 'user-1'
        },
        timestamp: new Date()
      })));

      const account1Clients = webSocketService.getClientsByAccount('account-1');
      expect(account1Clients).toHaveLength(1);
      expect(account1Clients[0].accountId).toBe('account-1');

      const account2Clients = webSocketService.getClientsByAccount('account-2');
      expect(account2Clients).toHaveLength(0);
    });

    it('should handle client disconnections', () => {
      const connectionHandler = mockWebSocketServer.on.mock.calls.find(
        (call: any) => call[0] === 'connection'
      )?.[1];

      connectionHandler(mockWebSocket);
      expect(webSocketService.getConnectedClients()).toHaveLength(1);

      // Simulate disconnection
      const closeHandler = mockWebSocket.on.mock.calls.find(
        (call: any) => call[0] === 'close'
      )?.[1];

      closeHandler();
      expect(webSocketService.getConnectedClients()).toHaveLength(0);
    });
  });

  describe('error handling', () => {
    it('should handle WebSocket errors gracefully', () => {
      const connectionHandler = mockWebSocketServer.on.mock.calls.find(
        (call: any) => call[0] === 'connection'
      )?.[1];

      connectionHandler(mockWebSocket);

      // Simulate WebSocket error
      const errorHandler = mockWebSocket.on.mock.calls.find(
        (call: any) => call[0] === 'error'
      )?.[1];

      const error = new Error('WebSocket error');
      errorHandler(error);

      // Should not crash and should clean up the connection
      expect(webSocketService.getConnectedClients()).toHaveLength(0);
    });

    it('should handle repository errors in calendar updates', async () => {
      const connectionHandler = mockWebSocketServer.on.mock.calls.find(
        (call: any) => call[0] === 'connection'
      )?.[1];

      connectionHandler(mockWebSocket);

      const messageHandler = mockWebSocket.on.mock.calls.find(
        (call: any) => call[0] === 'message'
      )?.[1];

      // Subscribe first
      messageHandler(Buffer.from(JSON.stringify({
        type: 'subscribe',
        payload: {
          accountId: 'account-1',
          userId: 'user-1'
        },
        timestamp: new Date()
      })));

      // Mock repository error
      (mockCalendarRepository.create as any)?.mockRejectedValue(new Error('Database error'));

      // Send calendar update
      const updateMessage = JSON.stringify({
        type: 'calendar_update',
        payload: {
          operation: 'create',
          item: { title: 'Test' }
        },
        timestamp: new Date(),
        requestId: 'req-1'
      });

      await messageHandler(Buffer.from(updateMessage));

      // Verify error message was sent
      expect(mockWebSocket.send).toHaveBeenCalledWith(
        expect.stringContaining('"type":"error"')
      );
    });
  });

  describe('shutdown', () => {
    it('should gracefully shutdown all connections', async () => {
      const connectionHandler = mockWebSocketServer.on.mock.calls.find(
        (call: any) => call[0] === 'connection'
      )?.[1];

      connectionHandler(mockWebSocket);
      connectionHandler({ ...mockWebSocket, send: vi.fn(), close: vi.fn() });

      expect(webSocketService.getConnectedClients()).toHaveLength(2);

      // Mock server close callback
      mockWebSocketServer.close.mockImplementation((callback: Function) => {
        callback();
      });

      await webSocketService.shutdown();

      // Verify all clients were notified and connections closed
      expect(mockWebSocket.send).toHaveBeenCalledWith(
        expect.stringContaining('"error":"Server shutting down"')
      );
      expect(mockWebSocket.close).toHaveBeenCalled();
      expect(mockWebSocketServer.close).toHaveBeenCalled();
    });
  });
});