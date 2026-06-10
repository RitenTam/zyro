import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";

import ProductCard from "@/components/site/ProductCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type Product, useProductsQuery } from "@/lib/products";

export const Route = createFileRoute("/collections")({
  head: () => ({
    meta: [
      { title: "Cases — Zyro" },
      { name: "description", content: "A single premium catalog of phone cases with refined filters for device, material, color, and sort." },
    ],
  }),
  component: CollectionsPage,
});

function CollectionsPage() {
  const { data: products = [], isPending, isError } = useProductsQuery();
  const [deviceFilter, setDeviceFilter] = useState("all");
  const [materialFilter, setMaterialFilter] = useState("all");
  const [colorFilter, setColorFilter] = useState("all");
  const [sortFilter, setSortFilter] = useState("featured");

  useEffect(() => {
    console.debug("[products] Collections page rendered stock", {
      total: products.length,
      stockByProduct: products.map((product) => ({
        id: product.id,
        slug: product.slug,
        stock: product.stock,
      })),
    });
  }, [products]);

  const deviceOptions = mergeUniqueOptions(DEFAULT_DEVICE_OPTIONS, collectDeviceOptions(products));
  const materialOptions = mergeUniqueOptions(DEFAULT_MATERIAL_OPTIONS, collectMaterialOptions(products));
  const colorOptions = mergeUniqueOptions([], collectColorOptions(products));

  const filteredProducts = products
    .filter((product) => matchesProductFilters(product, deviceFilter, materialFilter, colorFilter))
    .slice()
    .sort((left, right) => sortProducts(left, right, sortFilter));

  const activeFilterCount =
    [deviceFilter, materialFilter, colorFilter].filter((value) => value !== "all").length +
    (sortFilter !== "featured" ? 1 : 0);
  const isFiltered = activeFilterCount > 0;

  return (
    <div className="relative overflow-hidden pt-24 pb-32">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[32rem] bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.12),_transparent_66%)]" />
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-3xl space-y-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-foreground/45">Cases</p>
          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            One premium catalog, refined by fit and finish.
          </h1>
          <p className="max-w-2xl text-sm leading-7 text-foreground/60 sm:text-base">
            Browse the full collection as a single cohesive line-up. Filter by device, material, color, and sort to find the right case without breaking the visual rhythm of the page.
          </p>
        </div>

        <div className="mt-12 rounded-[2rem] border border-white/10 bg-white/[0.03] p-4 shadow-[0_24px_120px_rgba(0,0,0,0.18)] backdrop-blur-sm sm:p-6">
          <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr_1fr_0.95fr_auto]">
            <FilterField label="Device">
              <Select value={deviceFilter} onValueChange={setDeviceFilter}>
                <SelectTrigger className="h-11 rounded-full border-white/10 bg-background/40 px-4 text-sm shadow-none">
                  <SelectValue placeholder="Any device" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any device</SelectItem>
                  {deviceOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FilterField>

            <FilterField label="Material">
              <Select value={materialFilter} onValueChange={setMaterialFilter}>
                <SelectTrigger className="h-11 rounded-full border-white/10 bg-background/40 px-4 text-sm shadow-none">
                  <SelectValue placeholder="Any material" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any material</SelectItem>
                  {materialOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FilterField>

            <FilterField label="Color">
              <Select value={colorFilter} onValueChange={setColorFilter}>
                <SelectTrigger className="h-11 rounded-full border-white/10 bg-background/40 px-4 text-sm shadow-none">
                  <SelectValue placeholder="Any color" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any color</SelectItem>
                  {colorOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FilterField>

            <FilterField label="Sort">
              <Select value={sortFilter} onValueChange={setSortFilter}>
                <SelectTrigger className="h-11 rounded-full border-white/10 bg-background/40 px-4 text-sm shadow-none">
                  <SelectValue placeholder="Featured" />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FilterField>

            <div className="flex items-end">
              <button
                type="button"
                onClick={() => {
                  setDeviceFilter("all");
                  setMaterialFilter("all");
                  setColorFilter("all");
                  setSortFilter("featured");
                }}
                className={`inline-flex h-11 items-center justify-center rounded-full border px-5 text-[10px] font-semibold uppercase tracking-[0.28em] transition-colors ${
                  isFiltered
                    ? "border-white/15 bg-white text-background hover:bg-white/90"
                    : "border-white/10 bg-white/[0.04] text-foreground/45"
                }`}
              >
                Reset
              </button>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4 text-xs text-foreground/50">
            <span>
              Showing {filteredProducts.length} of {products.length} cases
            </span>
            {activeFilterCount > 0 ? (
              <span>
                {activeFilterCount} active filter{activeFilterCount === 1 ? "" : "s"}
              </span>
            ) : (
              <span>Curated for a single product ecosystem</span>
            )}
          </div>
        </div>

        <div className="mt-10">
          {isPending ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="space-y-4">
                  <div className="aspect-[4/5] rounded-[1.75rem] bg-white/[0.04] animate-pulse" />
                  <div className="space-y-3 px-1">
                    <div className="h-3 w-24 rounded-full bg-white/[0.05] animate-pulse" />
                    <div className="h-4 w-2/3 rounded-full bg-white/[0.05] animate-pulse" />
                    <div className="h-3 w-1/2 rounded-full bg-white/[0.04] animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-8 text-sm text-foreground/60">
              We could not load the product catalog right now.
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-8 text-sm text-foreground/60">
              No cases are available yet.
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-8 text-sm text-foreground/60">
              No cases match the selected filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filteredProducts.map((product) => {
                const deviceSummary = summarizeProductDevices(product);

                return (
                  <ProductCard
                    key={product.id}
                    product={product}
                    label={deviceSummary}
                    details={
                      <>
                        <p className="mt-1 text-sm text-foreground/55">{product.material}</p>
                        <p className="mt-1 text-xs text-foreground/45">Stock: {product.stock}</p>
                      </>
                    }
                    footer={
                      <div className="flex items-center gap-2 pt-1">
                        {product.colors.slice(0, 4).map((color) => (
                          <span
                            key={color.name}
                            className="size-2.5 rounded-full border border-white/15"
                            style={{ backgroundColor: color.hex }}
                          />
                        ))}
                      </div>
                    }
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="space-y-2">
      <span className="block text-[10px] font-semibold uppercase tracking-[0.28em] text-foreground/40">{label}</span>
      {children}
    </label>
  );
}

function matchesProductFilters(product: Product, deviceFilter: string, materialFilter: string, colorFilter: string) {
  return (
    matchesDevice(product, deviceFilter) &&
    matchesMaterial(product, materialFilter) &&
    matchesColor(product, colorFilter)
  );
}

function matchesDevice(product: Product, deviceFilter: string) {
  if (deviceFilter === "all") {
    return true;
  }

  return collectProductDevices(product).some((device) => normalizeFilterValue(device) === normalizeFilterValue(deviceFilter));
}

function matchesMaterial(product: Product, materialFilter: string) {
  if (materialFilter === "all") {
    return true;
  }

  return normalizeFilterValue(product.material) === normalizeFilterValue(materialFilter);
}

function matchesColor(product: Product, colorFilter: string) {
  if (colorFilter === "all") {
    return true;
  }

  return product.colors.some((color) => normalizeFilterValue(color.name) === normalizeFilterValue(colorFilter));
}

function sortProducts(left: Product, right: Product, sortFilter: string) {
  switch (sortFilter) {
    case "price-asc":
      return left.price - right.price;
    case "price-desc":
      return right.price - left.price;
    case "name-desc":
      return right.name.localeCompare(left.name);
    case "name-asc":
      return left.name.localeCompare(right.name);
    case "featured":
    default:
      if (Boolean(left.featured) !== Boolean(right.featured)) {
        return left.featured ? -1 : 1;
      }

      if (Boolean(left.bestSeller) !== Boolean(right.bestSeller)) {
        return left.bestSeller ? -1 : 1;
      }

      return left.name.localeCompare(right.name);
  }
}

function collectDeviceOptions(products: Product[]) {
  const values = products.flatMap((product) => collectProductDevices(product));
  return uniqueValues(values);
}

function collectMaterialOptions(products: Product[]) {
  return uniqueValues(products.map((product) => product.material).filter(Boolean));
}

function collectColorOptions(products: Product[]) {
  return uniqueValues(products.flatMap((product) => product.colors.map((color) => color.name).filter(Boolean)));
}

function collectProductDevices(product: Product) {
  const sources = [
    product.name,
    product.collection,
    product.slug,
    product.description,
    ...product.specs.flatMap((spec) => [spec.name, spec.value]),
    ...product.variants.flatMap((variant) => Object.values(variant.options ?? {})),
  ];

  const values = sources.flatMap((source) => extractDeviceNames(source));
  return uniqueValues(values);
}

function summarizeProductDevices(product: Product) {
  const devices = collectProductDevices(product);

  if (devices.length === 0) {
    return "Device fit not specified";
  }

  return devices.slice(0, 2).join(" · ");
}

function extractDeviceNames(value: string) {
  const matches = value.match(/iPhone\s?\d+(?:\s?(?:Pro\sMax|Pro|Plus|Mini))?/gi) ?? [];
  return matches.map((match) => match.replace(/\s+/g, " ").trim());
}

function uniqueValues(values: string[]) {
  const seen = new Set<string>();

  return values
    .map((value) => value.trim())
    .filter((value) => Boolean(value))
    .filter((value) => {
      const key = normalizeFilterValue(value);
      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    });
}

function mergeUniqueOptions(preferred: string[], observed: string[]) {
  return uniqueValues([...preferred, ...observed]);
}

function normalizeFilterValue(value: string) {
  return value.trim().toLowerCase();
}

const DEFAULT_DEVICE_OPTIONS = [
  "iPhone 16",
  "iPhone 16 Pro",
  "iPhone 16 Pro Max",
  "iPhone 17 Pro",
  "iPhone 17 Pro Max",
];

const DEFAULT_MATERIAL_OPTIONS = ["Silicone", "Woven", "Clear"];

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "name-asc", label: "Name: A to Z" },
  { value: "name-desc", label: "Name: Z to A" },
];