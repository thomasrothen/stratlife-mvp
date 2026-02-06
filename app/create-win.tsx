import { View, Text, TextInput, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";

export default function CreateWinScreen() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");

  const canSave = title.trim().length > 0;

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 22, fontWeight: "700" }}>Create a Win</Text>

      <View style={{ gap: 8 }}>
        <Text style={{ fontSize: 14, fontWeight: "600" }}>Title</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="e.g., Finished my workout"
          style={{
            padding: 12,
            borderRadius: 12,
            backgroundColor: "#f2f2f2",
          }}
        />
      </View>

      <View style={{ gap: 8 }}>
        <Text style={{ fontSize: 14, fontWeight: "600" }}>Note (optional)</Text>
        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="What worked? Why is this meaningful?"
          multiline
          style={{
            padding: 12,
            borderRadius: 12,
            backgroundColor: "#f2f2f2",
            minHeight: 100,
            textAlignVertical: "top",
          }}
        />
      </View>

      <Pressable
        disabled={!canSave}
        onPress={() => router.back()}
        style={{
          padding: 14,
          borderRadius: 12,
          backgroundColor: canSave ? "black" : "#999",
          alignItems: "center",
          marginTop: 8,
        }}
      >
        <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>
          Save
        </Text>
      </Pressable>
    </View>
  );
}