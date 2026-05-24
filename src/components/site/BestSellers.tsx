import { Link } from "@tanstack/react-router";
import ResponsiveImage from "@/components/ui/responsive-image";
import { getProductPathParam, pickBestSellerProducts, useProductsQuery } from "@/lib/products";

export function BestSellers() {
  const { data: products = [], isPending, isError } = useProductsQuery();
  const bestSellers = pickBestSellerProducts(products, 4);

  return (
    <section className="py-32 px-6 sm:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-16">
        <div>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tighter max-w-md text-balance">
            Best Sellers.
          </h2>
        </div>
      </div>

      {isPending ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="space-y-5">
              <div className="aspect-[4/5] rounded-[1.25rem] bg-white/[0.04] animate-pulse" />
              <div className="space-y-3">
                <div className="h-4 w-2/3 rounded-full bg-white/[0.05] animate-pulse" />
                <div className="h-3 w-1/2 rounded-full bg-white/[0.04] animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-8 text-sm text-foreground/60">
          We could not load best sellers right now.
        </div>
      ) : bestSellers.length === 0 ? (
        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-8 text-sm text-foreground/60">
          Best sellers will appear here once the catalog is populated.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bestSellers.map((p) => (
          <Link
            to="/products/$productId"
            params={{ productId: getProductPathParam(p) }}
            key={p.id}
            className="group block"
          >
            <div className="relative aspect-[4/5] bg-surface overflow-hidden">
              {p.image ? (
                <ResponsiveImage
                  src={p.image}
                  alt={p.name}
                  loading="lazy"
                  width={800}
                  height={1000}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-white/[0.03] text-sm text-foreground/40">Image coming soon</div>
              )}
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
            <div className="flex gap-1.5 mt-3">
              {p.colors.slice(0, 4).map((c) => (
                <span
                  key={c.name}
                  className="size-3 rounded-full border border-white/15"
                  style={{ background: c.hex }}
                />
              ))}
            </div>
          </Link>
          ))}
        </div>
      )}
    </section>
  );
}