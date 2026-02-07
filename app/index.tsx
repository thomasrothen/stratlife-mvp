import { View, ScrollView } from "react-native";
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

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function isToday(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  return startOfDay(d).getTime() === startOfDay(now).getTime();
}

function formatWinDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();

  const dayDiff = Math.floor(
    (startOfDay(now).getTime() - startOfDay(d).getTime()) / (1000 * 60 * 60 * 24)
  );

  if (dayDiff === 0) return "Today";
  if (dayDiff === 1) return "Yesterday";
  if (dayDiff > 1 && dayDiff < 7) return `${dayDiff} days ago`;

  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function FeedScreen() {
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

    if (!error && data) {
      setWins(data as Win[]);
    }

    setLoadingWins(false);
  }, [session]);

  if (!loading && !session) {
    return <Redirect href="/login" />;
  }

  useEffect(() => {
    if (session) loadWins();
  }, [session, loadWins]);

  useFocusEffect(
    useCallback(() => {
      if (session) loadWins();
    }, [session, loadWins])
  );

  const stats = useMemo(() => {
    const total = wins.length;
    const today = wins.reduce((acc, w) => acc + (isToday(w.created_at) ? 1 : 0), 0);
    return { total, today };
  }, [wins]);

  const winCards = useMemo(() => {
    return wins.map((win) => (
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
          <Text muted style={{ marginTop: theme.space.xs }}>
            {win.note}
          </Text>
        ) : null}
      </Card>
    ));
  }, [wins]);

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
        gap: theme.space.md,
        backgroundColor: theme.colors.bg,
      }}
    >
      {/* Anchor card now provides value (later: progress bar / promo video) */}
      <Card>
        <Text style={{ fontWeight: "600" }}>Your wins</Text>
        <Text muted style={{ marginTop: theme.space.sm }}>
          Track what works. Grow what matters.
        </Text>

        <View style={{ marginTop: theme.space.md, gap: theme.space.xs }}>
          <Text muted style={{ fontSize: 13, opacity: 0.8 }}>
            Wins today: {stats.today}
          </Text>
          <Text muted style={{ fontSize: 13, opacity: 0.8 }}>
            Total wins: {stats.total}
          </Text>
        </View>
      </Card>

      {/* Single primary action */}
      <Button title="+ Create Win" onPress={() => router.push("/create-win")} />

      <ScrollView
        contentContainerStyle={{ gap: theme.space.sm, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {wins.length === 0 ? (
          <Text muted style={{ marginTop: theme.space.sm }}>
            No wins yet. Start with something small.
          </Text>
        ) : (
          winCards
        )}
      </ScrollView>

      <Button
        title="Log out"
        variant="secondary"
        onPress={() => supabase.auth.signOut()}
      />
    </View>
  );
}