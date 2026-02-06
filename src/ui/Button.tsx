import { Pressable, PressableProps } from "react-native";
import { theme } from "@/theme/theme";
import { Text } from "@/ui/Text";

type ButtonProps = PressableProps & {
  title: string;
  variant?: "primary" | "secondary";
};

export function Button({ title, variant = "primary", disabled, style, ...props }: ButtonProps) {
  const bg =
    disabled
      ? theme.colors.disabled
      : variant === "primary"
      ? theme.colors.primary
      : theme.colors.surface;

  const textMuted = variant !== "primary";

  return (
    <Pressable
      disabled={disabled}
      style={[
        {
          padding: 14,
          borderRadius: theme.radius.md,
          backgroundColor: bg,
          alignItems: "center",
          borderWidth: variant === "secondary" ? 1 : 0,
          borderColor: variant === "secondary" ? theme.colors.border : "transparent",
        },
        style,
      ]}
      {...props}
    >
      <Text style={{ color: variant === "primary" ? "#fff" : theme.colors.text, fontWeight: "600" }}>
        {title}
      </Text>
    </Pressable>
  );
}