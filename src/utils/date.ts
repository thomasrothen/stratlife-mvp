export function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function startOfWeek(d: Date) {
  const date = startOfDay(d);
  const day = date.getDay(); // 0 = Sunday
  const diff = (day === 0 ? -6 : 1) - day; // Monday start
  date.setDate(date.getDate() + diff);
  return date;
}

export function formatRelativeDay(iso: string) {
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