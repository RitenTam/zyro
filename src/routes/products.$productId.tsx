import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { getProduct, getRelatedProducts, type Product, type Variant } from "@/lib/products";
import { useCart } from "@/contexts/cart";

export const Route = createFileRoute("/products/$productId")({
  loader: ({ params }): { product: Product } => {
    const product = getProduct(params.productId);
    if (!product) throw notFound();
    return { product };
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
  notFoundComponent: () => (
    <div className="pt-20 pb-32 px-6 text-center max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Product Not Found</h1>
      <Link to="/collections" className="btn-primary inline-block">
        Browse Cases
      </Link>
    </div>
  ),
  component: ProductPage,
});

function ProductPage() {
  const { product } = Route.useLoaderData() as { product: Product };
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [selectedVariant, setSelectedVariant] = useState<Variant | undefined>(
    product.variants?.[0]
  );
  const relatedProducts = getRelatedProducts(product.id, 3);

  return (
    <>
      <section className="pt-24 pb-20 px-6 max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Image */}
        <div className="relative">
          <div className="aspect-[3/4] bg-card overflow-hidden lg:sticky lg:top-24">
              <ResponsiveImage
                src={selectedVariant?.images?.[0] ?? product.image}
                alt={product.name}
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="w-full h-full object-cover"
              />
          </div>
        </div>

        {/* Details */}
        <div className="space-y-8">
          <div>
            <p className="text-sm text-foreground/60 mb-2 uppercase tracking-wide">
              {product.collection}
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
              {product.name}
            </h1>
            <p className="text-base text-foreground/70 mb-4 leading-relaxed">
              {product.description}
            </p>
            <div className="flex items-baseline gap-4">
              <p className="text-3xl font-bold">${selectedVariant?.price ?? product.price}</p>
              <p className="text-sm text-foreground/60">incl. VAT where applicable</p>
            </div>
          </div>

          {/* Color Selector */}
          <div>
            <h3 className="text-sm font-semibold mb-4">Color</h3>
            <div className="flex flex-wrap gap-3">
              {product.colors.map((color) => (
                <button
                  key={color.name}
                  onClick={() => {
                    setSelectedColor(color);
                    if (product.variants) {
                      const v = product.variants.find((vv) => vv.options?.color === color.name);
                      if (v) setSelectedVariant(v);
                    }
                  }}
                  className={`w-10 h-10 rounded-full border-2 transition-all ${
                    (selectedVariant?.options?.color === color.name || selectedColor.hex === color.hex)
                      ? "border-foreground scale-110"
                      : "border-white/20 hover:border-white/40"
                  }`}
                  style={{ backgroundColor: color.hex }}
                  aria-label={color.name}
                  aria-pressed={selectedVariant?.options?.color === color.name}
                />
              ))}
            </div>
            <p className="text-sm text-foreground/60 mt-3">Select a color to see availability.</p>
          </div>

          {/* Specs */}
          <div className="border-t border-white/10 pt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {product.specs.map((spec) => (
              <div key={spec.name}>
                <p className="text-xs text-foreground/60 uppercase tracking-wide mb-1">
                  {spec.name}
                </p>
                <p className="font-semibold">{spec.value}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <AddToCartButton product={product} selectedVariant={selectedVariant} selectedColor={selectedColor} />
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="py-24 px-6 max-w-7xl mx-auto border-t border-white/10">
          <h2 className="text-2xl font-bold tracking-tight mb-8">You might also like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.map((p) => (
              <Link
                key={p.id}
                to="/products/$productId"
                params={{ productId: p.id }}
                className="group"
              >
                <div className="aspect-[3/4] bg-card overflow-hidden mb-4 transition-shadow group-hover:shadow-lg">
                  <ResponsiveImage
                    src={p.image}
                    alt={p.name}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    width={600}
                    height={800}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <h3 className="font-semibold text-base">{p.name}</h3>
                <p className="text-sm text-foreground/60 mt-1">${p.price}</p>
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
  selectedColor: { name: string; hex: string };
}) {
  const { addItem } = useCart();
  const price = selectedVariant?.price ?? product.price;
  const available = typeof selectedVariant?.available === "number"
    ? selectedVariant!.available
    : product.variants?.reduce((s, v) => s + (v.available ?? 0), 0) ?? 0;

  function handleAdd() {
    if (available <= 0) return;
    addItem({
      productId: product.id,
      variantId: selectedVariant?.id,
      name: product.name + (selectedVariant?.options?.color ? ` — ${selectedVariant.options.color}` : ""),
      price,
      qty: 1,
      image: selectedVariant?.images?.[0] ?? product.image,
      color: selectedVariant?.options?.color ?? selectedColor.name,
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
        {isOut ? "Unavailable" : `Add to Cart — $${price}`}
      </button>
    </div>
  );
}