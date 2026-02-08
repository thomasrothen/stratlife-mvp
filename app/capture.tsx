import { View, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { theme } from "@/theme/theme";
import { Text } from "@/ui/Text";
import { Input } from "@/ui/Input";
import { Button } from "@/ui/Button";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

export default function CaptureMomentScreen() {
  const router = useRouter();
  const { session } = useAuth();

  const [moment, setMoment] = useState("");
  const [lifeArea, setLifeArea] = useState(""); // optional (MVP: simple text)
  const [focus, setFocus] = useState(""); // optional (MVP: simple text)
  const [helpOthers, setHelpOthers] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSave = useMemo(() => moment.trim().length > 0 && !!session, [moment, session]);

  async function saveMoment() {
    if (!session) return;

    setSaving(true);
    setError(null);

    try {
      const title = moment.trim();

      // Store optional metadata in note for now (keeps DB unchanged)
      const noteParts: string[] = [];
      if (lifeArea.trim()) noteParts.push(`Area: ${lifeArea.trim()}`);
      if (focus.trim()) noteParts.push(`Focus: ${focus.trim()}`);
      if (helpOthers) noteParts.push(`Share: yes`);

      const note = noteParts.length ? noteParts.join("\n") : null;

      const { error } = await supabase.from("wins").insert({
        user_id: session.user.id,
        title,
        note,
      });

      if (error) throw error;

      router.back();
    } catch (err: any) {
      setError(err?.message ?? "Could not save moment.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <View
      style={{
        flex: 1,
        padding: theme.space.lg,
        gap: theme.space.md,
        backgroundColor: theme.colors.bg,
      }}
    >
      <View style={{ gap: theme.space.xs }}>
        <Text variant="title" style={{ fontWeight: "800" }}>
          Capture a Moment
        </Text>
        <Text muted>What moved you forward today?</Text>
      </View>

      <Input
        value={moment}
        onChangeText={setMoment}
        placeholder="Write one honest sentence…"
        multiline
        style={{ minHeight: 120, textAlignVertical: "top" }}
      />

      <View style={{ gap: theme.space.sm }}>
        <Text muted>Life area (optional)</Text>
        <Input
          value={lifeArea}
          onChangeText={setLifeArea}
          placeholder="e.g., Spirit"
        />
      </View>

      <View style={{ gap: theme.space.sm }}>
        <Text muted>Link to focus (optional)</Text>
        <Input
          value={focus}
          onChangeText={setFocus}
          placeholder="e.g., More calm mornings"
        />
      </View>

      <Pressable
        onPress={() => setHelpOthers((v) => !v)}
        style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
      >
        <View
          style={{
            width: 18,
            height: 18,
            borderRadius: 5,
            borderWidth: 1,
            borderColor: theme.colors.border,
            backgroundColor: helpOthers ? theme.colors.primary : "transparent",
            opacity: helpOthers ? 1 : 0.35,
          }}
        />
        <Text muted>This might help others one day</Text>
      </Pressable>

      <Text muted style={{ fontSize: 13, opacity: 0.75 }}>
        Small steps count. Impact grows over time.
      </Text>

      {error ? <Text muted>{error}</Text> : null}

      <Button
        title={saving ? "Saving…" : "Save moment"}
        disabled={!canSave || saving}
        onPress={saveMoment}
      />
    </View>
  );
}