import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { LoaderCircle, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth";

type AuthResetPasswordFormProps = {
  nextPath?: string | null;
  ready: boolean;
  onSuccess: () => void;
};

export function AuthResetPasswordForm({ nextPath, ready, onSuccess }: AuthResetPasswordFormProps) {
  const { updatePassword } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBanner(null);

    if (!ready) {
      setBanner("Confirming your secure link first.");
      return;
    }

    if (password.length < 8) {
      setBanner("Use at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setBanner("Passwords do not match.");
      return;
    }

    setPending(true);
    const result = await updatePassword(password);
    setPending(false);

    if (result.error) {
      setBanner(result.error);
      return;
    }

    onSuccess();
  }

  return (
    <div className="auth-reveal space-y-8">
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-foreground/60">
          <ShieldCheck className="size-3.5 text-[#7DB1FF]" />
          Password recovery
        </div>
        <div className="space-y-3">
          <h2 className="text-4xl font-light tracking-tight text-balance">Create a new password.</h2>
          <p className="max-w-lg text-sm leading-6 text-foreground/60 text-pretty">
            This link is tied to your account session. Choose a new password to restore access and continue to your account.
          </p>
        </div>
      </div>

      {banner ? (
        <div className="rounded-3xl border border-amber-400/20 bg-amber-400/10 px-5 py-4 text-sm text-amber-100">
          {banner}
        </div>
      ) : null}

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="reset-password" className="text-foreground/70">
            New password
          </Label>
          <Input
            id="reset-password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Create a new secure password"
            className="h-12 rounded-2xl border-white/10 bg-white/[0.03] px-4 text-sm text-foreground placeholder:text-foreground/30 focus-visible:ring-1 focus-visible:ring-white/20"
            disabled={pending}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="reset-password-confirm" className="text-foreground/70">
            Confirm new password
          </Label>
          <Input
            id="reset-password-confirm"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Repeat the password"
            className="h-12 rounded-2xl border-white/10 bg-white/[0.03] px-4 text-sm text-foreground placeholder:text-foreground/30 focus-visible:ring-1 focus-visible:ring-white/20"
            disabled={pending}
          />
        </div>

        <Button type="submit" className="btn-primary h-12 w-full rounded-full text-sm" disabled={pending || !ready}>
          {pending ? <LoaderCircle className="size-4 animate-spin" /> : null}
          Update password
        </Button>
      </form>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-foreground/45">
        <p>
          If the secure link expired, request a new one from the sign-in page.
        </p>
        <Link
          to={`/auth${nextPath ? `?next=${encodeURIComponent(nextPath)}` : ""}`}
          className="text-xs font-medium uppercase tracking-[0.2em] text-foreground/40 transition-colors hover:text-foreground/70"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  );
}