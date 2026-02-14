import React from "react";
import {
  Text as RNText,
  TextProps as RNTextProps,
  StyleProp,
  TextStyle,
} from "react-native";
import { theme } from "@/theme/theme";

type TextVariant = "title" | "heading" | "body" | "caption";

export type AppTextProps = RNTextProps & {
  variant?: TextVariant;
  muted?: boolean;
  style?: StyleProp<TextStyle>;
};

const stylesByVariant: Record<TextVariant, TextStyle> = {
  title: {
    fontSize: theme.font.title, // 22
    lineHeight: Math.round(theme.font.title * 1.25),
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  heading: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "700",
    letterSpacing: -0.1,
  },
  body: {
    fontSize: theme.font.body, // 16
    lineHeight: Math.round(theme.font.body * 1.35),
    fontWeight: "400",
  },
  caption: {
    fontSize: theme.font.caption, // 13
    lineHeight: Math.round(theme.font.caption * 1.35),
    fontWeight: "400",
  },
};

export function Text({
  variant = "body",
  muted = false,
  style,
  ...props
}: AppTextProps) {
  return (
    <RNText
      {...props}
      style={[
        { color: muted ? theme.colors.mutedText : theme.colors.text },
        stylesByVariant[variant],
        style,
      ]}
    />
  );
}