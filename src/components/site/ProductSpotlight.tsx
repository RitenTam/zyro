import { Link } from "@tanstack/react-router";
import spotlightImg from "@/assets/spotlight-obsidian.jpg";
import { ResponsiveImage } from "@/components/ui/responsive-image";

export function ProductSpotlight() {
  return (
    <section className="mx-auto max-w-7xl border-t border-white/5 px-8 py-40 lg:px-12 xl:px-16">
      <div className="grid items-center gap-16 md:grid-cols-[0.98fr_1.02fr] xl:gap-24">
        <div className="relative order-2 md:order-1">
          <div className="absolute -inset-6 rounded-[2.5rem] bg-[radial-gradient(circle_at_45%_35%,rgba(43,127,255,0.08),transparent_36%),radial-gradient(circle_at_70%_72%,rgba(255,255,255,0.06),transparent_24%)] blur-2xl" />
            <ResponsiveImage
              src={spotlightImg}
              alt="Obsidian Pro case display"
              sizes="(max-width: 768px) 100vw, 50vw"
              width={1080}
              height={1500}
              className="relative aspect-[3/4] w-full object-cover border border-white/6 bg-card/35 shadow-[0_26px_80px_rgba(0,0,0,0.28)]"
            />
        </div>

        <div className="order-1 max-w-xl space-y-10 md:order-2 md:justify-self-end">
          <div className="space-y-6">
            <h2 className="text-4xl font-light tracking-tighter sm:text-5xl lg:text-[3.6rem]">
              Obsidian Pro
            </h2>
            <p className="max-w-lg text-lg font-light leading-8 text-foreground/56">
              Our most protective case. Aerospace polymer with reinforced corners, engineered for daily impact and heavy use.
            </p>
          </div>

          <div className="space-y-6 border-l border-white/10 pl-6">
            <div>
              <h3 className="mb-2 text-[0.72rem] font-medium uppercase tracking-[0.3em] text-[#8AB7FF]">Drop Protection</h3>
              <p className="text-sm font-light text-foreground/50">Up to 15 feet</p>
            </div>
            <div>
              <h3 className="mb-2 text-[0.72rem] font-medium uppercase tracking-[0.3em] text-[#8AB7FF]">Material</h3>
              <p className="text-sm font-light text-foreground/50">Aerospace-grade polymer</p>
            </div>
            <div>
              <h3 className="mb-2 text-[0.72rem] font-medium uppercase tracking-[0.3em] text-[#8AB7FF]">Warranty</h3>
              <p className="text-sm font-light text-foreground/50">Lifetime repairs</p>
            </div>
          </div>

          <Link
            to="/products/$productId"
            params={{ productId: "obsidian-protective-midnight" }}
            className="btn-primary inline-flex"
          >
            View Details
          </Link>
        </div>
      </div>
    </section>
  );
}