import { useEffect, useMemo, useState } from "react";
import { View, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "@/theme/theme";
import { Text } from "@/ui/Text";
import { Card } from "@/ui/Card";
import { Input } from "@/ui/Input";
import { Button } from "@/ui/Button";
import { getCurrentWeeklyFocus, upsertWeeklyFocusItems } from "@/data/focus";

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
  id?: string;
  text: string;
  area: Area;
};

export default function FocusScreen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [weekId, setWeekId] = useState<string | null>(null);

  const [items, setItems] = useState<FocusItem[]>([]);
  const [draftText, setDraftText] = useState("");
  const [draftArea, setDraftArea] = useState<Area>("Spirit");

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const result = await getCurrentWeeklyFocus();
      setWeekId(result.week.id);

      setItems(
        result.items.map((i) => ({
          id: i.id,
          text: i.text,
          area: (i.area as Area) ?? "Spirit",
        }))
      );
    } finally {
      setLoading(false);
    }
  }

  const canAdd = useMemo(
    () => draftText.trim().length > 0 && items.length < 3,
    [draftText, items.length]
  );

  const canSave = useMemo(() => items.length > 0 && !!weekId, [items.length, weekId]);

  function addFocus() {
    if (!canAdd) return;
    setItems((prev) => [...prev, { text: draftText.trim(), area: draftArea }]);
    setDraftText("");
  }

  function removeFocus(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  async function saveFocus() {
    if (!weekId || saving) return;

    setSaving(true);
    try {
      await upsertWeeklyFocusItems(
        weekId,
        items.map((it, index) => ({
          position: (index + 1) as 1 | 2 | 3,
          text: it.text,
          area: it.area,
        }))
      );
      await load();
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator />
        </View>
      </SafeAreaView>
    );
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
            Focus
          </Text>
          <Text muted>One to three things. No pressure.</Text>
        </View>

        {/* Items (content first) */}
        {items.length === 0 ? (
          <Card>
            <Text style={{ fontWeight: "700" }}>Nothing selected yet.</Text>
            <Text muted style={{ marginTop: theme.space.xs }}>
              Choose what deserves your energy this week.
            </Text>
          </Card>
        ) : (
          <View style={{ gap: theme.space.sm }}>
            {items.map((it, index) => (
              <Card key={`${it.id ?? "new"}-${index}`}>
                <Text style={{ fontWeight: "800" }}>{it.text}</Text>
                <Text muted variant="caption" style={{ marginTop: theme.space.xs, opacity: 0.75 }}>
                  {it.area}
                </Text>
                <View style={{ marginTop: theme.space.md }}>
                  <Button
                    title="Remove"
                    variant="secondary"
                    onPress={() => removeFocus(index)}
                  />
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* Add section */}
        <Card>
          <Text muted variant="caption" style={{ opacity: 0.75 }}>
            Add a focus (max 3)
          </Text>

          <View style={{ marginTop: theme.space.sm, gap: theme.space.sm }}>
            <Input
              value={draftText}
              onChangeText={setDraftText}
              placeholder="Add a focus…"
              maxLength={80}
            />

            <Pressable
              onPress={() => {
                const idx = AREAS.indexOf(draftArea);
                setDraftArea(AREAS[(idx + 1) % AREAS.length]);
              }}
            >
              <Text muted variant="caption">
                Area: {draftArea} (tap to change)
              </Text>
            </Pressable>

            <Button
              title={items.length >= 3 ? "Max 3 focuses" : "+ Add focus"}
              variant="secondary"
              disabled={!canAdd}
              onPress={addFocus}
            />
          </View>
        </Card>

        {items.length > 0 ? (
          <Button
            title={saving ? "Saving…" : "Save focus"}
            disabled={!canSave || saving}
            onPress={saveFocus}
          />
        ) : null}
      </View>
    </SafeAreaView>
  );
}