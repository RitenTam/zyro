import { Link } from "@tanstack/react-router";
import heroImg from "@/assets/hero-silicone.jpg";

export function Hero() {
  return (
    <section className="relative h-[100svh] min-h-[640px] flex flex-col items-center justify-center pt-20 px-6 overflow-hidden">
      <div className="absolute inset-0 z-0 animate-fade">
        <img
          src={heroImg}
          alt="Macro shot of premium matte black silicone phone case"
          className="w-full h-full object-cover opacity-50"
          width={1920}
          height={1280}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-onyx/80 via-transparent to-onyx" />
        <div className="absolute inset-0 bg-gradient-to-t from-onyx via-onyx/30 to-transparent" />
      </div>

      <div className="relative z-10 text-center max-w-3xl mx-auto">
        <span className="block text-[10px] tracking-[0.5em] uppercase text-foreground/40 mb-6 animate-rise">
          The Core Series
        </span>
        <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-extrabold tracking-tighter leading-[0.9] text-balance animate-rise delay-100">
          SILICONE
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-foreground to-foreground/20">
            REFINED
          </span>
        </h1>
        <p className="max-w-md mx-auto text-foreground/60 text-sm font-light leading-relaxed mt-8 animate-rise delay-200 text-pretty">
          Engineered for the modern nomad. Liquid silicone meets architectural precision.
        </p>
        <div className="pt-10 animate-rise delay-300">
          <Link
            to="/collections"
            className="inline-block px-10 py-4 bg-foreground text-background text-[10px] font-bold uppercase tracking-[0.3em] rounded-full hover:bg-foreground/90 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Shop Collection
          </Link>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-[9px] uppercase tracking-[0.3em] text-foreground/30 animate-fade delay-500">
        Scroll
      </div>
    </section>
  );
}