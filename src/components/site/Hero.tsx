import { Link } from "@tanstack/react-router";
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import heroImg from "@/assets/hero-silicone.jpg";
import wovenImg from "@/assets/collection-woven.jpg";
import spotlightImg from "@/assets/spotlight-obsidian.jpg";
import ResponsiveImage from "@/components/ui/responsive-image";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-white/5">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_16%,rgba(43,127,255,0.12),transparent_22%),radial-gradient(circle_at_84%_18%,rgba(255,255,255,0.08),transparent_16%),radial-gradient(circle_at_bottom,rgba(10,16,28,0.36),transparent_60%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),transparent_22%,rgba(0,0,0,0.34)_100%)]" />

      <div className="absolute inset-0">
        <ResponsiveImage
          src={heroImg}
          alt="Premium phone case in matte black"
          priority
          sizes="100vw"
          className="h-full w-full object-cover opacity-18 mix-blend-screen"
          width={1920}
          height={1280}
        />
        <div className="absolute inset-0 bg-[linear-gradient(112deg,rgba(6,10,20,0.97)_12%,rgba(6,10,20,0.8)_42%,rgba(6,10,20,0.92)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-background via-background/90 to-transparent" />
      </div>

      <div className="relative mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl gap-20 px-8 pb-28 pt-32 lg:grid-cols-[0.96fr_1.04fr] lg:items-center lg:px-12 xl:gap-28 xl:px-16">
        <div className="max-w-xl lg:pt-10">
          <div className="hero-reveal inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.04] px-4 py-2 text-[0.62rem] font-medium uppercase tracking-[0.34em] text-foreground/60 backdrop-blur-xl" style={{ animationDelay: "0.05s" }}>
            <Sparkles className="h-3.5 w-3.5 text-[#7DB0FF]" />
            Premium tech accessories
          </div>

          <h1
            className="hero-reveal mt-10 max-w-[10ch] text-5xl font-light tracking-[-0.065em] text-foreground sm:text-6xl md:text-[4.9rem] md:leading-[1.02] lg:text-[5.25rem]"
            style={{ animationDelay: "0.14s" }}
          >
            Precision protection.
            <span className="mt-3 block text-[#8AB7FF]">Made to feel engineered.</span>
            <span className="mt-4 block text-foreground/84">Built for the device beneath it.</span>
          </h1>

          <p
            className="hero-reveal mt-10 max-w-lg text-base leading-8 font-light text-foreground/58 sm:text-[1.05rem]"
            style={{ animationDelay: "0.22s" }}
          >
            Premium phone cases shaped with tactile materials, MagSafe-ready detail, and a cinematic finish that feels deliberate from every angle.
          </p>

          <div className="hero-reveal mt-12 flex flex-col gap-6 sm:flex-row sm:items-center" style={{ animationDelay: "0.3s" }}>
            <Link to="/collections" className="btn-primary group">
              Explore collection
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </Link>
            <div className="flex flex-wrap gap-2 text-[0.62rem] font-medium uppercase tracking-[0.3em] text-foreground/42">
              <span className="rounded-full border border-white/8 bg-white/[0.04] px-3 py-2 backdrop-blur-xl">Silicone texture</span>
              <span className="rounded-full border border-white/8 bg-white/[0.04] px-3 py-2 backdrop-blur-xl">Woven fabric</span>
              <span className="rounded-full border border-white/8 bg-white/[0.04] px-3 py-2 backdrop-blur-xl">MagSafe ring</span>
            </div>
          </div>

          <div className="hero-reveal mt-14 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3" style={{ animationDelay: "0.38s" }}>
            <div className="rounded-[1.35rem] border border-white/6 bg-white/[0.035] px-5 py-4 backdrop-blur-xl shadow-[0_14px_40px_rgba(0,0,0,0.2)]">
              <div className="mb-2 flex items-center gap-2 text-[#7DB0FF]">
                <ShieldCheck className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-[0.28em]">Protection</span>
              </div>
              <p className="text-sm font-light leading-6 text-foreground/62">Drop-tested structure with controlled edge softness and reinforced corners.</p>
            </div>

            <div className="rounded-[1.35rem] border border-white/6 bg-white/[0.035] px-5 py-4 backdrop-blur-xl shadow-[0_14px_40px_rgba(0,0,0,0.2)]">
              <div className="mb-2 text-xs font-medium uppercase tracking-[0.28em] text-foreground/45">Materials</div>
              <p className="text-sm font-light leading-6 text-foreground/62">Soft-touch silicone, woven texture, and metallic camera ring detail.</p>
            </div>

            <div className="rounded-[1.35rem] border border-white/6 bg-white/[0.035] px-5 py-4 backdrop-blur-xl shadow-[0_14px_40px_rgba(0,0,0,0.2)]">
              <div className="mb-2 text-xs font-medium uppercase tracking-[0.28em] text-foreground/45">Finish</div>
              <p className="text-sm font-light leading-6 text-foreground/62">Muted reflections, soft contrast, and a studio-lit presence.</p>
            </div>
          </div>
        </div>

        <div className="relative lg:justify-self-end lg:pt-14">
          <div className="absolute -inset-20 rounded-[3.5rem] bg-[radial-gradient(circle_at_35%_25%,rgba(43,127,255,0.14),transparent_36%),radial-gradient(circle_at_72%_74%,rgba(255,255,255,0.08),transparent_24%)] blur-3xl" />

          <div
            className="hero-float absolute left-0 top-6 hidden w-44 rounded-[1.6rem] border border-white/8 bg-black/28 p-3 backdrop-blur-xl lg:block"
            style={{ animationDelay: "0.7s" }}
          >
            <ResponsiveImage
              src={wovenImg}
              alt="Woven fabric texture detail"
              sizes="200px"
              width={480}
              height={640}
              className="h-28 w-full rounded-[1rem] object-cover"
            />
            <div className="mt-3 space-y-1">
              <p className="text-[0.62rem] font-medium uppercase tracking-[0.32em] text-foreground/40">Texture</p>
              <p className="text-sm font-light text-foreground/82">Refined woven finish</p>
            </div>
          </div>

          <div className="relative ml-auto max-w-[31rem] overflow-hidden rounded-[2.4rem] border border-white/8 bg-card/45 shadow-[0_36px_90px_rgba(0,0,0,0.44)] backdrop-blur-2xl">
            <ResponsiveImage
              src={spotlightImg}
              alt="Obsidian Pro case floating in a dark studio"
              sizes="(max-width: 1024px) 100vw, 40vw"
              width={1080}
              height={1500}
              className="aspect-[4/5] w-full object-cover opacity-94"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,transparent_16%,rgba(5,9,18,0.16)_56%,rgba(5,9,18,0.74)_100%)]" />
            <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-white/8 to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between gap-4 border-t border-white/8 bg-[linear-gradient(180deg,rgba(4,7,15,0.06),rgba(4,7,15,0.72))] px-6 py-5">
              <div>
                <p className="text-[0.62rem] font-medium uppercase tracking-[0.32em] text-foreground/42">Hero product</p>
                <p className="mt-2 text-xl font-light tracking-tight text-foreground">Obsidian Pro</p>
              </div>
              <p className="max-w-32 text-right text-sm font-light leading-6 text-foreground/56">
                Edge-lit form, tactile grip, and a finish that reads expensive.
              </p>
            </div>
          </div>

          <div
            className="hero-float absolute -bottom-10 right-0 hidden w-52 rounded-[1.4rem] border border-white/8 bg-black/28 p-4 backdrop-blur-xl lg:block"
            style={{ animationDelay: "1.1s" }}
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="text-[0.62rem] font-medium uppercase tracking-[0.3em] text-foreground/40">Performance</span>
              <span className="rounded-full border border-[#7DB0FF]/20 bg-[#7DB0FF]/10 px-2.5 py-1 text-[0.62rem] font-medium uppercase tracking-[0.24em] text-[#A8C8FF]">
                MagSafe
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm text-foreground/68">
              <div className="rounded-2xl border border-white/6 bg-white/[0.04] p-3">
                <p className="text-[0.62rem] uppercase tracking-[0.28em] text-foreground/42">Grip</p>
                <p className="mt-2 font-light">Soft matte control</p>
              </div>
              <div className="rounded-2xl border border-white/6 bg-white/[0.04] p-3">
                <p className="text-[0.62rem] uppercase tracking-[0.28em] text-foreground/42">Detail</p>
                <p className="mt-2 font-light">Camera ring precision</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}