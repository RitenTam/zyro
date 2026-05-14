import { Link } from "@tanstack/react-router";
import { collections } from "@/lib/products";
import ResponsiveImage from "@/components/ui/responsive-image";

export function CollectionGrid() {
  return (
    <section className="mx-auto max-w-7xl px-8 py-40 lg:px-12 xl:px-16">
      <div className="mb-24 max-w-2xl space-y-5">
        <h2 className="text-4xl font-light tracking-tighter sm:text-5xl lg:text-[3.6rem]">
          Shop by Material
        </h2>
        <p className="max-w-lg text-lg font-light leading-8 text-foreground/48">
          Each collection engineered for different needs and preferences.
        </p>
        <div className="h-px w-20 bg-white/20" />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 xl:gap-8">
        {collections.map((collection) => (
          <Link
            key={collection.slug}
            to="/collections"
            className="group relative aspect-[4/5] overflow-hidden border border-white/5 bg-card/35 transition-all duration-500 hover:border-white/12 hover:shadow-[0_30px_80px_rgba(0,0,0,0.34)]"
          >
            <ResponsiveImage
              src={collection.image}
              alt={collection.name}
              sizes="(max-width: 768px) 100vw, 33vw"
              width={800}
              height={1000}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/58 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-end p-8 lg:p-9">
              <h3 className="mb-2 text-2xl font-light tracking-tight text-foreground/92 transition-colors duration-200 group-hover:text-[#8AB7FF]">{collection.name}</h3>
              <p className="max-w-xs text-sm font-light leading-6 text-foreground/50">{collection.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}