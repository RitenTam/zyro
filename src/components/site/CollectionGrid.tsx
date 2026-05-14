import { Link } from "@tanstack/react-router";
import { collections } from "@/lib/products";
import ResponsiveImage from "@/components/ui/responsive-image";

export function CollectionGrid() {
  return (
    <section className="py-32 px-6 sm:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-16">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-foreground/40 mb-4">
            01 / Collections
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tighter max-w-md text-balance">
            Material intelligence.
          </h2>
        </div>
        <Link
          to="/collections"
          className="text-[10px] uppercase tracking-[0.3em] font-bold border-b border-foreground pb-1 self-start hover:border-foreground/50 hover:text-foreground/70 transition-colors"
        >
          View All Categories
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {collections.map((c) => (
          <Link
            key={c.slug}
            to="/collections"
            className="group relative aspect-[4/5] bg-surface border border-white/5 overflow-hidden flex flex-col justify-end p-8"
          >
            <img
              src={c.image}
              alt={`${c.name} collection`}
              loading="lazy"
              width={800}
              height={1000}
              className="absolute inset-0 w-full h-full object-cover opacity-60 transition-all duration-700 group-hover:scale-105 group-hover:opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-onyx via-onyx/20 to-transparent" />
            <div className="relative z-10">
              <h3 className="text-2xl font-semibold tracking-tight">{c.name}</h3>
              <p className="text-[10px] uppercase tracking-[0.25em] text-foreground/50 mt-2">
                {c.eyebrow}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}