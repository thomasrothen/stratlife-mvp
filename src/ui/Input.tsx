import { TextInput, TextInputProps } from "react-native";
import { theme } from "@/theme/theme";

export function Input({ style, ...props }: TextInputProps) {
  return (
    <TextInput
      placeholderTextColor={theme.colors.mutedText}
      style={[
        {
          padding: 12,
          borderRadius: theme.radius.md,
          backgroundColor: theme.colors.surface,
          borderWidth: 1,
          borderColor: theme.colors.border,
          color: theme.colors.text,
        },
        style,
      ]}
      {...props}
    />
  );
}