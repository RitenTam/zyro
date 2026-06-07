import { queryOptions, useQuery } from "@tanstack/react-query";

import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client";

export type ProductColor = { name: string; hex: string };
export type ProductMaterial = string;

export interface Variant {
  id: string;
  sku?: string;
  price?: number;
  available?: number;
  images?: string[];
  options?: Record<string, string>;
}

export interface Specification {
  name: string;
  value: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  collection: string;
  collectionSlug?: string;
  material: ProductMaterial;
  price: number;
  stock: number;
  description: string;
  image: string;
  colors: ProductColor[];
  variants: Variant[];
  specs: Specification[];
  featured?: boolean;
  bestSeller?: boolean;
}

export const productCatalogQueryKey = ["products", "catalog"] as const;

export function productCatalogQueryOptions() {
  return queryOptions({
    queryKey: productCatalogQueryKey,
    queryFn: fetchProducts,
    staleTime: 5 * 60 * 1000,
  });
}

export function useProductsQuery() {
  return useQuery(productCatalogQueryOptions());
}

export async function fetchProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured()) {
    throw new Error("Product catalog is unavailable until Supabase is configured.");
  }

  const { data, error } = await getSupabaseClient().from("products").select("*");

  if (error) {
    throw new Error(error.message);
  }

  const products = (data ?? [])
    .map((row) => normalizeProductRow(row as Record<string, unknown>))
    .filter((product): product is Product => product !== null)
    .sort(sortProducts);

  console.debug("[products] Supabase catalog fetch", {
    total: products.length,
    stockByProduct: products.map((product) => ({
      id: product.id,
      slug: product.slug,
      stock: product.stock,
    })),
  });

  return products;
}

export function getProductByIdentifier(products: Product[], identifier: string) {
  const normalizedIdentifier = normalizeIdentifier(identifier);
  return products.find((product) => {
    return [product.id, product.slug, slugify(product.name)].some((candidate) => normalizeIdentifier(candidate) === normalizedIdentifier);
  });
}

export function getProductPathParam(product: Pick<Product, "id" | "slug" | "name">) {
  return product.slug || slugify(product.name) || product.id;
}

export function getRelatedProducts(products: Product[], product: Product, limit: number = 3): Product[] {
  const sameCollection = products.filter((candidate) => candidate.id !== product.id && candidate.collection === product.collection);
  const sameMaterial = products.filter((candidate) => candidate.id !== product.id && candidate.material === product.material && !sameCollection.some((entry) => entry.id === candidate.id));
  const remaining = products.filter(
    (candidate) =>
      candidate.id !== product.id &&
      !sameCollection.some((entry) => entry.id === candidate.id) &&
      !sameMaterial.some((entry) => entry.id === candidate.id),
  );

  return [...sameCollection, ...sameMaterial, ...remaining].slice(0, limit);
}

export function pickFeaturedProduct(products: Product[]) {
  return products.find((product) => product.featured) ?? products.find((product) => product.bestSeller) ?? products[0] ?? null;
}

export function pickBestSellerProducts(products: Product[], limit: number = 4) {
  const flagged = products.filter((product) => product.bestSeller || product.featured);
  const fallback = products.filter((product) => !flagged.some((entry) => entry.id === product.id));
  return [...flagged, ...fallback].slice(0, limit);
}

function normalizeProductRow(row: Record<string, unknown>): Product | null {
  const name = firstString(row, ["name", "title", "product_name"]);
  if (!name) {
    return null;
  }

  const slug = firstString(row, ["slug", "product_slug", "handle"]) || slugify(name);
  const id = firstString(row, ["id", "product_id", "uuid"]) || slug;
  const collection = firstString(row, ["collection", "collection_name", "category", "category_name"]) || "Collection";
  const collectionSlug = firstString(row, ["collection_slug", "collectionHandle", "category_slug"]);
  const material = firstString(row, ["material", "product_material", "type"]) || collection;
  const description = firstString(row, ["description", "summary", "excerpt"]) || "";
  const variants = normalizeVariants(firstValue(row, ["variants", "variant_data", "variant_options"]));
  const colors = normalizeColors(firstValue(row, ["colors", "swatches", "colorways"]), variants);
  const specs = normalizeSpecifications(firstValue(row, ["specs", "specifications", "features"]));
  const price = firstNumber(row, ["price", "amount", "unit_price"]) ?? variants[0]?.price ?? 0;
  const stock = firstNumber(row, ["stock", "inventory", "available", "quantity"]) ?? 0;
  const image = firstString(row, ["image", "image_url", "thumbnail", "hero_image"]) || variants[0]?.images?.[0] || "";

  return {
    id,
    slug,
    name,
    collection,
    collectionSlug,
    material,
    price,
    stock,
    description,
    image,
    colors,
    variants,
    specs,
    featured: firstBoolean(row, ["featured", "is_featured"]),
    bestSeller: firstBoolean(row, ["best_seller", "bestSeller", "is_best_seller"]),
  };
}

