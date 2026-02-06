import { useState } from "react";
import { View } from "react-native";
import { Redirect } from "expo-router";
import { theme } from "@/theme/theme";
import { Text } from "@/ui/Text";
import { Input } from "@/ui/Input";
import { Button } from "@/ui/Button";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

export default function LoginScreen() {
  const { session, loading } = useAuth();

  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  if (!loading && session) return <Redirect href="/" />;

  async function sendLink() {
    setBusy(true);
    setMsg(null);
    try {
      const e = email.trim().toLowerCase();
      const { error } = await supabase.auth.signInWithOtp({
        email: e,
        options: {
          // IMPORTANT: make the email link open the app
          emailRedirectTo: "stratlife://login-callback",
          shouldCreateUser: true,
        },
      });
      if (error) throw error;

      setMsg("Check your email and tap the sign-in link.");
    } catch (err: any) {
      setMsg(err?.message ?? "Could not send link.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={{ flex: 1, padding: theme.space.lg, gap: theme.space.md, backgroundColor: theme.colors.bg }}>
      <Text variant="title" style={{ fontWeight: "700" }}>Sign in</Text>
      <Text muted>Enter your email. We’ll send you a sign-in link.</Text>

      <Input
        value={email}
        onChangeText={setEmail}
        placeholder="you@example.com"
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <Button
        title={busy ? "Sending…" : "Send link"}
        disabled={busy || email.trim().length < 3}
        onPress={sendLink}
      />

      {msg ? <Text muted>{msg}</Text> : null}
    </View>
  );
}