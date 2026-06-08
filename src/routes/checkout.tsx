import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader } from "lucide-react";

import { AddressSelector } from "@/components/site/AddressSelector";
import { CheckoutAddressForm } from "@/components/site/CheckoutAddressForm";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth";
import { useCart } from "@/contexts/cart";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { CheckoutAddress } from "@/contexts/checkout";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [{ title: "Secure checkout — Zyro" }],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  return <CheckoutContent />;
}

function CheckoutContent() {
  const { user } = useAuth();
  const { state, clear } = useCart();
  const subtotal = state.items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shippingCost = 250;
  const total = subtotal + shippingCost;

  const [addresses, setAddresses] = useState<CheckoutAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [shippingAddress, setShippingAddress] = useState<CheckoutAddress | null>(null);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(!user);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(Boolean(user));
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadAddresses() {
      if (!user || !isSupabaseConfigured()) {
        if (mounted) {
          setIsLoadingAddresses(false);
          setIsAddingNewAddress(!user);
        }
        return;
      }

      try {
        const supabase = getSupabaseClient();
        const { data, error: err } = await supabase
          .from("profiles")
          .select("addresses")
          .eq("id", user.id)
          .maybeSingle();

        if (!mounted) return;

        if (err) {
          console.error("Failed to load addresses", err);
          setError("Failed to load your addresses");
          setIsLoadingAddresses(false);
          return;
        }

        const loaded = Array.isArray(data?.addresses) ? (data.addresses as CheckoutAddress[]) : [];
        setAddresses(loaded);

        const defaultAddress = loaded.find((address) => (address as any).default);
        const initialAddress = defaultAddress || loaded[0] || null;

        if (initialAddress) {
          setSelectedAddressId(initialAddress.id);
          setShippingAddress(initialAddress);
          setIsAddingNewAddress(false);
        } else {
          setIsAddingNewAddress(true);
        }
      } catch (err) {
        console.error("Unexpected error loading addresses", err);
        setError("Unable to load saved addresses");
      } finally {
        if (mounted) setIsLoadingAddresses(false);
      }
    }

    void loadAddresses();

    return () => {
      mounted = false;
    };
  }, [user]);

  async function persistAddressToProfile(address: CheckoutAddress) {
    if (!user || !isSupabaseConfigured()) return;

    try {
      const supabase = getSupabaseClient();
      const nextAddresses = [address, ...addresses.filter((item) => item.id !== address.id)];
      setAddresses(nextAddresses);
      setSelectedAddressId(address.id);

      const { error } = await supabase.from("profiles").upsert({ id: user.id, addresses: nextAddresses });
      if (error) {
        console.error("Failed to persist address to profile", error);
      }
    } catch (err) {
      console.error("Unexpected error persisting address", err);
    }
  }

  function handleAddressSelection(address: CheckoutAddress) {
    setSelectedAddressId(address.id);
    setShippingAddress(address);
    setError(null);
  }

  function handleNewAddress(newAddress: CheckoutAddress) {
    setShippingAddress(newAddress);
    setSelectedAddressId(newAddress.id);
    setIsAddingNewAddress(false);
    setError(null);
    if (user) {
      void persistAddressToProfile(newAddress);
    }
  }

  function handleStartNewAddress() {
    setIsAddingNewAddress(true);
    setError(null);
  }

  function getShippingSummary() {
    if (!shippingAddress) return null;
    return (
      <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-5 text-sm text-foreground/70">
        <div className="font-medium text-foreground/90 mb-3">Shipping details</div>
        <p>{shippingAddress.recipient}</p>
        <p>{shippingAddress.phone}</p>
        <p>
          {shippingAddress.line1}
          {shippingAddress.line2 ? `, ${shippingAddress.line2}` : ""}
        </p>
        <p>
          {shippingAddress.city}, {shippingAddress.region} {shippingAddress.postalCode}
        </p>
        <p>{shippingAddress.country}</p>
        {shippingAddress.deliveryNotes ? (
          <p className="mt-3 text-foreground/50">Notes: {shippingAddress.deliveryNotes}</p>
        ) : null}
      </div>
    );
  }

  async function handlePlaceOrder() {
    if (state.items.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    if (!shippingAddress) {
      setError("Please select or add a shipping address.");
      return;
    }

    if (!user) {
      setError("Sign in to place your order and save this address.");
      return;
    }

    setError(null);
    setIsProcessing(true);

    const lineItems = state.items.map((item) => {
      const unitAmount = Math.round(item.price * 100);
      return {
        id: `${item.productId}-${item.variantId ?? "default"}`,
        object: "item",
        description: item.name,
        quantity: item.qty,
        amount_total: unitAmount * item.qty,
        price: {
          unit_amount: unitAmount,
          currency: "NPR",
        },
      };
    });

    const orderPayload = {
      user_id: user.id,
      order_number: `ZYRO-${Date.now()}`,
      customer_email: user.email ?? "",
      customer_name: shippingAddress.recipient,
      status: "pending",
      subtotal: Math.round(subtotal * 100),
      shipping_cost: Math.round(shippingCost * 100),
      total: Math.round(total * 100),
      currency: "NPR",
      payment_status: "pending",
      shipping_address: {
        label: shippingAddress.label,
        recipient: shippingAddress.recipient,
        phone: shippingAddress.phone,
        line1: shippingAddress.line1,
        line2: shippingAddress.line2,
        city: shippingAddress.city,
        region: shippingAddress.region,
        postal_code: shippingAddress.postalCode,
        country: shippingAddress.country,
        delivery_notes: shippingAddress.deliveryNotes,
      },
      line_items: lineItems,
      raw_session: null,
    } as const;

    try {
      const supabase = getSupabaseClient();
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert(orderPayload)
        .select("id")
        .maybeSingle();

      if (orderError || !order) {
        throw new Error(orderError?.message || "Failed to create order.");
      }

      const orderItems = state.items.map((item) => ({
        order_id: order.id,
        product_id: item.productId,
        product_name: item.name,
        product_sku: (item as any).sku ?? null,
        variant_id: item.variantId ?? null,
        variant_name: item.color ?? null,
        quantity: item.qty,
        unit_price: Math.round(item.price * 100),
        subtotal: Math.round(item.price * 100) * item.qty,
      }));

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
      if (itemsError) {
        console.error("Failed to create order items", itemsError);
      }

      clear();
      window.location.href = `/success?orderId=${encodeURIComponent(order.id)}`;
    } catch (err) {
      console.error("Order placement failed", err);
      setError(err instanceof Error ? err.message : "Failed to place order.");
      setIsProcessing(false);
    }
  }

  const emptyCart = state.items.length === 0;
  const hasSavedAddresses = addresses.length > 0;
  const showAddressForm = isAddingNewAddress || !user || (!hasSavedAddresses && !isAddingNewAddress);
  const formattedSubtotal = new Intl.NumberFormat("en-NP", { style: "currency", currency: "NPR" }).format(subtotal);
  const formattedShipping = new Intl.NumberFormat("en-NP", { style: "currency", currency: "NPR" }).format(shippingCost);
  const formattedTotal = new Intl.NumberFormat("en-NP", { style: "currency", currency: "NPR" }).format(total);

  return (
    <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
      <div className="mb-10 space-y-3">
        <div className="text-[11px] uppercase tracking-[0.3em] text-foreground/40">Secure checkout</div>
        <h1 className="text-4xl font-light tracking-tight sm:text-5xl">Complete your purchase.</h1>
        <p className="max-w-2xl text-sm leading-6 text-foreground/60">
          Review your cart, choose a shipping address, and place your order with cash on delivery.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[2rem] border border-white/8 bg-white/[0.04] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
          <div className="space-y-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-light tracking-tight">Order details</h2>
                <p className="text-sm text-foreground/60">Items in your cart and your chosen shipping information.</p>
              </div>
              <div className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs uppercase tracking-[0.3em] text-foreground/50">
                Cash on Delivery
              </div>
            </div>

            {emptyCart ? (
              <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-8 text-sm text-foreground/55">
                Your cart is empty. Add items before starting checkout.
              </div>
            ) : (
              <div className="space-y-4">
                {state.items.map((item) => (
                  <div
                    key={`${item.productId}-${item.variantId ?? "default"}`}
                    className="grid gap-4 rounded-3xl border border-white/8 bg-white/[0.03] p-4 sm:grid-cols-[minmax(0,1fr)_120px] sm:items-center"
                  >
                    <div className="flex items-start gap-4">
                      <img src={item.image} alt={item.name} className="h-20 w-20 rounded-3xl object-cover" />
                      <div>
                        <div className="font-medium text-foreground/90">{item.name}</div>
                        <div className="text-sm text-foreground/55">Qty {item.qty}</div>
                        {item.color ? <div className="text-xs text-foreground/50">{item.color}</div> : null}
                      </div>
                    </div>
                    <div className="text-right font-medium text-foreground/80">
                      {new Intl.NumberFormat("en-NP", { style: "currency", currency: "NPR" }).format(item.price * item.qty)}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t border-white/8 pt-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-light tracking-tight">Shipping</h2>
                  <p className="text-sm text-foreground/60">Use a saved address or enter one manually.</p>
                </div>
                {user ? (
                  <button
                    type="button"
                    onClick={handleStartNewAddress}
                    className="text-sm text-foreground/70 transition-colors hover:text-foreground"
                  >
                    + Add new address
                  </button>
                ) : null}
              </div>

              {error && (
                <div className="mt-6 rounded-3xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400/80">
                  {error}
                </div>
              )}

              {isLoadingAddresses ? (
                <div className="flex items-center justify-center py-6">
                  <Loader className="size-5 animate-spin text-foreground/40" />
                </div>
              ) : showAddressForm ? (
                <CheckoutAddressForm
                  onSubmit={handleNewAddress}
                  onCancel={() => setIsAddingNewAddress(false)}
                  isLoading={isProcessing}
                  submitLabel={user ? "Save address & continue" : "Continue with this address"}
                  initialAddress={shippingAddress ?? undefined}
                />
              ) : (
                <div className="space-y-4">
                  <AddressSelector
                    addresses={addresses}
                    selectedAddressId={selectedAddressId}
                    onSelectAddress={handleAddressSelection}
                    onAddNew={handleStartNewAddress}
                    isLoading={isLoadingAddresses}
                  />
                  {getShippingSummary()}
                </div>
              )}

              {!user ? (
                <div className="mt-6 rounded-3xl border border-white/8 bg-white/[0.03] p-5 text-sm text-foreground/60">
                  Sign in to save this address and place your order.
                  <div className="mt-3 flex flex-wrap gap-3">
                    <Link to="/auth?next=/checkout" className="btn-primary rounded-full px-4 py-2 text-sm">
                      Sign in or sign up
                    </Link>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <aside className="space-y-6 rounded-[2rem] border border-white/8 bg-white/[0.035] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
          <div className="space-y-2">
            <div className="text-[11px] uppercase tracking-[0.28em] text-foreground/40">Order summary</div>
            <div className="text-3xl font-light tracking-tight">{formattedTotal}</div>
          </div>

          <div className="rounded-[1.75rem] border border-white/8 bg-white/[0.03] p-6 space-y-4 text-sm text-foreground/60">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formattedSubtotal}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{formattedShipping}</span>
            </div>
            <div className="flex justify-between border-t border-white/8 pt-4 text-foreground/80 font-medium">
              <span>Total</span>
              <span>{formattedTotal}</span>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-white/8 bg-white/[0.03] p-6 space-y-4">
            <div className="text-sm uppercase tracking-[0.3em] text-foreground/40">Payment</div>
            <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-4 text-sm">
              <div className="font-medium text-foreground/90">Cash on Delivery</div>
              <p className="text-foreground/60">Pay when your order arrives. No card required.</p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              onClick={handlePlaceOrder}
              disabled={emptyCart || isProcessing || !shippingAddress || !user}
              className="w-full h-14 rounded-full"
            >
              {isProcessing ? (
                <>
                  <Loader className="mr-2 size-4 animate-spin" />
                  Placing order…
                </>
              ) : (
                "Place order"
              )}
            </Button>
            <Link to="/cart" className="btn-secondary text-center">
              Return to cart
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default Route;