function normalizeVariants(rawValue: unknown): Variant[] {
  const values = toArray(rawValue);

  return values
    .map((value, index) => {
      if (!isRecord(value)) {
        return null;
      }

      const id = firstString(value, ["id", "variant_id", "sku"]) || `variant-${index + 1}`;
      const options = normalizeOptions(firstValue(value, ["options", "option_values", "attributes"]));
      const images = toStringArray(firstValue(value, ["images", "image_urls", "media"]));
      const price = firstNumber(value, ["price", "amount", "unit_price"]);
      const available = firstNumber(value, ["available", "inventory", "stock", "quantity"]);
      const sku = firstString(value, ["sku"]);

      return {
        id,
        sku,
        price,
        available,
        images,
        options,
      };
    })
    .filter((variant): variant is Variant => variant !== null);
}

function normalizeColors(rawValue: unknown, variants: Variant[]): ProductColor[] {
  const values = toArray(rawValue)
    .map((value) => {
      if (!isRecord(value)) {
        return null;
      }

      const name = firstString(value, ["name", "label", "title"]);
      if (!name) {
        return null;
      }

      return {
        name,
        hex: firstString(value, ["hex", "value", "color"]) || colorHexFallback(name),
      } satisfies ProductColor;
    })
    .filter((color): color is ProductColor => color !== null);

  if (values.length > 0) {
    return uniqueColors(values);
  }

  const derived = variants
    .map((variant) => {
      const colorName = variant.options?.color || variant.options?.colour || variant.options?.shade;
      if (!colorName) {
        return null;
      }

      return {
        name: colorName,
        hex: variant.options?.hex || variant.options?.colorHex || colorHexFallback(colorName),
      } satisfies ProductColor;
    })
    .filter((color): color is ProductColor => color !== null);

  return uniqueColors(derived);
}

function normalizeSpecifications(rawValue: unknown): Specification[] {
  return toArray(rawValue)
    .map((value) => {
      if (!isRecord(value)) {
        return null;
      }

      const name = firstString(value, ["name", "label", "title"]);
      const specValue = firstString(value, ["value", "detail", "text"]);

      if (!name || !specValue) {
        return null;
      }

      return { name, value: specValue } satisfies Specification;
    })
    .filter((spec): spec is Specification => spec !== null);
}

function normalizeOptions(rawValue: unknown): Record<string, string> {
  if (!isRecord(rawValue)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(rawValue).map(([key, value]) => [key, typeof value === "string" ? value : String(value ?? "")]),
  );
}

function sortProducts(a: Product, b: Product) {
  if (Boolean(a.featured) !== Boolean(b.featured)) {
    return a.featured ? -1 : 1;
  }

  if (Boolean(a.bestSeller) !== Boolean(b.bestSeller)) {
    return a.bestSeller ? -1 : 1;
  }

  return a.name.localeCompare(b.name);
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

  if ((trimmed.startsWith("[") && trimmed.endsWith("]")) || (trimmed.startsWith("{") && trimmed.endsWith("}"))) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return value;
    }
  }

  return value;
}

function toArray(value: unknown): unknown[] {
  const parsed = parseMaybeJson(value);
  if (Array.isArray(parsed)) {
    return parsed;
  }

  return [];
}

function toStringArray(value: unknown): string[] {
  return toArray(value)
    .map((entry) => {
      if (typeof entry === "string") {
        return entry.trim();
      }

      return "";
    })
    .filter(Boolean);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeIdentifier(value: string) {
  return value.trim().toLowerCase();
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function uniqueColors(colors: ProductColor[]) {
  const seen = new Set<string>();
  return colors.filter((color) => {
    const key = color.name.trim().toLowerCase();
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function colorHexFallback(name: string) {
  const normalized = name.trim().toLowerCase();
  const palette: Record<string, string> = {
    onyx: "#0a0a0a",
    midnight: "#0a0a0a",
    black: "#101010",
    bone: "#e6e1d6",
    sand: "#b89c7c",
    slate: "#7a8088",
    storm: "#525a66",
    charcoal: "#2a2a2c",
    graphite: "#3d3d40",
    ivory: "#dcd6c8",
    frost: "#cdd5dc",
  };

  return palette[normalized] ?? "#7a8088";
}
