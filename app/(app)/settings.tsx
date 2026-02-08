import { useMemo, useState } from "react";
import { View } from "react-native";
import { Redirect } from "expo-router";
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

  const reminderValid = useMemo(
    () => normalizeTime(reminder) !== null,
    [reminder]
  );

  // Not signed in → Welcome
  if (!loading && !session) return <Redirect href="/welcome" />;

  async function logout() {
    await supabase.auth.signOut();
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.bg,
        padding: theme.space.lg,
        gap: theme.space.md,
      }}
    >
      <View style={{ gap: theme.space.xs }}>
        <Text variant="title" style={{ fontWeight: "700" }}>
          Settings
        </Text>
        <Text muted>
          You decide what stays private — and what inspires others.
        </Text>
      </View>

      <Card>
        <Text style={{ fontWeight: "600" }}>Name</Text>
        <Input
          value={name}
          onChangeText={setName}
          placeholder="Your name"
          style={{ marginTop: theme.space.sm }}
        />
      </Card>

      <Card>
        <Text style={{ fontWeight: "600" }}>Daily reminder</Text>
        <Text muted style={{ marginTop: theme.space.xs }}>
          Time (HH:MM), e.g. 20:30
        </Text>
        <Input
          value={reminder}
          onChangeText={setReminder}
          placeholder="20:30"
          style={{ marginTop: theme.space.sm }}
        />
        {!reminderValid ? (
          <Text muted style={{ marginTop: theme.space.xs, opacity: 0.75 }}>
            Please enter a valid time like 20:30.
          </Text>
        ) : null}
      </Card>

      <Card>
        <Text style={{ fontWeight: "600" }}>Theme</Text>
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
        <Text muted style={{ marginTop: theme.space.sm }}>
          (MVP) Theme toggle is UI-only for now.
        </Text>
      </Card>

      <Card>
        <Text style={{ fontWeight: "600" }}>Privacy</Text>
        <Text muted style={{ marginTop: theme.space.xs }}>
          You decide what stays private and what might help others one day.
        </Text>
      </Card>

      <View style={{ marginTop: theme.space.sm }}>
        <Button title="Log out" variant="secondary" onPress={logout} />
      </View>
    </View>
  );
}