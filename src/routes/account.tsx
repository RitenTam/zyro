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
import { formatCurrency } from "@/lib/admin-orders";

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

const emptyAddressForm: AddressFormState = {
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

type Address = AddressFormState & {
  id: string;
  isDefault: boolean;
};

type AddressInput = AddressFormState & {
  id?: string;
  isDefault: boolean;
};

type CustomerOrder = {
  id: string;
  order_number: string;
  status: string;
  total: number;
  currency: string | null;
  created_at: string;
};

// Start with no addresses for new users. Addresses are loaded from the
// `addresses` table when the user is authenticated.
// Dummy/example orders were removed so account orders load from Supabase.

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
  const [customerOrders, setCustomerOrders] = useState<CustomerOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  useEffect(() => {
    setProfileForm({ fullName: displayName, email });
  }, [displayName, email]);

  // Load customer orders from Supabase for the authenticated user.
  useEffect(() => {
    let mounted = true;
    async function loadOrders() {
      if (!user || !isSupabaseConfigured()) {
        if (mounted) {
          setCustomerOrders([]);
          setOrdersLoading(false);
        }
        return;
      }

      setOrdersLoading(true);
      setOrdersError(null);

      try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
          .from("orders")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("[customer-orders] Supabase error:", error);
          if (mounted) {
            setOrdersError(error.message ?? "Failed to load orders.");
            setCustomerOrders([]);
          }
          return;
        }

        if (!mounted) return;

        const loadedOrders = Array.isArray(data)
          ? data.map((row) => ({
              id: String(row.id),
              order_number: String(row.order_number),
              status: row.status ? String(row.status) : "pending",
              total: typeof row.total === "number" ? row.total : Number(row.total ?? 0),
              currency: row.currency ? String(row.currency) : "NPR",
              created_at: String(row.created_at ?? new Date().toISOString()),
            }))
          : [];

        setCustomerOrders(loadedOrders);
      } catch (error) {
        console.error("[customer-orders] Unexpected error:", error);
        if (mounted) {
          setOrdersError(error instanceof Error ? error.message : "Failed to load orders.");
          setCustomerOrders([]);
        }
      } finally {
        if (mounted) {
          setOrdersLoading(false);
        }
      }
    }

    void loadOrders();

    return () => {
      mounted = false;
    };
  }, [user]);

  // Load persisted addresses for authenticated users from the `addresses` table.
  useEffect(() => {
    let mounted = true;

    async function loadAddresses() {
      if (!user || !isSupabaseConfigured()) return;

      try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
          .from("addresses")
          .select(
            "id, label, recipient, phone, line1, line2, city, region, postal_code, country, delivery_notes, is_default"
          )
          .eq("user_id", user.id)
          .order("is_default", { ascending: false })
          .order("created_at", { ascending: false });

        if (error) {
          console.error(error);
          console.error(error?.message);
          console.error(error?.details);
          return;
        }

        if (!mounted) return;

        const loaded = Array.isArray(data)
          ? data.map((row) => ({
              id: row.id,
              label: row.label,
              recipient: row.recipient,
              phone: row.phone,
              line1: row.line1,
              line2: row.line2,
              city: row.city,
              region: row.region,
              postalCode: row.postal_code,
              country: row.country,
              deliveryNotes: row.delivery_notes,
              isDefault: row.is_default ?? false,
            }))
          : [];

        setAddresses(loaded);
      } catch (err) {
        console.error(err);
        console.error(err instanceof Error ? err.message : "");
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

  async function handleAddressSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || !isSupabaseConfigured()) return;

    const isEdit = Boolean(editingAddressId);
    const normalized: AddressInput = {
      ...addressForm,
      id: editingAddressId ?? undefined,
      isDefault: isEdit
        ? addresses.some((address) => address.id === editingAddressId && address.isDefault)
        : addresses.length === 0,
    };

    const savedAddress = await persistAddress(normalized, isEdit);
    if (!savedAddress) return;

    const next = isEdit
      ? addresses.map((address) => (address.id === savedAddress.id ? savedAddress : address))
      : [{ ...savedAddress, isDefault: savedAddress.isDefault ?? false }, ...addresses];

    setAddresses(next);
    clearAddressForm();
  }

  async function removeAddress(addressId: string) {
    const isDefault = addresses.some((address) => address.id === addressId && address.isDefault);
    const next = addresses.filter((address) => address.id !== addressId);

    if (next.length && !next.some((address) => address.isDefault)) {
      next[0] = { ...next[0], isDefault: true };
    }

    setAddresses(next);
    if (editingAddressId === addressId) {
      clearAddressForm();
    }

    if (!user || !isSupabaseConfigured()) return;

    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.from("addresses").delete().eq("id", addressId).eq("user_id", user.id);
      if (error) {
        console.error(error);
        console.error(error?.message);
        console.error(error?.details);
      } else if (isDefault && next.length) {
        await persistSetDefaultAddress(next[0].id);
      }
    } catch (err) {
      console.error(err);
      console.error(err instanceof Error ? err.message : "");
    }
  }

  function setDefaultAddress(addressId: string) {
    const next = addresses.map((address) => ({ ...address, isDefault: address.id === addressId }));
    setAddresses(next);
    void persistSetDefaultAddress(addressId);
  }

  async function persistAddress(address: AddressInput, isEdit: boolean) {
    if (!user || !isSupabaseConfigured()) return null;

    const payload = {
      user_id: user.id,
      label: address.label,
      recipient: address.recipient,
      phone: address.phone,
      line1: address.line1,
      line2: address.line2,
      city: address.city,
      region: address.region,
      postal_code: address.postalCode,
      country: address.country,
      delivery_notes: address.deliveryNotes,
      is_default: address.isDefault,
    } as const;

    try {
      const supabase = getSupabaseClient();

      if (address.isDefault) {
        const { error: resetError } = await supabase
          .from("addresses")
          .update({ is_default: false })
          .eq("user_id", user.id)
          .neq("id", address.id);
        if (resetError) {
          console.error(resetError);
          console.error(resetError?.message);
          console.error(resetError?.details);
        }
      }

      if (isEdit) {
        if (!address.id) return null;
        const { data, error } = await supabase
          .from("addresses")
          .update(payload)
          .eq("id", address.id)
          .eq("user_id", user.id)
          .select("id, label, recipient, phone, line1, line2, city, region, postal_code, country, delivery_notes, is_default")
          .single();
        if (error) {
          console.error(error);
          console.error(error?.message);
          console.error(error?.details);
          return null;
        }
        if (!data) return null;
        return {
          id: data.id,
          label: data.label,
          recipient: data.recipient,
          phone: data.phone,
          line1: data.line1,
          line2: data.line2,
          city: data.city,
          region: data.region,
          postalCode: data.postal_code,
          country: data.country,
          deliveryNotes: data.delivery_notes,
          isDefault: data.is_default ?? false,
        };
      }

      const { data, error } = await supabase
        .from("addresses")
        .insert(payload)
        .select("id, label, recipient, phone, line1, line2, city, region, postal_code, country, delivery_notes, is_default")
        .single();
      if (error) {
        console.error(error);
        console.error(error?.message);
        console.error(error?.details);
        return null;
      }
      if (!data) return null;

      return {
        id: data.id,
        label: data.label,
        recipient: data.recipient,
        phone: data.phone,
        line1: data.line1,
        line2: data.line2,
        city: data.city,
        region: data.region,
        postalCode: data.postal_code,
        country: data.country,
        deliveryNotes: data.delivery_notes,
        isDefault: data.is_default ?? false,
      };
    } catch (err) {
      console.error(err);
      console.error(err instanceof Error ? err.message : "");
      return null;
    }
  }

  async function persistSetDefaultAddress(addressId: string) {
    if (!user || !isSupabaseConfigured()) return;

    try {
      const supabase = getSupabaseClient();
      const { error: resetError } = await supabase
        .from("addresses")
        .update({ is_default: false })
        .eq("user_id", user.id);
      if (resetError) {
        console.error(resetError);
        console.error(resetError?.message);
        console.error(resetError?.details);
      }

      const { error: setError } = await supabase
        .from("addresses")
        .update({ is_default: true })
        .eq("id", addressId)
        .eq("user_id", user.id);
      if (setError) {
        console.error(setError);
        console.error(setError?.message);
        console.error(setError?.details);
      }
    } catch (err) {
      console.error(err);
      console.error(err instanceof Error ? err.message : "");
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
              <div key={address.id} className={cn("flex flex-col gap-3 rounded-2xl px-1 py-3 sm:flex-row sm:items-start sm:justify-between", address.isDefault && "bg-white/[0.03]") }>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-foreground/88">{address.label}</span>
                    {address.isDefault ? <span className="text-[11px] uppercase tracking-[0.22em] text-foreground/45">Default</span> : null}
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
                  {!address.isDefault ? (
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

          {ordersLoading ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-sm text-foreground/60">
              Loading your orders…
            </div>
          ) : ordersError ? (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-800">
              <p className="font-medium">Unable to load orders</p>
              <p>{ordersError}</p>
            </div>
          ) : customerOrders.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.03] p-6 text-sm text-foreground/60">
              You have no orders yet. Orders will appear here once they are created.
            </div>
          ) : (
            <div className="space-y-3">
              {customerOrders.map((order) => (
                <div key={order.id} className="flex flex-col gap-2 rounded-3xl border border-white/10 bg-white/[0.03] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-foreground/86">Order {order.order_number}</div>
                    <div className="text-sm text-foreground/48">{formatOrderDate(order.created_at)}</div>
                  </div>
                  <div className="space-y-1 text-sm text-foreground/52 sm:text-right">
                    <div>{order.status}</div>
                    <div>{formatCurrency(order.total, order.currency)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
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

function formatOrderDate(dateString: string) {
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
}


export default Route;
