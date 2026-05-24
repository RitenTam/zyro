import { createFileRoute, Link } from "@tanstack/react-router";
import ResponsiveImage from "@/components/ui/responsive-image";
import { getProductPathParam, useProductsQuery } from "@/lib/products";

export const Route = createFileRoute("/collections")({
  head: () => ({
    meta: [
      { title: "Shop — Zyro" },
      { name: "description", content: "Browse all available phone cases" },
    ],
  }),
  component: CollectionsPage,
});

function CollectionsPage() {
  const { data: products = [], isPending, isError } = useProductsQuery();

  return (
    <div className="pt-20 pb-32 max-w-7xl mx-auto px-6">
      <div className="mb-16 space-y-3">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">All Cases</h1>
        <p className="text-foreground/60">Available in multiple materials and colors.</p>
      </div>

      {isPending ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="space-y-4">
              <div className="aspect-[3/4] rounded-[1.25rem] bg-white/[0.04] animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 w-2/3 rounded-full bg-white/[0.05] animate-pulse" />
                <div className="h-3 w-1/2 rounded-full bg-white/[0.04] animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-8 text-sm text-foreground/60">
          We could not load the product catalog right now.
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-8 text-sm text-foreground/60">
          No products are available yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
          <Link
            key={product.id}
            to="/products/$productId"
            params={{ productId: getProductPathParam(product) }}
            className="group"
          >
            <div className="relative aspect-[3/4] bg-card overflow-hidden mb-4 transition-shadow group-hover:shadow-lg">
              {product.image ? (
                <ResponsiveImage
                  src={product.image}
                  alt={product.name}
                  loading="lazy"
                  width={600}
                  height={800}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-white/[0.03] text-sm text-foreground/40">Image coming soon</div>
              )}
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-base">{product.name}</h3>
              <p className="text-sm text-foreground/60">{product.collection}</p>
              <div className="flex justify-between items-center pt-1">
                <span className="text-sm font-medium">${product.price}</span>
                <div className="flex gap-1">
                  {product.colors.slice(0, 3).map((c) => (
                    <span
                      key={c.name}
                      className="w-2 h-2 rounded-full border border-white/20"
                      style={{ backgroundColor: c.hex }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </Link>
          ))}
        </div>
      )}
    </div>
  );
}