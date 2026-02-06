import { View } from "react-native";
import { useRouter } from "expo-router";
import { theme } from "@/theme/theme";
import { Text } from "@/ui/Text";
import { Card } from "@/ui/Card";
import { Button } from "@/ui/Button";

export default function FeedScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, padding: theme.space.lg, gap: theme.space.md, backgroundColor: theme.colors.bg }}>
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