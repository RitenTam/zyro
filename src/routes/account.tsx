import { createFileRoute, Link, useRouter } from "@tanstack/react-router";

import { AuthGate } from "@/components/site/auth/AuthGate";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [{ title: "Account — Zyro" }],
  }),
  component: AccountPage,
});

function AccountPage() {
  return (
    <AuthGate nextPath="/account">
      <AccountContent />
    </AuthGate>
  );
}

function AccountContent() {
  const router = useRouter();
  const { user, session, signOut } = useAuth();
  const email = user?.email ?? "Unknown email";
  const verified = Boolean(user?.email_confirmed_at);

  async function handleSignOut() {
    await signOut();
    router.navigate({ to: "/" });
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <div className="text-[11px] uppercase tracking-[0.3em] text-foreground/40">Private client area</div>
          <h1 className="text-4xl font-light tracking-tight sm:text-5xl">Your account.</h1>
          <p className="max-w-2xl text-sm leading-6 text-foreground/60">
            Manage session access, review identity status, and prepare for future features like addresses, saved devices, and order history.
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/collections" className="btn-secondary">
            Continue shopping
          </Link>
          <Button onClick={handleSignOut} className="btn-primary h-12 rounded-full px-6">
            Sign out
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[2rem] border border-white/8 bg-white/[0.04] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
          <div className="space-y-2">
            <div className="text-[11px] uppercase tracking-[0.28em] text-foreground/40">Profile snapshot</div>
            <h2 className="text-2xl font-light tracking-tight">{email}</h2>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <StatCard label="Email status" value={verified ? "Verified" : "Unverified"} detail={verified ? "Email verification is complete." : "Complete verification for faster checkout."} />
            <StatCard label="Session" value={session ? "Active" : "Offline"} detail={session?.expires_at ? `Expires ${new Date(session.expires_at * 1000).toLocaleString()}` : "No active session metadata available."} />
          </div>
        </section>

        <aside className="space-y-6 rounded-[2rem] border border-white/8 bg-white/[0.035] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
          <div className="space-y-3">
            <div className="text-[11px] uppercase tracking-[0.28em] text-foreground/40">Future-ready</div>
            <h2 className="text-2xl font-light tracking-tight">Scalable customer profile.</h2>
            <p className="text-sm leading-6 text-foreground/60">
              This structure is ready for addresses, saved devices, order history, wishlist data, and notification preferences.
            </p>
          </div>

          <div className="space-y-3 text-sm text-foreground/60">
            <DetailRow title="Protected routes" detail="Account, checkout, and future customer pages can reuse the same guard." />
            <DetailRow title="Social login" detail="Google and Apple provider hooks are ready once enabled in Supabase." />
            <DetailRow title="Session handling" detail="Persistent browser sessions are managed centrally through Supabase." />
          </div>
        </aside>
      </div>
    </div>
  );
}

function StatCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-5">
      <div className="text-[11px] uppercase tracking-[0.24em] text-foreground/35">{label}</div>
      <div className="mt-2 text-xl font-medium text-foreground">{value}</div>
      <div className="mt-2 text-sm leading-6 text-foreground/55">{detail}</div>
    </div>
  );
}

function DetailRow({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
      <div className="text-sm font-medium text-foreground/85">{title}</div>
      <div className="mt-1 text-sm leading-6 text-foreground/55">{detail}</div>
    </div>
  );
}

export default Route;