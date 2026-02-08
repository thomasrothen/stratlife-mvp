import { View } from "react-native";
import { theme } from "@/theme/theme";

export function WeeklyRhythm({
  days,
}: {
  days: { hasWin: boolean; isToday: boolean }[];
}) {
  return (
    <View style={{ flexDirection: "row", gap: 8, marginTop: theme.space.md }}>
      {days.map((d, i) => (
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
  );
}