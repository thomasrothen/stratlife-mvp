import { View } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { theme } from "@/theme/theme";
import { Text } from "@/ui/Text";
import { Input } from "@/ui/Input";
import { Button } from "@/ui/Button";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

export default function CreateWinScreen() {
  const router = useRouter();
  const { session } = useAuth();

  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSave = title.trim().length > 0 && !!session;

  async function saveWin() {
    if (!session) return;

    setSaving(true);
    setError(null);

    try {
      const { error } = await supabase.from("wins").insert({
        user_id: session.user.id,
        title: title.trim(),
        note: note.trim() || null,
      });

      if (error) throw error;

      router.back();
    } catch (err: any) {
      setError(err?.message ?? "Could not save win.");
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
      <Text variant="title" style={{ fontWeight: "700" }}>
        Create a Win
      </Text>

      <View style={{ gap: theme.space.sm }}>
        <Text style={{ fontWeight: "600" }}>Title</Text>
        <Input
          value={title}
          onChangeText={setTitle}
          placeholder="e.g., Finished my workout"
        />
      </View>

      <View style={{ gap: theme.space.sm }}>
        <Text style={{ fontWeight: "600" }}>Note (optional)</Text>
        <Input
          value={note}
          onChangeText={setNote}
          placeholder="Anything you want to remember about this."
          multiline
          style={{ minHeight: 110, textAlignVertical: "top" }}
        />
      </View>

      {error ? <Text muted>{error}</Text> : null}

      <Button
        title={saving ? "Saving…" : "Save"}
        disabled={!canSave || saving}
        onPress={saveWin}
      />
    </View>
  );
}