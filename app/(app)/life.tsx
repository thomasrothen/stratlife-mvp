import React, { useCallback, useMemo, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";

import { getWeekStartISO } from "@/lib/week";
import { supabase } from "@/lib/supabase";
import { Card } from "@/ui/Card";
import { theme } from "@/theme/theme";

type LifeScores = Record<string, number>;

type LifeCheckRow = {
  id: string;
  week_start: string;
  scores: LifeScores;
  note: string | null;
  created_at: string;
  updated_at: string;
};

function formatISOToReadable(iso: string) {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function avgScore(scores: LifeScores) {
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

/**
 * New horizontal spectrum dots:
 * Spirit    ● ● ● ● ○
 */
function DotRow({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  const dots = [1, 2, 3, 4, 5];

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Text style={{ color: theme.colors.text, opacity: 0.8 }}>
        {label}
      </Text>

      <View style={{ flexDirection: "row", gap: 6 }}>
        {dots.map((d) => {
          const filled = d <= value;
          return (
            <View
              key={d}
              style={{
                width: 10,
                height: 10,
                borderRadius: 999,
                backgroundColor: filled
                  ? "rgba(47,93,144,0.8)"
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

export default function LifeScreen() {
  const router = useRouter();

  const weekStartISO = useMemo(() => getWeekStartISO(), []);
  const weekLabel = useMemo(() => formatISOToReadable(weekStartISO), [weekStartISO]);

  const [loading, setLoading] = useState(true);
  const [row, setRow] = useState<LifeCheckRow | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data: userRes } = await supabase.auth.getUser();
      const user = userRes?.user;
      if (!user) {
        setRow(null);
        return;
      }

      const { data } = await supabase
        .from("life_checks")
        .select("id, week_start, scores, note, created_at, updated_at")
        .eq("user_id", user.id)
        .eq("week_start", weekStartISO)
        .maybeSingle();

      setRow((data as any) ?? null);
    } finally {
      setLoading(false);
    }
  }, [weekStartISO]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const hasCheckIn = !!row;
  const summary = hasCheckIn ? moodWordFromAvg(avgScore(row!.scores)) : null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }} edges={["top"]}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: theme.space.md,
          paddingTop: theme.space.sm,
          paddingBottom: 96,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={{ fontSize: 28, fontWeight: "800", color: theme.colors.text }}>
          Life
        </Text>

        <Text style={{ marginTop: 6, opacity: 0.6, color: theme.colors.text }}>
          Week of {weekLabel}
        </Text>

        <Text
          style={{
            marginTop: theme.space.md,
            fontSize: 16,
            opacity: 0.82,
            color: theme.colors.text,
          }}
        >
          How does your life feel right now?
        </Text>

        <View style={{ height: theme.space.md }} />

        {/* Primary CTA */}
        <Card
          onPress={() => router.push("/(modals)/life-check")}
          style={{
            paddingVertical: 14,
            alignItems: "center",
            borderColor: "rgba(47,93,144,0.18)",
            backgroundColor: "rgba(47,93,144,0.06)",
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "800", color: theme.colors.text }}>
            {hasCheckIn ? "Retake Life Check" : "Do Life Check"}
          </Text>
          <Text style={{ marginTop: 4, fontSize: 13, opacity: 0.65, color: theme.colors.text }}>
            {hasCheckIn
              ? "Update this week’s check-in"
              : "Gentle self-assessment (60 seconds)"}
          </Text>
        </Card>

        <View style={{ height: theme.space.lg }} />

        {/* Snapshot */}
        <Card
          style={{
            borderColor: "rgba(0,0,0,0.06)", // softer border
            backgroundColor: "rgba(0,0,0,0.02)", // softer background
          }}
        >
          <Text style={{ fontSize: 14, fontWeight: "900", color: theme.colors.text }}>
            Life this week
          </Text>

          {loading ? (
            <View style={{ marginTop: 12 }}>
              <ActivityIndicator />
            </View>
          ) : !row ? (
            <Text style={{ marginTop: 8, fontSize: 13, opacity: 0.6, color: theme.colors.text }}>
              No check-in yet. Do a Life Check to capture your week.
            </Text>
          ) : (
            <>
              {/* Removed bold emphasis */}
              <Text
                style={{
                  marginTop: 8,
                  fontSize: 13,
                  opacity: 0.75,
                  color: theme.colors.text,
                }}
              >
                This week feels {summary}.
              </Text>

              <View style={{ marginTop: theme.space.md, gap: 10 }}>
                <DotRow label="Spirit" value={row.scores?.spirit ?? 0} />
                <DotRow label="Fit" value={row.scores?.fit ?? 0} />
                <DotRow label="Experience" value={row.scores?.experience ?? 0} />
                <DotRow label="Connect" value={row.scores?.connect ?? 0} />
                <DotRow label="Happy" value={row.scores?.happy ?? 0} />
                <DotRow label="Business" value={row.scores?.business ?? 0} />
                <DotRow label="Money" value={row.scores?.money ?? 0} />
                <DotRow label="Home" value={row.scores?.home ?? 0} />
              </View>

              {!!row.note && (
                <Text
                  style={{
                    marginTop: theme.space.sm,
                    fontSize: 13,
                    opacity: 0.65,
                    color: theme.colors.text,
                  }}
                >
                  Remember: “{row.note}”
                </Text>
              )}
            </>
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}