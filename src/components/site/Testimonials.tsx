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
    <section className="py-24 px-6 max-w-7xl mx-auto border-t border-white/10">
      <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-12">
        What people say
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {testimonials.map((t, i) => (
          <figure key={i} className="space-y-4">
            <blockquote className="text-base leading-relaxed text-foreground/90">
              "{t.quote}"
            </blockquote>
            <figcaption className="text-sm text-foreground/60">
              — {t.author}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}