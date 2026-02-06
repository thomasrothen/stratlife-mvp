import { View } from "react-native";
import { Link, Stack } from "expo-router";
import { theme } from "@/theme/theme";
import { Text } from "@/ui/Text";

export default function NotFoundScreen() {
  return (
    <View style={{ flex: 1, padding: theme.space.lg, backgroundColor: theme.colors.bg, justifyContent: "center", gap: theme.space.md }}>
      <Stack.Screen options={{ title: "Not found" }} />
      <Text variant="title" style={{ fontWeight: "700" }}>Unmatched Route</Text>
      <Text muted>Page could not be found.</Text>
      <Link href="/">
        <Text style={{ fontWeight: "600" }}>Go to home</Text>
      </Link>
    </View>
  );
}