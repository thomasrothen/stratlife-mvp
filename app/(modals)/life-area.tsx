import React, { useMemo, useState } from "react";
import { View, Text, TextInput, Platform, KeyboardAvoidingView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";

import { LIFE_AREAS } from "@/data/areas";
import { Card } from "@/ui/Card";
import { theme } from "@/theme/theme";

export default function LifeAreaModal() {
  const router = useRouter();
  const { areaId } = useLocalSearchParams<{ areaId?: string }>();

  const area = useMemo(
    () => LIFE_AREAS.find((a) => a.id === areaId),
    [areaId]
  );

  const [text, setText] = useState("");

  function save() {
    // MVP: local only for now.
    // Next: persist in Supabase.
    router.back();
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }} edges={["top"]}>
      <KeyboardAvoidingView
        style={{ flex: 1, padding: theme.space.md }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={{ marginBottom: theme.space.md }}>
          <Text style={{ fontSize: 22, fontWeight: "800", color: theme.colors.text }}>
            {area?.title ?? "Life"}
          </Text>
          {!!area?.subtitle && (
            <Text style={{ marginTop: 6, opacity: 0.65, color: theme.colors.text }}>
              {area.subtitle}
            </Text>
          )}
        </View>

        <Card>
          <Text style={{ opacity: 0.75, color: theme.colors.text, marginBottom: theme.space.sm }}>
            What do you notice here right now?
          </Text>

          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="One clear sentence…"
            placeholderTextColor="rgba(0,0,0,0.35)"
            multiline
            style={{
              minHeight: 160,
              textAlignVertical: "top",
              fontSize: 15,
              color: theme.colors.text,
              paddingVertical: 6,
            }}
          />

          <View style={{ flexDirection: "row", gap: theme.space.sm, marginTop: theme.space.md }}>
            <Card
              onPress={() => router.back()}
              style={{
                flex: 1,
                alignItems: "center",
                paddingVertical: 10,
                backgroundColor: "rgba(0,0,0,0.04)",
              }}
            >
              <Text style={{ fontWeight: "700", color: theme.colors.text }}>Cancel</Text>
            </Card>

            <Card
              onPress={save}
              style={{
                flex: 1,
                alignItems: "center",
                paddingVertical: 10,
                backgroundColor: "rgba(47,93,144,0.10)",
                borderColor: "rgba(47,93,144,0.18)",
              }}
            >
              <Text style={{ fontWeight: "700", color: theme.colors.text }}>Save</Text>
            </Card>
          </View>
        </Card>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}