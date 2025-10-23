import { Tabs } from 'expo-router';
import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2563EB',
        tabBarStyle: isWeb
          ? { position: 'relative', paddingTop: 8 }
          : { height: 60, paddingBottom: 8 },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Overview' }} />
      <Tabs.Screen name="modules" options={{ title: 'FSM Modules' }} />
      <Tabs.Screen name="operations" options={{ title: 'Operations' }} />
    </Tabs>
  );
}
