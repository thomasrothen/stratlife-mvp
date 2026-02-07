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

  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // If already logged in → go home
  if (!loading && session) return <Redirect href="/" />;

  async function sendCode() {
    setBusy(true);
    setMsg(null);
    try {
      const e = email.trim().toLowerCase();

      // OTP CODE MODE: IMPORTANT → NO emailRedirectTo here!
      const { error } = await supabase.auth.signInWithOtp({
        email: e,
        options: {
          shouldCreateUser: true,
        },
      });

      if (error) throw error;

      setStep("code");
      setMsg("Check your email for the 6-digit code.");
    } catch (err: any) {
      setMsg(err?.message ?? "Could not send code.");
    } finally {
      setBusy(false);
    }
  }

  async function verifyCode() {
    setBusy(true);
    setMsg(null);
    try {
      const e = email.trim().toLowerCase();
      const t = code.trim();

      const { error } = await supabase.auth.verifyOtp({
        email: e,
        token: t,
        type: "email",
      });

      if (error) throw error;
      // Session will update via AuthProvider listener and redirect to "/"
    } catch (err: any) {
      setMsg(err?.message ?? "Invalid code.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <View
      style={{
        flex: 1,
        padding: theme.space.lg,
        gap: theme.space.md,
        backgroundColor: theme.colors.bg,
      }}
    >
      <Text variant="title" style={{ fontWeight: "700" }}>
        Sign in
      </Text>

      {step === "email" ? (
        <>
          <Text muted>
            Enter your email. We’ll send you a 6-digit sign-in code.
          </Text>

          <Input
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Button
            title={busy ? "Sending…" : "Send code"}
            disabled={busy || email.trim().length < 3}
            onPress={sendCode}
          />
        </>
      ) : (
        <>
          <Text muted>
            Enter the 6-digit code we sent to {email.trim().toLowerCase()}.
          </Text>

          <Input
            value={code}
            onChangeText={setCode}
            placeholder="123456"
            keyboardType="number-pad"
          />

          <Button
            title={busy ? "Verifying…" : "Verify"}
            disabled={busy || code.trim().length < 6}
            onPress={verifyCode}
          />

          <Button
            title="Resend code"
            variant="secondary"
            disabled={busy}
            onPress={sendCode}
          />
        </>
      )}

      {msg ? <Text muted>{msg}</Text> : null}
    </View>
  );
}