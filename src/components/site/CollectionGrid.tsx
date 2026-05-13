import { Link } from "@tanstack/react-router";
import { collections } from "@/lib/products";
import ResponsiveImage from "@/components/ui/responsive-image";

export function CollectionGrid() {
  return (
    <section className="py-24 px-6 max-w-7xl mx-auto">
      <div className="mb-16 space-y-3">
        <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
          Shop by material
        </h2>
        <p className="text-foreground/60 max-w-md">
          Each collection is engineered for different needs and preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {collections.map((collection) => (
          <Link
            key={collection.slug}
            to="/collections"
            className="group relative aspect-[4/5] overflow-hidden bg-card transition-all hover:shadow-lg"
          >
            <ResponsiveImage
              src={collection.image}
              alt={collection.name}
              sizes="(max-width: 768px) 100vw, 33vw"
              width={800}
              height={1000}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-end p-6">
              <h3 className="text-2xl font-semibold mb-1">{collection.name}</h3>
              <p className="text-sm text-foreground/70">{collection.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}