import { View, ViewProps } from "react-native";
import { theme } from "@/theme/theme";

export function Card({ style, ...props }: ViewProps) {
  return (
    <View
      style={[
        {
          padding: theme.space.lg,
          borderRadius: theme.radius.md,
          backgroundColor: theme.colors.surface,
          borderWidth: 1,
          borderColor: theme.colors.border,
        },
        style,
      ]}
      {...props}
    />
  );
}