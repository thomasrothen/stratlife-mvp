import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export type Moment = {
  id: string;
  title: string;
  note: string | null;
  created_at: string;
};

export function useMoments(userId?: string) {
  const [moments, setMoments] = useState<Moment[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    const { data, error } = await supabase
      .from("wins")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) setMoments(data as Moment[]);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    if (userId) reload();
  }, [userId, reload]);

  return { moments, loading, reload };
}