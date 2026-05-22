export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <section className="auth-reveal min-h-[calc(100vh-4rem)] px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-2xl items-center justify-center">
        <div className="relative w-full overflow-hidden rounded-[2.25rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.025))] px-6 py-10 shadow-[0_30px_100px_rgba(0,0,0,0.32)] ring-1 ring-white/[0.03] sm:px-10 sm:py-12 lg:px-12 lg:py-14">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.05),transparent_38%),radial-gradient(circle_at_75%_0%,rgba(43,127,255,0.08),transparent_24%)]" />
          <div className="relative mx-auto w-full max-w-lg">{children}</div>
        </div>
      </div>
    </section>
  );
}
