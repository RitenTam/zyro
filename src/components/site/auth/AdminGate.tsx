import { useEffect, useState } from "react";

import { useAuth } from "@/contexts/auth";
import { getSupabaseClient } from "@/lib/supabase/client";

type AdminProfile = {
  id: string;
  role: string | null;
};

type AdminGateProps = {
  children: React.ReactNode;
  nextPath?: string;
  onProfileResolved?: (profile: AdminProfile) => void;
};

type AdminGateState = "checking" | "ready";

export function AdminGate({ children, nextPath = "/admin", onProfileResolved }: AdminGateProps) {
  const { ready, user, clientAvailable } = useAuth();
  const [state, setState] = useState<AdminGateState>("checking");

  useEffect(() => {
    let active = true;
    setState("checking");

    if (!ready) {
      console.info("[admin-auth] Waiting for auth session to hydrate.");
      return;
    }

    if (!clientAvailable || !user) {
      if (!clientAvailable) {
        console.error("[admin-auth] Supabase client is unavailable. Redirecting to sign in.");
      } else {
        console.info("[admin-auth] No authenticated user. Redirecting to sign in.");
      }
      window.location.replace(`/auth?next=${encodeURIComponent(nextPath)}`);
      return;
    }

    async function verifyAdminAccess() {
      try {
        console.info("[admin-auth] Verifying admin role from profiles table.", { userId: user.id });

        const supabase = getSupabaseClient();
        try {
          const sessionInfo = await supabase.auth.getSession();
          console.debug('[admin-auth] supabase.auth.getSession', sessionInfo);
        } catch (e) {
          console.debug('[admin-auth] supabase.auth.getSession failed', e);
        }
        try {
          const userInfo = await supabase.auth.getUser();
          console.debug('[admin-auth] supabase.auth.getUser', userInfo);
        } catch (e) {
          console.debug('[admin-auth] supabase.auth.getUser failed', e);
        }

        const { data, error } = await supabase
          .from("profiles")
          .select("id, role")
          .eq("id", user.id)
          .maybeSingle<AdminProfile>();

        if (!active) {
          return;
        }

        if (error) {
          console.error("[admin-auth] Failed to load profile for admin verification.", {
            userId: user.id,
            error,
          });
          window.location.replace("/");
          return;
        }

        if (!data) {
          console.warn("[admin-auth] Missing profile row for authenticated user.", { userId: user.id });
          window.location.replace("/");
          return;
        }

        if (data.id !== user.id) {
          console.error("[admin-auth] Profile ID mismatch during admin verification.", {
            authenticatedUserId: user.id,
            queriedProfileId: data.id,
          });
          window.location.replace("/");
          return;
        }

        if (data.role !== "admin") {
          console.warn("[admin-auth] User is authenticated but not an admin.", {
            userId: user.id,
            role: data.role,
          });
          window.location.replace("/");
          return;
        }

        console.info("[admin-auth] Admin verification succeeded.", { userId: user.id });
        onProfileResolved?.(data);
        setState("ready");
      } catch (_error) {
        if (!active) {
          return;
        }

        console.error("[admin-auth] Unexpected error during admin verification.", {
          userId: user.id,
          error: _error,
        });
        window.location.replace("/");
      }
    }

    verifyAdminAccess();

    return () => {
      active = false;
    };
  }, [clientAvailable, nextPath, onProfileResolved, ready, user]);

  if (!ready || !user || !clientAvailable || state !== "ready") {
    return <AdminLoadingState />;
  }

  return <>{children}</>;
}

function AdminLoadingState() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl items-center justify-center px-6 py-24">
      <div className="flex flex-col items-center gap-5 text-center">
        <div className="h-10 w-10 animate-pulse rounded-full border border-white/10 bg-white/[0.04]" />
        <div className="space-y-2">
          <div className="text-[11px] uppercase tracking-[0.28em] text-foreground/35">Admin</div>
          <div className="text-sm text-foreground/60">Verifying access permissions…</div>
        </div>
        <div className="h-px w-40 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      </div>
    </div>
  );
}