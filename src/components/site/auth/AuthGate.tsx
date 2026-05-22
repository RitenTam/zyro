import { useEffect } from "react";

import { useAuth } from "@/contexts/auth";

export function AuthGate({ children, nextPath = "/account" }: { children: React.ReactNode; nextPath?: string }) {
  const { ready, user } = useAuth();

  useEffect(() => {
    if (ready && !user) {
      window.location.replace(`/auth?next=${encodeURIComponent(nextPath)}`);
    }
  }, [nextPath, ready, user]);

  if (!ready || !user) {
    return <ProtectedLoadingState />;
  }

  return <>{children}</>;
}

function ProtectedLoadingState() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-4xl items-center justify-center px-6 py-24">
      <div className="flex flex-col items-center gap-5 text-center">
        <div className="h-10 w-10 rounded-full border border-white/10 bg-white/[0.04]" />
        <div className="space-y-2">
          <div className="text-[11px] uppercase tracking-[0.28em] text-foreground/35">Account</div>
          <div className="text-sm text-foreground/60">Loading your customer profile…</div>
        </div>
        <div className="h-px w-40 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      </div>
    </div>
  );
}