const values = [
  { title: "Drop tested", description: "All cases tested to 10-15 feet" },
  { title: "Lifetime repairs", description: "We fix damage or replace free" },
  { title: "Simple design", description: "No excess, just protection" },
  { title: "Material choice", description: "Silicone, woven, or polymer" },
];

export function BrandValues() {
  return (
    <section className="mx-auto max-w-7xl px-8 py-40 lg:px-12 xl:px-16">
      <h2 className="mb-20 max-w-2xl text-3xl font-light tracking-tighter sm:text-4xl lg:text-[3.1rem]">
        Why Choose Zyro
      </h2>

      <div className="grid grid-cols-1 gap-14 md:grid-cols-2 xl:gap-16">
        {values.map((value) => (
          <div key={value.title} className="border-l border-white/10 pl-6 transition-all duration-200 hover:border-white/20">
            <h3 className="mb-3 text-[0.72rem] font-medium uppercase tracking-[0.3em] text-[#8AB7FF]">{value.title}</h3>
            <p className="text-sm font-light leading-7 text-foreground/50">
              {value.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}