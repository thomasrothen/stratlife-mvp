import React from "react";
import { TextInput, TextInputProps } from "react-native";
import { theme } from "@/theme/theme";

export function Input({ style, ...props }: TextInputProps) {
  return (
    <TextInput
      placeholderTextColor={theme.colors.mutedText}
      selectionColor={theme.colors.primary}
      style={[
        {
          minHeight: 48,
          paddingHorizontal: theme.space.md,
          paddingVertical: theme.space.md,
          borderRadius: theme.radius.md,
          backgroundColor: theme.colors.surface,
          borderWidth: 1,
          borderColor: theme.colors.border,
          color: theme.colors.text,
          fontSize: theme.font.body,
          lineHeight: Math.round(theme.font.body * 1.35),
        },
        style,
      ]}
      {...props}
    />
  );
}