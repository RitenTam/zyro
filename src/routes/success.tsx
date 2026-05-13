import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/success")({
  head: () => ({ meta: [{ title: "Order confirmation — Zyro" }] }),
  component: SuccessPage,
});

function SuccessPage() {
  const [status, setStatus] = useState<{ loading: boolean; message?: string; order?: any }>({ loading: true });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    if (!sessionId) {
      setStatus({ loading: false, message: "No session id found in URL." });
      return;
    }

    (async () => {
      try {
        const res = await fetch('/api/complete-checkout-session', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        });
        const data = await res.json();
        if (!res.ok) {
          setStatus({ loading: false, message: data?.message || 'Failed to finalize order.' });
          return;
        }
        setStatus({ loading: false, order: data.order?.[0] ?? data.order, message: 'Order recorded' });
      } catch (e) {
        setStatus({ loading: false, message: 'Network error while finalizing order.' });
      }
    })();
  }, []);

  if (status.loading) return <div className="pt-24 px-6 max-w-3xl mx-auto">Finalizing your order…</div>;

  if (status.order) {
    return (
      <div className="pt-24 px-6 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Thank you — your order is confirmed</h1>
        <p className="text-foreground/60 mb-6">We've recorded your order #{status.order.id ?? status.order[0]?.id}.</p>
        <Link to="/" className="btn-primary">Continue shopping</Link>
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
