import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/admin-orders";

export const Route = createFileRoute("/success")({
  head: () => ({ meta: [{ title: "Order confirmation — Zyro" }] }),
  component: SuccessPage,
});

function SuccessPage() {
  const [status, setStatus] = useState<{ loading: boolean; message?: string; order?: any }>({ loading: true });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get("orderId");

    if (!orderId) {
      setStatus({ loading: false, message: "No order id found in the URL." });
      return;
    }

    (async () => {
      if (!isSupabaseConfigured()) {
        setStatus({ loading: false, message: "Supabase is not configured." });
        return;
      }

      try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
          .from("orders")
          .select("*")
          .eq("id", orderId)
          .maybeSingle();

        if (error) {
          setStatus({ loading: false, message: error.message || "Failed to load order." });
          return;
        }

        if (!data) {
          setStatus({ loading: false, message: "Order not found." });
          return;
        }

        setStatus({ loading: false, order: data });
      } catch (err) {
        console.error(err);
        setStatus({ loading: false, message: "Could not load the order." });
      }
    })();
  }, []);

  if (status.loading) return <div className="pt-24 px-6 max-w-3xl mx-auto">Finalizing your order…</div>;

  if (status.order) {
    const order = status.order;
    const lineItems = Array.isArray(order.line_items) ? order.line_items : [];
    const shipping = order.shipping_cost != null ? formatCurrency(order.shipping_cost, order.currency ?? "NPR") : "—";
    const total = order.total != null ? formatCurrency(order.total, order.currency ?? "NPR") : "—";

    return (
      <div className="pt-24 px-6 max-w-4xl mx-auto">
        <div className="rounded-[2rem] border border-white/8 bg-white/[0.04] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.24)]">
          <div className="space-y-6">
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-foreground/40">Order confirmed</p>
              <h1 className="mt-4 text-4xl font-light tracking-tight">Your order is on the way.</h1>
              <p className="mt-3 text-sm text-foreground/60">
                Order <span className="font-medium text-foreground/90">{order.order_number}</span> has been created successfully.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-4">
                <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-6">
                  <h2 className="text-lg font-medium">Shipping</h2>
                  <div className="mt-4 text-sm text-foreground/70 space-y-2">
                    <p>{order.shipping_address?.recipient}</p>
                    <p>{order.shipping_address?.phone}</p>
                    <p>{order.shipping_address?.line1}{order.shipping_address?.line2 ? `, ${order.shipping_address.line2}` : ""}</p>
                    <p>
                      {order.shipping_address?.city}, {order.shipping_address?.region} {order.shipping_address?.postal_code}
                    </p>
                    <p>{order.shipping_address?.country}</p>
                    {order.shipping_address?.delivery_notes ? (
                      <p className="text-foreground/50">Notes: {order.shipping_address.delivery_notes}</p>
                    ) : null}
                  </div>
                </div>

                <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-6">
                  <h2 className="text-lg font-medium">Order summary</h2>
                  <div className="mt-4 space-y-3 text-sm text-foreground/60">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>{formatCurrency(order.subtotal ?? 0, order.currency ?? "NPR")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>{shipping}</span>
                    </div>
                    <div className="flex justify-between border-t border-white/8 pt-3 font-medium text-foreground/90">
                      <span>Total</span>
                      <span>{total}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-6">
                <h2 className="text-lg font-medium">Items ({lineItems.length})</h2>
                <div className="mt-4 space-y-4 text-sm text-foreground/70">
                  {lineItems.map((item: any, index: number) => (
                    <div key={index} className="space-y-1 border-b border-white/10 pb-3 last:border-b-0">
                      <p className="font-medium text-foreground/90">{item.description}</p>
                      <div className="flex justify-between text-foreground/60">
                        <span>Qty {item.quantity}</span>
                        <span>{formatCurrency(item.amount_total ?? 0, order.currency ?? "NPR")}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-4">
              <Link to="/collections" className="btn-primary rounded-full px-5 py-3">
                Continue shopping
              </Link>
              <Link to="/cart" className="btn-secondary rounded-full px-5 py-3">
                Back to cart
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 px-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Order finalization</h1>
      <p className="text-foreground/60 mb-6">{status.message}</p>
      <Link to="/cart" className="btn-secondary">Back to cart</Link>
    </div>
  );
}

export default Route;
