import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="modules/[slug]" options={{ title: 'Module Details', headerShown: true }} />
    </Stack>
  );
}
