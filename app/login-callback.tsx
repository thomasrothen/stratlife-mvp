import { View } from "react-native";
import { theme } from "@/theme/theme";
import { Text } from "@/ui/Text";

export default function LoginCallback() {
  return (
    <View style={{ flex: 1, padding: theme.space.lg, backgroundColor: theme.colors.bg, justifyContent: "center" }}>
      <Text muted>Finishing sign-in…</Text>
    </View>
  );
}