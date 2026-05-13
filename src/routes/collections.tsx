import { createFileRoute, Link } from "@tanstack/react-router";
import { products } from "@/lib/products";

export const Route = createFileRoute("/collections")({
  head: () => ({
    meta: [
      { title: "Collections — Aether" },
      {
        name: "description",
        content:
          "Explore the full Aether catalog. Silicone, woven, MagSafe, and protective cases engineered to aerospace tolerance.",
      },
      { property: "og:title", content: "Collections — Aether" },
      { property: "og:description", content: "Premium tech accessories engineered for the modern nomad." },
    ],
  }),
  component: CollectionsPage,
});

function CollectionsPage() {
  return (
    <>
      <header className="pt-40 pb-20 px-6 sm:px-8 max-w-7xl mx-auto">
        <p className="text-[10px] uppercase tracking-[0.3em] text-foreground/40 mb-6 animate-rise">
          The Catalog
        </p>
        <h1 className="text-5xl sm:text-7xl font-bold tracking-tighter max-w-3xl text-balance animate-rise delay-100">
          Every artifact, considered.
        </h1>
        <p className="max-w-md text-foreground/60 mt-8 text-sm leading-relaxed animate-rise delay-200">
          A focused catalog of architectural protection — built to outlast the devices they carry.
        </p>
      </header>

      <section className="px-6 sm:px-8 max-w-7xl mx-auto pb-32">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
              </div>
              <div className="pt-5 flex justify-between items-start gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.25em] text-foreground/40 mb-2">
                    {p.collection}
                  </p>
                  <h3 className="text-base font-semibold tracking-tight">{p.name}</h3>
                  <p className="text-xs text-foreground/50 mt-1">{p.tagline}</p>
                </div>
                <div className="text-sm font-medium tabular-nums">${p.price}</div>
              </div>
              <div className="flex gap-1.5 mt-3">
                {p.colors.map((c) => (
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
    </>
  );
}