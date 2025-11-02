import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { operationalCadence } from '../data/content';

export default function OperationsScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Operational Cadence</Text>
      <Text style={styles.subtitle}>
        Track the factory rhythm from intake through release. Each phase lists its purpose and the deliverables to expect.
      </Text>
      <View style={styles.timeline}>
        {operationalCadence.map((phase, index) => (
          <View key={phase.phase} style={styles.phaseRow}>
            <View style={styles.phaseMarker}>
              <View style={styles.phaseDot} />
              {index < operationalCadence.length - 1 && <View style={styles.phaseLine} />}
            </View>
            <View style={styles.phaseCard}>
              <Text style={styles.phaseTitle}>{phase.phase}</Text>
              <Text style={styles.phaseFocus}>{phase.focus}</Text>
              <Text style={styles.phaseLabel}>Deliverables</Text>
              {phase.deliverables.map((deliverable) => (
                <Text key={deliverable} style={styles.phaseDeliverable}>
                  • {deliverable}
                </Text>
              ))}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 48,
    backgroundColor: '#0F172A',
    gap: 18,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: '#E2E8F0',
    marginBottom: 24,
    lineHeight: 22,
  },
  timeline: {
    gap: 16,
  },
  phaseRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  phaseMarker: {
    alignItems: 'center',
    marginRight: 16,
  },
  phaseDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#38BDF8',
    borderWidth: 3,
    borderColor: '#0F172A',
  },
  phaseLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#1D4ED8',
    marginTop: 4,
    marginBottom: -4,
  },
  phaseCard: {
    flex: 1,
    backgroundColor: '#111C34',
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1E3A8A',
  },
  phaseTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  phaseFocus: {
    color: '#E2E8F0',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
  },
  phaseLabel: {
    color: '#93C5FD',
    fontWeight: '600',
    marginBottom: 4,
  },
  phaseDeliverable: {
    color: '#E2E8F0',
    fontSize: 14,
    lineHeight: 20,
  },
});
