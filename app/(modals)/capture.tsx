import { useMemo, useState } from "react";
import {
  View,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter, Redirect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "@/theme/theme";
import { Text } from "@/ui/Text";
import { Input } from "@/ui/Input";
import { Button } from "@/ui/Button";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

export default function CaptureMomentScreen() {
  const router = useRouter();
  const { session, loading } = useAuth();

  // ✅ Fix: auth group route
  if (!loading && !session) return <Redirect href="/(auth)/welcome" />;

  // MVP contract: title is the main saved card headline
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");

  const [lifeArea, setLifeArea] = useState("");
  const [focus, setFocus] = useState("");
  const [helpOthers, setHelpOthers] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSave = useMemo(
    () => title.trim().length > 0 && !!session,
    [title, session]
  );

  async function saveMoment() {
    if (!session || saving) return;

    setSaving(true);
    setError(null);

    try {
      const payload = {
        user_id: session.user.id,
        title: title.trim(),
        details: details.trim() ? details.trim() : null,
        area: lifeArea.trim() ? lifeArea.trim() : null,
        focus: focus.trim() ? focus.trim() : null,
        share: helpOthers,
      };

      const { error } = await supabase.from("wins").insert(payload);
      if (error) throw error;

      router.back();
    } catch (err: any) {
      setError(err?.message ?? "Could not save moment.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={{
            padding: theme.space.lg,
            gap: theme.space.md,
            paddingBottom: theme.space.xl,
          }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={{ gap: theme.space.xs }}>
            <Text variant="title" style={{ fontWeight: "800" }}>
              Capture a Moment
            </Text>
            <Text muted>What moved you forward today?</Text>
          </View>

          {/* Title (required) */}
          <View style={{ gap: theme.space.xs }}>
            <Text style={{ fontWeight: "600" }}>Title</Text>
            <Input
              value={title}
              onChangeText={setTitle}
              placeholder="One honest sentence…"
              returnKeyType="done"
            />
            <Text muted style={{ fontSize: 13, opacity: 0.75 }}>
              This becomes the headline in Today + Journey.
            </Text>
          </View>

          {/* Details (optional) */}
          <View style={{ gap: theme.space.xs }}>
            <Text style={{ fontWeight: "600" }}>Details (optional)</Text>
            <Input
              value={details}
              onChangeText={setDetails}
              placeholder="Anything else you want to remember…"
              multiline
              style={{ minHeight: 110, textAlignVertical: "top" }}
            />
          </View>

          {/* Metadata (optional) */}
          <View style={{ gap: theme.space.sm }}>
            <View style={{ gap: theme.space.xs }}>
              <Text style={{ fontWeight: "600" }}>Life area (optional)</Text>
              <Input
                value={lifeArea}
                onChangeText={setLifeArea}
                placeholder="e.g., Spirit"
              />
            </View>

            <View style={{ gap: theme.space.xs }}>
              <Text style={{ fontWeight: "600" }}>Focus (optional)</Text>
              <Input
                value={focus}
                onChangeText={setFocus}
                placeholder="e.g., More calm mornings"
              />
              <Text muted style={{ fontSize: 13, opacity: 0.75 }}>
                For now this is free text. Later it will become a picker.
              </Text>
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
                  backgroundColor: helpOthers
                    ? theme.colors.primary
                    : "transparent",
                  opacity: helpOthers ? 1 : 0.35,
                }}
              />
              <Text muted>This might help others one day</Text>
            </Pressable>
          </View>

          <Text muted style={{ fontSize: 13, opacity: 0.75 }}>
            Small steps count. Impact grows over time.
          </Text>

          {error ? <Text muted>{error}</Text> : null}

          <Button
            title={saving ? "Saving…" : "Save moment"}
            disabled={!canSave || saving}
            onPress={saveMoment}
          />

          <Button
            title="Close"
            variant="secondary"
            disabled={saving}
            onPress={() => router.back()}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}