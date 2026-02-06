import { Text as RNText, TextProps } from "react-native";
import { theme } from "@/theme/theme";

type Props = TextProps & {
  variant?: "title" | "body" | "caption";
  muted?: boolean;
};

export function Text({ variant = "body", muted, style, ...props }: Props) {
  const fontSize =
    variant === "title"
      ? theme.font.title
      : variant === "caption"
      ? theme.font.caption
      : theme.font.body;

  return (
    <RNText
      style={[
        { fontSize, color: muted ? theme.colors.mutedText : theme.colors.text },
        style,
      ]}
      {...props}
    />
  );
}