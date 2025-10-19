import React from 'react';
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="shell/index"
        options={{
          title: 'Shell',
          headerShown: false,
        }}
      />
    </Stack>
  );
}
