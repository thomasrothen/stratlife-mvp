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

type LifeCheck = {
  id: string;
  week_start: string; // date YYYY-MM-DD
  scores: Record<string, number> | null; // jsonb
  note: string | null;
  created_at: string;
  updated_at: string;
};

type FocusWeek = {
  id: string;
  week_start: string; // date YYYY-MM-DD
};

type FocusItem = {
  focus_week_id: string;
  position: number;
  text: string;
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

function formatWeekHeading(weekStart: string) {
  const d = new Date(`${weekStart}T00:00:00`);
  return `Week of ${d.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
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
    else if (line.toLowerCase().startsWith("focus:")) focus = line.slice(6).trim();
    else if (line.toLowerCase().startsWith("share:")) share = line.toLowerCase().includes("yes");
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
  compact,
}: {
  children: React.ReactNode;
  highlighted?: boolean;
  expanded?: boolean;
  compact?: boolean;
}) {
  return (
    <View
      style={[
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radius.lg,
          borderWidth: 1,
          borderColor: theme.colors.border,
          padding: compact
            ? expanded
              ? theme.space.sm
              : theme.space.xs
            : expanded
              ? theme.space.md
              : theme.space.sm,
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

function avgScore(scores: Record<string, number> | null | undefined) {
  const values = Object.values(scores ?? {});
  if (!values.length) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function moodWordFromAvg(a: number) {
  if (a >= 4.3) return "bright";
  if (a >= 3.6) return "steady";
  if (a >= 2.8) return "mixed";
  if (a >= 2.1) return "heavy";
  return "low";
}

function OverallDots({ value }: { value: number }) {
  // value is 0..5-ish (we'll clamp)
  const v = Math.max(0, Math.min(5, Math.round(value)));
  const dots = [1, 2, 3, 4, 5];

  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginTop: 8 }}>
      <Text muted variant="caption" style={{ opacity: 0.75 }}>
        Overall
      </Text>
      <View style={{ flexDirection: "row", gap: 4 }}>
        {dots.map((d) => {
          const filled = d <= v;
          return (
            <View
              key={d}
              style={{
                width: 7,
                height: 7,
                borderRadius: 999,
                backgroundColor: filled
                  ? "rgba(47,93,144,0.75)"
                  : "rgba(47,93,144,0.15)",
                borderWidth: 1,
                borderColor: "rgba(0,0,0,0.08)",
              }}
            />
          );
        })}
      </View>
    </View>
  );
}

function LifeDotMap({ scores }: { scores: Record<string, number> | null | undefined }) {
  if (!scores) return null;

  // Same order as Life screen (and stable for future Pro area renames).
  const order = [
    { key: "spirit", label: "Spirit" },
    { key: "fit", label: "Fit" },
    { key: "experience", label: "Experience" },
    { key: "connect", label: "Connect" },
    { key: "happy", label: "Happy" },
    { key: "business", label: "Business" },
    { key: "money", label: "Money" },
    { key: "home", label: "Home" },
  ] as const;

  const dots = [1, 2, 3, 4, 5];

  return (
    <View style={{ marginTop: 10, gap: 8 }}>
      {order.map((a) => {
        const value = (scores?.[a.key] ?? 0) as number;

        return (
          <View
            key={a.key}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text muted variant="caption" style={{ opacity: 0.75 }}>
              {a.label}
            </Text>

            <View style={{ flexDirection: "row", gap: 3 }}>
              {dots.map((d) => {
                const filled = d <= value;

                return (
                  <View
                    key={d}
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 999,
                      backgroundColor: filled
                        ? "rgba(47,93,144,0.75)"
                        : "rgba(47,93,144,0.15)",
                      borderWidth: 1,
                      borderColor: "rgba(0,0,0,0.08)",
                    }}
                  />
                );
              })}
            </View>
          </View>
        );
      })}
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

  const [lifeChecks, setLifeChecks] = useState<LifeCheck[]>([]);
  const [loadingLife, setLoadingLife] = useState(true);

  // week_start -> focus texts (ordered)
  const [focusByWeekStart, setFocusByWeekStart] = useState<Record<string, string[]>>({});

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

  const loadLifeChecks = useCallback(async () => {
    if (!session) return;

    setLoadingLife(true);
    const { data, error } = await supabase
      .from("life_checks")
      .select("id, week_start, scores, note, created_at, updated_at")
      .order("week_start", { ascending: false });

    if (!error && data) setLifeChecks(data as LifeCheck[]);
    setLoadingLife(false);

    // Load weekly focus for those same week_starts (Option 1, inside expanded baseline)
    if (!error && data && session?.user?.id) {
      const weekStarts = Array.from(new Set((data as LifeCheck[]).map((lc) => lc.week_start)));
      if (weekStarts.length) {
        const { data: focusWeeks, error: fwErr } = await supabase
          .from("focus_weeks")
          .select("id, week_start")
          .eq("user_id", session.user.id)
          .in("week_start", weekStarts);

        if (!fwErr && focusWeeks?.length) {
          const fw = focusWeeks as FocusWeek[];
          const ids = fw.map((x) => x.id);

          const { data: focusItems, error: fiErr } = await supabase
            .from("focus_items")
            .select("focus_week_id, position, text")
            .in("focus_week_id", ids)
            .order("position", { ascending: true });

          if (!fiErr && focusItems) {
            const items = focusItems as FocusItem[];

            const weekStartById: Record<string, string> = {};
            fw.forEach((w) => {
              weekStartById[w.id] = w.week_start;
            });

            const map: Record<string, string[]> = {};
            items.forEach((it) => {
              const ws = weekStartById[it.focus_week_id];
              if (!ws) return;
              if (!map[ws]) map[ws] = [];
              map[ws].push(it.text);
            });

            setFocusByWeekStart(map);
          } else {
            setFocusByWeekStart({});
          }
        } else {
          setFocusByWeekStart({});
        }
      } else {
        setFocusByWeekStart({});
      }
    }
  }, [session]);

  if (!loading && !session) return <Redirect href="/(auth)/welcome" />;

  useEffect(() => {
    if (session) {
      loadWins();
      loadLifeChecks();
    }
  }, [session, loadWins, loadLifeChecks]);

  useFocusEffect(
    useCallback(() => {
      if (session) {
        loadWins();
        loadLifeChecks();
      }
    }, [session, loadWins, loadLifeChecks])
  );

  const groupedWins = useMemo(() => {
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

  if (loading || loadingWins || loadingLife) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text muted>Loading…</Text>
        </View>
      </SafeAreaView>
    );
  }

  const tabBarHeightGuess = 64;
  const bottomSpacer = insets.bottom + tabBarHeightGuess + 24;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <View style={{ padding: theme.space.lg, paddingBottom: theme.space.sm, gap: theme.space.xs }}>
        <Text variant="title" style={{ fontWeight: "800" }}>
          Your Journey
        </Text>
        <Text muted>This is your story — one step at a time.</Text>
      </View>

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
        {/* Life baselines */}
        <View style={{ gap: theme.space.sm }}>
          <Text muted variant="caption" style={{ opacity: 0.75 }}>
            Life baselines
          </Text>

          {lifeChecks.length === 0 ? (
            <CardView>
              <Text style={{ fontWeight: "800" }}>No Life Checks yet.</Text>
              <Text muted style={{ marginTop: theme.space.xs }}>
                Do a Life Check to create your first weekly baseline.
              </Text>
            </CardView>
          ) : (
            lifeChecks.map((lc) => {
              const expanded = expandedId === lc.id;
              const highlighted = activeHighlight === lc.id;

              const onCardLayout = (e: LayoutChangeEvent) => {
                cardLayout.current[lc.id] = {
                  y: e.nativeEvent.layout.y,
                  h: e.nativeEvent.layout.height,
                };
              };

              const mood = moodWordFromAvg(avgScore(lc.scores));
              const overall = avgScore(lc.scores);

              const focusItems = focusByWeekStart[lc.week_start] ?? [];

              return (
                <View key={lc.id} onLayout={onCardLayout}>
                  <TouchableOpacity
                    activeOpacity={0.92}
                    onPressIn={() => {
                      setExpandedId((cur) => {
                        const next = cur === lc.id ? null : lc.id;
                        if (next) {
                          requestAnimationFrame(() => {
                            requestAnimationFrame(() => focusIfNeeded(next));
                          });
                        }
                        return next;
                      });
                    }}
                  >
                    <CardView highlighted={highlighted} expanded={expanded} compact>
                      <Text style={{ fontWeight: "800" }}>{formatWeekHeading(lc.week_start)}</Text>

                      <Text muted style={{ marginTop: theme.space.xs, opacity: 0.75 }}>
                        This week feels {mood}.
                      </Text>

                      {/* ✅ collapsed mini-summary (always visible) */}
                      <OverallDots value={overall} />

                      {expanded ? (
                        <>
                          <LifeDotMap scores={lc.scores} />

                          {!!lc.note ? (
                            <Text muted style={{ marginTop: theme.space.sm }}>
                              Remember: “{lc.note}”
                            </Text>
                          ) : null}

                          {/* ✅ Option 1: Focus inside baseline (expanded) */}
                          <View style={{ marginTop: theme.space.md }}>
                            <Text muted variant="caption" style={{ opacity: 0.75 }}>
                              Focus this week
                            </Text>

                            {focusItems.length === 0 ? (
                              <Text muted style={{ marginTop: 6, opacity: 0.65 }}>
                                No focus set.
                              </Text>
                            ) : (
                              <View style={{ marginTop: 6, gap: 6 }}>
                                {focusItems.slice(0, 3).map((t, idx) => (
                                  <Text key={`${lc.id}-f-${idx}`} style={{ opacity: 0.85 }}>
                                    • {t}
                                  </Text>
                                ))}
                              </View>
                            )}
                          </View>
                        </>
                      ) : null}
                    </CardView>
                  </TouchableOpacity>
                </View>
              );
            })
          )}
        </View>

        {/* Wins history (existing) */}
        {groupedWins.map((g) => (
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
                                marginTop: theme.space.xs,
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

        <View style={{ height: 56 }} />
      </ScrollView>
    </SafeAreaView>
  );
}