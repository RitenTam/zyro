import { createFileRoute, Link } from "@tanstack/react-router";

import { AuthGate } from "@/components/site/auth/AuthGate";
import { useCart } from "@/contexts/cart";

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
  const { state } = useCart();
  const subtotal = state.items.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
      <div className="mb-10 space-y-3">
        <div className="text-[11px] uppercase tracking-[0.3em] text-foreground/40">Protected flow</div>
        <h1 className="text-4xl font-light tracking-tight sm:text-5xl">Secure checkout lane.</h1>
        <p className="max-w-2xl text-sm leading-6 text-foreground/60">
          Authentication is now wired for the checkout surface. The purchase step can reuse this session layer when payment is enabled.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-[2rem] border border-white/8 bg-white/[0.04] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
          <div className="space-y-4">
            <h2 className="text-2xl font-light tracking-tight">Session-backed purchase details</h2>
            <p className="text-sm leading-6 text-foreground/60">
              This protected route can later host shipping, payment, and confirmation controls without changing the auth architecture.
            </p>
          </div>

          <div className="mt-8 space-y-4">
            {state.items.length === 0 ? (
              <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-5 text-sm text-foreground/55">
                Your cart is empty. Add items before starting checkout.
              </div>
            ) : (
              state.items.map((item) => (
                <div key={`${item.productId}-${item.variantId ?? "default"}`} className="flex items-center gap-4 rounded-3xl border border-white/8 bg-white/[0.03] p-4">
                  <img src={item.image} alt={item.name} className="size-16 rounded-2xl object-cover" />
                  <div className="flex-1">
                    <div className="font-medium text-foreground/90">{item.name}</div>
                    <div className="text-sm text-foreground/55">Qty {item.qty}</div>
                  </div>
                  <div className="text-sm font-medium text-foreground/80">${(item.price * item.qty).toFixed(2)}</div>
                </div>
              ))
            )}
          </div>
        </section>

        <aside className="space-y-6 rounded-[2rem] border border-white/8 bg-white/[0.035] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
          <div className="space-y-2">
            <div className="text-[11px] uppercase tracking-[0.28em] text-foreground/40">Summary</div>
            <div className="text-3xl font-light tracking-tight">${subtotal.toFixed(2)}</div>
          </div>

          <div className="space-y-3 text-sm text-foreground/60">
            <p>Payment and fulfillment can be layered in later without rewriting auth or route protection.</p>
            <p>Checkout is reserved for verified sessions and can surface saved customer data in the future.</p>
          </div>

          <div className="flex flex-col gap-3">
            <Link to="/cart" className="btn-primary text-center">
              Back to cart
            </Link>
            <Link to="/collections" className="btn-secondary text-center">
              Continue shopping
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default Route;