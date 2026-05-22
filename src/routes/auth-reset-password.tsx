import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { AuthResetPasswordForm } from "@/components/site/auth/AuthResetPasswordForm";
import { AuthShell } from "@/components/site/auth/AuthShell";
import { useAuth } from "@/contexts/auth";
import { getSupabaseClient } from "@/lib/supabase/client";
import { normalizeAuthError, safeReturnTo } from "@/lib/supabase/auth";

export const Route = createFileRoute("/auth-reset-password")({
  validateSearch: (search: Record<string, unknown>) => ({
    next: typeof search.next === "string" ? search.next : "/account",
  }),
  head: () => ({
    meta: [{ title: "Reset password — Zyro" }],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const router = useRouter();
  const search = Route.useSearch();
  const { ready } = useAuth();
  const [linkReady, setLinkReady] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function resolveRecoveryLink() {
      if (typeof window === "undefined") {
        return;
      }

      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");

      if (!code) {
        if (active) {
          setLinkReady(true);
        }
        return;
      }

      const { error } = await getSupabaseClient().auth.exchangeCodeForSession(code);
      if (!active) {
        return;
      }

      if (error) {
        setErrorMessage(normalizeAuthError(error));
      }

      setLinkReady(true);
    }

    resolveRecoveryLink();

    return () => {
      active = false;
    };
  }, []);

  function handleSuccess() {
    router.navigate({ to: safeReturnTo(search.next) });
  }

  return (
    <AuthShell>
      {errorMessage ? (
        <div className="space-y-6 rounded-[2rem] border border-rose-400/20 bg-rose-400/10 p-6 text-sm text-rose-100">
          <p>{errorMessage}</p>
          <p className="text-rose-100/70">
            Request a fresh recovery link from the sign-in page.
          </p>
        </div>
      ) : null}

      <AuthResetPasswordForm ready={ready && linkReady} nextPath={search.next} onSuccess={handleSuccess} />
    </AuthShell>
  );
}

export default Route;