import {
  View,
  ScrollView,
  TouchableOpacity,
  Platform,
  LayoutChangeEvent,
} from "react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  useFocusEffect,
  Redirect,
  useLocalSearchParams,
} from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { theme } from "@/theme/theme";
import { Text } from "@/ui/Text";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

type Win = {
  id: string;
  title: string;
  created_at: string;

  // New best-practice columns
  area: string | null;
  focus: string | null;
  share: boolean | null;
  details: string | null;

  // Legacy (optional)
  note?: string | null;
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

// Legacy fallback: only used if the row has no new columns yet
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
    else if (line.toLowerCase().startsWith("focus:")) focus = line.slice(6).trim();
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
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: theme.colors.border,
      }}
    >
      <Text muted style={{ fontSize: 12, opacity: 0.8 }}>
        {text}
      </Text>
    </View>
  );
}

function CardView({
  children,
  highlighted,
}: {
  children: React.ReactNode;
  highlighted?: boolean;
}) {
  return (
    <View
      style={[
        {
          backgroundColor: theme.colors.surface,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: theme.colors.border,
          padding: theme.space.md,
        },
        highlighted
          ? {
              borderColor: "rgba(0,0,0,0.14)",
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
  const highlightId = typeof params.highlight === "string" ? params.highlight : null;

  const { session, loading } = useAuth();

  const [wins, setWins] = useState<Win[]>([]);
  const [loadingWins, setLoadingWins] = useState(true);

  const scrollRef = useRef<ScrollView>(null);

  // Store layout metrics for each card so we can scroll precisely
  const cardLayout = useRef<Record<string, { y: number; h: number }>>({});

  // Track scroll viewport
  const scrollY = useRef(0);
  const viewportH = useRef(0);

  // Expand / collapse
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Soft highlight when arriving from Today
  const [activeHighlight, setActiveHighlight] = useState<string | null>(highlightId);

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

  if (!loading && !session) return <Redirect href="/welcome" />;

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

  // Best-practice: focus active card only if it’s outside the viewport
  const focusIfNeeded = useCallback(
    (id: string) => {
      const m = cardLayout.current[id];
      if (!m) return;

      const topPadding = 24;
      const bottomPadding = 24 + (insets.bottom || 0);

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

  // Deep-link from Today: scroll + expand
  useEffect(() => {
    if (!activeHighlight) return;

    setExpandedId(activeHighlight);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => focusIfNeeded(activeHighlight));
    });

    const t = setTimeout(() => setActiveHighlight(null), 700);
    return () => clearTimeout(t);
  }, [activeHighlight, focusIfNeeded]);

  if (loading || loadingWins) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.bg,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text muted>Loading…</Text>
      </View>
    );
  }

  const bottomInset = insets.bottom + 24;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <ScrollView
        ref={scrollRef}
        keyboardShouldPersistTaps="always"
        contentInsetAdjustmentBehavior="automatic"
        contentInset={Platform.OS === "ios" ? { bottom: bottomInset } : undefined}
        scrollIndicatorInsets={Platform.OS === "ios" ? { bottom: bottomInset } : undefined}
        onScroll={(e) => {
          scrollY.current = e.nativeEvent.contentOffset.y;
        }}
        scrollEventThrottle={16}
        onLayout={(e) => {
          viewportH.current = e.nativeEvent.layout.height;
        }}
        contentContainerStyle={{
          padding: theme.space.lg,
          paddingBottom: Platform.OS === "android" ? bottomInset : theme.space.lg,
          gap: theme.space.md,
        }}
        showsVerticalScrollIndicator
      >
        <View style={{ gap: theme.space.xs }}>
          <Text muted>This is your story — one step at a time.</Text>
          <Text muted style={{ fontSize: 12, opacity: 0.6 }}>
            Tap a moment to see details.
          </Text>
        </View>

        {grouped.map((g) => (
          <View key={g.key} style={{ gap: theme.space.sm }}>
            <Text muted style={{ fontSize: 13, opacity: 0.75 }}>
              {formatDayHeading(g.headingIso)}
            </Text>

            {g.items.map((w) => {
              // New fields first; fallback to legacy note if needed
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
                    <CardView highlighted={highlighted}>
                      <Text style={{ fontWeight: "700" }}>{w.title}</Text>

                      {expanded ? (
                        <>
                          {(area || focus || share) ? (
                            <View
                              style={{
                                flexDirection: "row",
                                flexWrap: "wrap",
                                gap: 8,
                                marginTop: theme.space.sm,
                              }}
                            >
                              {area ? <MetaPill text={area} /> : null}
                              {focus ? <MetaPill text={focus} /> : null}
                              {share ? <MetaPill text="Might help others" /> : null}
                            </View>
                          ) : null}

                          {details ? (
                            <Text muted style={{ marginTop: theme.space.sm }}>
                              {details}
                            </Text>
                          ) : null}

                          {/* Future: media slot */}
                          {/* <MediaGrid ... /> */}
                        </>
                      ) : null}
                    </CardView>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}