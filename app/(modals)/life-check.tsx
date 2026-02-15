import React, { useMemo, useState } from "react";
import { View, Text, TextInput, ScrollView, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { LIFE_AREAS } from "@/data/areas";
import { getWeekStartISO } from "@/lib/week";
import { supabase } from "@/lib/supabase";
import { Card } from "@/ui/Card";
import { theme } from "@/theme/theme";

type AreaId = (typeof LIFE_AREAS)[number]["id"];

function FeelingDots({
  value,
  onChange,
}: {
  value: number; // 1..5
  onChange: (v: number) => void;
}) {
  const dots = [1, 2, 3, 4, 5];

  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
      <Text style={{ fontSize: 16 }}>😔</Text>

      <View style={{ flexDirection: "row", gap: 10 }}>
        {dots.map((d) => {
          const active = d <= value;

          return (
            <Pressable
              key={d}
              onPress={() => onChange(d)}
              style={{
                width: 18,
                height: 18,
                borderRadius: 999,
                backgroundColor: active ? "rgba(47,93,144,0.25)" : theme.colors.surface,
                borderWidth: 1,
                borderColor: active ? "rgba(47,93,144,0.35)" : theme.colors.border,
              }}
              hitSlop={8}
            />
          );
        })}
      </View>

      <Text style={{ fontSize: 16 }}>😊</Text>
    </View>
  );
}

export default function LifeCheckModal() {
  const router = useRouter();

  const weekStartISO = useMemo(() => getWeekStartISO(), []);

  const initialScores = useMemo(() => {
    const map: Record<string, number> = {};
    LIFE_AREAS.forEach((a) => (map[a.id] = 3));
    return map as Record<AreaId, number>;
  }, []);

  const [scores, setScores] = useState<Record<AreaId, number>>(initialScores);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  function setArea(id: AreaId, v: number) {
    setScores((p) => ({ ...p, [id]: v }));
  }

  async function save() {
    if (saving) return;
    setSaving(true);

    try {
      const { data: userRes, error: userErr } = await supabase.auth.getUser();
      if (userErr) {
        console.log("[LifeCheck] auth.getUser error:", userErr);
        Alert.alert("Not signed in", userErr.message);
        return;
      }

      const user = userRes?.user;
      if (!user) {
        Alert.alert("Not signed in", "Please sign in first.");
        return;
      }

      const payload = {
        user_id: user.id,
        week_start: weekStartISO,
        scores,
        note: note.trim(),
      };

      const { error } = await supabase
        .from("life_checks")
        .upsert(payload, { onConflict: "user_id,week_start" });

      if (error) {
        console.log("[LifeCheck] upsert error:", error);
        Alert.alert("Couldn’t save Life Check", error.message);
        return;
      }

      router.back();
    } catch (e: any) {
      console.log("[LifeCheck] unexpected error:", e);
      Alert.alert("Couldn’t save Life Check", e?.message ?? "Unknown error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }} edges={["top"]}>
      <ScrollView
        contentContainerStyle={{
          padding: theme.space.md,
          paddingBottom: 96,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={{ fontSize: 22, fontWeight: "900", color: theme.colors.text }}>
          Life Check
        </Text>
        <Text style={{ marginTop: 6, fontSize: 15, opacity: 0.82, color: theme.colors.text }}>
          How does your life feel right now?
        </Text>

        <View style={{ height: theme.space.md }} />

        <Card>
          <View style={{ gap: 14 }}>
            {LIFE_AREAS.map((a) => (
              <View
                key={a.id}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <View style={{ width: 110 }}>
                  <Text style={{ fontSize: 15, fontWeight: "800", color: theme.colors.text }}>
                    {a.title}
                  </Text>
                </View>

                <FeelingDots value={scores[a.id]} onChange={(v) => setArea(a.id, v)} />
              </View>
            ))}
          </View>
        </Card>

        <View style={{ height: theme.space.md }} />

        <Card>
          <Text style={{ fontSize: 14, fontWeight: "800", color: theme.colors.text }}>
            Anything you want to remember?
          </Text>

          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Optional…"
            placeholderTextColor="rgba(0,0,0,0.35)"
            multiline
            style={{
              marginTop: 10,
              minHeight: 110,
              textAlignVertical: "top",
              fontSize: 15,
              color: theme.colors.text,
              paddingVertical: 6,
            }}
          />
        </Card>

        <View style={{ height: theme.space.md }} />

        <View style={{ flexDirection: "row", gap: theme.space.sm }}>
          <Card
            onPress={save}
            disabled={saving}
            style={{
              flex: 1,
              alignItems: "center",
              paddingVertical: 12,
              backgroundColor: "rgba(47,93,144,0.10)",
              borderColor: "rgba(47,93,144,0.22)",
              opacity: saving ? 0.6 : 1,
            }}
          >
            <Text style={{ fontWeight: "900", color: theme.colors.text }}>
              {saving ? "Saving…" : "Save"}
            </Text>
          </Card>

          <Card
            onPress={() => router.back()}
            disabled={saving}
            style={{
              flex: 1,
              alignItems: "center",
              paddingVertical: 12,
              backgroundColor: "rgba(0,0,0,0.04)",
              opacity: saving ? 0.6 : 1,
            }}
          >
            <Text style={{ fontWeight: "900", color: theme.colors.text }}>Cancel</Text>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}