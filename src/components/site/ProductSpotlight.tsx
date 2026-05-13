import { Link } from "@tanstack/react-router";
import spotlightImg from "@/assets/spotlight-obsidian.jpg";
import { ResponsiveImage } from "@/components/ui/responsive-image";

export function ProductSpotlight() {
  return (
    <section className="py-32 px-6 max-w-7xl mx-auto border-t border-white/5">
      <div className="grid md:grid-cols-2 gap-16 items-center">
        <div className="relative order-2 md:order-1">
            <ResponsiveImage
              src={spotlightImg}
              alt="Obsidian Pro case display"
              sizes="(max-width: 768px) 100vw, 50vw"
              width={1080}
              height={1500}
              className="aspect-[3/4] w-full object-cover border border-white/5"
            />
        </div>

        <div className="order-1 md:order-2 space-y-8">
          <div>
            <h2 className="text-5xl sm:text-6xl font-light tracking-tighter mb-6">
              Obsidian Pro
            </h2>
            <p className="text-foreground/60 leading-relaxed font-light text-lg">
              Our most protective case. Aerospace polymer with reinforced corners, engineered for daily impact and heavy use.
            </p>
          </div>

          <div className="space-y-6 border-l border-[#2B7FFF]/30 pl-6">
            <div>
              <h3 className="font-medium text-sm mb-2 text-[#2B7FFF]">Drop Protection</h3>
              <p className="text-sm text-foreground/50 font-light">Up to 15 feet</p>
            </div>
            <div>
              <h3 className="font-medium text-sm mb-2 text-[#2B7FFF]">Material</h3>
              <p className="text-sm text-foreground/50 font-light">Aerospace-grade polymer</p>
            </div>
            <div>
              <h3 className="font-medium text-sm mb-2 text-[#2B7FFF]">Warranty</h3>
              <p className="text-sm text-foreground/50 font-light">Lifetime repairs</p>
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