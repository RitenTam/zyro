import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { ArrowRight, CirclePlus, MapPin, PencilLine, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import { AuthGate } from "@/components/site/auth/AuthGate";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/auth";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [{ title: "Account — Zyro" }],
  }),
  component: AccountPage,
});

type AddressFormState = {
  id?: string;
  label: string;
  recipient: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  deliveryNotes: string;
};

type Address = AddressFormState & {
  id: string;
  default: boolean;
};

type OrderPreview = {
  id: string;
  title: string;
  date: string;
  status: string;
  total: string;
  items: string[];
};

// Start with no addresses for new users. Addresses are loaded from the
// `profiles` table (JSON column `addresses`) when the user is authenticated.
// Dummy/example addresses were removed so they don't appear on new accounts.

const recentOrders: OrderPreview[] = [
  {
    id: "ZY-2418",
    title: "Evening essentials set",
    date: "Delivered 18 May 2026",
    status: "Delivered",
    total: "$248",
    items: ["Cashmere scarf", "Leather card holder"],
  },
  {
    id: "ZY-2409",
    title: "Weekend layer refresh",
    date: "In transit since 21 May 2026",
    status: "In transit",
    total: "$186",
    items: ["Wool overshirt", "Merino tee"],
  },
  {
    id: "ZY-2394",
    title: "Signature gift order",
    date: "Prepared 14 May 2026",
    status: "Preparing",
    total: "$312",
    items: ["Gift wrap", "Candles", "Travel set"],
  },
];

function AccountPage() {
  const { ready, user, role, roleReady } = useAuth();

  useEffect(() => {
    if (ready && user && roleReady && role === "admin") {
      window.location.replace("/admin");
    }
  }, [ready, role, roleReady, user]);

  if (!ready || (user && !roleReady) || role === "admin") {
    return <AccountRedirectLoadingState />;
  }

  return (
    <AuthGate nextPath="/account">
      <AccountContent />
    </AuthGate>
  );
}

function AccountRedirectLoadingState() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-4xl items-center justify-center px-6 py-24">
      <div className="flex flex-col items-center gap-5 text-center">
        <div className="h-10 w-10 rounded-full border border-white/10 bg-white/[0.04]" />
        <div className="space-y-2">
          <div className="text-[11px] uppercase tracking-[0.28em] text-foreground/35">Account</div>
          <div className="text-sm text-foreground/60">Checking your access…</div>
        </div>
        <div className="h-px w-40 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      </div>
    </div>
  );
}

