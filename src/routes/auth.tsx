import { createFileRoute } from "@tanstack/react-router";

import { AuthEntryForm } from "@/components/site/auth/AuthEntryForm";
import { AuthShell } from "@/components/site/auth/AuthShell";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>) => ({
    mode: search.mode === "signup" ? "signup" : "signin",
    next: typeof search.next === "string" ? search.next : "/account",
  }),
  head: () => ({
    meta: [{ title: "Sign in — Zyro" }],
  }),
  component: AuthPage,
});

function AuthPage() {
  const search = Route.useSearch();

  return (
    <AuthShell>
      <AuthEntryForm initialMode={search.mode} nextPath={search.next} />
    </AuthShell>
  );
}

export default Route;