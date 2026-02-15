import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "@/theme/theme";

type TabIconProps = {
  color: string;
  focused: boolean;
};

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: "#777",

        // ✅ Make layout consistent + give breathing room for 5 tabs
        tabBarStyle: {
          backgroundColor: theme.colors.bg,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,

          elevation: 0,
          shadowOpacity: 0,

          // key: prevents “Settings” feeling pressed against the edge
          paddingHorizontal: 10,

          // let iOS handle safe-area; only add light vertical padding
          paddingTop: 6,
          paddingBottom: 8,
        },

        // ✅ align icon + label as a compact stack
        tabBarIconStyle: {
          marginTop: 2,
        },

        tabBarLabelStyle: {
          fontSize: 9,
          marginTop: 2,
        },

        // ✅ keep each item centered and tappable
        tabBarItemStyle: {
          paddingVertical: 4,
        },
      }}
    >
      <Tabs.Screen
        name="life"
        options={{
          title: "Life",
          tabBarIcon: ({ color }: TabIconProps) => (
            <Ionicons name="home-outline" size={22} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="focus"
        options={{
          title: "Focus",
          tabBarIcon: ({ color }: TabIconProps) => (
            <Ionicons name="compass-outline" size={22} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="today"
        options={{
          title: "Today",
          tabBarIcon: ({ color }: TabIconProps) => (
            <Ionicons name="sunny-outline" size={22} color={color} />
          ),
        }}
      />



      <Tabs.Screen
        name="journey"
        options={{
          title: "Journey",
          tabBarIcon: ({ color }: TabIconProps) => (
            <Ionicons name="book-outline" size={22} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }: TabIconProps) => (
            <Ionicons name="settings-outline" size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}