import { Stack } from "expo-router";

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerTitleStyle: { fontWeight: "600" } }}>
      <Stack.Screen name="today" options={{ title: "Today" }} />
      <Stack.Screen name="journey" options={{ title: "Your Journey" }} />
      <Stack.Screen name="settings" options={{ title: "Settings" }} />

      {/* Flows in the app stack (fine for MVP) */}
      <Stack.Screen name="life-check" options={{ title: "Life Check" }} />
      <Stack.Screen name="focus" options={{ title: "Your Focus" }} />
    </Stack>
  );
}