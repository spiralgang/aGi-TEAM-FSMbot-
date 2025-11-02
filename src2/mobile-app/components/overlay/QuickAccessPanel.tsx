import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { loadHistory, type ShellHistoryEntry } from '../../lib/shell/history';

export function QuickAccessPanel() {
  const router = useRouter();
  const [lastEntry, setLastEntry] = useState<ShellHistoryEntry | null>(null);

  useEffect(() => {
    loadHistory()
      .then((entries) => setLastEntry(entries[0] ?? null))
      .catch(() => setLastEntry(null));
  }, []);

  return (
    <View style={styles.panel}>
      <View style={styles.meta}>
        <Text style={styles.heading}>Secure Shell Bridge</Text>
        <Text style={styles.description}>Tunnel commands through the remote daemon without touching device processes.</Text>
        {lastEntry ? (
          <Text style={styles.audit}>
            Last command · {lastEntry.command} ({new Date(lastEntry.timestamp).toLocaleString()})
          </Text>
        ) : (
          <Text style={styles.audit}>No command history recorded yet.</Text>
        )}
      </View>
      <Pressable accessibilityRole="button" onPress={() => router.push('/shell')} style={styles.button}>
        <Text style={styles.buttonText}>Open Shell</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  meta: {
    gap: 6,
  },
  heading: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f1f5f9',
  },
  description: {
    color: '#cbd5f5',
    fontSize: 14,
    lineHeight: 20,
  },
  audit: {
    color: '#94a3b8',
    fontSize: 12,
  },
  button: {
    alignSelf: 'flex-start',
    backgroundColor: '#0ea5e9',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  buttonText: {
    color: '#0f172a',
    fontWeight: '600',
    fontSize: 16,
  },
});
