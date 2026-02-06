import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerTitle: "Stratlife",
        headerTitleStyle: { fontWeight: "600" },
      }}
    />
  );
}