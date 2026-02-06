import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";

export default function FeedScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 22, fontWeight: "700" }}>Stratlife</Text>

      <View style={{ padding: 16, borderRadius: 12, backgroundColor: "#f2f2f2" }}>
        <Text style={{ fontSize: 16, fontWeight: "600" }}>Your first win starts here.</Text>
        <Text style={{ marginTop: 6, fontSize: 14, opacity: 0.7 }}>
          Track what works. Grow what matters.
        </Text>
      </View>

      <Pressable
        onPress={() => router.push("/create-win")}
        style={{
          padding: 14,
          borderRadius: 12,
          backgroundColor: "black",
          alignItems: "center",
        }}
      >
        <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>
          + Create Win
        </Text>
      </Pressable>
    </View>
  );
}