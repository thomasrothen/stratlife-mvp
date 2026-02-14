// src/types/focus.ts

export type ISODate = `${number}-${number}-${number}`; // "YYYY-MM-DD"

// DB rows
export type FocusWeekRow = {
  id: string; // uuid
  user_id: string; // uuid
  week_start_date: ISODate;

  intent: string | null;
  is_locked: boolean;
  version: number;
  source: string | null;
  meta: Record<string, unknown>;

  created_at: string; // timestamptz
  updated_at: string; // timestamptz
};

export type FocusItemRow = {
  id: string; // uuid
  focus_week_id: string; // uuid

  position: 1 | 2 | 3;
  text: string;
  area: string | null;
  tags: unknown[]; // jsonb array
  linked_note_id: string | null;
  linked_reflection_id: string | null;

  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

// UI model returned to screens
export type WeeklyFocus = {
  week: Pick<FocusWeekRow, "id" | "week_start_date" | "version">;
  items: Array<Pick<FocusItemRow, "id" | "position" | "text" | "area">>;
};