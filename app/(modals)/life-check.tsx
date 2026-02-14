import { useMemo, useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Slider from "@react-native-community/slider";
import { theme } from "@/theme/theme";
import { Text } from "@/ui/Text";
import { Card } from "@/ui/Card";
import { Input } from "@/ui/Input";
import { Button } from "@/ui/Button";

type Area =
  | "Spirit"
  | "Fit"
  | "Connect"
  | "Experience"
  | "Happy"
  | "Business"
  | "Money";

const AREAS: Area[] = [
  "Spirit",
  "Fit",
  "Connect",
  "Experience",
  "Happy",
  "Business",
  "Money",
];

export default function LifeCheckScreen() {
  const router = useRouter();

  const [values, setValues] = useState<Record<Area, number>>(() =>
    Object.fromEntries(AREAS.map((a) => [a, 0.5])) as Record<Area, number>
  );
  const [note, setNote] = useState("");

  const canContinue = useMemo(() => true, []);

  function setArea(area: Area, v: number) {
    setValues((prev) => ({ ...prev, [area]: v }));
  }

  async function onContinue() {
    // MVP: persist later (Supabase or local)
    // ✅ After Life Check, go back into the app tabs and open Focus.
    router.replace("/(app)/focus");
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <View
        style={{
          flex: 1,
          padding: theme.space.lg,
          gap: theme.space.md,
        }}
      >
        <View style={{ gap: theme.space.xs }}>
          <Text variant="title" style={{ fontWeight: "800" }}>
            Life Check
          </Text>
          <Text muted>How does your life feel right now?</Text>
        </View>

        <Card>
          <View style={{ gap: theme.space.md }}>
            {AREAS.map((area) => (
              <View key={area} style={{ gap: theme.space.xs }}>
                <Text style={{ fontWeight: "600" }}>{area}</Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <Text muted>😔</Text>
                  <Slider
                    style={{ flex: 1 }}
                    minimumValue={0}
                    maximumValue={1}
                    value={values[area]}
                    onValueChange={(v) => setArea(area, v)}
                  />
                  <Text muted>😊</Text>
                </View>
              </View>
            ))}
          </View>
        </Card>

        <Card>
          <Text style={{ fontWeight: "600" }}>Anything you want to remember?</Text>
          <Input
            value={note}
            onChangeText={setNote}
            placeholder="Optional…"
            style={{ marginTop: theme.space.sm }}
          />
        </Card>

        <Button title="Continue" disabled={!canContinue} onPress={onContinue} />
        <Button title="Close" variant="secondary" onPress={() => router.back()} />
      </View>
    </SafeAreaView>
  );
}