import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { ArrowRight, Banknote, CirclePlus, MapPin, PencilLine, ShieldCheck, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { AuthGate } from "@/components/site/auth/AuthGate";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/auth";
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

const initialAddresses: Address[] = [
  {
    id: "home",
    label: "Home",
    recipient: "Zyro Customer",
    phone: "+1 (555) 010-2401",
    line1: "24 Mercer Street",
    line2: "Apt 4B",
    city: "New York",
    region: "NY",
    postalCode: "10013",
    country: "United States",
    deliveryNotes: "Leave with concierge if available.",
    default: true,
  },
  {
    id: "studio",
    label: "Studio",
    recipient: "Zyro Customer",
    phone: "+1 (555) 010-2401",
    line1: "900 Broadway",
    line2: "Floor 6",
    city: "New York",
    region: "NY",
    postalCode: "10003",
    country: "United States",
    deliveryNotes: "Call before delivery.",
    default: false,
  },
];

function AccountPage() {
  return (
    <AuthGate nextPath="/account">
      <AccountContent />
    </AuthGate>
  );
}

function AccountContent() {
  const router = useRouter();
  const { user, signOut, updateProfile, updatePassword } = useAuth();
  const displayName = getDisplayName(user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? user?.email ?? "Customer");
  const email = user?.email ?? "Unknown email";
  const initials = getInitials(displayName, email);
  const [activeSection, setActiveSection] = useState<"overview" | "profile" | "addresses" | "orders">("overview");

  const [profileForm, setProfileForm] = useState({ fullName: displayName, email });
  const [passwordForm, setPasswordForm] = useState({ password: "", confirmPassword: "" });
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState<AddressFormState>(emptyAddressForm);

  const defaultAddress = useMemo(() => addresses.find((address) => address.default) ?? addresses[0] ?? null, [addresses]);
  const sectionLinks = [
    { label: "My profile", value: "profile" as const, detail: "Update name, email, and password" },
    { label: "Addresses", value: "addresses" as const, detail: "Add, edit, and default checkout addresses" },
    { label: "More", value: "orders" as const, detail: "View your order history" },
  ];

  useEffect(() => {
    setProfileForm({ fullName: displayName, email });
  }, [displayName, email]);

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

  async function handlePasswordSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
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

    setAddresses((current) => {
      if (editingAddressId) {
        return current.map((address) => (address.id === editingAddressId ? { ...normalized, default: address.default } : address));
      }

      const shouldDefault = current.length === 0;
      return [{ ...normalized, default: shouldDefault }, ...current.map((address) => ({ ...address, default: address.default }))];
    });

    clearAddressForm();
  }

  function removeAddress(addressId: string) {
    setAddresses((current) => {
      const next = current.filter((address) => address.id !== addressId);
      if (next.length && !next.some((address) => address.default)) {
        next[0] = { ...next[0], default: true };
      }
      return next;
    });

    if (editingAddressId === addressId) {
      clearAddressForm();
    }
  }

  function setDefaultAddress(addressId: string) {
    setAddresses((current) => current.map((address) => ({ ...address, default: address.id === addressId })));
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-20 sm:py-24 lg:py-28">
      <div className="mb-12 grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border border-white/10 bg-white/[0.05] ring-1 ring-white/[0.04]">
              <AvatarFallback className="bg-gradient-to-br from-white/18 to-white/6 text-sm font-semibold tracking-[0.2em] text-white/90">{initials}</AvatarFallback>
            </Avatar>
            <div className="space-y-1.5">
              <div className="text-[11px] uppercase tracking-[0.3em] text-foreground/35">Your info</div>
              <h1 className="text-4xl font-light tracking-tight text-balance sm:text-5xl lg:text-6xl">{displayName}</h1>
            </div>
          </div>

          <p className="max-w-2xl text-sm leading-7 text-foreground/58 sm:text-base">
            A quiet place for your profile, delivery details, and order history. Update your information once and keep checkout effortless.
          </p>

          <div className="flex flex-wrap gap-2.5">
            {sectionLinks.map((link) => (
              <button
                key={link.label}
                type="button"
                onClick={() => setActiveSection(link.value)}
                className={cn(
                  "group inline-flex flex-col gap-1 rounded-[1.25rem] border px-4 py-3 text-left transition-colors duration-200",
                  activeSection === link.value ? "border-white/14 bg-white/[0.07]" : "border-white/8 bg-white/[0.035] hover:bg-white/[0.06]",
                )}
              >
                <span className="text-sm font-medium text-foreground/85">{link.label}</span>
                <span className="text-xs leading-5 text-foreground/45">{link.detail}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4 lg:justify-self-end lg:max-w-sm">
          <div className="rounded-[1.75rem] border border-white/8 bg-white/[0.035] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-foreground/35">
              <ShieldCheck className="size-4 text-[#7DB1FF]" />
              Private account
            </div>
            <div className="mt-3 text-lg font-medium text-foreground/90">{email}</div>
          </div>

          <div className="flex flex-wrap gap-3 lg:justify-end">
            <Link to="/collections" className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.04] px-5 py-3 text-sm text-foreground/80 transition-colors duration-200 hover:bg-white/[0.08]">
            Continue shopping
            <ArrowRight className="size-4" />
            </Link>
            <Button onClick={handleSignOut} className="h-12 rounded-full border border-white/8 bg-white/[0.04] px-5 text-sm font-medium text-foreground/80 transition-colors duration-200 hover:bg-white/[0.08]">
              Sign out
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-[2rem] border border-white/8 bg-white/[0.035] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.2)] sm:p-5">
        <div className="flex flex-wrap gap-2">
          {sectionLinks.map((link) => (
            <button
              key={link.value}
              type="button"
              onClick={() => setActiveSection(link.value)}
              className={cn(
                "rounded-full px-4 py-2 text-sm transition-colors duration-200",
                activeSection === link.value ? "bg-white/10 text-foreground" : "text-foreground/55 hover:bg-white/[0.05] hover:text-foreground",
              )}
            >
              {link.label}
            </button>
          ))}
        </div>
      </div>

      {activeSection === "overview" ? (
        <section className="mt-6 rounded-[2rem] border border-white/8 bg-white/[0.035] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.2)] sm:p-8">
          <div className="max-w-2xl space-y-3">
            <div className="text-[11px] uppercase tracking-[0.3em] text-foreground/35">Overview</div>
            <h2 className="text-2xl font-light tracking-tight">Choose a section to update your account.</h2>
            <p className="text-sm leading-7 text-foreground/55">
              Profile, addresses, and order history are organized separately so the page opens clean and stays focused.
            </p>
          </div>
        </section>
      ) : null}

      {activeSection === "profile" ? (
        <section id="profile" className="mt-6 rounded-[2rem] border border-white/8 bg-white/[0.04] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.24)] sm:p-8">
          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <div className="text-[11px] uppercase tracking-[0.3em] text-foreground/35">Profile</div>
              <h2 className="mt-2 text-2xl font-light tracking-tight">My profile</h2>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <form className="space-y-4" onSubmit={handleProfileSave}>
              <div className="space-y-2.5">
                <Label htmlFor="fullName" className="text-foreground/70">
                  Full name
                </Label>
                <Input
                  id="fullName"
                  value={profileForm.fullName}
                  onChange={(event) => setProfileForm((current) => ({ ...current, fullName: event.target.value }))}
                  placeholder="Enter your name"
                  className="h-12 rounded-2xl border-white/10 bg-white/[0.03] px-4 text-sm text-foreground placeholder:text-foreground/30 focus-visible:ring-1 focus-visible:ring-white/20"
                />
              </div>
              <div className="space-y-2.5">
                <Label htmlFor="email" className="text-foreground/70">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={profileForm.email}
                  onChange={(event) => setProfileForm((current) => ({ ...current, email: event.target.value }))}
                  className="h-12 rounded-2xl border-white/10 bg-white/[0.03] px-4 text-sm text-foreground placeholder:text-foreground/30 focus-visible:ring-1 focus-visible:ring-white/20"
                />
              </div>
              {profileMessage ? <p className="text-sm leading-6 text-foreground/55">{profileMessage}</p> : null}
              <Button type="submit" disabled={savingProfile} className="h-12 rounded-full px-5">
                {savingProfile ? "Saving changes…" : "Save profile"}
              </Button>
            </form>

            <form className="space-y-4" onSubmit={handlePasswordSave}>
              <div className="space-y-2.5">
                <Label htmlFor="password" className="text-foreground/70">
                  New password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={passwordForm.password}
                  onChange={(event) => setPasswordForm((current) => ({ ...current, password: event.target.value }))}
                  placeholder="Create a new password"
                  className="h-12 rounded-2xl border-white/10 bg-white/[0.03] px-4 text-sm text-foreground placeholder:text-foreground/30 focus-visible:ring-1 focus-visible:ring-white/20"
                />
              </div>
              <div className="space-y-2.5">
                <Label htmlFor="confirmPassword" className="text-foreground/70">
                  Confirm password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(event) => setPasswordForm((current) => ({ ...current, confirmPassword: event.target.value }))}
                  placeholder="Repeat the new password"
                  className="h-12 rounded-2xl border-white/10 bg-white/[0.03] px-4 text-sm text-foreground placeholder:text-foreground/30 focus-visible:ring-1 focus-visible:ring-white/20"
                />
              </div>
              {passwordMessage ? <p className="text-sm leading-6 text-foreground/55">{passwordMessage}</p> : null}
              <Button type="submit" disabled={savingPassword} className="h-12 rounded-full px-5">
                {savingPassword ? "Updating password…" : "Update password"}
              </Button>
            </form>
          </div>
        </section>
      ) : null}

      {activeSection === "addresses" ? (
        <section id="addresses" className="mt-6 rounded-[2rem] border border-white/8 bg-white/[0.035] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.22)] sm:p-8">
          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <div className="text-[11px] uppercase tracking-[0.3em] text-foreground/35">Addresses</div>
              <h2 className="mt-2 text-2xl font-light tracking-tight">Address book</h2>
            </div>
            <Button type="button" variant="outline" onClick={clearAddressForm} className="h-10 rounded-full border-white/10 bg-white/[0.03] px-4 text-sm text-foreground/75 hover:bg-white/[0.06]">
              <CirclePlus className="mr-2 size-4" />
              New address
            </Button>
          </div>

          <div className="space-y-4">
            {addresses.map((address) => (
              <article key={address.id} className={cn("rounded-[1.5rem] border p-5 transition-colors", address.default ? "border-white/14 bg-white/[0.055]" : "border-white/8 bg-white/[0.03]")}>
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="size-4 text-[#7DB1FF]" />
                      <h3 className="text-base font-medium text-foreground">{address.label}</h3>
                      {address.default ? <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] uppercase tracking-[0.24em] text-foreground/65">Default</span> : null}
                    </div>
                    <p className="text-sm leading-6 text-foreground/60">
                      {address.recipient} · {address.phone}
                    </p>
                    <p className="text-sm leading-6 text-foreground/60">
                      {address.line1}
                      {address.line2 ? <span>, {address.line2}</span> : null}
                      <br />
                      {address.city}, {address.region} {address.postalCode}
                      <br />
                      {address.country}
                    </p>
                    <p className="text-sm leading-6 text-foreground/45">{address.deliveryNotes}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" variant="ghost" onClick={() => beginEditAddress(address)} className="h-9 rounded-full px-3 text-foreground/70 hover:bg-white/[0.05] hover:text-foreground">
                      <PencilLine className="size-4" />
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => removeAddress(address.id)} className="h-9 rounded-full px-3 text-foreground/50 hover:bg-white/[0.05] hover:text-foreground">
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {!address.default ? (
                    <Button type="button" variant="outline" onClick={() => setDefaultAddress(address.id)} className="h-9 rounded-full border-white/10 bg-white/[0.03] px-3 text-xs text-foreground/70 hover:bg-white/[0.06]">
                      Set default
                    </Button>
                  ) : null}
                </div>
              </article>
            ))}
          </div>

          <form className="mt-6 space-y-4 rounded-[1.75rem] border border-white/8 bg-white/[0.03] p-5" onSubmit={handleAddressSubmit}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-[11px] uppercase tracking-[0.28em] text-foreground/35">{editingAddressId ? "Edit address" : "Add address"}</div>
                <h3 className="mt-1 text-lg font-medium text-foreground">{editingAddressId ? "Update shipping details" : "Create a new shipping destination"}</h3>
              </div>
              <Button type="button" variant="ghost" onClick={clearAddressForm} className="h-9 rounded-full px-3 text-foreground/55 hover:bg-white/[0.05] hover:text-foreground">
                Clear
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
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
              <Field label="State / region">
                <Input value={addressForm.region} onChange={(event) => setAddressForm((current) => ({ ...current, region: event.target.value }))} className="h-12 rounded-2xl border-white/10 bg-white/[0.03] px-4 text-sm text-foreground placeholder:text-foreground/30 focus-visible:ring-1 focus-visible:ring-white/20" placeholder="Region" />
              </Field>
              <Field label="Postal code">
                <Input value={addressForm.postalCode} onChange={(event) => setAddressForm((current) => ({ ...current, postalCode: event.target.value }))} className="h-12 rounded-2xl border-white/10 bg-white/[0.03] px-4 text-sm text-foreground placeholder:text-foreground/30 focus-visible:ring-1 focus-visible:ring-white/20" placeholder="Postal code" />
              </Field>
              <Field label="Delivery notes" className="sm:col-span-2">
                <Textarea value={addressForm.deliveryNotes} onChange={(event) => setAddressForm((current) => ({ ...current, deliveryNotes: event.target.value }))} className="min-h-24 rounded-2xl border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground placeholder:text-foreground/30 focus-visible:ring-1 focus-visible:ring-white/20" placeholder="Gate code, call instructions, preferred delivery note" />
              </Field>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <Button type="submit" className="h-12 rounded-full px-5">
                {editingAddressId ? "Update address" : "Add address"}
              </Button>
              <Button type="button" variant="outline" onClick={clearAddressForm} className="h-12 rounded-full border-white/10 bg-white/[0.03] px-5 text-foreground/75 hover:bg-white/[0.06]">
                Cancel
              </Button>
            </div>
          </form>
        </section>
      ) : null}

      {activeSection === "orders" ? (
        <section id="orders" className="mt-6 rounded-[2rem] border border-white/8 bg-white/[0.035] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.2)] sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-[11px] uppercase tracking-[0.3em] text-foreground/35">Orders</div>
              <h2 className="mt-2 text-2xl font-light tracking-tight">Order history</h2>
            </div>
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-3 py-2 text-xs text-foreground/50">
              <Banknote className="size-4" />
              Ready for future receipts and reorders
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-white/8 bg-white/[0.025]">
            <div className="grid grid-cols-4 gap-4 border-b border-white/8 px-5 py-4 text-[11px] uppercase tracking-[0.24em] text-foreground/35">
              <span>Date</span>
              <span className="col-span-2">Items</span>
              <span className="text-right">Status</span>
            </div>
            <div className="grid grid-cols-4 gap-4 px-5 py-6 text-sm text-foreground/55">
              <span>—</span>
              <span className="col-span-2">Your recent purchases will appear here after checkout.</span>
              <span className="text-right">Empty for now</span>
            </div>
          </div>
        </section>
      ) : null}
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
