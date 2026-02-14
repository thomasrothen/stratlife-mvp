import {
  View,
  ScrollView,
  TouchableOpacity,
  Platform,
  LayoutChangeEvent,
} from "react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFocusEffect, Redirect, useLocalSearchParams } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { theme } from "@/theme/theme";
import { Text } from "@/ui/Text";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

type Win = {
  id: string;
  title: string;
  created_at: string;
  area: string | null;
  focus: string | null;
  share: boolean | null;
  details: string | null;
  note?: string | null; // legacy
};

function dayKey(iso: string) {
  return new Date(iso).toISOString().slice(0, 10);
}

function formatDayHeading(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function parseLegacyNote(note: string | null) {
  if (!note) return { area: "", focus: "", share: false, details: "" };

  const lines = note.split("\n");
  let area = "";
  let focus = "";
  let share = false;

  let i = 0;
  for (; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) break;

    if (line.toLowerCase().startsWith("area:")) area = line.slice(5).trim();
    else if (line.toLowerCase().startsWith("focus:"))
      focus = line.slice(6).trim();
    else if (line.toLowerCase().startsWith("share:"))
      share = line.toLowerCase().includes("yes");
  }

  while (i < lines.length && !lines[i].trim()) i++;
  const details = lines.slice(i).join("\n").trim();

  return { area, focus, share, details };
}

function MetaPill({ text }: { text: string }) {
  return (
    <View
      style={{
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 999,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
      }}
    >
      <Text muted variant="caption" style={{ opacity: 0.7 }}>
        {text}
      </Text>
    </View>
  );
}

function CardView({
  children,
  highlighted,
  expanded,
}: {
  children: React.ReactNode;
  highlighted?: boolean;
  expanded?: boolean;
}) {
  return (
    <View
      style={[
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radius.lg,
          borderWidth: 1,
          borderColor: theme.colors.border,
          padding: expanded ? theme.space.md : theme.space.sm, // compact collapsed cards
        },
        expanded
          ? {
              borderColor: "rgba(0,0,0,0.12)",
              backgroundColor: "rgba(0,0,0,0.02)",
            }
          : null,
        highlighted
          ? {
              borderColor: "rgba(0,0,0,0.16)",
              backgroundColor: "rgba(0,0,0,0.03)",
            }
          : null,
      ]}
    >
      {children}
    </View>
  );
}

