import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { getProduct, products, type Product } from "@/lib/products";

export const Route = createFileRoute("/products/$productId")({
  loader: ({ params }): { product: Product } => {
    const product = getProduct(params.productId);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    const p = loaderData?.product;
    if (!p) {
      return { meta: [{ title: "Product — Aether" }] };
    }
    return {
      meta: [
        { title: `${p.name} — Aether` },
        { name: "description", content: p.description },
        { property: "og:title", content: `${p.name} — Aether` },
        { property: "og:description", content: p.tagline },
        { property: "og:image", content: p.image },
        { property: "twitter:image", content: p.image },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="pt-40 pb-32 px-6 max-w-3xl mx-auto text-center">
      <h1 className="text-4xl font-bold tracking-tighter">Product not found</h1>
      <Link
        to="/collections"
        className="inline-block mt-8 text-[10px] uppercase tracking-[0.3em] font-bold border-b border-foreground pb-1"
      >
        Back to collections
      </Link>
    </div>
  ),
  component: ProductPage,
});

function ProductPage() {
  const { product } = Route.useLoaderData() as { product: Product };
  const [color, setColor] = useState(product.colors[0]);
  const recommended = products.filter((p) => p.id !== product.id).slice(0, 3);

  return (
    <>
      <section className="pt-28 pb-20 px-6 sm:px-8 max-w-7xl mx-auto grid lg:grid-cols-[1.2fr_1fr] gap-12 lg:gap-16">
        {/* Image */}
        <div className="relative">
          <div className="aspect-[4/5] bg-surface overflow-hidden sticky top-24">
            <img
              key={color.hex}
              src={product.image}
              alt={`${product.name} in ${color.name}`}
              width={1080}
              height={1350}
              className="w-full h-full object-cover animate-fade"
            />
          </div>
        </div>

        {/* Details */}
        <div className="space-y-10">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-foreground/40 mb-4">
              {product.collection}
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tighter text-balance">
              {product.name}
            </h1>
            <p className="text-foreground/60 mt-4 text-sm leading-relaxed text-pretty max-w-md">
              {product.description}
            </p>
            <p className="mt-6 text-2xl font-semibold tabular-nums">${product.price}</p>
          </div>

          {/* Color */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[10px] uppercase tracking-[0.3em] text-foreground/40">
                Color
              </span>
              <span className="text-[10px] uppercase tracking-[0.25em] text-foreground/70">
                {color.name}
              </span>
            </div>
            <div className="flex gap-3">
              {product.colors.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setColor(c)}
                  aria-label={c.name}
                  className={`size-9 rounded-full border transition-all ${
                    color.hex === c.hex
                      ? "border-foreground scale-110"
                      : "border-white/10 hover:border-white/30"
                  }`}
                  style={{ background: c.hex }}
                />
              ))}
            </div>
          </div>

          {/* Material badge */}
          <div className="space-y-4">
            <span className="text-[10px] uppercase tracking-[0.3em] text-foreground/40 block">
              Material
            </span>
            <div className="inline-block px-4 py-2 border border-white/10 text-xs uppercase tracking-[0.25em]">
              {product.material}
            </div>
          </div>

          {/* CTAs */}
          <div className="flex items-center gap-4 pt-4 sticky bottom-4">
            <button className="flex-1 py-4 bg-foreground text-background text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-foreground/90 transition-all active:scale-[0.98]">
              Add to Cart — ${product.price}
            </button>
            <button
              aria-label="Save"
              className="size-12 flex items-center justify-center border border-white/10 hover:border-white/30 transition-all"
            >
              ♡
            </button>
          </div>

          {/* Features */}
          <div className="border-t border-white/5 pt-10 space-y-6">
            <span className="text-[10px] uppercase tracking-[0.3em] text-foreground/40 block">
              Engineering
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {product.features.map((f) => (
                <div key={f.label} className="space-y-1.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider">{f.label}</h4>
                  <p className="text-[11px] text-foreground/50 leading-relaxed">{f.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Recommended */}
      <section className="py-32 px-6 sm:px-8 max-w-7xl mx-auto border-t border-white/5">
        <p className="text-[10px] uppercase tracking-[0.3em] text-foreground/40 mb-12">
          You might also consider
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recommended.map((p) => (
            <Link
              to="/products/$productId"
              params={{ productId: p.id }}
              key={p.id}
              className="group block"
            >
              <div className="relative aspect-[4/5] bg-surface overflow-hidden">
                <img
                  src={p.image}
                  alt={p.name}
                  loading="lazy"
                  width={800}
                  height={1000}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="pt-5 flex justify-between items-start gap-4">
                <div>
                  <h3 className="text-sm font-semibold tracking-tight">{p.name}</h3>
                  <p className="text-[10px] uppercase tracking-[0.25em] text-foreground/40 mt-1">
                    {p.collection}
                  </p>
                </div>
                <div className="text-sm font-medium tabular-nums">${p.price}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}