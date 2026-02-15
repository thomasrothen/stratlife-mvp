import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Modal,
  Pressable,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";

import { theme } from "@/theme/theme";
import { Text } from "@/ui/Text";
import { Card } from "@/ui/Card";
import { Input } from "@/ui/Input";
import { Button } from "@/ui/Button";

import { supabase } from "@/lib/supabase";
import { getWeekStartISO } from "@/lib/week";

type Area =
  | "Spirit"
  | "Fit"
  | "Experience"
  | "Connect"
  | "Happy"
  | "Business"
  | "Money"
  | "Home";

const AREAS: Area[] = [
  "Spirit",
  "Fit",
  "Experience",
  "Connect",
  "Happy",
  "Business",
  "Money",
  "Home",
];

type FocusItemUI = {
  id?: string;
  position: number;
  text: string;
  area: Area | null;
};

type FocusWeekRow = {
  id: string;
  week_start: string;
};

type FocusItemRow = {
  id: string;
  focus_week_id: string;
  position: number;
  text: string;
  area: string | null;
  deleted_at: string | null;
};

function formatWeekLabel(weekStartISO: string) {
  const d = new Date(`${weekStartISO}T00:00:00`);
  return `Week of ${d.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
}

function AreaPill({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        alignSelf: "flex-start",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        backgroundColor: "rgba(0,0,0,0.03)",
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.10)",
      }}
    >
      <Text muted variant="caption" style={{ opacity: 0.75 }}>
        {label}
      </Text>
    </Pressable>
  );
}

function SheetRow({
  title,
  selected,
  onPress,
}: {
  title: string;
  selected?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 12,
        backgroundColor: selected ? "rgba(47,93,144,0.08)" : "transparent",
        borderWidth: 1,
        borderColor: selected ? "rgba(47,93,144,0.25)" : "rgba(0,0,0,0.06)",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text style={{ fontWeight: "700" }}>{title}</Text>
        <View
          style={{
            width: 8,
            height: 8,
            borderRadius: 999,
            backgroundColor: selected
              ? "rgba(47,93,144,0.85)"
              : "rgba(0,0,0,0.10)",
          }}
        />
      </View>
    </Pressable>
  );
}

type AreaTarget =
  | { type: "draft" }
  | { type: "item"; index: number }
  | { type: "edit" };

export default function FocusScreen() {
  const weekStartISO = useMemo(() => getWeekStartISO(), []);
  const weekLabel = useMemo(() => formatWeekLabel(weekStartISO), [weekStartISO]);

  const [loading, setLoading] = useState(true);
  const [focusWeekId, setFocusWeekId] = useState<string | null>(null);

  const [items, setItems] = useState<FocusItemUI[]>([]);
  const [draftText, setDraftText] = useState("");
  const [draftArea, setDraftArea] = useState<Area | null>(null);

  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipAutosaveOnce = useRef(true);

  const MAX_ITEMS = 3;
  const isMax = items.length >= MAX_ITEMS;

  // Area picker modal
  const [areaModalOpen, setAreaModalOpen] = useState(false);
  const [areaTarget, setAreaTarget] = useState<AreaTarget>({ type: "draft" });

  // Edit modal (tap text)
  const [editOpen, setEditOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [editArea, setEditArea] = useState<Area | null>(null);

  const draftTrimmed = draftText.trim();
  const canAdd = draftTrimmed.length > 0 && !isMax;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data: userRes, error: userErr } = await supabase.auth.getUser();
      if (userErr) {
        console.log("[Focus] auth.getUser error:", userErr);
        Alert.alert("Focus", "Couldn’t read your session.");
        setItems([]);
        setFocusWeekId(null);
        return;
      }
      const user = userRes?.user;
      if (!user) {
        setItems([]);
        setFocusWeekId(null);
        return;
      }

      const { data: weekRow, error: weekErr } = await supabase
        .from("focus_weeks")
        .upsert(
          { user_id: user.id, week_start: weekStartISO },
          { onConflict: "user_id,week_start" }
        )
        .select("id, week_start")
        .single();

      if (weekErr) {
        console.log("[Focus] upsert focus_weeks error:", weekErr);
        Alert.alert("Focus", `Couldn’t prepare this week.\n\n${weekErr.message}`);
        setItems([]);
        setFocusWeekId(null);
        return;
      }

      const focusWeek = weekRow as FocusWeekRow;
      setFocusWeekId(focusWeek.id);

      const { data: rows, error: itemsErr } = await supabase
        .from("focus_items")
        .select("id, focus_week_id, position, text, area, deleted_at")
        .eq("focus_week_id", focusWeek.id)
        .is("deleted_at", null)
        .order("position", { ascending: true });

      if (itemsErr) {
        console.log("[Focus] load focus_items error:", itemsErr);
        Alert.alert("Focus", `Couldn’t load focus.\n\n${itemsErr.message}`);
        setItems([]);
        return;
      }

      const ui = (rows ?? []).map((r: FocusItemRow) => ({
        id: r.id,
        position: r.position,
        text: r.text,
        area: (r.area as Area) ?? null,
      }));

      setItems(ui);
      setSaveState("idle");
      skipAutosaveOnce.current = true;
    } finally {
      setLoading(false);
    }
  }, [weekStartISO]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const persist = useCallback(
    async (nextItems: FocusItemUI[]) => {
      if (!focusWeekId) return;

      const { data: userRes, error: userErr } = await supabase.auth.getUser();
      if (userErr) {
        console.log("[Focus] auth.getUser error:", userErr);
        Alert.alert("Focus", `Couldn’t save.\n\n${userErr.message}`);
        return;
      }
      const user = userRes?.user;
      if (!user) {
        Alert.alert("Focus", "Not signed in.");
        return;
      }

      setSaveState("saving");

      const del = await supabase.from("focus_items").delete().eq("focus_week_id", focusWeekId);
      if (del.error) {
        console.log("[Focus] delete focus_items error:", del.error);
        Alert.alert("Focus", `Couldn’t save.\n\n${del.error.message}`);
        setSaveState("idle");
        return;
      }

      if (nextItems.length > 0) {
        const payload = nextItems.map((it, idx) => ({
          user_id: user.id,
          focus_week_id: focusWeekId,
          position: idx + 1,
          text: it.text,
          area: it.area,
        }));

        const ins = await supabase.from("focus_items").insert(payload);
        if (ins.error) {
          console.log("[Focus] insert focus_items error:", ins.error);
          Alert.alert("Focus", `Couldn’t save.\n\n${ins.error.message}`);
          setSaveState("idle");
          return;
        }
      }

      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 900);
    },
    [focusWeekId]
  );

  useEffect(() => {
    if (!focusWeekId) return;

    if (skipAutosaveOnce.current) {
      skipAutosaveOnce.current = false;
      return;
    }

    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      void persist(items);
    }, 450);

    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [items, focusWeekId, persist]);

  function addItem() {
    if (!canAdd) return;

    setItems((prev) => {
      const next: FocusItemUI[] = [
        ...prev,
        { position: prev.length + 1, text: draftTrimmed, area: draftArea },
      ];
      return next.slice(0, MAX_ITEMS);
    });

    setDraftText("");
    setDraftArea(null);
  }

  function removeItem(index: number) {
    setItems((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((it, idx) => ({ ...it, position: idx + 1 }))
    );
  }

  function openEdit(index: number) {
    const it = items[index];
    setEditIndex(index);
    setEditText(it.text);
    setEditArea(it.area ?? null);
    setEditOpen(true);
  }

  function saveEdit() {
    if (editIndex === null) return;
    const t = editText.trim();
    if (!t) {
      Alert.alert("Focus", "Please enter a focus.");
      return;
    }

    setItems((prev) =>
      prev.map((it, idx) =>
        idx === editIndex ? { ...it, text: t, area: editArea } : it
      )
    );

    setEditOpen(false);
    setEditIndex(null);
  }

  function openAreaPicker(target: AreaTarget) {
    setAreaTarget(target);
    setAreaModalOpen(true);
  }

  function currentSelectedArea(): Area | null {
    if (areaTarget.type === "draft") return draftArea;
    if (areaTarget.type === "edit") return editArea;
    return items[areaTarget.index]?.area ?? null;
  }

  function applyAreaSelection(a: Area | null) {
    if (areaTarget.type === "draft") {
      setDraftArea(a);
      setAreaModalOpen(false);
      return;
    }

    if (areaTarget.type === "edit") {
      setEditArea(a);
      setAreaModalOpen(false);
      return;
    }

    // update existing item directly (autosaves)
    const idx = areaTarget.index;
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, area: a } : it)));
    setAreaModalOpen(false);
  }

  const helperText = useMemo(() => {
    if (isMax) return "";
    if (draftTrimmed.length > 0) return "Tap “Add focus” to save.";
    return "Saved automatically after you edit, add, or remove.";
  }, [draftTrimmed.length, isMax]);

  const statusText = useMemo(() => {
    if (saveState === "saving") return "Saving…";
    if (saveState === "saved") return "Saved";
    return "";
  }, [saveState]);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <ScrollView
        contentContainerStyle={{
          padding: theme.space.lg,
          gap: theme.space.lg,
          paddingBottom: 96,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ gap: theme.space.xs }}>
          <Text variant="title" style={{ fontWeight: "800" }}>
            Focus
          </Text>
          <Text muted>One to three things. No pressure.</Text>
          <Text muted variant="caption" style={{ opacity: 0.6 }}>
            {weekLabel}
          </Text>
        </View>

        {statusText ? (
          <Text muted variant="caption" style={{ opacity: 0.55 }}>
            {statusText}
          </Text>
        ) : null}

        {items.length === 0 ? (
          <Card>
            <Text style={{ fontWeight: "800" }}>Nothing selected yet.</Text>
            <Text muted style={{ marginTop: theme.space.xs }}>
              Choose what deserves your energy this week.
            </Text>
          </Card>
        ) : (
          <View style={{ gap: theme.space.sm }}>
            {items.map((it, idx) => {
              const isLast = idx === items.length - 1;

              return (
                <View key={`${it.id ?? "local"}-${idx}`} style={{ gap: 6 }}>
                  <Card>
                    {/* Header row: text (tap to edit) + subtle remove in corner */}
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        gap: theme.space.md,
                      }}
                    >
                      <Pressable onPress={() => openEdit(idx)} style={{ flex: 1 }}>
                        <Text style={{ fontWeight: "800" }}>{it.text}</Text>
                      </Pressable>

                      <Pressable
                        onPress={() => removeItem(idx)}
                        hitSlop={10}
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 14,
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: "rgba(0,0,0,0.03)",
                          borderWidth: 1,
                          borderColor: "rgba(0,0,0,0.08)",
                        }}
                      >
                        <Text muted style={{ fontSize: 16, lineHeight: 16, opacity: 0.6 }}>
                          ×
                        </Text>
                      </Pressable>
                    </View>

                    <View style={{ marginTop: theme.space.sm }}>
                      <AreaPill
                        label={`Area: ${it.area ?? "None"}`}
                        onPress={() => openAreaPicker({ type: "item", index: idx })}
                      />
                    </View>
                  </Card>

                  {isLast && isMax ? (
                    <Text muted variant="caption" style={{ opacity: 0.55, paddingLeft: 2 }}>
                      Max {MAX_ITEMS} this week.
                    </Text>
                  ) : null}
                </View>
              );
            })}
          </View>
        )}

        {/* Add card only when not maxed */}
        {!isMax ? (
          <Card>
            <Text muted variant="caption" style={{ opacity: 0.75 }}>
              Add a focus (max {MAX_ITEMS})
            </Text>

            <View style={{ marginTop: theme.space.sm, gap: theme.space.sm }}>
              <Input
                value={draftText}
                onChangeText={setDraftText}
                placeholder="Add a focus…"
                maxLength={80}
              />

              <AreaPill
                label={`Area: ${draftArea ?? "None"}`}
                onPress={() => openAreaPicker({ type: "draft" })}
              />

              <Button title="+ Add focus" variant="secondary" disabled={!canAdd} onPress={addItem} />

              {helperText ? (
                <Text muted variant="caption" style={{ opacity: 0.6 }}>
                  {helperText}
                </Text>
              ) : null}
            </View>
          </Card>
        ) : null}

        {/* Area picker sheet */}
        <Modal
          visible={areaModalOpen}
          animationType="fade"
          transparent
          onRequestClose={() => setAreaModalOpen(false)}
        >
          <Pressable
            style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.25)" }}
            onPress={() => setAreaModalOpen(false)}
          >
            <View style={{ flex: 1, justifyContent: "flex-end", padding: theme.space.lg }}>
              <Pressable onPress={() => {}}>
                <View
                  style={{
                    backgroundColor: theme.colors.surface,
                    borderRadius: theme.radius.lg,
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                    padding: theme.space.md,
                    gap: theme.space.sm,
                  }}
                >
                  <Text style={{ fontWeight: "800" }}>Area</Text>

                  <SheetRow title="None" selected={currentSelectedArea() === null} onPress={() => applyAreaSelection(null)} />

                  {AREAS.map((a) => (
                    <SheetRow
                      key={a}
                      title={a}
                      selected={currentSelectedArea() === a}
                      onPress={() => applyAreaSelection(a)}
                    />
                  ))}

                  <Pressable
                    onPress={() => setAreaModalOpen(false)}
                    style={{ paddingVertical: 10, alignItems: "center" }}
                  >
                    <Text muted style={{ opacity: 0.75 }}>
                      Cancel
                    </Text>
                  </Pressable>
                </View>
              </Pressable>
            </View>
          </Pressable>
        </Modal>

        {/* Edit modal (tap text) */}
        <Modal
          visible={editOpen}
          animationType="fade"
          transparent
          onRequestClose={() => setEditOpen(false)}
        >
          <Pressable
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.25)",
              padding: theme.space.lg,
              justifyContent: "center",
            }}
            onPress={() => setEditOpen(false)}
          >
            <Pressable onPress={() => {}}>
              <Card>
                <Text style={{ fontWeight: "800" }}>Edit focus</Text>

                <View style={{ height: theme.space.sm }} />

                <Input
                  value={editText}
                  onChangeText={setEditText}
                  placeholder="Focus…"
                  maxLength={80}
                />

                <View style={{ height: theme.space.sm }} />

                <AreaPill
                  label={`Area: ${editArea ?? "None"}`}
                  onPress={() => openAreaPicker({ type: "edit" })}
                />

                <View style={{ height: theme.space.md }} />

                <View style={{ gap: theme.space.sm }}>
                  <Button title="Save" onPress={saveEdit} />
                  <Button title="Cancel" variant="secondary" onPress={() => setEditOpen(false)} />
                </View>
              </Card>
            </Pressable>
          </Pressable>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}