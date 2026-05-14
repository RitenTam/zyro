import { Link } from "@tanstack/react-router";
import { products } from "@/lib/products";
import ResponsiveImage from "@/components/ui/responsive-image";

export function BestSellers() {
  return (
    <section className="py-32 px-6 max-w-7xl mx-auto">
      <div className="mb-16 space-y-4">
        <h2 className="text-5xl sm:text-6xl font-light tracking-tighter">
          Popular Models
        </h2>
        <p className="text-foreground/50 max-w-md text-lg font-light">
          Our most trusted and reviewed cases
        </p>
        <div className="h-0.5 w-16 bg-[#2B7FFF]" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {products.map((product) => {
          const totalAvailable = product.variants?.reduce((s, v) => s + (v.available ?? 0), 0) ?? 0;
          const isLow = totalAvailable > 0 && totalAvailable < 30;
          const isOut = totalAvailable === 0;

          return (
            <Link
              key={product.id}
              to="/products/$productId"
              params={{ productId: product.id }}
              className="group block"
            >
                <div className="relative aspect-[3/4] bg-card overflow-hidden mb-6 transition-all duration-300 group-hover:shadow-2xl border border-white/5 group-hover:border-[#2B7FFF]/30">
                <ResponsiveImage
                  src={product.image}
                  alt={product.name}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  width={600}
                  height={800}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="space-y-3">
                  <h3 className="font-light text-lg tracking-tight group-hover:text-[#2B7FFF] transition-colors duration-200">{product.name}</h3>
                  <p className="text-sm text-foreground/40 font-light">{product.collection}</p>
                <div className="flex justify-between items-start pt-2">
                    <span className="text-base font-medium text-[#2B7FFF]">${product.price}</span>
                  <div className="flex items-center gap-3">
                    {isOut && (
                        <span className="text-xs bg-red-600/20 text-red-400 px-2.5 py-1 rounded-sm font-medium">Out of stock</span>
                    )}
                    {isLow && (
                        <span className="text-xs bg-amber-400/20 text-amber-300 px-2.5 py-1 rounded-sm font-medium">Low stock</span>
                    )}
                    <div className="flex gap-2">
                      {product.colors.slice(0, 3).map((c) => (
                        <span
                          key={c.name}
                            className="w-2.5 h-2.5 rounded-full border border-white/10 transition-all hover:border-white/30"
                          style={{ backgroundColor: c.hex }}
                          title={c.name}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}