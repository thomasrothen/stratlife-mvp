import { useMemo, useState } from "react";
import { View } from "react-native";
import { Redirect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "@/theme/theme";
import { Text } from "@/ui/Text";
import { Card } from "@/ui/Card";
import { Input } from "@/ui/Input";
import { Button } from "@/ui/Button";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function normalizeTime(value: string) {
  const v = value.trim().replace(".", ":");
  const compact =
    v.includes(":") ? v : v.length === 4 ? `${v.slice(0, 2)}:${v.slice(2)}` : v;

  const m = compact.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;

  const hh = Number(m[1]);
  const mm = Number(m[2]);
  if (hh < 0 || hh > 23 || mm < 0 || mm > 59) return null;

  return `${pad2(hh)}:${pad2(mm)}`;
}

export default function SettingsScreen() {
  const { session, loading } = useAuth();

  const [name, setName] = useState("Tom");
  const [reminder, setReminder] = useState("20:30");
  const [themeMode, setThemeMode] = useState<"Light" | "Dark">("Light");

  const reminderValid = useMemo(() => normalizeTime(reminder) !== null, [reminder]);

  if (!loading && !session) return <Redirect href="/(auth)/welcome" />;

  async function logout() {
    await supabase.auth.signOut();
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <View
        style={{
          flex: 1,
          padding: theme.space.lg,
          gap: theme.space.lg,
        }}
      >
        {/* Header */}
        <View style={{ gap: theme.space.xs }}>
          <Text variant="title" style={{ fontWeight: "800" }}>
            Settings
          </Text>
          <Text muted>You decide what stays private — and what inspires others.</Text>
        </View>

        <View style={{ gap: theme.space.md }}>
          <Card>
            <Text style={{ fontWeight: "700" }}>Name</Text>
            <View style={{ marginTop: theme.space.sm }}>
              <Input value={name} onChangeText={setName} placeholder="Your name" />
            </View>
          </Card>

          <Card>
            <Text style={{ fontWeight: "700" }}>Reminder time</Text>
            <Text muted style={{ marginTop: theme.space.xs }}>
              Optional. A gentle nudge to reflect.
            </Text>

            <View style={{ marginTop: theme.space.sm }}>
              <Input
                value={reminder}
                onChangeText={setReminder}
                placeholder="20:30"
                keyboardType="numbers-and-punctuation"
              />
            </View>

            {!reminderValid ? (
              <Text muted variant="caption" style={{ marginTop: theme.space.xs }}>
                Please use HH:MM (e.g., 20:30)
              </Text>
            ) : null}
          </Card>

          <Card>
            <Text style={{ fontWeight: "700" }}>Theme</Text>
            <Text muted style={{ marginTop: theme.space.xs }}>
              (MVP placeholder)
            </Text>

            <View style={{ flexDirection: "row", gap: 10, marginTop: theme.space.sm }}>
              <Button
                title="Light"
                variant={themeMode === "Light" ? "primary" : "secondary"}
                onPress={() => setThemeMode("Light")}
              />
              <Button
                title="Dark"
                variant={themeMode === "Dark" ? "primary" : "secondary"}
                onPress={() => setThemeMode("Dark")}
              />
            </View>
          </Card>

          <Button title="Log out" variant="secondary" onPress={logout} />
        </View>
      </View>
    </SafeAreaView>
  );
}