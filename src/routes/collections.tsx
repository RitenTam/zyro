import { createFileRoute, Link } from "@tanstack/react-router";
import { products } from "@/lib/products";

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
  return (
    <div className="pt-20 pb-32 max-w-7xl mx-auto px-6">
      <div className="mb-16 space-y-3">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
          All Cases
        </h1>
        <p className="text-foreground/60">
          Available in multiple materials and colors.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <Link
            key={product.id}
            to="/products/$productId"
            params={{ productId: product.id }}
            className="group"
          >
            <div className="relative aspect-[3/4] bg-card overflow-hidden mb-4 transition-shadow group-hover:shadow-lg">
              <img
                src={product.image}
                alt={product.name}
                loading="lazy"
                width={600}
                height={800}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
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
    </div>
  );
}