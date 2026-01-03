/**
 * Base WebSocket Client
 * Provides connection management, automatic reconnection, heartbeat, and error handling
 */

import { TypedEventEmitter } from './event-emitter.js';
import type { BaseClientOptions, ConnectionState, ClientEventMap, Logger } from './types.js';

/** Default logger using console */
const defaultLogger: Logger = {
  error: (message: string, ...args: unknown[]) => console.error(message, ...args),
};

/** Default configuration values */
const DEFAULTS = {
  autoReconnect: true,
  maxReconnectAttempts: Infinity,
  reconnectDelay: 1000,
  maxReconnectDelay: 30000,
  heartbeatInterval: 30000,
  connectionTimeout: 10000,
} as const;

/** Extended event map including raw message */
interface BaseEventMap extends ClientEventMap {
  rawMessage: string;
}

/** Options with logger as required */
interface InternalOptions extends Omit<Required<BaseClientOptions>, 'logger'> {
  logger: Logger;
}

/**
 * Abstract base class for WebSocket clients
 * Handles connection lifecycle, reconnection logic, and heartbeat mechanism
 */
export abstract class BaseWebSocketClient extends TypedEventEmitter<BaseEventMap> {
  protected ws: WebSocket | null = null;
  protected readonly options: InternalOptions;
  protected state: ConnectionState = 'disconnected';
  protected reconnectAttempts = 0;
  protected reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  protected heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  protected connectionTimer: ReturnType<typeof setTimeout> | null = null;
  protected isIntentionalClose = false;
  protected pendingSubscriptions: (() => void)[] = [];

  constructor(options: BaseClientOptions) {
    super();
    this.options = {
      url: options.url,
      autoReconnect: options.autoReconnect ?? DEFAULTS.autoReconnect,
      maxReconnectAttempts: options.maxReconnectAttempts ?? DEFAULTS.maxReconnectAttempts,
      reconnectDelay: options.reconnectDelay ?? DEFAULTS.reconnectDelay,
      maxReconnectDelay: options.maxReconnectDelay ?? DEFAULTS.maxReconnectDelay,
      heartbeatInterval: options.heartbeatInterval ?? DEFAULTS.heartbeatInterval,
      connectionTimeout: options.connectionTimeout ?? DEFAULTS.connectionTimeout,
      logger: options.logger ?? defaultLogger,
    };
  }

  /**
   * Current connection state
   */
  get connectionState(): ConnectionState {
    return this.state;
  }

  /**
   * Whether the client is currently connected
   */
  get isConnected(): boolean {
    return this.state === 'connected';
  }

  /**
   * Connect to the WebSocket server
   */
  async connect(): Promise<void> {
    if (this.state === 'connected' || this.state === 'connecting') {
      return;
    }

    this.isIntentionalClose = false;
    await this.createConnection();
  }

  /**
   * Disconnect from the WebSocket server
   */
  disconnect(): void {
    this.isIntentionalClose = true;
    this.cleanup();
    this.setState('disconnected');
  }

  /**
   * Send a message through the WebSocket
   */
  protected send(data: unknown): void {
    if (!this.ws || this.state !== 'connected') {
      throw new Error('WebSocket is not connected');
    }

    const message = typeof data === 'string' ? data : JSON.stringify(data);
    this.ws.send(message);
  }

  /**
   * Create the WebSocket connection
   */
  private async createConnection(): Promise<void> {
    this.setState('connecting');

    return new Promise((resolve, reject) => {
      try {
        // Use native WebSocket from Node.js 22+ or browser
        this.ws = new WebSocket(this.options.url);

        // Set connection timeout
        this.connectionTimer = setTimeout(() => {
          const error = new Error(`Connection timeout after ${this.options.connectionTimeout}ms`);
          this.handleError(error);
          this.ws?.close();
          reject(error);
        }, this.options.connectionTimeout);

        this.ws.onopen = () => {
          this.clearConnectionTimeout();
          this.reconnectAttempts = 0;
          this.setState('connected');
          this.startHeartbeat();
          this.flushPendingSubscriptions();
          this.onConnected();
          this.emit('connected', undefined);
          resolve();
        };

        this.ws.onclose = (event: CloseEvent) => {
          this.clearConnectionTimeout();
          this.stopHeartbeat();
          this.emit('disconnected', { code: event.code, reason: event.reason });
          this.onDisconnected(event.code, event.reason);

          if (!this.isIntentionalClose && this.options.autoReconnect) {
            this.scheduleReconnect();
          } else {
            this.setState('disconnected');
          }
        };

        this.ws.onerror = () => {
          const error = new Error('WebSocket error');
          this.handleError(error);
        };

        this.ws.onmessage = (event: MessageEvent) => {
          this.handleIncomingMessage(event.data as string);
        };
      } catch (error) {
        this.clearConnectionTimeout();
        this.handleError(error instanceof Error ? error : new Error(String(error)));
        reject(error);
      }
    });
  }

