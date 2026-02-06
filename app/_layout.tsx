import { Stack } from "expo-router";
import { AuthProvider } from "@/lib/auth";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerTitleStyle: { fontWeight: "600" } }}>
        <Stack.Screen name="index" options={{ title: "Stratlife" }} />
        <Stack.Screen name="create-win" options={{ title: "Create a Win" }} />
        <Stack.Screen name="login" options={{ title: "Sign in" }} />
      </Stack>
    </AuthProvider>
  );
}