function AccountContent() {
  const router = useRouter();
  const { user, signOut, updateProfile, updatePassword } = useAuth();
  const displayName = getDisplayName(user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? user?.email ?? "Customer");
  const email = user?.email ?? "Unknown email";
  const initials = getInitials(displayName, email);

  const [profileForm, setProfileForm] = useState({ fullName: displayName, email });
  const [passwordForm, setPasswordForm] = useState({ password: "", confirmPassword: "" });
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState<AddressFormState>(emptyAddressForm);

  useEffect(() => {
    setProfileForm({ fullName: displayName, email });
  }, [displayName, email]);

  // Load persisted addresses for authenticated users from the `profiles` table.
  useEffect(() => {
    let mounted = true;

    async function loadAddresses() {
      if (!user || !isSupabaseConfigured()) return;

      try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase.from("profiles").select("addresses").eq("id", user.id).maybeSingle();
        if (error) {
          console.error("Failed to load addresses for profile", { error });
          return;
        }

        if (!mounted) return;

        const loaded: Address[] = (data && (data as any).addresses) || [];
        setAddresses(Array.isArray(loaded) ? loaded : []);
      } catch (err) {
        console.error("Unexpected error while loading addresses", err);
      }
    }

    void loadAddresses();

    return () => {
      mounted = false;
    };
  }, [user]);

  async function handleSignOut() {
    await signOut();
    router.navigate({ to: "/" });
  }

  async function handleProfileSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingProfile(true);
    setProfileMessage(null);

    const result = await updateProfile({ fullName: profileForm.fullName, email: profileForm.email });
    setSavingProfile(false);

    if (result.error) {
      setProfileMessage(result.error);
      return;
    }

    setProfileMessage("Profile updated. Email changes may require confirmation.");
  }

  async function handlePasswordSave() {
    setPasswordMessage(null);

    if (passwordForm.password.length < 8) {
      setPasswordMessage("Use at least 8 characters.");
      return;
    }

    if (passwordForm.password !== passwordForm.confirmPassword) {
      setPasswordMessage("Passwords do not match.");
      return;
    }

    setSavingPassword(true);
    const result = await updatePassword(passwordForm.password);
    setSavingPassword(false);

    if (result.error) {
      setPasswordMessage(result.error);
      return;
    }

    setPasswordMessage("Password updated successfully.");
    setPasswordForm({ password: "", confirmPassword: "" });
  }

  function beginEditAddress(address: Address) {
    setEditingAddressId(address.id);
    setAddressForm({
      id: address.id,
      label: address.label,
      recipient: address.recipient,
      phone: address.phone,
      line1: address.line1,
      line2: address.line2,
      city: address.city,
      region: address.region,
      postalCode: address.postalCode,
      country: address.country,
      deliveryNotes: address.deliveryNotes,
    });
  }

  function clearAddressForm() {
    setEditingAddressId(null);
    setAddressForm(emptyAddressForm);
  }

  function handleAddressSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized: Address = {
      ...addressForm,
      id: addressForm.id ?? `address-${Date.now()}`,
      default: editingAddressId ? addresses.some((address) => address.id === editingAddressId && address.default) : addresses.length === 0,
    };

    let next: Address[];

    if (editingAddressId) {
      next = addresses.map((address) => (address.id === editingAddressId ? { ...normalized, default: address.default } : address));
    } else {
      const shouldDefault = addresses.length === 0;
      next = [{ ...normalized, default: shouldDefault }, ...addresses.map((address) => ({ ...address, default: address.default }))];
    }

    setAddresses(next);
    void persistAddresses(next);

    clearAddressForm();
  }

  function removeAddress(addressId: string) {
    const next = addresses.filter((address) => address.id !== addressId);
    if (next.length && !next.some((address) => address.default)) {
      next[0] = { ...next[0], default: true };
    }

    setAddresses(next);
    void persistAddresses(next);

    if (editingAddressId === addressId) {
      clearAddressForm();
    }
  }

  function setDefaultAddress(addressId: string) {
    const next = addresses.map((address) => ({ ...address, default: address.id === addressId }));
    setAddresses(next);
    void persistAddresses(next);
  }

  async function persistAddresses(next: Address[]) {
    if (!user || !isSupabaseConfigured()) return;

    try {
      const supabase = getSupabaseClient();
      // upsert will create the profile row if it doesn't exist yet.
      const { error } = await supabase.from("profiles").upsert({ id: user.id, addresses: next });
      if (error) {
        console.error("Failed to persist addresses to profile", { error });
      }
    } catch (err) {
      console.error("Unexpected error persisting addresses", err);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-20 sm:py-24 lg:py-28">
      <div className="space-y-10">
        <header className="space-y-5">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border border-white/10 bg-white/[0.05] ring-1 ring-white/[0.04]">
              <AvatarFallback className="bg-gradient-to-br from-white/18 to-white/6 text-sm font-semibold tracking-[0.2em] text-white/90">{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 space-y-1">
              <h1 className="truncate text-4xl font-light tracking-tight text-balance sm:text-5xl lg:text-6xl">{displayName}</h1>
              <p className="text-sm leading-6 text-foreground/52 sm:text-base">{email}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-foreground/45">
            <a href="#profile" className="transition-colors duration-200 hover:text-foreground/78">
              Profile
            </a>
            <a href="#addresses" className="transition-colors duration-200 hover:text-foreground/78">
              Addresses
            </a>
            <a href="#orders" className="transition-colors duration-200 hover:text-foreground/78">
              Orders
            </a>
          </div>

          <div className="flex flex-wrap gap-3 pt-1">
            <Link to="/collections" className="inline-flex items-center gap-2 text-sm text-foreground/70 transition-colors duration-200 hover:text-foreground">
              Continue shopping
              <ArrowRight className="size-4" />
            </Link>
            <button type="button" onClick={handleSignOut} className="text-sm text-foreground/55 transition-colors duration-200 hover:text-foreground/85">
              Sign out
            </button>
          </div>
        </header>

        <section id="profile" className="space-y-6 border-t border-white/8 pt-6 sm:pt-8">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px]">
            <form className="space-y-4" onSubmit={handleProfileSave}>
              <div className="space-y-4 sm:grid sm:grid-cols-2 sm:gap-4 sm:space-y-0">
                <Field label="Full name">
                  <Input
                    id="fullName"
                    value={profileForm.fullName}
                    onChange={(event) => setProfileForm((current) => ({ ...current, fullName: event.target.value }))}
                    placeholder="Enter your name"
                    className="h-12 rounded-2xl border-white/10 bg-white/[0.03] px-4 text-sm text-foreground placeholder:text-foreground/30 focus-visible:ring-1 focus-visible:ring-white/20"
                  />
                </Field>
                <Field label="Email">
                  <Input
                    id="email"
                    type="email"
                    value={profileForm.email}
                    onChange={(event) => setProfileForm((current) => ({ ...current, email: event.target.value }))}
                    className="h-12 rounded-2xl border-white/10 bg-white/[0.03] px-4 text-sm text-foreground placeholder:text-foreground/30 focus-visible:ring-1 focus-visible:ring-white/20"
                  />
                </Field>
              </div>

              {profileMessage ? <p className="text-sm leading-6 text-foreground/55">{profileMessage}</p> : null}

              <div className="flex flex-wrap gap-3 pt-1">
                <Button type="submit" disabled={savingProfile} className="h-12 rounded-full px-5">
                  {savingProfile ? "Saving changes…" : "Save profile"}
                </Button>
              </div>

              <div className="border-t border-white/8 pt-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    id="password"
                    type="password"
                    value={passwordForm.password}
                    onChange={(event) => setPasswordForm((current) => ({ ...current, password: event.target.value }))}
                    placeholder="New password"
                    className="h-12 rounded-2xl border-white/10 bg-white/[0.03] px-4 text-sm text-foreground placeholder:text-foreground/30 focus-visible:ring-1 focus-visible:ring-white/20"
                  />
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(event) => setPasswordForm((current) => ({ ...current, confirmPassword: event.target.value }))}
                    placeholder="Confirm password"
                    className="h-12 rounded-2xl border-white/10 bg-white/[0.03] px-4 text-sm text-foreground placeholder:text-foreground/30 focus-visible:ring-1 focus-visible:ring-white/20"
                  />
                  <div className="sm:col-span-2 flex flex-wrap items-center gap-3">
                    <Button type="button" disabled={savingPassword} onClick={() => void handlePasswordSave()} className="h-11 rounded-full px-5">
                      {savingPassword ? "Updating password…" : "Update password"}
                    </Button>
                    {passwordMessage ? <span className="text-sm leading-6 text-foreground/55">{passwordMessage}</span> : null}
                  </div>
                </div>
              </div>
            </form>
          </div>
        </section>

        <section id="addresses" className="space-y-5 border-t border-white/8 pt-6 sm:pt-8">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-light tracking-tight text-foreground/88">Addresses</h2>
            <Button type="button" variant="ghost" onClick={clearAddressForm} className="h-10 rounded-full px-3 text-foreground/60 hover:bg-white/[0.04] hover:text-foreground">
              <CirclePlus className="mr-2 size-4" />
              Add
            </Button>
          </div>

          <div className="space-y-2">
            {addresses.map((address) => (
              <div key={address.id} className={cn("flex flex-col gap-3 rounded-2xl px-1 py-3 sm:flex-row sm:items-start sm:justify-between", address.default && "bg-white/[0.03]") }>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-foreground/88">{address.label}</span>
                    {address.default ? <span className="text-[11px] uppercase tracking-[0.22em] text-foreground/45">Default</span> : null}
                  </div>
                  <p className="text-sm leading-6 text-foreground/58">
                    {address.line1}
                    {address.line2 ? <span>, {address.line2}</span> : null}
                    <br />
                    {address.city}, {address.region} {address.postalCode}
                    <br />
                    {address.country}
                  </p>
                </div>
                <div className="flex gap-2 sm:pt-0.5">
                  <button type="button" onClick={() => beginEditAddress(address)} className="text-sm text-foreground/55 transition-colors duration-200 hover:text-foreground/85">
                    Edit
                  </button>
                  <button type="button" onClick={() => removeAddress(address.id)} className="text-sm text-foreground/45 transition-colors duration-200 hover:text-foreground/75">
                    Delete
                  </button>
                  {!address.default ? (
                    <button type="button" onClick={() => setDefaultAddress(address.id)} className="text-sm text-foreground/55 transition-colors duration-200 hover:text-foreground/85">
                      Default
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>

          <form className="grid gap-4 pt-4 sm:grid-cols-2" onSubmit={handleAddressSubmit}>
            <Field label="Label">
              <Input value={addressForm.label} onChange={(event) => setAddressForm((current) => ({ ...current, label: event.target.value }))} className="h-12 rounded-2xl border-white/10 bg-white/[0.03] px-4 text-sm text-foreground placeholder:text-foreground/30 focus-visible:ring-1 focus-visible:ring-white/20" placeholder="Home" />
            </Field>
            <Field label="Recipient">
              <Input value={addressForm.recipient} onChange={(event) => setAddressForm((current) => ({ ...current, recipient: event.target.value }))} className="h-12 rounded-2xl border-white/10 bg-white/[0.03] px-4 text-sm text-foreground placeholder:text-foreground/30 focus-visible:ring-1 focus-visible:ring-white/20" placeholder="Full name" />
            </Field>
            <Field label="Phone">
              <Input value={addressForm.phone} onChange={(event) => setAddressForm((current) => ({ ...current, phone: event.target.value }))} className="h-12 rounded-2xl border-white/10 bg-white/[0.03] px-4 text-sm text-foreground placeholder:text-foreground/30 focus-visible:ring-1 focus-visible:ring-white/20" placeholder="Phone number" />
            </Field>
            <Field label="Country">
              <Input value={addressForm.country} onChange={(event) => setAddressForm((current) => ({ ...current, country: event.target.value }))} className="h-12 rounded-2xl border-white/10 bg-white/[0.03] px-4 text-sm text-foreground placeholder:text-foreground/30 focus-visible:ring-1 focus-visible:ring-white/20" placeholder="Country" />
            </Field>
            <Field label="Address line 1" className="sm:col-span-2">
              <Input value={addressForm.line1} onChange={(event) => setAddressForm((current) => ({ ...current, line1: event.target.value }))} className="h-12 rounded-2xl border-white/10 bg-white/[0.03] px-4 text-sm text-foreground placeholder:text-foreground/30 focus-visible:ring-1 focus-visible:ring-white/20" placeholder="Street address" />
            </Field>
            <Field label="Address line 2" className="sm:col-span-2">
              <Input value={addressForm.line2} onChange={(event) => setAddressForm((current) => ({ ...current, line2: event.target.value }))} className="h-12 rounded-2xl border-white/10 bg-white/[0.03] px-4 text-sm text-foreground placeholder:text-foreground/30 focus-visible:ring-1 focus-visible:ring-white/20" placeholder="Apartment, suite, etc." />
            </Field>
            <Field label="City">
              <Input value={addressForm.city} onChange={(event) => setAddressForm((current) => ({ ...current, city: event.target.value }))} className="h-12 rounded-2xl border-white/10 bg-white/[0.03] px-4 text-sm text-foreground placeholder:text-foreground/30 focus-visible:ring-1 focus-visible:ring-white/20" placeholder="City" />
            </Field>
            <Field label="Region">
              <Input value={addressForm.region} onChange={(event) => setAddressForm((current) => ({ ...current, region: event.target.value }))} className="h-12 rounded-2xl border-white/10 bg-white/[0.03] px-4 text-sm text-foreground placeholder:text-foreground/30 focus-visible:ring-1 focus-visible:ring-white/20" placeholder="Region" />
            </Field>
            <Field label="Postal code">
              <Input value={addressForm.postalCode} onChange={(event) => setAddressForm((current) => ({ ...current, postalCode: event.target.value }))} className="h-12 rounded-2xl border-white/10 bg-white/[0.03] px-4 text-sm text-foreground placeholder:text-foreground/30 focus-visible:ring-1 focus-visible:ring-white/20" placeholder="Postal code" />
            </Field>
            <Field label="Notes" className="sm:col-span-2">
              <Textarea value={addressForm.deliveryNotes} onChange={(event) => setAddressForm((current) => ({ ...current, deliveryNotes: event.target.value }))} className="min-h-24 rounded-2xl border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground placeholder:text-foreground/30 focus-visible:ring-1 focus-visible:ring-white/20" placeholder="Optional delivery note" />
            </Field>

            <div className="sm:col-span-2 flex flex-wrap gap-3 pt-1">
              <Button type="submit" className="h-12 rounded-full px-5">
                {editingAddressId ? "Update address" : "Add address"}
              </Button>
              <Button type="button" variant="outline" onClick={clearAddressForm} className="h-12 rounded-full border-white/10 bg-white/[0.03] px-5 text-foreground/75 hover:bg-white/[0.06]">
                Cancel
              </Button>
            </div>
          </form>
        </section>

        <section id="orders" className="space-y-4 border-t border-white/8 pt-6 sm:pt-8">
          <h2 className="text-sm uppercase tracking-[0.3em] text-foreground/35">Orders</h2>
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex flex-col gap-2 py-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                  <div className="text-sm font-medium text-foreground/86">{order.title}</div>
                  <div className="text-sm text-foreground/48">{order.date}</div>
                </div>
                <div className="text-sm text-foreground/52 sm:text-right">
                  <div>{order.status}</div>
                  <div>{order.total}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("space-y-2.5", className)}>
      <Label className="text-foreground/70">{label}</Label>
      {children}
    </div>
  );
}

function getDisplayName(input: string) {
  return input
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .join(" ");
}

function getInitials(name: string, email: string) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("");

  if (initials) {
    return initials.toUpperCase();
  }

  return email
    .split("@")[0]
    .split(/[._-]/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function emptyAddressForm(): AddressFormState {
  return {
    label: "",
    recipient: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    region: "",
    postalCode: "",
    country: "",
    deliveryNotes: "",
  };
}

export default Route;
