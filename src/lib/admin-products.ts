import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { isRecord, parseMaybeJson, toArray } from "@/lib/utils";

export type ProductStatus = "active" | "draft";

export interface ProductColorValue {
  id: string;
  displayName: string;
  hexValue: string;
}

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
  colors: ProductColorValue[];
  image?: string;
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
  colors: ProductColorValue[];
  image: string;
  imageFile?: File | null;
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
    colors: [],
    image: "",
    imageFile: null,
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
    colors: row.colors.map((color, index) => normalizeAdminProductColor(color, index)).filter(
      (color): color is ProductColorValue => color !== null,
    ),
    image: row.image ?? "",
    imageFile: null,
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

  const supabase = getSupabaseClient();
  const payload = buildAdminProductPayload(values);

  if (values.imageFile) {
    payload.image = await uploadProductImage(values.imageFile, values);
  }

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
    colors: normalizeAdminProductColors(values.colors),
    image: values.image.trim(),
  };
}

async function uploadProductImage(file: File, values: ProductFormValues) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Only image uploads are supported.");
  }

  if (file.size > 10 * 1024 * 1024) {
    throw new Error("Image must be smaller than 10MB.");
  }

  const supabase = getSupabaseClient();
  const fileName = buildProductImagePath(values, file);
  const { error: uploadError } = await supabase.storage
    .from("product-images")
    .upload(fileName, file);

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data } = supabase.storage.from("product-images").getPublicUrl(fileName);
  return data.publicUrl;
}

function buildProductImagePath(values: ProductFormValues, file: File) {
  const baseName = slugify(values.slug || values.name || `product-${Date.now()}`) || `product-${Date.now()}`;
  const extension = file.name.split(".").pop()?.replace(/[^a-z0-9]/gi, "").toLowerCase() || "jpg";
  return `${baseName}-${Date.now()}.${extension}`;
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
    image: firstString(row, ["image", "image_url", "thumbnail", "hero_image"]),
    featured: firstBoolean(row, ["featured", "is_featured"]) ?? false,
    bestSeller: firstBoolean(row, ["best_seller", "bestSeller", "is_best_seller"]) ?? false,
    stock: firstNumber(row, ["stock", "inventory", "available", "quantity"]) ?? 0,
    sku: firstString(row, ["sku", "product_sku"]),
    status: normalizeStatus(firstString(row, ["status", "product_status"])) ?? "draft",
    colors: normalizeAdminProductColors(firstValue(row, ["colors", "swatches", "colorways"])),
  };
}

export function normalizeAdminProductColors(rawValue: unknown): ProductColorValue[] {
  const values = toArray(rawValue);

  if (values.length > 0) {
    return values
      .map((value, index) => normalizeAdminProductColor(value, index))
      .filter((color): color is ProductColorValue => color !== null);
  }

  if (typeof rawValue === "string") {
    const trimmed = rawValue.trim();

    if (!trimmed) {
      return [];
    }

    const entries = trimmed.includes(",") ? trimmed.split(",") : [trimmed];

    return entries
      .map((value, index) => normalizeAdminProductColor(value.trim(), index))
      .filter((color): color is ProductColorValue => color !== null);
  }

  if (isRecord(rawValue)) {
    const color = normalizeAdminProductColor(rawValue, 0);
    return color ? [color] : [];
  }

  return [];
}

function normalizeAdminProductColor(value: unknown, index: number): ProductColorValue | null {
  if (typeof value === "string") {
    const displayName = value.trim();

    if (!displayName) {
      return null;
    }

    return {
      id: `color-${index + 1}`,
      displayName,
      hexValue: isValidCssColorValue(displayName) ? displayName : "",
    };
  }

  if (!isRecord(value)) {
    return null;
  }

  const displayName = firstString(value, ["displayName", "display_name", "name", "label", "title"]);
  const hexValue =
    firstString(value, ["hexValue", "hex_value", "hex", "value", "color"]) ||
    (displayName && isValidCssColorValue(displayName) ? displayName : "");

  if (!displayName && !hexValue) {
    return null;
  }

  return {
    id: firstString(value, ["id", "color_id"]) || `color-${index + 1}`,
    displayName: displayName || hexValue,
    hexValue,
  };
}

export function isValidCssColorValue(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return false;
  }

  if (typeof document === "undefined") {
    return /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(trimmed);
  }

  const probe = document.createElement("span");
  probe.style.color = "";
  probe.style.color = trimmed;
  return probe.style.color !== "";
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

