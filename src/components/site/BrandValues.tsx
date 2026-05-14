const values = [
  { title: "Drop tested", description: "All cases tested to 10-15 feet" },
  { title: "Lifetime repairs", description: "We fix damage or replace free" },
  { title: "Simple design", description: "No excess, just protection" },
  { title: "Material choice", description: "Silicone, woven, or polymer" },
];

export function BrandValues() {
  return (
    <section className="py-32 px-6 max-w-7xl mx-auto">
      <h2 className="text-4xl sm:text-5xl font-light tracking-tighter mb-16 max-w-2xl">
        Why Choose Zyro
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {values.map((value) => (
          <div key={value.title} className="border-l border-[#2B7FFF]/30 pl-6 transition-all hover:border-[#2B7FFF] duration-200">
            <h3 className="font-medium text-base mb-3 text-[#2B7FFF]">{value.title}</h3>
            <p className="text-foreground/50 text-sm leading-relaxed font-light">
              {value.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}