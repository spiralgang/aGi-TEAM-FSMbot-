import React from "react";
import { Stack } from "expo-router";
import { OverlayLifecycleManager, OverlayProvider } from "../components/overlay";

export default function RootLayout() {
  return (
    <OverlayProvider>
      <OverlayLifecycleManager />
      <Stack screenOptions={{ headerShown: false }} />
    </OverlayProvider>
  );
}
