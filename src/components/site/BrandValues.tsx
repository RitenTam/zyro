const values = [
  { title: "Drop tested", description: "All cases tested to 10-15 feet" },
  { title: "Lifetime repairs", description: "We fix damage or replace free" },
  { title: "Simple design", description: "No excess, just protection" },
  { title: "Material choice", description: "Silicone, woven, or polymer" },
];

export function BrandValues() {
  return (
    <section className="py-24 px-6 max-w-7xl mx-auto">
      <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-12 max-w-2xl">
        Why choose Zyro
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {values.map((value) => (
          <div key={value.title} className="border-l border-white/10 pl-6">
            <h3 className="font-semibold text-base mb-2">{value.title}</h3>
            <p className="text-foreground/60 text-sm leading-relaxed">
              {value.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}