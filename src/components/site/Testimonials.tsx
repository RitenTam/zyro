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
    <section className="mx-auto max-w-7xl border-t border-white/5 px-8 py-40 lg:px-12 xl:px-16">
      <h2 className="mb-20 text-4xl font-light tracking-tighter sm:text-5xl lg:text-[3.6rem]">
        What People Say
      </h2>

      <div className="grid grid-cols-1 gap-12 md:grid-cols-3 xl:gap-16">
        {testimonials.map((t, i) => (
          <figure key={i} className="space-y-6 border-l border-white/10 pl-6 transition-all duration-200 hover:border-white/20">
            <blockquote className="text-lg font-light leading-8 text-foreground/76">
              "{t.quote}"
            </blockquote>
            <figcaption className="text-sm font-light text-foreground/46">
              — {t.author}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}