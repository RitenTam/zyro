import { Link } from "@tanstack/react-router";
import spotlightImg from "@/assets/spotlight-obsidian.jpg";

export function ProductSpotlight() {
  return (
    <section className="py-32 border-t border-white/5 bg-surface/30">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 grid md:grid-cols-2 gap-16 lg:gap-24 items-center">
        <div className="order-2 md:order-1 relative">
          <img
            src={spotlightImg}
            alt="Obsidian Pro case in four colorways arranged on dark slate"
            loading="lazy"
            width={1080}
            height={1500}
            className="aspect-[3/4] w-full object-cover rounded-sm shadow-2xl"
          />
        </div>
        <div className="order-1 md:order-2 space-y-10">
          <div className="space-y-4">
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-foreground/30">
              02 / New Arrival
            </span>
            <h2 className="text-5xl sm:text-6xl font-bold tracking-tighter text-balance">
              Obsidian Series.
            </h2>
            <p className="text-foreground/60 leading-relaxed text-sm max-w-md text-pretty">
              Crafted from aerospace-grade polymers with a micro-etched finish. Designed to age with character while providing 15ft drop protection.
            </p>
          </div>

          <div className="space-y-6">
            <SpotlightFeature badge="15ft" title="Reinforced Edge" detail="Dampens impact forces by 40%." />
            <SpotlightFeature badge="MAG" title="MagSafe Optimized" detail="N52 Neodymium magnet array." />
            <SpotlightFeature badge="ECO" title="FSC Packaging" detail="Compostable technical packaging." />
          </div>

          <div className="flex items-center gap-4 pt-4">
            <Link
              to="/products/$productId"
              params={{ productId: "obsidian-protective-midnight" }}
              className="flex-1 py-4 text-center bg-foreground text-background text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-foreground/90 transition-all"
            >
              Add to Cart — $95
            </Link>
            <button
              aria-label="Save"
              className="size-12 flex items-center justify-center border border-white/10 hover:border-white/30 transition-all"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function SpotlightFeature({ badge, title, detail }: { badge: string; title: string; detail: string }) {
  return (
    <div className="flex gap-4 items-center">
      <div className="size-12 shrink-0 bg-white/5 rounded-full border border-white/10 flex items-center justify-center text-[10px] font-bold tracking-tighter">
        {badge}
      </div>
      <div className="flex flex-col justify-center">
        <span className="text-[11px] font-bold uppercase tracking-wider">{title}</span>
        <span className="text-[11px] text-foreground/40">{detail}</span>
      </div>
    </div>
  );
}