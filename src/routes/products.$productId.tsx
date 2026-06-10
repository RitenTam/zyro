import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { useCart } from "@/contexts/cart";
import ResponsiveImage from "@/components/ui/responsive-image";
import { formatPrice } from "@/lib/utils";
import {
  getProductByIdentifier,
  getProductPathParam,
  getRelatedProducts,
  productCatalogQueryOptions,
  type Product,
  type ProductColor,
  type Variant,
} from "@/lib/products";

export const Route = createFileRoute("/products/$productId")({
  loader: async ({ params, context }): Promise<{ product: Product; relatedProducts: Product[] }> => {
    const products = await context.queryClient.ensureQueryData(productCatalogQueryOptions());
    const product = getProductByIdentifier(products, params.productId);
    if (!product) throw notFound();
    return { product, relatedProducts: getRelatedProducts(products, product, 3) };
  },
  head: ({ loaderData }) => {
    const p = loaderData?.product;
    if (!p) return { meta: [{ title: "Product — Zyro" }] };
    return {
      meta: [
        { title: `${p.name} — Zyro` },
        { name: "description", content: p.description },
      ],
    };
  },
  pendingComponent: ProductLoadingState,
  errorComponent: ProductErrorState,
  notFoundComponent: () => (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-3xl items-center justify-center px-6 py-24">
      <div className="space-y-6 text-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-light tracking-tight sm:text-4xl">Product not found</h1>
          <p className="text-sm leading-7 text-foreground/55">This item may have been removed or the link is no longer current.</p>
        </div>
        <Link to="/collections" className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-sm text-foreground/80 transition-colors hover:bg-white/[0.08]">
          Browse all products
        </Link>
      </div>
    </div>
  ),
  component: ProductPage,
});

function ProductLoadingState() {
  return (
    <div className="mx-auto grid min-h-[calc(100vh-8rem)] max-w-7xl gap-8 px-6 py-24 lg:grid-cols-2 lg:gap-12">
      <div className="aspect-[3/4] animate-pulse rounded-[2rem] bg-white/[0.04]" />
      <div className="space-y-6 py-2">
        <div className="h-4 w-24 animate-pulse rounded-full bg-white/[0.06]" />
        <div className="h-14 w-3/4 animate-pulse rounded-2xl bg-white/[0.06]" />
        <div className="h-5 w-full animate-pulse rounded-full bg-white/[0.05]" />
        <div className="h-5 w-5/6 animate-pulse rounded-full bg-white/[0.05]" />
        <div className="h-12 w-40 animate-pulse rounded-full bg-white/[0.06]" />
        <div className="grid grid-cols-2 gap-4 pt-8">
          <div className="h-24 animate-pulse rounded-2xl bg-white/[0.04]" />
          <div className="h-24 animate-pulse rounded-2xl bg-white/[0.04]" />
        </div>
      </div>
    </div>
  );
}

function ProductErrorState({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();

  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-3xl items-center justify-center px-6 py-24 text-center">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-light tracking-tight sm:text-4xl">Unable to load product</h1>
          <p className="text-sm leading-7 text-foreground/55">The catalog query failed. Try again or browse the product list while we recover.</p>
          <p className="text-xs text-foreground/35">{error.message}</p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-sm text-foreground/80 transition-colors hover:bg-white/[0.08]"
          >
            Try again
          </button>
          <Link to="/collections" className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-sm text-foreground/80 transition-colors hover:bg-white/[0.08]">
            Browse products
          </Link>
        </div>
      </div>
    </div>
  );
}

