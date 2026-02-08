import { useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { theme } from "@/theme/theme";
import { Text } from "@/ui/Text";
import { Input } from "@/ui/Input";
import { Button } from "@/ui/Button";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

type Step = "intro" | "email" | "code";

const normalizeEmail = (v: string) => v.trim().toLowerCase();
const normalizeOtp = (v: string) => v.replace(/\D/g, "").slice(0, 6);

export default function WelcomeScreen() {
  const router = useRouter();
  const { loading } = useAuth();

  const [step, setStep] = useState<Step>("intro");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  if (loading) return null;

  const emailN = useMemo(() => normalizeEmail(email), [email]);
  const otpN = useMemo(() => normalizeOtp(code), [code]);

  const canSend = emailN.length > 3;
  const canVerify = otpN.length === 6;

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  async function sendCode() {
    if (busy) return;
    setBusy(true);
    setMsg(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: emailN,
        options: { shouldCreateUser: true },
      });
      if (error) throw error;

      setStep("code");
      setCooldown(60);
      setMsg("Check your email for the 6-digit code.");
    } catch (e: any) {
      setMsg(e.message ?? "Could not send code.");
    } finally {
      setBusy(false);
    }
  }

  async function verifyCode() {
    if (busy) return;
    setBusy(true);
    setMsg(null);

    try {
      const { error } = await supabase.auth.verifyOtp({
        email: emailN,
        token: otpN,
        type: "email",
      });
      if (error) throw error;

      // 🚨 OTP is single-use → navigate immediately
      router.replace("/today");
    } catch (e: any) {
      setMsg(e.message ?? "Invalid code.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={{ flex: 1, padding: theme.space.lg, gap: theme.space.md, justifyContent: "center" }}>
      <Text variant="title" style={{ fontWeight: "800" }}>Stratlife</Text>
      <Text muted>Inspire life together</Text>

      {step === "intro" && (
        <>
          <Text muted>Most growth happens quietly.</Text>
          <Button title="Get started" onPress={() => setStep("email")} />
        </>
      )}

      {step === "email" && (
        <>
          <Input value={email} onChangeText={setEmail} placeholder="you@example.com" />
          <Button title="Send code" disabled={!canSend || busy} onPress={sendCode} />
          <Button title="Back" variant="secondary" onPress={() => setStep("intro")} />
        </>
      )}

      {step === "code" && (
        <>
          <Input
            value={otpN}
            onChangeText={setCode}
            keyboardType="number-pad"
            placeholder="123456"
            maxLength={6}
          />
          <Button title="Verify" disabled={!canVerify || busy} onPress={verifyCode} />
          <Button
            title={cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
            variant="secondary"
            disabled={cooldown > 0 || busy}
            onPress={sendCode}
          />
        </>
      )}

      {msg && <Text muted>{msg}</Text>}
    </View>
  );
}