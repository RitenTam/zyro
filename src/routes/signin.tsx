import { createFileRoute } from "@tanstack/react-router";

import { AuthEntryForm } from "@/components/site/auth/AuthEntryForm";
import { AuthShell } from "@/components/site/auth/AuthShell";

export const Route = createFileRoute("/signin")({
  validateSearch: (search: Record<string, unknown>) => ({
    next: typeof search.next === "string" ? search.next : "/",
  }),
  head: () => ({
    meta: [{ title: "Sign in — Zyro" }],
  }),
  component: SignInPage,
});

function SignInPage() {
  const search = Route.useSearch();

  return (
    <AuthShell>
      <AuthEntryForm initialMode="signin" nextPath={search.next} />
    </AuthShell>
  );
}

export default Route;