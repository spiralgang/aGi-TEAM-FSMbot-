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
  },
});
