// Server endpoint for updating order status
// Updates order status in Supabase and returns the updated order
// Requires env variables:
// - SUPABASE_URL
// - SUPABASE_SERVICE_KEY (Service Role key)
//
// Request body:
// {
//   orderId: string,
//   status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
// }

export async function onRequestPost({ request, env }: { request: Request; env?: any }) {
  const body = await request.json().catch(() => ({}));
  const { orderId, status } = body;
  const supabaseUrl = env?.SUPABASE_URL || (typeof process !== "undefined" && (process.env as any)?.SUPABASE_URL);
  const supabaseKey = env?.SUPABASE_SERVICE_KEY || (typeof process !== "undefined" && (process.env as any)?.SUPABASE_SERVICE_KEY);

  if (!orderId) return new Response(JSON.stringify({ message: "orderId required" }), { status: 400, headers: { "content-type": "application/json" } });
  if (!status) return new Response(JSON.stringify({ message: "status required" }), { status: 400, headers: { "content-type": "application/json" } });
  if (!supabaseUrl || !supabaseKey) return new Response(JSON.stringify({ message: "Supabase not configured (SUPABASE_URL and SUPABASE_SERVICE_KEY required)" }), { status: 501, headers: { "content-type": "application/json" } });

  const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
  if (!validStatuses.includes(status)) {
    return new Response(JSON.stringify({ message: `Invalid status. Must be one of: ${validStatuses.join(", ")}` }), { status: 400, headers: { "content-type": "application/json" } });
  }

  try {
    // Update order status in Supabase
    const updateRes = await fetch(`${supabaseUrl.replace(/\/$/, "")}/rest/v1/orders?id=eq.${encodeURIComponent(orderId)}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${supabaseKey}`,
        apikey: supabaseKey,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({ status }),
    });

    const updateData = await updateRes.json().catch(() => null);
    if (!updateRes.ok) {
      return new Response(JSON.stringify({ message: "Supabase update failed", raw: updateData }), { status: 502, headers: { "content-type": "application/json" } });
    }

    if (!Array.isArray(updateData) || updateData.length === 0) {
      return new Response(JSON.stringify({ message: "Order not found" }), { status: 404, headers: { "content-type": "application/json" } });
    }

    return new Response(JSON.stringify({ success: true, order: updateData[0] }), { status: 200, headers: { "content-type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ message: "Failed to update order", error: String(err) }), { status: 500, headers: { "content-type": "application/json" } });
  }
}

export default onRequestPost;
