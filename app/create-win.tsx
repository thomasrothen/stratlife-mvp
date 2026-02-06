import { View } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { theme } from "@/theme/theme";
import { Text } from "@/ui/Text";
import { Input } from "@/ui/Input";
import { Button } from "@/ui/Button";

export default function CreateWinScreen() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");

  const canSave = title.trim().length > 0;

  return (
    <View style={{ flex: 1, padding: theme.space.lg, gap: theme.space.md, backgroundColor: theme.colors.bg }}>
      <Text variant="title" style={{ fontWeight: "700" }}>
        Create a Win
      </Text>

      <View style={{ gap: theme.space.sm }}>
        <Text style={{ fontWeight: "600" }}>Title</Text>
        <Input value={title} onChangeText={setTitle} placeholder="e.g., Finished my workout" />
      </View>

      <View style={{ gap: theme.space.sm }}>
        <Text style={{ fontWeight: "600" }}>Note (optional)</Text>
        <Input
          value={note}
          onChangeText={setNote}
          placeholder="What worked? Why is this meaningful?"
          multiline
          style={{ minHeight: 110, textAlignVertical: "top" }}
        />
      </View>

      <Button title="Save" disabled={!canSave} onPress={() => router.back()} />
    </View>
  );
}