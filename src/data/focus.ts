// src/data/focus.ts

import { supabase } from "@/lib/supabase"; // keep YOUR existing supabase client location
import type { WeeklyFocus, FocusWeekRow } from "@/types/focus";
import { getWeekStartISO, getPreviousWeekStartISO } from "@/lib/week";

export type WeeklyFocusItemInput = {
  position: 1 | 2 | 3;
  text: string;
  area?: string | null;
};

async function requireUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  const userId = data.user?.id;
  if (!userId) throw new Error("Not authenticated");
  return userId;
}

/**
 * Get-or-create the focus week row for current week.
 */
export async function getOrCreateCurrentWeek(): Promise<
  Pick<FocusWeekRow, "id" | "week_start_date" | "version">
> {
  const userId = await requireUserId();
  const weekStart = getWeekStartISO();

  const { data, error } = await supabase
    .from("focus_weeks")
    .upsert(
      {
        user_id: userId,
        week_start_date: weekStart,
        source: "manual",
      },
      { onConflict: "user_id,week_start_date" }
    )
    .select("id, week_start_date, version")
    .single();

  if (error) throw error;
  return data;
}

/**
 * Fetch current week with items (creates week if missing).
 */
export async function getCurrentWeeklyFocus(): Promise<WeeklyFocus> {
  const week = await getOrCreateCurrentWeek();

  const { data, error } = await supabase
    .from("focus_items")
    .select("id, position, text, area, deleted_at")
    .eq("focus_week_id", week.id)
    .is("deleted_at", null)
    .order("position", { ascending: true });

  if (error) throw error;

  return {
    week,
    items:
      (data ?? []).map((i) => ({
        id: i.id as string,
        position: i.position as 1 | 2 | 3,
        text: i.text as string,
        area: (i.area ?? null) as string | null,
      })) ?? [],
  };
}

/**
 * Upsert 1–3 focus items and bump week version (RPC).
 */
export async function upsertWeeklyFocusItems(
  focusWeekId: string,
  items: WeeklyFocusItemInput[]
): Promise<void> {
  if (items.length < 1 || items.length > 3) {
    throw new Error("Focus must have 1–3 items.");
  }

  const normalized = items.map((it) => ({
    focus_week_id: focusWeekId,
    position: it.position,
    text: it.text.trim(),
    area: it.area ?? null,
    deleted_at: null,
  }));

  // 1) Upsert provided positions
  const { error: upsertErr } = await supabase
    .from("focus_items")
    .upsert(normalized, { onConflict: "focus_week_id,position" });

  if (upsertErr) throw upsertErr;

  // 2) Soft-delete positions not included
  const keepPositions = normalized.map((i) => i.position);
  const { error: delErr } = await supabase
    .from("focus_items")
    .update({ deleted_at: new Date().toISOString() })
    .eq("focus_week_id", focusWeekId)
    .not("position", "in", `(${keepPositions.join(",")})`)
    .is("deleted_at", null);

  if (delErr) throw delErr;

  // 3) Version bump (future-proof hook)
  // Requires DB function: bump_focus_week_version(p_week_id uuid)
  const { error: rpcErr } = await supabase.rpc("bump_focus_week_version", {
    p_week_id: focusWeekId,
  });

  if (rpcErr) throw rpcErr;
}

/**
 * Fetch last week's focus (does NOT create it).
 */
export async function getLastWeekFocus(): Promise<WeeklyFocus | null> {
  const userId = await requireUserId();

  const currentWeekStart = getWeekStartISO();
  const lastWeekStart = getPreviousWeekStartISO(currentWeekStart);

  const { data: week, error: weekErr } = await supabase
    .from("focus_weeks")
    .select("id, week_start_date, version")
    .eq("user_id", userId)
    .eq("week_start_date", lastWeekStart)
    .maybeSingle();

  if (weekErr) throw weekErr;
  if (!week) return null;

  const { data: items, error: itemErr } = await supabase
    .from("focus_items")
    .select("id, position, text, area, deleted_at")
    .eq("focus_week_id", week.id)
    .is("deleted_at", null)
    .order("position", { ascending: true });

  if (itemErr) throw itemErr;

  return {
    week: {
      id: week.id,
      week_start_date: week.week_start_date,
      version: week.version,
    },
    items: (items ?? []).map((i) => ({
      id: i.id as string,
      position: i.position as 1 | 2 | 3,
      text: i.text as string,
      area: (i.area ?? null) as string | null,
    })),
  };
}