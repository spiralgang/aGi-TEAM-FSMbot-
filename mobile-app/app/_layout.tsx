import React from 'react';
import React from "react";
import { Stack } from "expo-router";
import { OverlayLifecycleManager, OverlayProvider } from "../components/overlay";

export default function RootLayout() {
  return (
    <OverlayProvider>
      <OverlayLifecycleManager />
      <Stack screenOptions={{ headerShown: false }} />
    </OverlayProvider>
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="modules/[slug]" options={{ title: 'Module Details', headerShown: true }} />
    </Stack>
  );
}
