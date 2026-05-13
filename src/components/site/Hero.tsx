import { Link } from "@tanstack/react-router";
import heroImg from "@/assets/hero-silicone.jpg";
import ResponsiveImage from "@/components/ui/responsive-image";

export function Hero() {
  return (
    <section className="relative h-screen flex flex-col items-center justify-center pt-20 px-6 overflow-hidden">
      {/* Background image with minimal overlays */}
      <div className="absolute inset-0 z-0">
        <ResponsiveImage
          src={heroImg}
          alt="Premium phone case in matte black"
          priority
          sizes="100vw"
          className="w-full h-full object-cover opacity-40"
          width={1920}
          height={1280}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background to-background/20" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-2xl">
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-tight mb-6">
          Built to protect.
          <br />
          Designed to last.
        </h1>
        <p className="text-lg text-foreground/70 mb-8 leading-relaxed">
          Phone cases engineered for durability and simplicity.
        </p>
        <Link to="/collections" className="btn-primary inline-block">
          Shop Cases
        </Link>
      </div>
    </section>
  );
}