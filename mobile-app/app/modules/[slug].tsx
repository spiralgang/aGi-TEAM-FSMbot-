import { useLocalSearchParams, router } from 'expo-router';
import { ScrollView, View, Text, StyleSheet, Pressable } from 'react-native';
import { modules } from '../data/content';

export default function ModuleDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const module = modules.find((item) => item.slug === slug);

  if (!module) {
    return (
      <View style={styles.missingContainer}>
        <Text style={styles.missingTitle}>Module not found</Text>
        <Text style={styles.missingBody}>
          The requested module is not registered in the mobile console. Return to the directory to select another station.
        </Text>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backLabel}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.kicker}>FSM Playbook</Text>
      <Text style={styles.title}>{module.title}</Text>
      <Text style={styles.summary}>{module.summary}</Text>

      <View style={styles.block}>
        <Text style={styles.blockTitle}>Responsibilities</Text>
        {module.responsibilities.map((item) => (
          <Text key={item} style={styles.listItem}>
            • {item}
          </Text>
        ))}
      </View>

      <View style={styles.block}>
        <Text style={styles.blockTitle}>Handoffs</Text>
        {module.handoffs.map((item) => (
          <Text key={item} style={styles.listItem}>
            • {item}
          </Text>
        ))}
      </View>

      <View style={styles.block}>
        <Text style={styles.blockTitle}>Signals to Watch</Text>
        {module.signals.map((item) => (
          <Text key={item} style={styles.listItem}>
            • {item}
          </Text>
        ))}
      </View>

      {module.metrics && (
        <View style={styles.block}>
          <Text style={styles.blockTitle}>Operational Metrics</Text>
          {module.metrics.map((metric) => (
            <View key={metric.label} style={styles.metricRow}>
              <Text style={styles.metricLabel}>{metric.label}</Text>
              <Text style={styles.metricValue}>{metric.value}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 48,
    backgroundColor: '#FFFFFF',
    gap: 24,
  },
  kicker: {
    textTransform: 'uppercase',
    letterSpacing: 1.1,
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
    marginBottom: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
  },
  summary: {
    fontSize: 16,
    lineHeight: 22,
    color: '#374151',
  },
  block: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  blockTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 10,
  },
  listItem: {
    fontSize: 15,
    color: '#1F2937',
    lineHeight: 22,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  metricLabel: {
    fontSize: 15,
    color: '#1F2937',
    fontWeight: '600',
  },
  metricValue: {
    fontSize: 15,
    color: '#2563EB',
    fontWeight: '700',
  },
  missingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    backgroundColor: '#0F172A',
  },
  missingTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#F9FAFB',
    marginBottom: 12,
  },
  missingBody: {
    fontSize: 16,
    color: '#E2E8F0',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
  },
  backLabel: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});
