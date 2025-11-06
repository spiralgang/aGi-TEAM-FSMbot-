export type ShellBridgeConfig = {
  /** Base URL to the shell daemon (without query params). */
  url: string;
  /** Shared secret used to authenticate with the daemon. */
  token?: string;
  /** Interval in milliseconds to send heartbeats. Defaults to 15s. */
  heartbeatInterval?: number;
};

export type ShellSessionOpenRequest = {
  sessionId?: string;
  cwd?: string;
  shell?: string;
  cols?: number;
  rows?: number;
  env?: Record<string, string>;
};

export type ShellStreamEvent =
  | { type: 'stdout'; sessionId: string; data: string }
  | { type: 'exit'; sessionId: string; code: number | null; signal: string | null }
  | { type: 'error'; sessionId?: string; message: string }
  | { type: 'ready'; sessionId: string };

export interface ShellSessionHandle {
  id: string;
  write(data: string): void;
  resize(cols: number, rows: number): void;
  close(signal?: string): void;
}

type ClientMessage =
  | ({ type: 'open' } & ShellSessionOpenRequest & { sessionId?: string })
  | { type: 'input'; sessionId: string; data: string }
  | { type: 'resize'; sessionId: string; cols: number; rows: number }
  | { type: 'close'; sessionId: string; signal?: string }
  | { type: 'heartbeat' };

type ServerMessage =
  | { type: 'ready'; sessionId: string }
  | { type: 'stdout'; sessionId: string; data: string }
  | { type: 'exit'; sessionId: string; code: number | null; signal: string | null }
  | { type: 'error'; sessionId?: string; message: string }
  | { type: 'ack'; sessionId: string };

type ShellEventListener = (event: ShellStreamEvent) => void;

const DEFAULT_HEARTBEAT_INTERVAL = 15_000;

function generateSessionId(): string {
  const cryptoApi = globalThis.crypto as { randomUUID?: () => string } | undefined;
  if (cryptoApi?.randomUUID) {
    return cryptoApi.randomUUID();
  }
  return `shell-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export class ShellSessionManager {
  private readonly config: ShellBridgeConfig;
  private socket: WebSocket | null = null;
  private listeners: Set<ShellEventListener> = new Set();
  private pendingSessions = new Map<string, { resolve: (value: ShellSessionHandle) => void; reject: (error: Error) => void }>();
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private connected = false;

  constructor(config: ShellBridgeConfig) {
    this.config = config;
  }

  get isConnected(): boolean {
    return this.connected && this.socket?.readyState === WebSocket.OPEN;
  }

  addListener(listener: ShellEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  async connect(): Promise<void> {
    if (this.isConnected) {
      return;
    }

    await new Promise<void>((resolve, reject) => {
      try {
        const wsUrl = this.createUrl();
        const socket = new WebSocket(wsUrl);
        this.socket = socket;
        let settled = false;

        socket.onopen = () => {
          this.connected = true;
          this.startHeartbeat();
          settled = true;
          resolve();
        };

        socket.onerror = (event) => {
          const error = new Error('Shell bridge connection error');
          this.listeners.forEach((listener) => listener({ type: 'error', message: error.message }));
          if (!settled) {
            settled = true;
            reject(error);
          }
        };

        socket.onclose = () => {
          this.connected = false;
          this.stopHeartbeat();
          if (!settled) {
            settled = true;
            reject(new Error('Shell bridge connection closed'));
          }
        };

        socket.onmessage = (event) => {
          this.handleMessage(event.data);
        };
      } catch (error) {
        reject(error as Error);
      }
    });
  }

  disconnect(): void {
    if (!this.socket) return;
    this.stopHeartbeat();
    this.socket.close();
    this.socket = null;
    this.connected = false;
  }

  async openSession(options: ShellSessionOpenRequest = {}): Promise<ShellSessionHandle> {
    await this.connect();
    const sessionId = options.sessionId ?? generateSessionId();

    return new Promise<ShellSessionHandle>((resolve, reject) => {
      this.pendingSessions.set(sessionId, { resolve, reject });
      this.send({
        type: 'open',
        sessionId,
        cwd: options.cwd,
        shell: options.shell,
        cols: options.cols,
        rows: options.rows,
        env: options.env,
      });
    });
  }

  write(sessionId: string, data: string) {
    this.send({ type: 'input', sessionId, data });
  }

  resize(sessionId: string, cols: number, rows: number) {
    this.send({ type: 'resize', sessionId, cols, rows });
  }

  close(sessionId: string, signal?: string) {
    this.send({ type: 'close', sessionId, signal });
  }

  private handleMessage(raw: unknown) {
    try {
      const payload: ServerMessage = JSON.parse(String(raw));
      switch (payload.type) {
        case 'ready': {
          const pending = this.pendingSessions.get(payload.sessionId);
          if (pending) {
            const handle: ShellSessionHandle = {
              id: payload.sessionId,
              write: (data: string) => this.write(payload.sessionId, data),
              resize: (cols: number, rows: number) => this.resize(payload.sessionId, cols, rows),
              close: (signal?: string) => this.close(payload.sessionId, signal),
            };
            pending.resolve(handle);
            this.pendingSessions.delete(payload.sessionId);
          }
          this.emit({ type: 'ready', sessionId: payload.sessionId });
          return;
        }
        case 'stdout':
          this.emit({ type: 'stdout', sessionId: payload.sessionId, data: payload.data });
          return;
        case 'exit':
          this.emit({ type: 'exit', sessionId: payload.sessionId, code: payload.code, signal: payload.signal });
          return;
        case 'error':
          if (payload.sessionId) {
            const pending = this.pendingSessions.get(payload.sessionId);
            if (pending) {
              pending.reject(new Error(payload.message));
              this.pendingSessions.delete(payload.sessionId);
            }
          }
          this.emit({ type: 'error', sessionId: payload.sessionId, message: payload.message });
          return;
        case 'ack':
          return;
        default:
          return;
      }
    } catch (error) {
      const err = error as Error;
      this.emit({ type: 'error', message: err.message });
    }
  }

  private send(message: ClientMessage) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      throw new Error('Shell bridge is not connected');
    }
    this.socket.send(JSON.stringify(message));
  }

  private emit(event: ShellStreamEvent) {
    this.listeners.forEach((listener) => listener(event));
  }

  private startHeartbeat() {
    const interval = this.config.heartbeatInterval ?? DEFAULT_HEARTBEAT_INTERVAL;
    if (interval <= 0) return;
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      try {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
          this.socket.send(JSON.stringify({ type: 'heartbeat' } satisfies ClientMessage));
        }
      } catch (error) {
        this.emit({ type: 'error', message: (error as Error).message });
      }
    }, interval);
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private createUrl(): string {
    const url = new URL(this.config.url);
    if (this.config.token) {
      url.searchParams.set('token', this.config.token);
    }
    return url.toString();
  }
}
