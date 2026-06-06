import { createFileRoute } from "@tanstack/react-router";

import { AuthEntryForm } from "@/components/site/auth/AuthEntryForm";
import { AuthShell } from "@/components/site/auth/AuthShell";

export const Route = createFileRoute("/signup")({
  validateSearch: (search: Record<string, unknown>) => ({
    next: typeof search.next === "string" ? search.next : "/",
  }),
  head: () => ({
    meta: [{ title: "Sign up — Zyro" }],
  }),
  component: SignUpPage,
});

function SignUpPage() {
  const search = Route.useSearch();

  return (
    <AuthShell>
      <AuthEntryForm initialMode="signup" nextPath={search.next} />
    </AuthShell>
  );
}

export default Route;