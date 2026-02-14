import React from "react";
import {
  View,
  Pressable,
  StyleProp,
  ViewStyle,
  Platform,
  PressableStateCallbackType,
  ViewProps,
} from "react-native";
import { theme } from "@/theme/theme";

type Props = ViewProps & {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  disabled?: boolean;
};

const baseCard: ViewStyle = {
  backgroundColor: theme.colors.surface,
  borderRadius: theme.radius.lg,
  borderWidth: 1,
  borderColor: theme.colors.border,
  padding: theme.space.md,

  ...Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOpacity: 0.06,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 6 },
    },
    android: { elevation: 1 },
    default: {},
  }),
};

export function Card({ children, style, onPress, disabled, ...rest }: Props) {
  if (onPress) {
    const pressableStyle = ({
      pressed,
    }: PressableStateCallbackType): StyleProp<ViewStyle> => [
      baseCard,
      pressed && !disabled ? { opacity: 0.92 } : null,
      style,
    ];

    return (
      <Pressable
        {...rest}
        onPress={onPress}
        disabled={disabled}
        style={pressableStyle}
        android_ripple={{ color: "rgba(0,0,0,0.06)" }}
        hitSlop={8}
        accessibilityRole="button"
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View {...rest} style={[baseCard, style]}>
      {children}
    </View>
  );
}