import React from "react";
import {
  Pressable,
  PressableProps,
  StyleProp,
  ViewStyle,
  PressableStateCallbackType,
} from "react-native";
import { theme } from "@/theme/theme";
import { Text } from "@/ui/Text";

type ButtonProps = PressableProps & {
  title: string;
  variant?: "primary" | "secondary";
};

export function Button({
  title,
  variant = "primary",
  disabled,
  style,
  ...props
}: ButtonProps) {
  const backgroundColor = disabled
    ? theme.colors.disabled
    : variant === "primary"
    ? theme.colors.primary
    : theme.colors.surface;

  const borderWidth = variant === "secondary" ? 1 : 0;
  const borderColor =
    variant === "secondary" ? theme.colors.border : "transparent";

  const pressableStyle = ({
    pressed,
  }: PressableStateCallbackType): StyleProp<ViewStyle> => [
    {
      minHeight: 48,
      paddingHorizontal: theme.space.lg,
      paddingVertical: theme.space.md,
      borderRadius: theme.radius.md,
      backgroundColor,
      alignItems: "center",
      justifyContent: "center",
      borderWidth,
      borderColor,
      opacity: pressed && !disabled ? 0.9 : 1,
    },
    style as StyleProp<ViewStyle>,
  ];

  const textColor = variant === "primary" ? "#FFFFFF" : theme.colors.text;

  return (
    <Pressable
      {...props}
      disabled={disabled}
      style={pressableStyle}
      hitSlop={8}
      accessibilityRole="button"
    >
      <Text style={{ color: textColor, fontWeight: "600" }}>{title}</Text>
    </Pressable>
  );
}