function ProductPage() {
  const { product, relatedProducts } = Route.useLoaderData() as { product: Product; relatedProducts: Product[] };
  const [selectedColor, setSelectedColor] = useState<ProductColor | null>(product.colors[0] ?? null);
  const [selectedVariant, setSelectedVariant] = useState<Variant | undefined>(() => selectInitialVariant(product, product.colors[0]?.name));

  useEffect(() => {
    const nextColor = product.colors[0] ?? null;
    setSelectedColor(nextColor);
    setSelectedVariant(selectInitialVariant(product, nextColor?.name));
  }, [product]);

  useEffect(() => {
    console.debug("[products] Product page rendered stock", {
      id: product.id,
      slug: product.slug,
      stock: product.stock,
      selectedVariantAvailable: selectedVariant?.available ?? null,
    });
  }, [product.id, product.slug, product.stock, selectedVariant?.available]);

  const primaryImage = selectedVariant?.images?.[0] ?? product.image;

  return (
    <>
      <section className="pt-24 pb-20 px-6 max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 lg:gap-12">
        <div className="relative">
          <div className="aspect-[3/4] bg-card overflow-hidden lg:sticky lg:top-24">
            {primaryImage ? (
              <ResponsiveImage
                src={primaryImage}
                alt={product.name}
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-white/[0.03] text-sm text-foreground/40">Image coming soon</div>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <div>
            {product.collection ? <p className="text-sm text-foreground/60 mb-2 uppercase tracking-wide">{product.collection}</p> : null}
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
              {product.name}
            </h1>
            {product.description ? <p className="text-base text-foreground/70 mb-4 leading-relaxed">{product.description}</p> : null}
            <div className="flex items-baseline gap-4">
              <p className="text-3xl font-bold">{formatPrice(selectedVariant?.price ?? product.price)}</p>
              <p className="text-sm text-foreground/60">incl. VAT where applicable</p>
            </div>
            <p className="mt-3 text-sm text-foreground/55">Stock: {product.stock}</p>
          </div>

          {product.colors.length > 0 ? (
            <div>
              <h3 className="text-sm font-semibold mb-4">Color</h3>
              <div className="flex flex-wrap gap-3">
                {product.colors.map((color) => (
                  <button
                    key={color.name}
                    type="button"
                    onClick={() => {
                      setSelectedColor(color);
                      const nextVariant = findVariantForColor(product, color.name);
                      if (nextVariant) {
                        setSelectedVariant(nextVariant);
                      }
                    }}
                    className={`w-10 h-10 rounded-full border-2 transition-all ${
                      selectedVariant?.options?.color === color.name || selectedColor?.name === color.name
                        ? "border-foreground scale-110"
                        : "border-white/20 hover:border-white/40"
                    }`}
                    style={{ backgroundColor: color.hex }}
                    aria-label={color.name}
                    aria-pressed={selectedVariant?.options?.color === color.name}
                  />
                ))}
              </div>
            </div>
          ) : null}

          {product.specs.length > 0 ? (
            <div className="border-t border-white/10 pt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {product.specs.map((spec) => (
                <div key={spec.name}>
                  <p className="text-xs text-foreground/60 uppercase tracking-wide mb-1">{spec.name}</p>
                  <p className="font-semibold">{spec.value}</p>
                </div>
              ))}
            </div>
          ) : null}

          <AddToCartButton product={product} selectedVariant={selectedVariant} selectedColor={selectedColor} />
        </div>
      </section>

      {relatedProducts.length > 0 && (
        <section className="py-24 px-6 max-w-7xl mx-auto border-t border-white/10">
          <h2 className="text-2xl font-bold tracking-tight mb-8">You might also like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.map((p) => (
              <Link
                key={p.id}
                to="/products/$productId"
                params={{ productId: getProductPathParam(p) }}
                className="group"
              >
                <div className="aspect-[3/4] bg-card overflow-hidden mb-4 transition-shadow group-hover:shadow-lg">
                  {p.image ? (
                    <ResponsiveImage
                      src={p.image}
                      alt={p.name}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      width={600}
                      height={800}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-white/[0.03] text-sm text-foreground/40">Image coming soon</div>
                  )}
                </div>
                <h3 className="font-semibold text-base">{p.name}</h3>
                <p className="text-sm text-foreground/60 mt-1">{formatPrice(p.price)}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}

function AddToCartButton({
  product,
  selectedVariant,
  selectedColor,
}: {
  product: Product;
  selectedVariant?: Variant;
  selectedColor: ProductColor | null;
}) {
  const { addItem } = useCart();
  const price = selectedVariant?.price ?? product.price;

  const available = product.stock;

  useEffect(() => {
    console.debug("[products] Product UI stock rendered", {
      id: product.id,
      slug: product.slug,
      stock: product.stock,
      selectedVariantId: selectedVariant?.id ?? null,
    });
  }, [product.id, product.slug, product.stock, selectedVariant?.id]);

  function handleAdd() {
    if (available <= 0) return;
    addItem({
      productId: product.id,
      variantId: selectedVariant?.id,
      name: product.name + (selectedVariant?.options?.color ? ` — ${selectedVariant.options.color}` : ""),
      price,
      qty: 1,
      image: selectedVariant?.images?.[0] ?? product.image,
      color: selectedVariant?.options?.color ?? selectedColor?.name ?? product.collection,
    });
  }

  const isLow = available > 0 && available < 10;
  const isOut = available === 0;

  return (
    <div>
      <div className="mb-4">
        {isOut ? (
          <p className="text-sm text-red-500 font-semibold">Out of stock</p>
        ) : isLow ? (
          <p className="text-sm text-amber-500 font-semibold">Only {available} left — order soon</p>
        ) : (
          <p className="text-sm text-foreground/70">In stock — ships within 1–2 business days</p>
        )}
      </div>

      <button
        className={`btn-primary w-full ${isOut ? "opacity-50 cursor-not-allowed" : ""}`}
        onClick={handleAdd}
        aria-label={`Add ${product.name} to cart`}
        disabled={isOut}
      >
        {isOut ? "Unavailable" : `Add to Cart — ${formatPrice(price)}`}
      </button>
    </div>
  );
}

function selectInitialVariant(product: Product, colorName?: string) {
  if (colorName) {
    const matched = findVariantForColor(product, colorName);
    if (matched) {
      return matched;
    }
  }

  return product.variants[0];
}

function findVariantForColor(product: Product, colorName: string) {
  return product.variants.find((variant) => variant.options?.color === colorName || variant.options?.colour === colorName);
}