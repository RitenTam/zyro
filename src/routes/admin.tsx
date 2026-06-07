import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { AdminGate } from "@/components/site/auth/AdminGate";
import { useAuth } from "@/contexts/auth";

type AdminProfile = {
  id: string;
  role: string | null;
};

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Admin dashboard — Zyro" }],
  }),
  component: AdminPage,
});

function AdminPage() {
  const [profile, setProfile] = useState<AdminProfile | null>(null);

  return (
    <AdminGate nextPath="/admin" onProfileResolved={setProfile}>
      <AdminContent profile={profile} />
    </AdminGate>
  );
}

function AdminContent({ profile }: { profile: AdminProfile | null }) {
  const { user } = useAuth();

  return (
    <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
      <header className="mb-10 space-y-3">
        <div className="text-[11px] uppercase tracking-[0.3em] text-foreground/40">
          Restricted area
        </div>
        <h1 className="text-4xl font-light tracking-tight sm:text-5xl">Admin Dashboard</h1>
        <p className="text-sm text-foreground/60">Signed in as {user?.email ?? "Unknown email"}</p>
        <p className="text-xs text-foreground/45">Role: {profile?.role ?? "admin"}</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Products"
          description="Manage product catalog, pricing, and merchandising."
          to="/admin/products"
          cta="Open products"
        />
        <DashboardCard
          title="Inventory"
          description="Monitor stock levels and replenishment workflows."
        />
        <DashboardCard
          title="Orders"
          description="Track order lifecycle, payments, and fulfillment status."
        />
        <DashboardCard
          title="Customers"
          description="Review customer activity and support handoff data."
        />
      </section>
    </div>
  );
}

function DashboardCard({
  title,
  description,
  to,
  cta,
}: {
  title: string;
  description: string;
  to?: string;
  cta?: string;
}) {
  return (
    <article className="rounded-3xl border border-white/8 bg-white/[0.035] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.2)]">
      <h2 className="text-xl font-light tracking-tight">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-foreground/60">{description}</p>
      {to ? (
        <Link
          to={to}
          className="mt-5 inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-medium text-foreground/75 transition-colors hover:bg-white/[0.08] hover:text-foreground"
        >
          {cta ?? "Open"}
        </Link>
      ) : null}
    </article>
  );
}
