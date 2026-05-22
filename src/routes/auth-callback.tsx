import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";

import { AuthShell } from "@/components/site/auth/AuthShell";
import { useAuth } from "@/contexts/auth";
import { getSupabaseClient } from "@/lib/supabase/client";
import { normalizeAuthError, safeReturnTo } from "@/lib/supabase/auth";

export const Route = createFileRoute("/auth-callback")({
  validateSearch: (search: Record<string, unknown>) => ({
    next: typeof search.next === "string" ? search.next : "/account",
  }),
  head: () => ({
    meta: [{ title: "Confirm access — Zyro" }],
  }),
  component: AuthCallbackPage,
});

function AuthCallbackPage() {
  const router = useRouter();
  const search = Route.useSearch();
  const { ready, user } = useAuth();
  const [status, setStatus] = useState<"loading" | "error">("loading");
  const [message, setMessage] = useState("Confirming your secure link.");

  useEffect(() => {
    let active = true;

    if (ready && user) {
      router.navigate({ to: safeReturnTo(search.next) });
      return;
    }

    async function exchangeCode() {
      if (typeof window === "undefined") {
        return;
      }

      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");

      if (!code) {
        if (active) {
          setStatus("error");
          setMessage("This verification link is missing its code. Return to sign in and request a fresh link.");
        }
        return;
      }

      const { error } = await getSupabaseClient().auth.exchangeCodeForSession(code);

      if (!active) {
        return;
      }

      if (error) {
        setStatus("error");
        setMessage(normalizeAuthError(error));
        return;
      }

      router.navigate({ to: safeReturnTo(search.next) });
    }

    exchangeCode();

    return () => {
      active = false;
    };
  }, [ready, router, search.next, user]);

  return (
    <AuthShell>
      <div className="space-y-8 rounded-[2rem] border border-white/8 bg-white/[0.04] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
        <div className="space-y-3">
          <h2 className="text-4xl font-light tracking-tight">Secure access</h2>
          <p className="max-w-lg text-sm leading-6 text-foreground/60">
            {status === "loading"
              ? "Verifying your account link and restoring your session."
              : message}
          </p>
        </div>
        {status === "loading" ? (
          <div className="flex items-center gap-3 text-sm text-foreground/55">
            <LoaderCircle className="size-4 animate-spin text-[#7DB1FF]" />
            Finalizing authentication
          </div>
        ) : null}
      </div>
    </AuthShell>
  );
}

export default Route;