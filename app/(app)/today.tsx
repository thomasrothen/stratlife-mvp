import { View, ScrollView, Pressable } from "react-native";
import { useRouter, Redirect, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "@/theme/theme";
import { Text } from "@/ui/Text";
import { Card } from "@/ui/Card";
import { Button } from "@/ui/Button";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

type Win = {
  id: string;
  title: string;
  created_at: string;
};

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function startOfWeek(d: Date) {
  const date = startOfDay(d);
  const day = date.getDay(); // 0 = Sunday
  const diff = (day === 0 ? -6 : 1) - day; // Monday start
  date.setDate(date.getDate() + diff);
  return date;
}

function formatWinDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();

  const dayDiff = Math.floor(
    (startOfDay(now).getTime() - startOfDay(d).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  if (dayDiff === 0) return "Today";
  if (dayDiff === 1) return "Yesterday";
  if (dayDiff > 1 && dayDiff < 7) return `${dayDiff} days ago`;

  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function TodayScreen() {
  const router = useRouter();
  const { session, loading } = useAuth();

  const [wins, setWins] = useState<Win[]>([]);
  const [loadingWins, setLoadingWins] = useState(true);

  const loadWins = useCallback(async () => {
    if (!session) return;

    setLoadingWins(true);

    const { data, error } = await supabase
      .from("wins")
      .select("id, title, created_at")
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

  const weekData = useMemo(() => {
    const start = startOfWeek(new Date());
    const today = startOfDay(new Date()).getTime();

    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(start);
      day.setDate(start.getDate() + i);

      const dayStart = startOfDay(day).getTime();

      const hasWin = wins.some(
        (w) => startOfDay(new Date(w.created_at)).getTime() === dayStart
      );

      return { hasWin, isToday: dayStart === today };
    });
  }, [wins]);

  const visibleWins = useMemo(() => wins.slice(0, 3), [wins]);
  const hasMore = wins.length > visibleWins.length;

  if (loading || loadingWins) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text muted>Loading…</Text>
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
            Your Life — Today
          </Text>
          <Text muted>Small steps count. Impact grows over time.</Text>
        </View>

        {/* Weekly rhythm */}
        <Card>
          <Text style={{ fontWeight: "700" }}>Weekly rhythm</Text>
          <Text muted style={{ marginTop: theme.space.xs }}>
            Just a glimpse — no pressure.
          </Text>

          <View style={{ flexDirection: "row", gap: 8, marginTop: theme.space.md }}>
            {weekData.map((d, i) => (
              <View
                key={i}
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 7,
                  borderWidth: d.isToday ? 1.5 : 0,
                  borderColor: d.isToday ? theme.colors.primary : "transparent",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: d.hasWin ? theme.colors.primary : theme.colors.border,
                    opacity: d.hasWin ? 1 : 0.3,
                  }}
                />
              </View>
            ))}
          </View>
        </Card>

        {/* Primary action */}
        <Button title="+ Add moment" onPress={() => router.push("/capture")} />

        {/* Glimpse list */}
        <View style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={{
              gap: theme.space.sm,
              paddingBottom: theme.space.xl,
            }}
            showsVerticalScrollIndicator
          >
            {wins.length === 0 ? (
              <Card>
                <Text style={{ fontWeight: "700" }}>No moments yet.</Text>
                <Text muted style={{ marginTop: theme.space.xs }}>
                  Start with something small — one honest sentence.
                </Text>
                <View style={{ marginTop: theme.space.md }}>
                  <Button title="Capture a moment" onPress={() => router.push("/capture")} />
                </View>
              </Card>
            ) : (
              <>
                <Text muted variant="caption" style={{ opacity: 0.75 }}>
                  Recent moments
                </Text>

                {visibleWins.map((win) => (
                  <Pressable
                    key={win.id}
                    onPress={() => router.push(`/journey?highlight=${win.id}`)}
                  >
                    <Card>
                      <Text style={{ fontWeight: "700" }}>{win.title}</Text>
                      <Text muted variant="caption" style={{ marginTop: theme.space.xs, opacity: 0.75 }}>
                        {formatWinDate(win.created_at)}
                      </Text>
                    </Card>
                  </Pressable>
                ))}

                {hasMore ? (
                  <Card>
                    <Text style={{ fontWeight: "700" }}>Want the full story?</Text>
                    <Text muted style={{ marginTop: theme.space.xs }}>
                      Your Journey holds everything you’ve captured.
                    </Text>
                    <View style={{ marginTop: theme.space.md }}>
                      <Button
                        title="See your journey"
                        variant="secondary"
                        onPress={() => router.push("/journey")}
                      />
                    </View>
                  </Card>
                ) : null}
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}