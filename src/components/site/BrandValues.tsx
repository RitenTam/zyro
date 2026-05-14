const values = [
  { eyebrow: "Material", title: "Recycled Polymer", detail: "Sourced from post-industrial waste streams." },
  { eyebrow: "Protection", title: "Mil-Spec Rated", detail: "MIL-STD-810G drop tested at 15ft." },
  { eyebrow: "Finish", title: "Soft-Touch Matte", detail: "Oil and fingerprint resistant." },
  { eyebrow: "Origin", title: "Designed in SF", detail: "Manufactured to aerospace tolerance." },
];

export function BrandValues() {
  return (
    <section className="py-32 sm:py-40 bg-onyx text-center overflow-hidden">
      <div className="max-w-4xl mx-auto px-6 sm:px-8 space-y-20">
        <p className="text-[10px] uppercase tracking-[0.3em] text-foreground/40">
          05 / Philosophy
        </p>
        <h2 className="text-3xl sm:text-5xl md:text-6xl font-light tracking-tight leading-[1.1] italic text-balance -mt-12">
          "The most sustainable product is the one you never need to {" "}
          <span className="text-foreground/40">replace</span>."
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 border-t border-white/5 pt-12 text-left sm:text-center">
          {values.map((v) => (
            <div key={v.title} className="space-y-2">
              <div className="text-[10px] font-bold tracking-widest text-foreground/30 uppercase">
                {v.eyebrow}
              </div>
              <div className="text-sm font-semibold">{v.title}</div>
              <div className="text-[11px] text-foreground/40 leading-relaxed">{v.detail}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}