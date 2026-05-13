import { Link } from "@tanstack/react-router";
import { products } from "@/lib/products";

export function BestSellers() {
  return (
    <section className="py-24 px-6 max-w-7xl mx-auto">
      <div className="mb-12 space-y-3">
        <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
          Popular models
        </h2>
        <p className="text-foreground/60 max-w-md">
          Our most reviewed and trusted cases.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <Link
            key={product.id}
            to="/products/$productId"
            params={{ productId: product.id }}
            className="group block"
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
    </section>
  );
}