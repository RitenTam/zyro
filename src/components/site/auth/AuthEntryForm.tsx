import { useEffect, useMemo, useState } from "react";
import { Link, useRouter } from "@tanstack/react-router";
import { Apple, Chrome, LoaderCircle, Mail, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth";
import { safeReturnTo } from "@/lib/supabase/auth";

type AuthMode = "signin" | "signup" | "forgot";

type AuthEntryFormProps = {
  nextPath?: string | null;
  initialMode?: AuthMode;
};

type BannerState =
  | { tone: "success" | "error"; message: string }
  | null;

export function AuthEntryForm({ nextPath, initialMode = "signin" }: AuthEntryFormProps) {
  const router = useRouter();
  const { ready, user, signIn, signUp, sendPasswordReset, signInWithProvider, clientAvailable, configurationError } = useAuth();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [banner, setBanner] = useState<BannerState>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);

  const returnTo = useMemo(() => safeReturnTo(nextPath), [nextPath]);

  useEffect(() => {
    if (ready && user) {
      router.navigate({ to: returnTo });
    }
  }, [ready, returnTo, router, user]);

  useEffect(() => {
    setFieldError(null);
    setBanner(null);
    setConfirmPassword("");
  }, [mode]);

  const isBusy = pending || !clientAvailable;

  async function handleSocial(provider: "google" | "apple") {
    setBanner(null);
    setFieldError(null);
    setPending(true);

    const result = await signInWithProvider(provider, returnTo);
    setPending(false);

    if (result.error) {
      setBanner({ tone: "error", message: result.error });
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldError(null);
    setBanner(null);

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setFieldError("Enter your email address.");
      return;
    }

    if (mode !== "forgot" && password.length < 8) {
      setFieldError("Use at least 8 characters.");
      return;
    }

    if (mode === "signup" && password !== confirmPassword) {
      setFieldError("Passwords do not match.");
      return;
    }

    setPending(true);

    if (mode === "signin") {
      const result = await signIn(trimmedEmail, password);
      setPending(false);

      if (result.error) {
        setBanner({ tone: "error", message: result.error });
        return;
      }

      router.navigate({ to: returnTo });
      return;
    }

    if (mode === "signup") {
      const result = await signUp(trimmedEmail, password, returnTo);
      setPending(false);

      if (result.error) {
        setBanner({ tone: "error", message: result.error });
        return;
      }

      if (result.needsVerification) {
        setBanner({ tone: "success", message: "Account created. Check your inbox to verify your email, then return here to sign in." });
        setMode("signin");
        setPassword("");
        setConfirmPassword("");
        return;
      }

      router.navigate({ to: returnTo });
      return;
    }

    const result = await sendPasswordReset(trimmedEmail, returnTo);
    setPending(false);

    if (result.error) {
      setBanner({ tone: "error", message: result.error });
      return;
    }

    setBanner({ tone: "success", message: "Password reset email sent. Follow the secure link to create a new password." });
  }

  return (
    <div className="auth-reveal space-y-8">
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-foreground/60">
          <ShieldCheck className="size-3.5 text-[#7DB1FF]" />
          Account access
        </div>
        <div className="space-y-3">
          <h2 className="text-4xl font-light tracking-tight text-balance">
            {mode === "signin" && "Welcome back."}
            {mode === "signup" && "Create your account."}
            {mode === "forgot" && "Reset access."}
          </h2>
          <p className="max-w-lg text-sm leading-6 text-foreground/60 text-pretty">
            {mode === "signin" && "Return to your account, checkout history, and saved details."}
            {mode === "signup" && "Set up a verified account for order tracking, faster checkout, and future profile features."}
            {mode === "forgot" && "We’ll send a secure link to create a new password without exposing your current one."}
          </p>
        </div>
      </div>

      {!clientAvailable && configurationError ? (
        <div className="rounded-3xl border border-amber-400/20 bg-amber-400/10 px-5 py-4 text-sm text-amber-100">
          {configurationError}
        </div>
      ) : null}

      {banner ? (
        <div
          className={`rounded-3xl border px-5 py-4 text-sm ${
            banner.tone === "success"
              ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-50"
              : "border-rose-400/20 bg-rose-400/10 text-rose-50"
          }`}
        >
          {banner.message}
        </div>
      ) : null}

      <div className="grid grid-cols-3 gap-2 rounded-full border border-white/8 bg-white/[0.03] p-1.5">
        <ModeButton active={mode === "signin"} onClick={() => setMode("signin")} label="Sign in" />
        <ModeButton active={mode === "signup"} onClick={() => setMode("signup")} label="Sign up" />
        <ModeButton active={mode === "forgot"} onClick={() => setMode("forgot")} label="Forgot" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Button
          type="button"
          variant="outline"
          className="h-12 rounded-2xl border-white/10 bg-white/[0.03] text-sm font-medium text-foreground/85 hover:border-white/20 hover:bg-white/[0.06]"
          onClick={() => handleSocial("google")}
          disabled={isBusy}
        >
          <Chrome className="size-4" />
          Continue with Google
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-12 rounded-2xl border-white/10 bg-white/[0.03] text-sm font-medium text-foreground/85 hover:border-white/20 hover:bg-white/[0.06]"
          onClick={() => handleSocial("apple")}
          disabled={isBusy}
        >
          <Apple className="size-4" />
          Continue with Apple
        </Button>
      </div>

      <div className="relative flex items-center gap-4 py-1 text-[11px] uppercase tracking-[0.26em] text-foreground/35">
        <div className="h-px flex-1 bg-white/10" />
        Or use email
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-foreground/70">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@domain.com"
            className="h-12 rounded-2xl border-white/10 bg-white/[0.03] px-4 text-sm text-foreground placeholder:text-foreground/30 focus-visible:ring-1 focus-visible:ring-white/20"
            disabled={isBusy}
          />
        </div>

        {mode !== "forgot" ? (
          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground/70">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={mode === "signup" ? "Create a password" : "Enter your password"}
              className="h-12 rounded-2xl border-white/10 bg-white/[0.03] px-4 text-sm text-foreground placeholder:text-foreground/30 focus-visible:ring-1 focus-visible:ring-white/20"
              disabled={isBusy}
            />
          </div>
        ) : null}

        {mode === "signup" ? (
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-foreground/70">
              Confirm password
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Repeat your password"
              className="h-12 rounded-2xl border-white/10 bg-white/[0.03] px-4 text-sm text-foreground placeholder:text-foreground/30 focus-visible:ring-1 focus-visible:ring-white/20"
              disabled={isBusy}
            />
          </div>
        ) : null}

        <div className="flex items-center justify-between gap-3 text-sm text-foreground/55">
          <p className="flex items-center gap-2">
            <Mail className="size-4 text-[#7DB1FF]" />
            {mode === "signin" && "Session persistence is enabled on this device."}
            {mode === "signup" && "A verification email will be sent automatically."}
            {mode === "forgot" && "We’ll send recovery instructions to this inbox."}
          </p>
          {mode === "signin" ? (
            <button
              type="button"
              onClick={() => setMode("forgot")}
              className="text-xs font-medium uppercase tracking-[0.18em] text-foreground/50 transition-colors hover:text-foreground/80"
            >
              Forgot?
            </button>
          ) : null}
        </div>

        {fieldError ? <p className="text-sm text-rose-200">{fieldError}</p> : null}

        <Button type="submit" className="btn-primary h-12 w-full rounded-full text-sm" disabled={isBusy}>
          {pending ? <LoaderCircle className="size-4 animate-spin" /> : null}
          {mode === "signin" && "Sign in"}
          {mode === "signup" && "Create account"}
          {mode === "forgot" && "Send reset link"}
        </Button>
      </form>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-foreground/45">
        {mode !== "signin" ? (
          <button
            type="button"
            onClick={() => setMode("signin")}
            className="font-medium text-foreground/70 transition-colors hover:text-foreground"
          >
            Back to sign in
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setMode("signup")}
            className="font-medium text-foreground/70 transition-colors hover:text-foreground"
          >
            New customer? Create an account
          </button>
        )}

        <Link
          to="/"
          className="text-xs font-medium uppercase tracking-[0.2em] text-foreground/40 transition-colors hover:text-foreground/70"
        >
          Return home
        </Link>
      </div>
    </div>
  );
}

function ModeButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-3 text-sm transition-all duration-200 ${
        active
          ? "bg-white text-background shadow-[0_14px_40px_rgba(0,0,0,0.22)]"
          : "text-foreground/50 hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}