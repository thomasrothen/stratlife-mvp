import { useMemo, useState } from "react";
import { View, Pressable } from "react-native";
import { useRouter } from "expo-router";
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

type FocusItem = {
  id: string;
  text: string;
  area: Area;
};

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

export default function FocusScreen() {
  const router = useRouter();
  const [items, setItems] = useState<FocusItem[]>([]);
  const [draftText, setDraftText] = useState("");
  const [draftArea, setDraftArea] = useState<Area>("Spirit");

  const canAdd = useMemo(() => {
    return draftText.trim().length > 0 && items.length < 3;
  }, [draftText, items.length]);

  const canSave = useMemo(() => items.length > 0, [items.length]);

  function addFocus() {
    if (!canAdd) return;
    setItems((prev) => [
      ...prev,
      { id: uid(), text: draftText.trim(), area: draftArea },
    ]);
    setDraftText("");
  }

  function removeFocus(id: string) {
    setItems((prev) => prev.filter((x) => x.id !== id));
  }

  async function saveFocus() {
    // MVP: persist later (supabase or local). For now: return to Today.
    router.replace("/today");
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
        <Text variant="title" style={{ fontWeight: "800" }}>
          Your Focus
        </Text>
        <Text muted>What matters right now — for your life?</Text>
      </View>

      <Card>
        <Text muted style={{ marginBottom: theme.space.sm }}>
          One or two things are enough.
        </Text>

        <Input
          value={draftText}
          onChangeText={setDraftText}
          placeholder="Add a focus…"
        />

        {/* MVP area picker: simple cycle button to avoid building a picker UI */}
        <View style={{ flexDirection: "row", gap: 10, marginTop: theme.space.sm }}>
          <Pressable
            onPress={() => {
              const idx = AREAS.indexOf(draftArea);
              setDraftArea(AREAS[(idx + 1) % AREAS.length]);
            }}
          >
            <Text muted>Area: {draftArea} (tap to change)</Text>
          </Pressable>
        </View>

        <Button
          title={items.length >= 3 ? "Max 3 focuses" : "+ Add focus"}
          variant="secondary"
          disabled={!canAdd}
          onPress={addFocus}
        />
      </Card>

      <View style={{ gap: theme.space.sm }}>
        {items.map((it) => (
          <Card key={it.id}>
            <Text style={{ fontWeight: "600" }}>{it.text}</Text>
            <Text muted style={{ marginTop: theme.space.xs }}>
              {it.area}
            </Text>

            <Button
              title="Remove"
              variant="secondary"
              onPress={() => removeFocus(it.id)}
            />
          </Card>
        ))}
      </View>

      <Button title="Save focus" disabled={!canSave} onPress={saveFocus} />
    </View>
  );
}