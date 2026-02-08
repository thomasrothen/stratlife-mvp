import React from "react";
import { View, Pressable, StyleProp, ViewStyle } from "react-native";
import { theme } from "@/theme/theme";

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  disabled?: boolean;
};

export function Card({ children, style, onPress, disabled }: Props) {
  const baseStyle: StyleProp<ViewStyle> = [
    {
      backgroundColor: theme.colors.surface, // ✅ was theme.colors.card
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: theme.space.md,
    },
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={baseStyle}
        android_ripple={{ color: "rgba(0,0,0,0.06)" }}
        hitSlop={8}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={baseStyle}>{children}</View>;
}