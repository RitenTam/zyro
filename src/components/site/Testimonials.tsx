const testimonials = [
  {
    quote: "Feels less like a case and more like the device was always meant to look this way.",
    author: "M. Chen",
    role: "Product Designer, Tokyo",
  },
  {
    quote: "The snap of the MagSafe is genuinely satisfying. Tactile in a way most accessories aren't.",
    author: "S. Okonkwo",
    role: "Photographer, Lagos",
  },
  {
    quote: "Two years of daily use. Still looks new. The patina is its own kind of beautiful.",
    author: "L. Reyes",
    role: "Architect, Mexico City",
  },
];

export function Testimonials() {
  return (
    <section className="py-32 px-6 sm:px-8 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <p className="text-[10px] uppercase tracking-[0.3em] text-foreground/40 mb-16 text-center">
          06 / Considered by
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          {testimonials.map((t, i) => (
            <figure key={i} className="space-y-6">
              <blockquote className="text-base sm:text-lg font-light leading-relaxed text-foreground/90 text-balance">
                "{t.quote}"
              </blockquote>
              <figcaption className="text-[10px] uppercase tracking-[0.25em] text-foreground/40">
                <span className="text-foreground/70">{t.author}</span> — {t.role}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}