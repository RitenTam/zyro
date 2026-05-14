import { Link } from "@tanstack/react-router";
import { products } from "@/lib/products";

export function BestSellers() {
  return (
    <section className="py-32 px-6 sm:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-16">
        <div>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tighter max-w-md text-balance">
            Best Sellers.
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((p) => (
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
              <button
                onClick={(e) => {
                  e.preventDefault();
                }}
                className="absolute bottom-4 left-4 right-4 py-3 bg-foreground/95 text-background text-[10px] font-bold uppercase tracking-[0.3em] opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 backdrop-blur-md"
              >
                Quick Add
              </button>
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
    </section>
  );
}