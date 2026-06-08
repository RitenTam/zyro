import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client";

export type ProductStatus = "active" | "draft";

export interface AdminProductRow {
  id: string;
  name: string;
  slug: string;
  collection: string;
  collectionSlug: string;
  material: string;
  price: number;
  description: string;
  featured: boolean;
  bestSeller: boolean;
  stock: number;
  sku: string;
  status: ProductStatus;
}

export interface ProductFormValues {
  name: string;
  slug: string;
  collection: string;
  collectionSlug: string;
  material: string;
  price: string;
  description: string;
  featured: boolean;
  bestSeller: boolean;
  stock: string;
  sku: string;
  status: ProductStatus;
}

export const adminProductsQueryKey = ["admin", "products"] as const;

export function emptyProductForm(): ProductFormValues {
  return {
    name: "",
    slug: "",
    collection: "",
    collectionSlug: "",
    material: "",
    price: "",
    description: "",
    featured: false,
    bestSeller: false,
    stock: "0",
    sku: "",
    status: "draft",
  };
}

export function productFormFromRow(row: AdminProductRow): ProductFormValues {
  return {
    name: row.name ?? "",
    slug: row.slug ?? "",
    collection: row.collection ?? "",
    collectionSlug: row.collectionSlug ?? "",
    material: row.material ?? "",
    price: row.price !== undefined ? String(row.price) : "",
    description: row.description ?? "",
    featured: Boolean(row.featured),
    bestSeller: Boolean(row.bestSeller),
    stock: String(row.stock ?? 0),
    sku: row.sku ?? "",
    status: row.status ?? "draft",
  };
}

export async function fetchAdminProducts() {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured.");
  }

  const { data, error } = await getSupabaseClient().from("products").select("*");

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? [])
    .map((row) => normalizeAdminProductRow(row as Record<string, unknown>))
    .filter((product): product is AdminProductRow => product !== null)
    .sort((left, right) => left.name.localeCompare(right.name));
}

export async function saveAdminProduct(values: ProductFormValues, productId?: string) {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured.");
  }

  const payload = buildAdminProductPayload(values);
  const supabase = getSupabaseClient();

  if (productId) {
    const { data, error } = await supabase
      .from("products")
      .update(payload)
      .eq("id", productId)
      .select("*")
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error("The product could not be updated.");
    }

    const normalizedProduct = normalizeAdminProductRow(data as Record<string, unknown>);
    if (!normalizedProduct) {
      throw new Error("Failed to process the updated product data.");
    }
    return normalizedProduct;
  }

  const { data, error } = await supabase.from("products").insert(payload).select("*").maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("The product could not be created.");
  }

  const normalizedProduct = normalizeAdminProductRow(data as Record<string, unknown>);
  if (!normalizedProduct) {
    throw new Error("Failed to process the created product data.");
  }
  return normalizedProduct;
}

export async function deleteAdminProduct(productId: string) {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured.");
  }

  const { error } = await getSupabaseClient().from("products").delete().eq("id", productId);

  if (error) {
    throw new Error(error.message);
  }
}

function buildAdminProductPayload(values: ProductFormValues) {
  const name = values.name.trim();
  const slug = normalizeSlug(values.slug) || slugify(name);
  const collection = values.collection.trim();
  const collectionSlug = normalizeSlug(values.collectionSlug) || slugify(collection);
  const material = values.material.trim();
  const price = normalizeNumber(values.price);
  const stock = normalizeStock(values.stock);

  return {
    name,
    slug,
    collection,
    collection_slug: collectionSlug,
    material,
    price,
    description: values.description.trim(),
    featured: Boolean(values.featured),
    best_seller: Boolean(values.bestSeller),
    stock,
    sku: values.sku.trim(),
    status: values.status,
  };
}

function normalizeAdminProductRow(row: Record<string, unknown>): AdminProductRow | null {
  const name = firstString(row, ["name", "title", "product_name"]);

  if (!name) {
    return null;
  }

  return {
    id: firstString(row, ["id", "product_id", "uuid"]) || slugify(name),
    name,
    slug: firstString(row, ["slug", "product_slug", "handle"]) || slugify(name),
    collection: firstString(row, ["collection", "collection_name", "category", "category_name"]),
    collectionSlug: firstString(row, ["collection_slug", "collectionSlug", "category_slug"]),
    material: firstString(row, ["material", "product_material", "type"]),
    price: firstNumber(row, ["price", "amount", "unit_price"]) ?? 0,
    description: firstString(row, ["description", "summary", "excerpt"]),
    featured: firstBoolean(row, ["featured", "is_featured"]) ?? false,
    bestSeller: firstBoolean(row, ["best_seller", "bestSeller", "is_best_seller"]) ?? false,
    stock: firstNumber(row, ["stock", "inventory", "available", "quantity"]) ?? 0,
    sku: firstString(row, ["sku", "product_sku"]),
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

function normalizeNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeStock(value: string) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return 0;
  }

  return Math.max(0, Math.round(parsed));
}

function normalizeSlug(value: string) {
  return value.trim().toLowerCase();
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/["']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
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

  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

function firstBoolean(row: Record<string, unknown>, keys: string[]) {
  const value = firstValue(row, keys);

  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value !== 0;
  }

  if (typeof value === "string") {
    return ["true", "1", "yes", "y"].includes(value.toLowerCase());
  }

  return undefined;
}

function parseMaybeJson(value: unknown) {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return value;
  }

  if (
    (trimmed.startsWith("[") && trimmed.endsWith("]")) ||
    (trimmed.startsWith("{") && trimmed.endsWith("}"))
  ) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return value;
    }
  }

  return value;
}
