import { Stack } from "expo-router";

export default function ModalLayout() {
  return (
    <Stack
      screenOptions={{
        // Optional improvement: make modals feel like flows (full-bleed, no header)
        headerShown: false,

        // Optional improvement: consistent modal presentation for everything in this group
        presentation: "modal",

        // Optional improvement: keeps the title weight consistent if you ever show headers again
        headerTitleStyle: { fontWeight: "600" },
      }}
    >
      {/* Optional improvement: even with headerShown false, keep the title for accessibility */}
      <Stack.Screen
        name="capture"
        options={{
          title: "Capture a Moment",
        }}
      />
    </Stack>
  );
}