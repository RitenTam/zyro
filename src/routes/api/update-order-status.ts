import { createClient } from "@supabase/supabase-js";

// Server endpoint for updating order status
// Updates order status in Supabase and returns the updated order
// Requires authentication: Bearer token in Authorization header
// Requires admin role: User must have role="admin" in profiles table
// Requires env variables:
// - SUPABASE_URL
// - SUPABASE_SERVICE_KEY (Service Role key)
//
// Request headers:
// - Authorization: "Bearer <user_session_token>"
//
// Request body:
// {
//   orderId: string,
//   status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
// }

function getJsonResponse(message: string, status: number, additional?: Record<string, any>) {
  return new Response(JSON.stringify({ message, ...additional }), {
    status,
    headers: { "content-type": "application/json" },
  });
}

async function verifyAdminAccess(userToken: string, supabaseUrl: string, anonKey: string): Promise<{ success: boolean; userId?: string; error?: string }> {
  // Create a Supabase client with the user's token to respect RLS
  const supabase = createClient(supabaseUrl, anonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    },
  });

  try {
    // Get the authenticated user
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      return { success: false, error: "Invalid or expired authentication token" };
    }

    const userId = userData.user.id;

    // Check if user has admin role in profiles table
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", userId)
      .maybeSingle();

    if (profileError) {
      return { success: false, error: "Failed to verify admin status" };
    }

    if (!profileData || profileData.role !== "admin") {
      return { success: false, error: "User does not have admin privileges" };
    }

    return { success: true, userId };
  } catch (err) {
    return { success: false, error: "Failed to verify authentication" };
  }
}

export async function onRequestPost({ request, env }: { request: Request; env?: any }) {
  const supabaseUrl = env?.SUPABASE_URL || (typeof process !== "undefined" && (process.env as any)?.SUPABASE_URL);
  const supabaseAnonKey = env?.VITE_SUPABASE_ANON_KEY || (typeof process !== "undefined" && (process.env as any)?.VITE_SUPABASE_ANON_KEY);
  const supabaseServiceKey = env?.SUPABASE_SERVICE_KEY || (typeof process !== "undefined" && (process.env as any)?.SUPABASE_SERVICE_KEY);

  // Verify configuration
  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
    return getJsonResponse(
      "Supabase not configured (SUPABASE_URL, VITE_SUPABASE_ANON_KEY, and SUPABASE_SERVICE_KEY required)",
      501,
    );
  }

  // Extract Authorization header
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return getJsonResponse("Authentication required. Provide Authorization: Bearer <token> header.", 401);
  }

  const userToken = authHeader.slice(7); // Remove "Bearer " prefix

  // Verify user is authenticated and is an admin
  const adminCheck = await verifyAdminAccess(userToken, supabaseUrl, supabaseAnonKey);
  if (!adminCheck.success) {
    const isExpiredToken = adminCheck.error?.includes("expired");
    const status = adminCheck.error?.includes("privileges") ? 403 : 401;
    return getJsonResponse(adminCheck.error || "Authentication failed", status);
  }

  // Parse request body
  const body = await request.json().catch(() => ({}));
  const { orderId, status } = body;

  // Validate required fields
  if (!orderId) {
    return getJsonResponse("orderId required", 400);
  }
  if (!status) {
    return getJsonResponse("status required", 400);
  }

  // Validate status value
  const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
  if (!validStatuses.includes(status)) {
    return getJsonResponse(`Invalid status. Must be one of: ${validStatuses.join(", ")}`, 400);
  }

  try {
    // Update order status in Supabase using Service Role Key
    const updateRes = await fetch(`${supabaseUrl.replace(/\/$/, "")}/rest/v1/orders?id=eq.${encodeURIComponent(orderId)}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${supabaseServiceKey}`,
        apikey: supabaseServiceKey,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({ status }),
    });

    const updateData = await updateRes.json().catch(() => null);
    if (!updateRes.ok) {
      return getJsonResponse("Supabase update failed", 502, { raw: updateData });
    }

    if (!Array.isArray(updateData) || updateData.length === 0) {
      return getJsonResponse("Order not found", 404);
    }

    return new Response(JSON.stringify({ success: true, order: updateData[0] }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (err) {
    return getJsonResponse("Failed to update order", 500, { error: String(err) });
  }
}

export default onRequestPost;
