import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { useFocusEffect } from 'expo-router';
import {
  ShellSessionManager,
  type ShellSessionHandle,
  type ShellStreamEvent,
} from '../../lib/shell/session';
import { appendHistory, loadHistory, type ShellHistoryEntry } from '../../lib/shell/history';

type WebViewInboundMessage =
  | { type: 'ready' }
  | { type: 'input'; data: string; sessionId?: string }
  | { type: 'resize'; cols: number; rows: number; sessionId?: string };

const SHELL_BRIDGE_URL = process.env.EXPO_PUBLIC_SHELL_BRIDGE_URL ?? 'ws://localhost:9090';
const SHELL_BRIDGE_TOKEN = process.env.EXPO_PUBLIC_SHELL_BRIDGE_TOKEN;

const terminalHtml = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Shell</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/xterm@5.3.0/css/xterm.css" />
    <style>
      html, body { margin: 0; padding: 0; height: 100%; background-color: #000; }
      #terminal { height: 100%; width: 100%; }
      .xterm-viewport { overflow-y: hidden !important; }
    </style>
  </head>
  <body>
    <div id="terminal"></div>
    <script>
      (function () {
        const post = (message) => {
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify(message));
          }
        };
        function boot() {
          const term = new window.Terminal({ convertEol: true, cursorBlink: true });
          const fitAddon = new window.FitAddon.FitAddon();
          term.loadAddon(fitAddon);
          const container = document.getElementById('terminal');
          term.open(container);
          fitAddon.fit();
          term.focus();
          let sessionId = null;
          const notifyResize = () => {
            fitAddon.fit();
            if (sessionId) {
              post({ type: 'resize', cols: term.cols, rows: term.rows, sessionId });
            }
          };
          window.addEventListener('resize', notifyResize);
          term.onData((data) => {
            post({ type: 'input', data, sessionId });
          });
          document.addEventListener('message', (event) => {
            try {
              const message = JSON.parse(event.data);
              switch (message.type) {
                case 'attach':
                  sessionId = message.sessionId;
                  term.reset();
                  notifyResize();
                  if (message.initialOutput) {
                    term.write(message.initialOutput);
                  }
                  break;
                case 'stdout':
                  term.write(message.data);
                  break;
                case 'exit':
                  term.writeln('\r\nSession closed (code ' + message.code + ').');
                  break;
                default:
                  break;
              }
            } catch (error) {
              console.error('Terminal bridge error', error);
            }
          });
          post({ type: 'ready' });
        }
        const loadFit = () => {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/xterm-addon-fit@0.7.0/lib/xterm-addon-fit.min.js';
          script.onload = boot;
          document.body.appendChild(script);
        };
        const termScript = document.createElement('script');
        termScript.src = 'https://cdn.jsdelivr.net/npm/xterm@5.3.0/lib/xterm.min.js';
        termScript.onload = loadFit;
        document.body.appendChild(termScript);
      })();
    </script>
  </body>
