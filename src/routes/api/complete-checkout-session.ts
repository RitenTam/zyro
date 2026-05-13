// Server helper that fetches a Stripe Checkout Session and persists an order
// record to Supabase. Requires env variables:
// - STRIPE_SECRET
// - SUPABASE_URL
// - SUPABASE_SERVICE_KEY (Service Role key)

export async function onRequestPost({ request, env }: { request: Request; env?: any }) {
  const body = await request.json().catch(() => ({}));
  const sessionId = body?.sessionId;
  const stripeSecret = env?.STRIPE_SECRET || (typeof process !== "undefined" && (process.env as any)?.STRIPE_SECRET);
  const supabaseUrl = env?.SUPABASE_URL || (typeof process !== "undefined" && (process.env as any)?.SUPABASE_URL);
  const supabaseKey = env?.SUPABASE_SERVICE_KEY || (typeof process !== "undefined" && (process.env as any)?.SUPABASE_SERVICE_KEY);

  if (!sessionId) return new Response(JSON.stringify({ message: "sessionId required" }), { status: 400, headers: { "content-type": "application/json" } });
  if (!stripeSecret) return new Response(JSON.stringify({ message: "STRIPE_SECRET not configured" }), { status: 501, headers: { "content-type": "application/json" } });
  if (!supabaseUrl || !supabaseKey) return new Response(JSON.stringify({ message: "Supabase not configured (SUPABASE_URL and SUPABASE_SERVICE_KEY required)" }), { status: 501, headers: { "content-type": "application/json" } });

  try {
    // Fetch session
    const sessRes = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`, {
      headers: { Authorization: `Bearer ${stripeSecret}` },
    });
    const session = await sessRes.json();

    if (!sessRes.ok) {
      return new Response(JSON.stringify({ message: "Stripe error fetching session", raw: session }), { status: 502, headers: { "content-type": "application/json" } });
    }

    // Fetch line items
    const liRes = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}/line_items`, {
      headers: { Authorization: `Bearer ${stripeSecret}` },
    });
    const lineItems = await liRes.json();

    // Build order payload
    const order = {
      id: session.id,
      customer_email: session.customer_details?.email ?? null,
      amount_total: session.amount_total ?? null,
      currency: session.currency ?? null,
      payment_status: session.payment_status ?? null,
      line_items: JSON.stringify(lineItems?.data ?? []),
      raw_session: JSON.stringify(session),
    };

    // Insert into Supabase using REST API
    const insertRes = await fetch(`${supabaseUrl.replace(/\/$/, "")}/rest/v1/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${supabaseKey}`,
        apikey: supabaseKey,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(order),
    });

    const insertData = await insertRes.json().catch(() => null);
    if (!insertRes.ok) {
      return new Response(JSON.stringify({ message: "Supabase insert failed", raw: insertData }), { status: 502, headers: { "content-type": "application/json" } });
    }

    return new Response(JSON.stringify({ success: true, order: insertData }), { status: 200, headers: { "content-type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ message: "Failed to complete order", error: String(err) }), { status: 500, headers: { "content-type": "application/json" } });
  }
}

export default onRequestPost;
