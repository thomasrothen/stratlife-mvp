import { Redirect } from "expo-router";
import { useAuth } from "@/lib/auth";

export default function Index() {
  const { session, loading } = useAuth();

  if (loading) return null;

  // Root route = decision, not a screen
  return session ? <Redirect href="/today" /> : <Redirect href="/welcome" />;
}