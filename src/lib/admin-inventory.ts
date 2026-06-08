import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client";

export type InventoryProductStatus = "active" | "draft";

export interface InventoryProductRow {
  id: string;
  name: string;
  sku: string;
  stock: number;
  status: InventoryProductStatus;
}

export const adminInventoryQueryKey = ["admin", "inventory"] as const;

export async function fetchInventoryProducts() {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured.");
  }

  const { data, error } = await getSupabaseClient()
    .from("products")
    .select("id, name, sku, stock, status")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? [])
    .map((row) => normalizeInventoryProductRow(row as Record<string, unknown>))
    .filter((product): product is InventoryProductRow => product !== null);
}

export async function updateInventoryStock(productId: string, stock: number) {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured.");
  }

  const { data, error } = await getSupabaseClient()
    .from("products")
    .update({ stock: Math.max(0, Math.round(stock)) })
    .eq("id", productId)
    .select("id, stock")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Stock could not be updated.");
  }

  return { id: data.id as string, stock: Number(data.stock ?? 0) };
}

function normalizeInventoryProductRow(row: Record<string, unknown>): InventoryProductRow | null {
  const name = firstString(row, ["name", "title", "product_name"]);

  if (!name) {
    return null;
  }

  return {
    id: firstString(row, ["id", "product_id", "uuid"]) || slugify(name),
    name,
    sku: firstString(row, ["sku", "product_sku"]),
    stock: firstNumber(row, ["stock", "inventory", "available", "quantity"]) ?? 0,
    status: normalizeStatus(firstString(row, ["status", "product_status"])) ?? "draft",
  };
}

function normalizeStatus(value: string) {
  const status = value.trim().toLowerCase();

  if (status === "active" || status === "draft") {
    return status;
  }

  return undefined;
}

function firstValue(row: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== null) {
      return parseMaybeJson(row[key]);
    }
  }

  return undefined;
}

function firstString(row: Record<string, unknown>, keys: string[]) {
  const value = firstValue(row, keys);

  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return "";
}

function firstNumber(row: Record<string, unknown>, keys: string[]) {
  const value = firstValue(row, keys);

  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

function parseMaybeJson(value: unknown) {
  if (typeof value !== "string") {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/["]|[']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
