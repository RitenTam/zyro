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
      <div className="w-full max-w-lg rounded-[2rem] border border-white/8 bg-white/[0.04] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
        <div className="space-y-4">
          <div className="h-3 w-24 animate-pulse rounded-full bg-white/10" />
          <div className="h-8 w-2/3 animate-pulse rounded-full bg-white/10" />
          <div className="h-4 w-full animate-pulse rounded-full bg-white/10" />
          <div className="h-4 w-5/6 animate-pulse rounded-full bg-white/10" />
          <div className="mt-8 h-12 w-40 animate-pulse rounded-full bg-white/10" />
        </div>
      </div>
    </div>
  );
}