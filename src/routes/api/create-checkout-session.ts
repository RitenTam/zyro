// Server implementation for creating Stripe Checkout sessions using the
// Stripe REST API. Expects a `STRIPE_SECRET` environment variable to be set
// in the deployment environment. This function works in Cloudflare Pages
// Functions / Workers and Node environments (it detects env sources).

export async function onRequestPost({ request, env }: { request: Request; env?: any }) {
  const body = await request.json().catch(() => ({}));
  const stripeSecret = env?.STRIPE_SECRET || (typeof process !== "undefined" && (process.env as any)?.STRIPE_SECRET) || (globalThis as any)?.STRIPE_SECRET;

  if (!stripeSecret) {
    return new Response(JSON.stringify({
      message:
        "Stripe checkout is not configured. Set STRIPE_SECRET in the deployment environment to enable Checkout.",
      received: body,
    }), { status: 501, headers: { "content-type": "application/json" } });
  }

  const items = Array.isArray(body.items) ? body.items : [];
  if (items.length === 0) {
    return new Response(JSON.stringify({ message: "No items provided" }), { status: 400, headers: { "content-type": "application/json" } });
  }

  const params = new URLSearchParams();

  items.forEach((item: any, idx: number) => {
    const price = Math.round(Number(item.price || 0) * 100);
    params.append(`line_items[${idx}][price_data][currency]`, (item.currency || "usd").toLowerCase());
    params.append(`line_items[${idx}][price_data][product_data][name]`, String(item.name || item.productId || "Product"));
    params.append(`line_items[${idx}][price_data][unit_amount]`, String(price));
    params.append(`line_items[${idx}][quantity]`, String(Number(item.qty || 1)));
  });

  params.append("mode", "payment");

  const origin = request.headers.get("origin") || (() => {
    try { return new URL(request.url).origin; } catch { return null; }
  })();
  const successUrl = origin ? `${origin}/success?session_id={CHECKOUT_SESSION_ID}` : "/success";
  const cancelUrl = origin ? `${origin}/cart` : "/cart";

  params.append("success_url", successUrl);
  params.append("cancel_url", cancelUrl);

  try {
    const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripeSecret}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const data = await res.json();
    if (!res.ok) {
      return new Response(JSON.stringify({ message: data.error?.message || "Stripe error", raw: data }), { status: 502, headers: { "content-type": "application/json" } });
    }

    return new Response(JSON.stringify({ url: data.url }), { status: 200, headers: { "content-type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ message: "Failed to contact Stripe", error: String(err) }), { status: 502, headers: { "content-type": "application/json" } });
  }
}

export default onRequestPost;
