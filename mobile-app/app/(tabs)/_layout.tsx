import React from 'react';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
      <Tabs>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            headerShown: false,
          }}
        />
        <Tabs.Screen name="shell-tab" options={{ title: 'Shell' }} href="/shell" />
      </Tabs>
  );
}
