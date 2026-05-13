import { Link } from "@tanstack/react-router";
import spotlightImg from "@/assets/spotlight-obsidian.jpg";

export function ProductSpotlight() {
  return (
    <section className="py-24 px-6 max-w-7xl mx-auto border-t border-white/10">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div className="relative order-2 md:order-1">
            <ResponsiveImage
              src={spotlightImg}
              alt="Obsidian Pro case display"
              sizes="(max-width: 768px) 100vw, 50vw"
              width={1080}
              height={1500}
              className="aspect-[3/4] w-full object-cover"
            />
        </div>

        <div className="order-1 md:order-2 space-y-6">
          <div>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
              Obsidian Pro
            </h2>
            <p className="text-foreground/70 leading-relaxed">
              Our most protective case. Aerospace polymer with reinforced corners. Built for daily impact and heavy use.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-sm mb-1">Drop Protection</h3>
              <p className="text-sm text-foreground/60">Up to 15 feet</p>
            </div>
            <div>
              <h3 className="font-semibold text-sm mb-1">Material</h3>
              <p className="text-sm text-foreground/60">Aerospace-grade polymer</p>
            </div>
            <div>
              <h3 className="font-semibold text-sm mb-1">Warranty</h3>
              <p className="text-sm text-foreground/60">Lifetime repairs</p>
            </div>
          </div>

          <Link
            to="/products/$productId"
            params={{ productId: "obsidian-protective-midnight" }}
            className="btn-primary inline-block"
          >
            View Details
          </Link>
        </div>
      </div>
    </section>
  );
}