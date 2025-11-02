import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { modules } from '../data/content';

export default function ModulesScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>FSM Specialist Directory</Text>
      <Text style={styles.subtitle}>
        Every station is a deterministic teammate. Tap through to inspect responsibilities, handoffs, and key signals.
      </Text>
      {modules.map((module) => (
        <Link
          key={module.slug}
          href={{ pathname: '/modules/[slug]', params: { slug: module.slug } }}
          style={styles.moduleCard}
        >
          <Text style={styles.moduleTitle}>{module.title}</Text>
          <Text style={styles.moduleSummary}>{module.summary}</Text>
          <Text style={styles.linkLabel}>View playbook →</Text>
        </Link>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 48,
    backgroundColor: '#F4F4F5',
    gap: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: '#374151',
    marginBottom: 20,
    lineHeight: 21,
  },
  moduleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  moduleTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  moduleSummary: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 21,
  },
  linkLabel: {
    marginTop: 14,
    color: '#2563EB',
    fontWeight: '600',
  },
});
