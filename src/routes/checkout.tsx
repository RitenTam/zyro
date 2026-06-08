import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader } from "lucide-react";

import { AuthGate } from "@/components/site/auth/AuthGate";
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
  return (
    <AuthGate nextPath="/checkout">
      <CheckoutContent />
    </AuthGate>
  );
}

function CheckoutContent() {
  const { user } = useAuth();
  const { state } = useCart();
  const subtotal = state.items.reduce((sum, item) => sum + item.price * item.qty, 0);

  const [addresses, setAddresses] = useState<CheckoutAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load addresses from user profile
  useEffect(() => {
    let mounted = true;

    async function loadAddresses() {
      if (!user || !isSupabaseConfigured()) {
        if (mounted) setIsLoadingAddresses(false);
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
          console.error("Failed to load addresses", { err });
          setError("Failed to load your addresses");
          setIsLoadingAddresses(false);
          return;
        }

        const loaded = (data?.addresses as CheckoutAddress[]) || [];
        setAddresses(loaded);

        // Pre-select the default address
        const defaultAddress = loaded.find((a) => (a as any).default);
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id);
        }

        setIsLoadingAddresses(false);
      } catch (err) {
        console.error("Unexpected error loading addresses", err);
        if (mounted) {
          setError("An error occurred while loading addresses");
          setIsLoadingAddresses(false);
        }
      }
    }

    void loadAddresses();

    return () => {
      mounted = false;
    };
  }, [user]);

  function handleAddNewAddress(newAddress: CheckoutAddress) {
    // Add to local state (without persisting to DB - that happens in account page)
    setAddresses((current) => [newAddress, ...current]);
    setSelectedAddressId(newAddress.id);
    setIsAddingNewAddress(false);
  }

  async function handleCheckout() {
    if (!selectedAddressId) {
      setError("Please select or add a delivery address");
      return;
    }

    if (state.items.length === 0) {
      setError("Your cart is empty");
      return;
    }

    const selectedAddress = addresses.find((a) => a.id === selectedAddressId);
    if (!selectedAddress) {
      setError("Selected address not found");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: state.items,
          address: selectedAddress,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create checkout session");
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      setError(err instanceof Error ? err.message : "Checkout failed");
      setIsProcessing(false);
    }
  }

  const emptyCart = state.items.length === 0;

  return (
    <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
      <div className="mb-10 space-y-3">
        <div className="text-[11px] uppercase tracking-[0.3em] text-foreground/40">Secure checkout</div>
        <h1 className="text-4xl font-light tracking-tight sm:text-5xl">Complete your purchase.</h1>
        <p className="max-w-2xl text-sm leading-6 text-foreground/60">
          Review your items and provide a shipping address to complete your order.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        {/* Main content */}
        <section className="rounded-[2rem] border border-white/8 bg-white/[0.04] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
          {/* Cart items */}
          <div className="space-y-4">
            <h2 className="text-2xl font-light tracking-tight">Order details</h2>

            {emptyCart ? (
              <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-5 text-sm text-foreground/55 mt-6">
                Your cart is empty. Add items before starting checkout.
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {state.items.map((item) => (
                  <div
                    key={`${item.productId}-${item.variantId ?? "default"}`}
                    className="flex items-center gap-4 rounded-3xl border border-white/8 bg-white/[0.03] p-4"
                  >
                    <img src={item.image} alt={item.name} className="size-16 rounded-2xl object-cover" />
                    <div className="flex-1">
                      <div className="font-medium text-foreground/90">{item.name}</div>
                      <div className="text-sm text-foreground/55">Qty {item.qty}</div>
                    </div>
                    <div className="text-sm font-medium text-foreground/80">${(item.price * item.qty).toFixed(2)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Shipping address */}
          <div className="mt-10 border-t border-white/8 pt-8 space-y-4">
            <h2 className="text-2xl font-light tracking-tight">Shipping address</h2>

            {error && (
              <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400/80">
                {error}
              </div>
            )}

            {isLoadingAddresses ? (
              <div className="flex items-center justify-center py-6">
                <Loader className="size-5 animate-spin text-foreground/40" />
              </div>
            ) : isAddingNewAddress ? (
              <CheckoutAddressForm
                onSubmit={handleAddNewAddress}
                onCancel={() => setIsAddingNewAddress(false)}
                isLoading={isProcessing}
              />
            ) : (
              <AddressSelector
                addresses={addresses}
                selectedAddressId={selectedAddressId}
                onSelectAddress={(address) => {
                  setSelectedAddressId(address.id);
                  setError(null);
                }}
                onAddNew={() => setIsAddingNewAddress(true)}
                isLoading={isLoadingAddresses}
              />
            )}
          </div>
        </section>

        {/* Sidebar */}
        <aside className="space-y-6 rounded-[2rem] border border-white/8 bg-white/[0.035] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
          <div className="space-y-2">
            <div className="text-[11px] uppercase tracking-[0.28em] text-foreground/40">Total</div>
            <div className="text-3xl font-light tracking-tight">${subtotal.toFixed(2)}</div>
          </div>

          <div className="border-t border-white/8 pt-6 space-y-3 text-sm text-foreground/60">
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Shipping</span>
              <span>Calculated at checkout</span>
            </div>
            <div className="border-t border-white/8 pt-3 flex items-center justify-between text-foreground/88 font-medium">
              <span>Estimated total</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              onClick={handleCheckout}
              disabled={emptyCart || !selectedAddressId || isProcessing || isLoadingAddresses || isAddingNewAddress}
              className="w-full h-12 rounded-full"
            >
              {isProcessing ? (
                <>
                  <Loader className="mr-2 size-4 animate-spin" />
                  Processing…
                </>
              ) : (
                "Proceed to payment"
              )}
            </Button>
            <Link to="/cart" className="btn-secondary text-center">
              Return to cart
            </Link>
            <Link to="/collections" className="btn-tertiary text-center">
              Continue shopping
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default Route;