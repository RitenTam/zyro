import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client";

export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

export interface ShippingAddress {
  label?: string;
  recipient?: string;
  phone?: string;
  line1?: string;
  line2?: string;
  city?: string;
  region?: string;
  postal_code?: string;
  country?: string;
  delivery_notes?: string;
}

export interface LineItem {
  id: string;
  object: string;
  amount_discount: number;
  amount_subtotal: number;
  amount_tax: number;
  amount_total: number;
  currency: string;
  description: string;
  price: {
    id: string;
    object: string;
    active: boolean;
    billing_scheme: string;
    created: number;
    currency: string;
    custom_unit_amount: null | number;
    livemode: boolean;
    lookup_key: string | null;
    metadata: Record<string, any>;
    nickname: string | null;
    object: string;
    product: string;
    recurring: null | Record<string, any>;
    tax_behavior: string;
    tiers_mode: null | string;
    time_period_end: null | number;
    time_period_start: null | number;
    type: string;
    unit_amount: number;
    unit_amount_decimal: string;
  };
  proration: boolean;
  proration_details: Record<string, any>;
  quantity: number;
}

export interface AdminOrderRow {
  id: string;
  user_id: string;
  order_number: string;
  customer_email: string | null;
  customer_name: string | null;
  status: OrderStatus;
  subtotal: number;
  shipping_cost: number;
  total: number;
  currency: string | null;
  payment_status: string | null;
  payment_intent_id: string | null;
  shipping_address: ShippingAddress;
  line_items: LineItem[];
  raw_session: Record<string, any>;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const adminOrdersQueryKey = ["admin", "orders"] as const;

export async function fetchAdminOrders() {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured.");
  }

  const supabase = getSupabaseClient();
  try {
    const sessionInfo = await supabase.auth.getSession();
    console.debug("[admin-orders] auth.getSession", sessionInfo);
  } catch (e) {
    console.debug("[admin-orders] auth.getSession failed", e);
  }

  try {
    const userInfo = await supabase.auth.getUser();
    console.debug("[admin-orders] auth.getUser", userInfo);
  } catch (e) {
    console.debug("[admin-orders] auth.getUser failed", e);
  }

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[admin-orders] fetchAdminOrders error:", error);
    throw new Error(error.message);
  }

  return (data ?? [])
    .map((row) => normalizeAdminOrderRow(row as Record<string, unknown>))
    .filter((order): order is AdminOrderRow => order !== null);
}

export async function fetchOrderById(orderId: string) {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured.");
  }

  const { data, error } = await getSupabaseClient()
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();

  if (error) {
    console.error("[admin-orders] fetchOrderById error:", error);
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Order not found.");
  }

  const normalizedOrder = normalizeAdminOrderRow(data as Record<string, unknown>);
  if (!normalizedOrder) {
    throw new Error("Failed to process the order data.");
  }
  return normalizedOrder;
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured.");
  }

  const { data, error } = await getSupabaseClient()
    .from("orders")
    .update({ status })
    .eq("id", orderId)
    .select("*")
    .maybeSingle();

  if (error) {
    console.error("[admin-orders] updateOrderStatus error:", error);
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Order could not be updated.");
  }

  const normalizedOrder = normalizeAdminOrderRow(data as Record<string, unknown>);
  if (!normalizedOrder) {
    throw new Error("Failed to process the updated order data.");
  }
  return normalizedOrder;
}

function normalizeAdminOrderRow(row: Record<string, unknown>): AdminOrderRow | null {
  if (!row.id || !row.order_number) {
    return null;
  }

  try {
    const lineItems: LineItem[] = typeof row.line_items === "string"
      ? JSON.parse(row.line_items)
      : Array.isArray(row.line_items)
        ? row.line_items
        : [];

    const shippingAddress: ShippingAddress = typeof row.shipping_address === "string"
      ? JSON.parse(row.shipping_address)
      : typeof row.shipping_address === "object"
        ? (row.shipping_address as ShippingAddress)
        : {};

    const rawSession = typeof row.raw_session === "string"
      ? JSON.parse(row.raw_session)
      : (typeof row.raw_session === "object" && row.raw_session !== null)
        ? (row.raw_session as Record<string, any>)
        : {};

    return {
      id: String(row.id),
      user_id: String(row.user_id),
      order_number: String(row.order_number),
      customer_email: row.customer_email ? String(row.customer_email) : null,
      customer_name: row.customer_name ? String(row.customer_name) : null,
      status: (row.status as OrderStatus) || "pending",
      subtotal: typeof row.subtotal === "number" ? row.subtotal : Number(row.subtotal ?? 0),
      shipping_cost: typeof row.shipping_cost === "number" ? row.shipping_cost : Number(row.shipping_cost ?? 0),
      total: typeof row.total === "number" ? row.total : Number(row.total ?? 0),
      currency: row.currency ? String(row.currency) : null,
      payment_status: row.payment_status ? String(row.payment_status) : null,
      payment_intent_id: row.payment_intent_id ? String(row.payment_intent_id) : null,
      shipping_address: shippingAddress,
      line_items: lineItems,
      raw_session: rawSession,
      notes: row.notes ? String(row.notes) : null,
      created_at: row.created_at ? String(row.created_at) : new Date().toISOString(),
      updated_at: row.updated_at ? String(row.updated_at) : new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error normalizing order row:", error);
    return null;
  }
}

export function formatOrderDate(dateString: string): string {
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

export function formatOrderDateTime(dateString: string): string {
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
}

export function formatCurrency(cents: number | null, currency: string = "NPR", locale: string = "en-NP"): string {
  if (cents === null) return "—";
  const amount = cents / 100;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount);
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  processing: "bg-blue-100 text-blue-800 border-blue-200",
  shipped: "bg-purple-100 text-purple-800 border-purple-200",
  delivered: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};
