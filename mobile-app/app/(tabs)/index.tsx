import React from "react";
import { ScrollView, StyleSheet, Text } from "react-native";

const HomeScreen = () => (
  <ScrollView contentContainerStyle={styles.container}>
    <Text style={styles.title}>FSM Tab App</Text>
    <Text style={styles.subtitle}>Use the floating console from the settings tab to issue commands.</Text>
  </ScrollView>
);

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Link } from 'expo-router';
import { assemblyPrinciples, modules } from '../data/content';

export default function OverviewScreen() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.kicker}>aGi²TEAM³FSMbot¹</Text>
        <Text style={styles.title}>Mobile Command Overview</Text>
        <Text style={styles.body}>
          The mobile console keeps the FSM factory transparent on the go. Review the guiding principles, inspect specialist
          modules, and jump into the operational cadence from your phone or tablet.
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Assembly Principles</Text>
          {assemblyPrinciples.map((principle) => (
            <View key={principle.title} style={styles.card}>
              <Text style={styles.cardTitle}>{principle.title}</Text>
              <Text style={styles.cardBody}>{principle.description}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Modules</Text>
          {modules.slice(0, 3).map((module) => (
            <Link
              key={module.slug}
              href={{ pathname: '/modules/[slug]', params: { slug: module.slug } }}
              style={[styles.card, styles.linkCard]}
            >
              <Text style={styles.cardTitle}>{module.title}</Text>
              <Text style={styles.cardBody}>{module.summary}</Text>
              <Text style={styles.linkLabel}>Open module →</Text>
            </Link>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1120',
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 48,
    paddingTop: 60,
  },
  kicker: {
    color: '#60A5FA',
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 4,
    letterSpacing: 1.1,
  },
  title: {
    color: '#F9FAFB',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
  },
  body: {
    color: '#CBD5F5',
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    color: '#F9FAFB',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  linkCard: {
    borderColor: '#2563EB',
  },
  cardTitle: {
    color: '#F9FAFB',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  cardBody: {
    color: '#CBD5F5',
    fontSize: 15,
    lineHeight: 21,
  },
  linkLabel: {
    marginTop: 12,
    color: '#60A5FA',
    fontWeight: '600',
  },
});
