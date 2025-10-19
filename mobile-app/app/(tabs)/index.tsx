import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { QuickAccessPanel } from '../../components/overlay/QuickAccessPanel';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Control Center</Text>
        <Text style={styles.subtitle}>Use the shell for low-level diagnostics.</Text>
      </View>
      <QuickAccessPanel />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    padding: 24,
    justifyContent: 'space-between',
  },
  content: {
    gap: 8,
  },
  title: {
    color: '#f8fafc',
    fontSize: 24,
    fontWeight: '600',
  },
  subtitle: {
    color: '#cbd5f5',
    fontSize: 16,
  },
});
