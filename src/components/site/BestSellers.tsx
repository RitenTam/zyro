import { Link } from "@tanstack/react-router";
import { products } from "@/lib/products";
import ResponsiveImage from "@/components/ui/responsive-image";

export function BestSellers() {
  return (
    <section className="mx-auto max-w-7xl px-8 py-40 lg:px-12 xl:px-16">
      <div className="mb-20 max-w-2xl space-y-5">
        <h2 className="text-4xl font-light tracking-tighter sm:text-5xl lg:text-[3.6rem]">
          Popular Models
        </h2>
        <p className="max-w-lg text-lg font-light leading-8 text-foreground/48">
          Our most trusted and reviewed cases
        </p>
        <div className="h-px w-20 bg-white/20" />
      </div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 xl:gap-10">
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
                <div className="relative mb-6 aspect-[3/4] overflow-hidden border border-white/6 bg-card/30 transition-all duration-500 group-hover:border-white/12 group-hover:shadow-[0_26px_72px_rgba(0,0,0,0.28)]">
                <ResponsiveImage
                  src={product.image}
                  alt={product.name}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  width={600}
                  height={800}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />
              </div>
              <div className="space-y-3">
                  <h3 className="text-lg font-light tracking-tight transition-colors duration-200 group-hover:text-[#8AB7FF]">{product.name}</h3>
                  <p className="text-sm font-light text-foreground/42">{product.collection}</p>
                <div className="flex justify-between items-start pt-2">
                    <span className="text-base font-medium text-[#8AB7FF]">${product.price}</span>
                  <div className="flex items-center gap-3">
                    {isOut && (
                        <span className="rounded-sm bg-red-600/20 px-2.5 py-1 text-xs font-medium text-red-400">Out of stock</span>
                    )}
                    {isLow && (
                        <span className="rounded-sm bg-amber-400/20 px-2.5 py-1 text-xs font-medium text-amber-300">Low stock</span>
                    )}
                    <div className="flex gap-2">
                      {product.colors.slice(0, 3).map((c) => (
                        <span
                          key={c.name}
                            className="h-2.5 w-2.5 rounded-full border border-white/10 transition-all hover:border-white/30"
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