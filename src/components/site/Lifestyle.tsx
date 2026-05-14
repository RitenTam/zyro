import lifestyleImg from "@/assets/lifestyle.jpg";
import ResponsiveImage from "@/components/ui/responsive-image";

export function Lifestyle() {
  return (
    <section className="relative h-96 overflow-hidden bg-card">
      <ResponsiveImage
        src={lifestyleImg}
        alt="Phone case in use"
        sizes="100vw"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/50 to-transparent" />

      <div className="relative h-full max-w-7xl mx-auto px-6 flex items-end pb-12">
        <div className="max-w-md">
          <h2 className="text-4xl sm:text-5xl font-light tracking-tighter mb-4">
            Designed for Your Lifestyle
          </h2>
          <p className="text-foreground/60 font-light text-lg">
            Built tough for daily use, refined for any setting.
          </p>
        </div>
      </div>
    </section>
  );
}