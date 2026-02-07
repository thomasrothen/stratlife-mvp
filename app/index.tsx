import { View, ScrollView } from "react-native";
import { useRouter, Redirect, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
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

  // Redirect if not logged in
  if (!loading && !session) {
    return <Redirect href="/login" />;
  }

  // Load once after session is available
  useEffect(() => {
    if (session) loadWins();
  }, [session, loadWins]);

  // Reload when this screen gains focus (coming back from Create Win)
  useFocusEffect(
    useCallback(() => {
      if (session) loadWins();
    }, [session, loadWins])
  );

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
      <Text variant="title" style={{ fontWeight: "700" }}>
        Stratlife
      </Text>

      <Card>
        <Text style={{ fontWeight: "600" }}>Your wins</Text>
        <Text muted style={{ marginTop: theme.space.sm }}>
          Track what works. Grow what matters.
        </Text>
      </Card>

      <Button title="+ Create Win" onPress={() => router.push("/create-win")} />

      <ScrollView
        contentContainerStyle={{ gap: theme.space.sm, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {wins.length === 0 ? (
          <Card>
            <Text muted>No wins yet. Create your first one 👇</Text>
          </Card>
        ) : (
          wins.map((win) => (
            <Card key={win.id}>
              <Text style={{ fontWeight: "600" }}>{win.title}</Text>
              {win.note ? (
                <Text muted style={{ marginTop: theme.space.xs }}>
                  {win.note}
                </Text>
              ) : null}
            </Card>
          ))
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