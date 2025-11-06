import * as SecureStore from 'expo-secure-store';

export type ShellHistoryEntry = {
  id: string;
  sessionId: string;
  command: string;
  timestamp: string;
};

const HISTORY_KEY = 'shell.audit.history';
const HISTORY_LIMIT = 200;

export async function loadHistory(): Promise<ShellHistoryEntry[]> {
  try {
    const raw = await SecureStore.getItemAsync(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ShellHistoryEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn('Failed to load shell history', error);
    return [];
  }
}

export async function saveHistory(entries: ShellHistoryEntry[]): Promise<void> {
  try {
    await SecureStore.setItemAsync(HISTORY_KEY, JSON.stringify(entries.slice(0, HISTORY_LIMIT)));
  } catch (error) {
    console.warn('Failed to persist shell history', error);
  }
}

export async function appendHistory(entry: ShellHistoryEntry): Promise<ShellHistoryEntry[]> {
  const existing = await loadHistory();
  const next = [entry, ...existing].slice(0, HISTORY_LIMIT);
  await saveHistory(next);
  return next;
}
