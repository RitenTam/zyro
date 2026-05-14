const testimonials = [
  {
    quote: "Two years of daily use and it still looks great.",
    author: "Marcus",
  },
  {
    quote: "The soft silicone feels good and actually protects. No bloat.",
    author: "Sarah",
  },
  {
    quote: "Simple, clean design. Does exactly what it should.",
    author: "James",
  },
];

export function Testimonials() {
  return (
    <section className="py-32 px-6 max-w-7xl mx-auto border-t border-white/5">
      <h2 className="text-5xl sm:text-6xl font-light tracking-tighter mb-16">
        What People Say
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {testimonials.map((t, i) => (
          <figure key={i} className="space-y-6 border-l border-[#2B7FFF]/30 pl-6 transition-all hover:border-[#2B7FFF] duration-200">
            <blockquote className="text-lg leading-relaxed text-foreground/80 font-light">
              "{t.quote}"
            </blockquote>
            <figcaption className="text-sm text-foreground/50 font-light">
              — {t.author}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}