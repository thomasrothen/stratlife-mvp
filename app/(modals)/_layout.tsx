import { Stack } from "expo-router";

export default function ModalLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        presentation: "modal",
        headerTitleStyle: { fontWeight: "600" },
      }}
    >
      <Stack.Screen
        name="capture"
        options={{
          title: "Capture a Moment",
        }}
      />

      <Stack.Screen
        name="life-check"
        options={{
          title: "Life Check",
        }}
      />
    </Stack>
  );
}