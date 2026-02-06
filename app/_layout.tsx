import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerTitleStyle: { fontWeight: "600" } }}>
      <Stack.Screen name="index" options={{ title: "Stratlife" }} />
      <Stack.Screen name="create-win" options={{ title: "Create a Win" }} />
    </Stack>
  );
}