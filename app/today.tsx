import { View, ScrollView, Pressable } from "react-native";
import { useRouter, Redirect, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { theme } from "@/theme/theme";
import { Text } from "@/ui/Text";
import { Card } from "@/ui/Card";
import { Button } from "@/ui/Button";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

type Win = {
  id: string;
  title: string;
  note: string | null;
  created_at: string;
};

/* ---------- date helpers ---------- */

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

/* ---------- main ---------- */

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
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) setWins(data as Win[]);
    setLoadingWins(false);
  }, [session]);

  // Not signed in → Welcome (Screen 1)
  if (!loading && !session) return <Redirect href="/welcome" />;

  useEffect(() => {
    if (session) loadWins();
  }, [session, loadWins]);

  useFocusEffect(
    useCallback(() => {
      if (session) loadWins();
    }, [session, loadWins])
  );

  /* ---------- weekly rhythm ---------- */

  const weekData = useMemo(() => {
    const start = startOfWeek(new Date());
    const today = startOfDay(new Date()).getTime();

    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(start);
      day.setDate(start.getDate() + i);

      const dayStart = startOfDay(day).getTime();

      const hasWin = wins.some((w) => {
        return startOfDay(new Date(w.created_at)).getTime() === dayStart;
      });

      return { hasWin, isToday: dayStart === today };
    });
  }, [wins]);

  /* ---------- home (orientation only) ---------- */

  // Today = glimpse, not archive
  const visibleWins = useMemo(() => wins.slice(0, 3), [wins]);
  const hasMore = wins.length > visibleWins.length;

  const winCards = useMemo(() => {
    return visibleWins.map((win) => (
      <Card key={win.id}>
        <Text style={{ fontWeight: "600" }}>{win.title}</Text>

        <Text
          muted
          style={{
            marginTop: theme.space.xs,
            fontSize: 13,
            opacity: 0.75,
          }}
        >
          {formatWinDate(win.created_at)}
        </Text>

        {win.note ? (
          <Text
            muted
            numberOfLines={2}
            ellipsizeMode="tail"
            style={{ marginTop: theme.space.xs }}
          >
            {win.note}
          </Text>
        ) : null}

        <View
          style={{
            marginTop: theme.space.xs,
            height: 14,
            justifyContent: "center",
          }}
        />
      </Card>
    ));
  }, [visibleWins]);

  if (loading || loadingWins) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.colors.bg,
        }}
      >
        <Text muted>Loading…</Text>
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        padding: theme.space.lg,
        backgroundColor: theme.colors.bg,
      }}
    >
      {/* Header / Orientation */}
      <View style={{ gap: theme.space.md }}>
        <View>
          <Text variant="title" style={{ fontWeight: "700" }}>
            Your Life — Today
          </Text>
          <Text muted style={{ marginTop: theme.space.xs }}>
            Small steps count. Impact grows over time.
          </Text>
        </View>

        <Card>
          <Text style={{ fontWeight: "600" }}>Weekly rhythm</Text>
          <Text muted style={{ marginTop: theme.space.xs }}>
            Just a glimpse — no pressure.
          </Text>

          {/* Weekly dots + ring for today */}
          <View
            style={{
              flexDirection: "row",
              gap: 8,
              marginTop: theme.space.md,
            }}
          >
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
                    backgroundColor: d.hasWin
                      ? theme.colors.primary
                      : theme.colors.border,
                    opacity: d.hasWin ? 1 : 0.3,
                  }}
                />
              </View>
            ))}
          </View>
        </Card>

        <Button title="+ Add moment" onPress={() => router.push("/capture")} />
      </View>

      {/* Glimpse list */}
      <View style={{ flex: 1, marginTop: theme.space.md }}>
        <ScrollView
          contentContainerStyle={{
            gap: theme.space.sm,
            paddingBottom: theme.space.xl,
          }}
          showsVerticalScrollIndicator={true}
        >
          {wins.length === 0 ? (
            <Text muted>No moments yet. Start with something small.</Text>
          ) : (
            <>
              <Text muted style={{ fontSize: 13, opacity: 0.75 }}>
                Recent moments
              </Text>

              {winCards}

              {hasMore ? (
                <Pressable
                  onPress={() => {
                    // When Journey exists: router.push("/journey")
                  }}
                >
                  <Text
                    muted
                    style={{
                      marginTop: theme.space.xs,
                      fontSize: 13,
                      opacity: 0.75,
                    }}
                  >
                    See your journey →
                  </Text>
                </Pressable>
              ) : null}
            </>
          )}
        </ScrollView>
      </View>

      {/* Keep logout here for now (move to Settings later) */}
      <View style={{ marginTop: theme.space.sm }}>
        <Button
          title="Log out"
          variant="secondary"
          onPress={() => supabase.auth.signOut()}
        />
      </View>
    </View>
  );
}