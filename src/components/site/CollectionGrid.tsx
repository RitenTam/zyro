import { Link } from "@tanstack/react-router";
import { collections } from "@/lib/products";
import ResponsiveImage from "@/components/ui/responsive-image";

export function CollectionGrid() {
  return (
    <section className="py-32 px-6 max-w-7xl mx-auto">
      <div className="mb-20 space-y-4">
        <h2 className="text-5xl sm:text-6xl font-light tracking-tighter">
          Shop by Material
        </h2>
        <p className="text-foreground/50 max-w-md text-lg font-light">
          Each collection engineered for different needs and preferences.
        </p>
        <div className="h-0.5 w-16 bg-[#2B7FFF]" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {collections.map((collection) => (
          <Link
            key={collection.slug}
            to="/collections"
            className="group relative aspect-[4/5] overflow-hidden bg-card transition-all duration-300 hover:shadow-2xl border border-white/5 hover:border-[#2B7FFF]/30"
          >
            <ResponsiveImage
              src={collection.image}
              alt={collection.name}
              sizes="(max-width: 768px) 100vw, 33vw"
              width={800}
              height={1000}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-end p-8">
              <h3 className="text-2xl font-light tracking-tight mb-2 group-hover:text-[#2B7FFF] transition-colors duration-200">{collection.name}</h3>
              <p className="text-sm text-foreground/50 font-light">{collection.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}