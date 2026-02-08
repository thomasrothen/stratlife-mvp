import { useState } from "react";
import { View } from "react-native";
import { Redirect } from "expo-router";
import { theme } from "@/theme/theme";
import { Text } from "@/ui/Text";
import { Input } from "@/ui/Input";
import { Button } from "@/ui/Button";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

type Step = "intro" | "email" | "code";

export default function WelcomeScreen() {
  const { session, loading } = useAuth();

  const [step, setStep] = useState<Step>("intro");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // If already logged in → Today
  if (!loading && session) return <Redirect href="/today" />;

  async function sendCode() {
    setBusy(true);
    setMsg(null);
    try {
      const e = email.trim().toLowerCase();

      const { error } = await supabase.auth.signInWithOtp({
        email: e,
        options: { shouldCreateUser: true },
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
      // Session updates via AuthProvider and Index gate routes to /today
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
        justifyContent: "center",
      }}
    >
      <View style={{ gap: theme.space.sm }}>
        <Text variant="title" style={{ fontWeight: "800" }}>
          Stratlife
        </Text>
        <Text muted style={{ fontSize: 14, opacity: 0.8 }}>
          Inspire life together
        </Text>
      </View>

      {step === "intro" ? (
        <>
          <Text muted style={{ lineHeight: 20 }}>
            Most growth happens quietly. Stratlife helps you notice it — and turn
            it into shared inspiration.
          </Text>

          <Button title="Get started" onPress={() => setStep("email")} />
        </>
      ) : step === "email" ? (
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

          <Button
            title="Back"
            variant="secondary"
            disabled={busy}
            onPress={() => setStep("intro")}
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

          <Button
            title="Back"
            variant="secondary"
            disabled={busy}
            onPress={() => setStep("email")}
          />
        </>
      )}

      {msg ? <Text muted>{msg}</Text> : null}
    </View>
  );
}