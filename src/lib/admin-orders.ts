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
  order_number: string;
  customer_email: string | null;
  customer_name: string | null;
  amount_total: number | null;
  currency: string | null;
  payment_status: string | null;
  status: OrderStatus;
  line_items: LineItem[];
  raw_session?: Record<string, any>;
  shipping_address: ShippingAddress;
  created_at: string;
  updated_at: string;
}

export const adminOrdersQueryKey = ["admin", "orders"] as const;

export async function fetchAdminOrders() {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured.");
  }

  const { data, error } = await getSupabaseClient()
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
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
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Order not found.");
  }

  return normalizeAdminOrderRow(data as Record<string, unknown>);
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
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Order could not be updated.");
  }

  return normalizeAdminOrderRow(data as Record<string, unknown>);
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
      : row.raw_session || {};

    return {
      id: String(row.id),
      order_number: String(row.order_number),
      customer_email: row.customer_email ? String(row.customer_email) : null,
      customer_name: row.customer_name ? String(row.customer_name) : null,
      amount_total: row.amount_total ? Number(row.amount_total) : null,
      currency: row.currency ? String(row.currency) : null,
      payment_status: row.payment_status ? String(row.payment_status) : null,
      status: (row.status as OrderStatus) || "pending",
      line_items: lineItems,
      raw_session: rawSession,
      shipping_address: shippingAddress,
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

export function formatCurrency(cents: number | null, currency: string = "USD"): string {
  if (cents === null) return "—";
  const amount = cents / 100;
  return new Intl.NumberFormat("en-US", {
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
