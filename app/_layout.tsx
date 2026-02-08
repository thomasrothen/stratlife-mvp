import { Stack } from "expo-router";
import { AuthProvider } from "@/lib/auth";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerTitleStyle: { fontWeight: "600" } }}>
        {/* redirect gate */}
        <Stack.Screen name="index" options={{ headerShown: false }} />

        {/* route groups */}
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
        <Stack.Screen name="(modals)" options={{ headerShown: false }} />

        {/* 404 */}
        <Stack.Screen name="+not-found" />
      </Stack>
    </AuthProvider>
  );
}