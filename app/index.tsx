import { View } from "react-native";
import { Redirect, useRouter } from "expo-router";
import { theme } from "@/theme/theme";
import { Text } from "@/ui/Text";
import { Card } from "@/ui/Card";
import { Button } from "@/ui/Button";
import { useAuth } from "@/lib/auth";

export default function FeedScreen() {
  const router = useRouter();
  const { session, loading } = useAuth();

  // While we figure out if the user is logged in, show a tiny loading state
  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          padding: theme.space.lg,
          backgroundColor: theme.colors.bg,
          justifyContent: "center",
        }}
      >
        <Text muted>Loading…</Text>
      </View>
    );
  }

  // No session → force sign in
  if (!session) {
    return <Redirect href="/login" />;
  }

  // Logged in → show feed
  return (
    <View
      style={{
        flex: 1,
        padding: theme.space.lg,
        gap: theme.space.md,
        backgroundColor: theme.colors.bg,
      }}
    >
      <Text variant="title" style={{ fontWeight: "700" }}>
        Stratlife
      </Text>

      <Card>
        <Text style={{ fontWeight: "600" }}>Your first win starts here.</Text>
        <Text muted style={{ marginTop: theme.space.sm }}>
          Track what works. Grow what matters.
        </Text>
      </Card>

      <Button title="+ Create Win" onPress={() => router.push("/create-win")} />
      <Button title="Inspire me" variant="secondary" onPress={() => {}} />
    </View>
  );
}