</html>`;

type ScreenStatus = 'idle' | 'connecting' | 'ready' | 'error';

type CommandBuffers = Record<string, string>;

export default function ShellScreen() {
  const webViewRef = useRef<WebView>(null);
  const sessionRef = useRef<ShellSessionHandle | null>(null);
  const commandBuffersRef = useRef<CommandBuffers>({});
  const pendingMessagesRef = useRef<string[]>([]);
  const pendingAttachRef = useRef<string | null>(null);
  const webViewReadyRef = useRef(false);
  const historyRef = useRef<ShellHistoryEntry[]>([]);

  const [history, setHistory] = useState<ShellHistoryEntry[]>([]);
  const [status, setStatus] = useState<ScreenStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    loadHistory().then((entries) => {
      historyRef.current = entries;
      setHistory(entries);
    });
  }, []);

  const flushWebViewQueue = useCallback(() => {
    if (!webViewReadyRef.current || !webViewRef.current) {
      return;
    }
    const target = webViewRef.current;
    if (pendingAttachRef.current) {
      target.postMessage(JSON.stringify({ type: 'attach', sessionId: pendingAttachRef.current }));
      pendingAttachRef.current = null;
    }
    if (pendingMessagesRef.current.length > 0) {
      pendingMessagesRef.current.forEach((payload) => target.postMessage(payload));
      pendingMessagesRef.current = [];
    }
  }, []);

  const sendToWebView = useCallback(
    (message: unknown) => {
      const payload = JSON.stringify(message);
      if (webViewReadyRef.current && webViewRef.current) {
        webViewRef.current.postMessage(payload);
      } else {
        pendingMessagesRef.current.push(payload);
      }
    },
    [],
  );

  const notifyAttach = useCallback(
    (sessionId: string) => {
      pendingAttachRef.current = sessionId;
      flushWebViewQueue();
    },
    [flushWebViewQueue],
  );

  const recordCommand = useCallback((sessionId: string, command: string) => {
    const normalized = command.trim();
    if (!normalized) return;
    const entry: ShellHistoryEntry = {
      id: `${sessionId}-${Date.now()}`,
      sessionId,
      command: normalized,
      timestamp: new Date().toISOString(),
    };
    historyRef.current = [entry, ...historyRef.current].slice(0, 200);
    setHistory(historyRef.current);
    appendHistory(entry)
      .then((entries) => {
        historyRef.current = entries;
        setHistory(entries);
      })
      .catch(() => {
        // Ignore persistence failures but keep local state.
      });
  }, []);

  const processCommandBuffer = useCallback(
    (sessionId: string, data: string) => {
      let buffer = commandBuffersRef.current[sessionId] ?? '';
      for (const char of data) {
        if (char === '\r' || char === '\n') {
          recordCommand(sessionId, buffer);
          buffer = '';
        } else if (char === '\u0008' || char === '\u007f') {
          buffer = buffer.slice(0, -1);
        } else if (char >= ' ') {
          buffer += char;
        }
      }
      commandBuffersRef.current[sessionId] = buffer;
    },
    [recordCommand],
  );

  const handleInputFromWebView = useCallback(
    (message: Extract<WebViewInboundMessage, { type: 'input' }>) => {
      const current = sessionRef.current;
      if (!current) return;
      const sessionId = message.sessionId ?? current.id;
      processCommandBuffer(sessionId, message.data);
      current.write(message.data);
    },
    [processCommandBuffer],
  );

  const handleResizeFromWebView = useCallback((message: Extract<WebViewInboundMessage, { type: 'resize' }>) => {
    const current = sessionRef.current;
    if (!current) return;
    current.resize(message.cols, message.rows);
  }, []);

  const handleManagerEvent = useCallback(
    (event: ShellStreamEvent) => {
      switch (event.type) {
        case 'stdout': {
          if (sessionRef.current?.id === event.sessionId) {
            sendToWebView({ type: 'stdout', sessionId: event.sessionId, data: event.data });
          }
          break;
        }
        case 'exit': {
          if (sessionRef.current?.id === event.sessionId) {
            sendToWebView({ type: 'exit', sessionId: event.sessionId, code: event.code, signal: event.signal });
            setStatus('error');
            setErrorMessage(`Session closed (${event.code ?? `signal ${event.signal}`})`);
          }
          break;
        }
        case 'error': {
          if (!event.sessionId || sessionRef.current?.id === event.sessionId) {
            setStatus('error');
            setErrorMessage(event.message);
          }
          break;
        }
        default:
          break;
      }
    },
    [sendToWebView],
  );

  useFocusEffect(
    useCallback(() => {
      const manager = new ShellSessionManager({
        url: SHELL_BRIDGE_URL,
        token: SHELL_BRIDGE_TOKEN,
      });
      const unsubscribe = manager.addListener(handleManagerEvent);
      let cancelled = false;

      setStatus('connecting');
      setErrorMessage(null);

      manager
        .openSession()
        .then((handle) => {
          if (cancelled) {
            handle.close();
            return;
          }
          sessionRef.current = handle;
          commandBuffersRef.current = {};
          notifyAttach(handle.id);
          setStatus('ready');
        })
        .catch((error) => {
          if (!cancelled) {
            setStatus('error');
            setErrorMessage(error.message);
          }
        });

      return () => {
        cancelled = true;
        unsubscribe();
        manager.disconnect();
        const active = sessionRef.current;
        if (active) {
          active.close('SIGTERM');
        }
        sessionRef.current = null;
        commandBuffersRef.current = {};
        pendingMessagesRef.current = [];
        pendingAttachRef.current = null;
        webViewReadyRef.current = false;
        // Web view will rehydrate on the next focus cycle.
        setStatus('idle');
      };
    }, [handleManagerEvent, notifyAttach]),
  );

  const handleWebViewMessage = useCallback(
    (event: { nativeEvent: { data: string } }) => {
      try {
        const message = JSON.parse(event.nativeEvent.data) as WebViewInboundMessage;
        switch (message.type) {
          case 'ready':
            webViewReadyRef.current = true;
            if (sessionRef.current) {
              notifyAttach(sessionRef.current.id);
            }
            flushWebViewQueue();
            break;
          case 'input':
            handleInputFromWebView(message);
            break;
          case 'resize':
            handleResizeFromWebView(message);
            break;
          default:
            break;
        }
      } catch (error) {
        setErrorMessage((error as Error).message);
      }
    },
    [flushWebViewQueue, handleInputFromWebView, handleResizeFromWebView, notifyAttach],
  );

  const headerMessage = (() => {
    switch (status) {
      case 'connecting':
        return 'Connecting to the secure shell daemon…';
      case 'error':
        return errorMessage ?? 'Shell session encountered an error.';
      default:
        return undefined;
    }
  })();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Remote Shell</Text>
          <Text style={styles.subtitle}>
            Commands run on the daemon and stream securely over the WebSocket bridge. Device processes remain untouched.
          </Text>
          {headerMessage ? (
            <View style={styles.statusRow}>
              {status === 'connecting' ? <ActivityIndicator size="small" color="#38bdf8" /> : null}
              <Text style={styles.statusText}>{headerMessage}</Text>
            </View>
          ) : null}
        </View>
        <View style={styles.terminalContainer}>
          <WebView
            ref={webViewRef}
            source={{ html: terminalHtml }}
            originWhitelist={['*']}
            onMessage={handleWebViewMessage}
            style={styles.webview}
            allowsLinkPreview={false}
            allowFileAccess={false}
            javaScriptEnabled
          />
        </View>
        <View style={styles.historyContainer}>
          <Text style={styles.historyTitle}>Command History (secure)</Text>
          {history.length === 0 ? (
            <Text style={styles.historyEmpty}>No recorded commands yet.</Text>
          ) : (
            <ScrollView style={styles.historyList}>
              {history.slice(0, 10).map((entry) => (
                <View key={entry.id} style={styles.historyItem}>
                  <Text style={styles.historyCommand}>{entry.command}</Text>
                  <Text style={styles.historyMeta}>
                    Session {entry.sessionId} · {new Date(entry.timestamp).toLocaleString()}
                  </Text>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#020617',
  },
  container: {
    flex: 1,
    padding: 16,
    gap: 16,
  },
  header: {
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#f8fafc',
  },
  subtitle: {
    color: '#cbd5f5',
    fontSize: 14,
    lineHeight: 20,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    color: '#f97316',
    fontSize: 13,
  },
  terminalContainer: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1f2937',
    backgroundColor: '#000',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  historyContainer: {
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1f2937',
    maxHeight: 200,
  },
  historyTitle: {
    color: '#e2e8f0',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  historyEmpty: {
    color: '#94a3b8',
    fontSize: 13,
  },
  historyList: {
    maxHeight: 160,
  },
  historyItem: {
    paddingVertical: 4,
  },
  historyCommand: {
    color: '#f1f5f9',
    fontSize: 14,
    fontFamily: 'monospace',
  },
  historyMeta: {
    color: '#94a3b8',
    fontSize: 12,
  },
});
