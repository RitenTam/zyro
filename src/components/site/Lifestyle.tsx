import lifestyleImg from "@/assets/lifestyle.jpg";

export function Lifestyle() {
  return (
    <section className="relative h-96 overflow-hidden bg-card">
      <img
        src={lifestyleImg}
        alt="Phone case in use"
        loading="lazy"
        width={1600}
        height={1000}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent" />

      <div className="relative h-full max-w-7xl mx-auto px-6 flex items-end pb-12">
        <div className="max-w-md">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
            Designed for your lifestyle
          </h2>
          <p className="text-foreground/70">
            Built tough enough for daily use, polished enough for any setting.
          </p>
        </div>
      </div>
    </section>
  );
}