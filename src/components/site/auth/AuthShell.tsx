import { ShieldCheck, Sparkles, LockKeyhole, ArrowRight } from "lucide-react";

import authVisual from "@/assets/lifestyle.jpg";

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <section className="auth-reveal min-h-[calc(100vh-4rem)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-6rem)] max-w-7xl overflow-hidden rounded-[2rem] border border-white/8 bg-white/[0.03] shadow-[0_30px_120px_rgba(0,0,0,0.35)] xl:grid-cols-[1.05fr_0.95fr]">
        <div className="relative hidden overflow-hidden xl:block">
          <img
            src={authVisual}
            alt="Premium lifestyle scene with refined tech accessories"
            className="absolute inset-0 h-full w-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,10,18,0.2),rgba(7,10,18,0.92))]" />
          <div className="absolute inset-x-0 bottom-0 space-y-6 p-10 text-white">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[11px] uppercase tracking-[0.28em] text-white/70 backdrop-blur-sm">
              <Sparkles className="size-3.5" />
              Secure client access
            </div>
            <div className="max-w-lg space-y-4">
              <h1 className="text-5xl font-light tracking-tight text-balance">
                Sign in to a more considered experience.
              </h1>
              <p className="max-w-md text-sm leading-6 text-white/72 text-pretty">
                Private orders, verified email flows, and session persistence designed to feel as polished as the product itself.
              </p>
            </div>
            <div className="grid max-w-lg gap-3 sm:grid-cols-3">
              <FeatureCard icon={LockKeyhole} label="Encrypted" detail="Secure session handling" />
              <FeatureCard icon={ShieldCheck} label="Verified" detail="Email confirmation" />
              <FeatureCard icon={ArrowRight} label="Ready" detail="Google and Apple" />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center p-6 sm:p-10 lg:p-14">
          <div className="w-full max-w-xl">{children}</div>
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  icon: Icon,
  label,
  detail,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-4 backdrop-blur-sm">
      <Icon className="mb-3 size-4 text-white/70" />
      <div className="text-[11px] uppercase tracking-[0.28em] text-white/55">{label}</div>
      <div className="mt-1 text-sm text-white/82">{detail}</div>
    </div>
  );
}