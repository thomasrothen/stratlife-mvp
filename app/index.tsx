import { Redirect } from "expo-router";
import { useAuth } from "@/lib/auth";

export default function Index() {
  const { session, loading } = useAuth();

  if (loading) return null;

  return session ? (
    <Redirect href="/(app)/today" />
  ) : (
    <Redirect href="/(auth)/welcome" />
  );
}