  /**
   * Handle incoming messages
   */
  private handleIncomingMessage(data: string): void {
    this.emit('rawMessage', data);

    try {
      const parsed = JSON.parse(data);
      this.handleParsedMessage(parsed);
    } catch {
      // Not JSON, pass as-is
      this.handleParsedMessage(data);
    }
  }

  /**
   * Handle errors
   */
  private handleError(error: Error): void {
    this.emit('error', error);
    this.onError(error);
  }

  /**
   * Update connection state
   */
  private setState(newState: ConnectionState): void {
    if (this.state !== newState) {
      const previousState = this.state;
      this.state = newState;
      this.emit('stateChange', { state: newState, previousState });
    }
  }

  /**
   * Schedule a reconnection attempt
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.options.maxReconnectAttempts) {
      this.setState('disconnected');
      this.handleError(new Error('Max reconnection attempts reached'));
      return;
    }

    this.setState('reconnecting');
    this.reconnectAttempts++;

    // Exponential backoff with jitter
    const delay = Math.min(
      this.options.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1) + Math.random() * 1000,
      this.options.maxReconnectDelay
    );

    this.emit('reconnecting', {
      attempt: this.reconnectAttempts,
      maxAttempts: this.options.maxReconnectAttempts,
    });

    this.reconnectTimer = setTimeout(async () => {
      try {
        await this.createConnection();
      } catch {
        // Error already handled in createConnection
      }
    }, delay);
  }

  /**
   * Start the heartbeat mechanism
   */
  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (this.state === 'connected') {
        this.sendHeartbeat();
      }
    }, this.options.heartbeatInterval);
  }

  /**
   * Stop the heartbeat mechanism
   */
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /**
   * Clear connection timeout
   */
  private clearConnectionTimeout(): void {
    if (this.connectionTimer) {
      clearTimeout(this.connectionTimer);
      this.connectionTimer = null;
    }
  }

  /**
   * Flush pending subscriptions after connection
   */
  private flushPendingSubscriptions(): void {
    const pending = this.pendingSubscriptions;
    this.pendingSubscriptions = [];
    for (const subscription of pending) {
      try {
        subscription();
      } catch (error) {
        this.handleError(error instanceof Error ? error : new Error(String(error)));
      }
    }
  }

  /**
   * Cleanup resources
   */
  private cleanup(): void {
    this.clearConnectionTimeout();
    this.stopHeartbeat();

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.onopen = null;
      this.ws.onclose = null;
      this.ws.onerror = null;
      this.ws.onmessage = null;
      if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
        this.ws.close(1000, 'Client disconnect');
      }
      this.ws = null;
    }

    this.pendingSubscriptions = [];
    this.reconnectAttempts = 0;

    // Allow subclasses to clean up their resources
    this.onCleanup();
  }

  /**
   * Called during cleanup to allow subclasses to release resources
   * Override in subclass to clear subscriptions, callbacks, etc.
   */
  protected onCleanup(): void {
    // Override in subclass
  }

  /**
   * Send heartbeat/ping message
   * Override in subclass if server requires specific format
   */
  protected sendHeartbeat(): void {
    // Default: send ping frame (some servers may expect specific message)
    try {
      this.send('ping');
    } catch {
      // Ignore send errors during heartbeat
    }
  }

  /**
   * Called when connection is established
   * Override in subclass for custom logic
   */
  protected onConnected(): void {
    // Override in subclass
  }

  /**
   * Called when connection is closed
   * Override in subclass for custom logic
   */
  protected onDisconnected(_code: number, _reason: string): void {
    // Override in subclass
  }

  /**
   * Called when a message is received
   * Must be implemented by subclass
   */
  protected abstract handleParsedMessage(data: unknown): void;

  /**
   * Called when an error occurs
   * Override in subclass for custom error handling
   */
  protected onError(_error: Error): void {
    // Override in subclass
  }
}
