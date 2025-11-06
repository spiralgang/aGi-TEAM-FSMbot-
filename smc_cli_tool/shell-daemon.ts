import http from 'node:http';
import { randomUUID } from 'node:crypto';
import type { AddressInfo } from 'node:net';
import { WebSocketServer, WebSocket } from 'ws';
import pty from 'node-pty';

type ClientMessage =
  | {
      type: 'open';
      sessionId?: string;
      cwd?: string;
      shell?: string;
      env?: Record<string, string>;
      cols?: number;
      rows?: number;
    }
  | { type: 'input'; sessionId: string; data: string }
  | { type: 'resize'; sessionId: string; cols: number; rows: number }
  | { type: 'close'; sessionId: string; signal?: NodeJS.Signals }
  | { type: 'heartbeat' };

type ServerMessage =
  | { type: 'ready'; sessionId: string }
  | { type: 'stdout'; sessionId: string; data: string }
  | { type: 'exit'; sessionId: string; code: number | null; signal: NodeJS.Signals | null }
  | { type: 'error'; sessionId?: string; message: string }
  | { type: 'ack'; sessionId: string };

interface ShellSessionOptions {
  shell?: string;
  cols?: number;
  rows?: number;
  cwd?: string;
  env?: Record<string, string>;
}

class ShellSession {
  readonly id: string;
  private readonly ptyProcess: pty.IPty;
  private readonly socket: WebSocket;
  private closed = false;

  constructor(id: string, socket: WebSocket, options: ShellSessionOptions = {}) {
    this.id = id;
    this.socket = socket;

    const shell = options.shell || process.env.SHELL || '/bin/bash';
    const cols = options.cols && options.cols > 0 ? options.cols : 80;
    const rows = options.rows && options.rows > 0 ? options.rows : 24;

    this.ptyProcess = pty.spawn(shell, [], {
      cols,
      rows,
      cwd: options.cwd || process.cwd(),
      env: {
        ...process.env,
        ...(options.env ?? {}),
      },
    });

    this.ptyProcess.onData((data) => {
      this.send({ type: 'stdout', sessionId: this.id, data });
    });

    this.ptyProcess.onExit(({ exitCode, signal }) => {
      this.closed = true;
      this.send({ type: 'exit', sessionId: this.id, code: exitCode, signal: signal as NodeJS.Signals | null });
    });
  }

  write(data: string) {
    if (this.closed) return;
    this.ptyProcess.write(data);
  }

  resize(cols: number, rows: number) {
    if (this.closed) return;
    if (cols > 0 && rows > 0) {
      this.ptyProcess.resize(cols, rows);
    }
  }

  kill(signal?: NodeJS.Signals) {
    if (this.closed) return;
    this.ptyProcess.kill(signal);
  }

  private send(message: ServerMessage) {
    if (this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    }
  }
}

interface ConnectionContext {
  sessions: Map<string, ShellSession>;
  authenticated: boolean;
  heartbeat?: NodeJS.Timeout;
}

type Authenticator = (token: string | null | undefined) => boolean;

const DEFAULT_PORT = Number(process.env.SHELL_DAEMON_PORT ?? 9090);
const TOKEN = process.env.SHELL_DAEMON_TOKEN ?? '';

const authenticator: Authenticator = (token) => {
  if (!TOKEN) return true;
  return token === TOKEN;
};

const server = http.createServer();
const wss = new WebSocketServer({ noServer: true });

const clients = new WeakMap<WebSocket, ConnectionContext>();

function ensureAuthenticated(socket: WebSocket): asserts socket is WebSocket {
  const ctx = clients.get(socket);
  if (!ctx || !ctx.authenticated) {
    throw new Error('unauthenticated');
  }
}

wss.on('connection', (socket) => {
  const context: ConnectionContext = {
    sessions: new Map(),
    authenticated: true,
  };
  clients.set(socket, context);

  const pingInterval = setInterval(() => {
    if (socket.readyState === socket.OPEN) {
      socket.ping();
    }
  }, 20_000);

  socket.on('close', () => {
    clearInterval(pingInterval);
    context.sessions.forEach((session) => session.kill());
    context.sessions.clear();
  });

  socket.on('message', (payload) => {
    let message: ClientMessage;
    try {
      message = JSON.parse(payload.toString());
    } catch (error) {
      socket.send(JSON.stringify({ type: 'error', message: 'invalid json payload' } satisfies ServerMessage));
      return;
    }

    try {
      switch (message.type) {
        case 'heartbeat':
          socket.send(JSON.stringify({ type: 'ack', sessionId: 'heartbeat' } satisfies ServerMessage));
          return;
        case 'open': {
          const sessionId = message.sessionId ?? randomUUID();
          if (context.sessions.has(sessionId)) {
            socket.send(
              JSON.stringify({
                type: 'error',
                sessionId,
                message: 'session already exists',
              } satisfies ServerMessage),
            );
            return;
          }
          const session = new ShellSession(sessionId, socket, {
            shell: message.shell,
            cols: message.cols,
            rows: message.rows,
            cwd: message.cwd,
            env: message.env,
          });
          context.sessions.set(sessionId, session);
          socket.send(JSON.stringify({ type: 'ready', sessionId } satisfies ServerMessage));
          return;
        }
        case 'input': {
          ensureAuthenticated(socket);
          const session = context.sessions.get(message.sessionId);
          if (!session) {
            socket.send(
              JSON.stringify({
                type: 'error',
                sessionId: message.sessionId,
                message: 'session not found',
              } satisfies ServerMessage),
            );
            return;
          }
          session.write(message.data);
          return;
        }
        case 'resize': {
          ensureAuthenticated(socket);
          const session = context.sessions.get(message.sessionId);
          if (!session) {
            socket.send(
              JSON.stringify({
                type: 'error',
                sessionId: message.sessionId,
                message: 'session not found',
              } satisfies ServerMessage),
            );
            return;
          }
          session.resize(message.cols, message.rows);
          return;
        }
        case 'close': {
          ensureAuthenticated(socket);
          const session = context.sessions.get(message.sessionId);
          if (!session) {
            return;
          }
          session.kill(message.signal);
          context.sessions.delete(message.sessionId);
          return;
        }
        default:
          socket.send(JSON.stringify({ type: 'error', message: 'unknown message' } satisfies ServerMessage));
      }
    } catch (error) {
      const err = error as Error;
      socket.send(
        JSON.stringify({
          type: 'error',
          message: err.message,
        } satisfies ServerMessage),
      );
    }
  });
});

server.on('upgrade', (req, socket, head) => {
  const { url } = req;
  const parsed = new URL(url ?? '/', `http://${req.headers.host ?? 'localhost'}`);
  const token = parsed.searchParams.get('token');

  if (!authenticator(token)) {
    socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
    socket.destroy();
    return;
  }

  wss.handleUpgrade(req, socket, head, (client) => {
    wss.emit('connection', client, req);
  });
});

server.listen(DEFAULT_PORT, () => {
  const address = server.address() as AddressInfo | null;
  const bind = address ? `${address.address}:${address.port}` : 'unknown address';
  console.log(`Shell daemon listening on ${bind}`);
});

process.on('SIGINT', () => {
  console.log('Shell daemon shutting down');
  wss.clients.forEach((client) => {
    client.close(1001, 'daemon shutting down');
  });
  server.close(() => process.exit(0));
});

process.on('SIGTERM', () => {
  console.log('Shell daemon terminating');
  wss.clients.forEach((client) => {
    client.close(1001, 'daemon shutting down');
  });
  server.close(() => process.exit(0));
});