export default function JourneyScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ highlight?: string }>();
  const highlightId =
    typeof params.highlight === "string" ? params.highlight : null;

  const { session, loading } = useAuth();

  const [wins, setWins] = useState<Win[]>([]);
  const [loadingWins, setLoadingWins] = useState(true);

  const scrollRef = useRef<ScrollView>(null);

  const cardLayout = useRef<Record<string, { y: number; h: number }>>({});
  const scrollY = useRef(0);
  const viewportH = useRef(0);

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeHighlight, setActiveHighlight] = useState<string | null>(null);

  const loadWins = useCallback(async () => {
    if (!session) return;

    setLoadingWins(true);
    const { data, error } = await supabase
      .from("wins")
      .select("id, title, created_at, area, focus, share, details, note")
      .order("created_at", { ascending: false });

    if (!error && data) setWins(data as Win[]);
    setLoadingWins(false);
  }, [session]);

  if (!loading && !session) return <Redirect href="/(auth)/welcome" />;

  useEffect(() => {
    if (session) loadWins();
  }, [session, loadWins]);

  useFocusEffect(
    useCallback(() => {
      if (session) loadWins();
    }, [session, loadWins])
  );

  const grouped = useMemo(() => {
    const map = new Map<string, { headingIso: string; items: Win[] }>();

    for (const w of wins) {
      const key = dayKey(w.created_at);
      if (!map.has(key)) map.set(key, { headingIso: w.created_at, items: [] });
      map.get(key)!.items.push(w);
    }

    return Array.from(map.entries())
      .sort((a, b) => (a[0] < b[0] ? 1 : -1))
      .map(([key, v]) => ({ key, ...v }));
  }, [wins]);

  const focusIfNeeded = useCallback(
    (id: string) => {
      const m = cardLayout.current[id];
      if (!m) return;

      const topPadding = 16;
      const bottomPadding = 16 + (insets.bottom || 0);

      const currentTop = scrollY.current;
      const currentBottom = currentTop + viewportH.current;

      const cardTop = m.y;
      const cardBottom = m.y + m.h;

      const desiredTop = Math.max(0, cardTop - topPadding);

      const isFullyVisible =
        cardTop >= currentTop + topPadding &&
        cardBottom <= currentBottom - bottomPadding;

      if (!isFullyVisible) {
        scrollRef.current?.scrollTo({ y: desiredTop, animated: true });
      }
    },
    [insets.bottom]
  );

  useEffect(() => {
    if (!highlightId) return;

    setExpandedId(highlightId);
    setActiveHighlight(highlightId);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => focusIfNeeded(highlightId));
    });

    const t = setTimeout(() => setActiveHighlight(null), 700);
    return () => clearTimeout(t);
  }, [highlightId, focusIfNeeded]);

  if (loading || loadingWins) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text muted>Loading…</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Utility spacing (still helpful), but we also add a real footer spacer
  const tabBarHeightGuess = 64;
  const bottomSpacer = insets.bottom + tabBarHeightGuess + 24;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      {/* ✅ Fixed header (always visible) */}
      <View style={{ padding: theme.space.lg, paddingBottom: theme.space.sm, gap: theme.space.xs }}>
        <Text variant="title" style={{ fontWeight: "800" }}>
          Your Journey
        </Text>
        <Text muted>This is your story — one step at a time.</Text>
      </View>

      {/* ✅ Scrollable content */}
      <ScrollView
        ref={scrollRef}
        keyboardShouldPersistTaps="always"
        contentInsetAdjustmentBehavior="never"
        contentInset={Platform.OS === "ios" ? { bottom: bottomSpacer } : undefined}
        scrollIndicatorInsets={Platform.OS === "ios" ? { bottom: bottomSpacer } : undefined}
        onScroll={(e) => {
          scrollY.current = e.nativeEvent.contentOffset.y;
        }}
        scrollEventThrottle={16}
        onLayout={(e) => {
          viewportH.current = e.nativeEvent.layout.height;
        }}
        contentContainerStyle={{
          paddingHorizontal: theme.space.lg,
          paddingBottom: bottomSpacer,
          gap: theme.space.md,
        }}
        showsVerticalScrollIndicator
      >
        {grouped.map((g) => (
          <View key={g.key} style={{ gap: theme.space.sm }}>
            <Text muted variant="caption" style={{ opacity: 0.75 }}>
              {formatDayHeading(g.headingIso)}
            </Text>

            {g.items.map((w) => {
              const legacy = parseLegacyNote(w.note ?? null);

              const area = w.area ?? legacy.area;
              const focus = w.focus ?? legacy.focus;
              const share = (w.share ?? legacy.share) === true;
              const details = w.details ?? legacy.details;

              const expanded = expandedId === w.id;
              const highlighted = activeHighlight === w.id;

              const onCardLayout = (e: LayoutChangeEvent) => {
                cardLayout.current[w.id] = {
                  y: e.nativeEvent.layout.y,
                  h: e.nativeEvent.layout.height,
                };
              };

              return (
                <View key={w.id} onLayout={onCardLayout}>
                  <TouchableOpacity
                    activeOpacity={0.92}
                    onPressIn={() => {
                      setExpandedId((cur) => {
                        const next = cur === w.id ? null : w.id;

                        if (next) {
                          requestAnimationFrame(() => {
                            requestAnimationFrame(() => focusIfNeeded(next));
                          });
                        }

                        return next;
                      });
                    }}
                  >
                    <CardView highlighted={highlighted} expanded={expanded}>
                      <Text style={{ fontWeight: "800" }}>{w.title}</Text>

                      {expanded ? (
                        <>
                          {area || focus || share ? (
                            <View
                              style={{
                                flexDirection: "row",
                                flexWrap: "wrap",
                                gap: 6,
                                marginTop: theme.space.xs, // tighter to title
                              }}
                            >
                              {area ? <MetaPill text={area} /> : null}
                              {focus ? <MetaPill text={focus} /> : null}
                              {share ? <MetaPill text="Shareable" /> : null}
                            </View>
                          ) : null}

                          {details ? (
                            <Text muted style={{ marginTop: theme.space.sm }}>
                              {details}
                            </Text>
                          ) : null}
                        </>
                      ) : null}
                    </CardView>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        ))}

        {/* ✅ Visual “end of list” spacer (prevents “cut off” feeling) */}
        <View style={{ height: 56 }} />
      </ScrollView>
    </SafeAreaView>
  );
}