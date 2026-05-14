import lifestyleImg from "@/assets/lifestyle.jpg";

export function Lifestyle() {
  return (
    <section className="relative h-[80vh] min-h-[520px] overflow-hidden">
      <img
        src={lifestyleImg}
        alt="Hand holding phone with premium matte case in cinematic golden light"
        loading="lazy"
        width={1600}
        height={1000}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-onyx via-onyx/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-onyx/60 via-transparent to-transparent" />
      <div className="relative z-10 h-full max-w-7xl mx-auto px-6 sm:px-8 flex items-end pb-24">
        <div className="max-w-md">
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tighter leading-[1.05] text-balance">
            In Use.
          </h2>
          <p className="mt-6 text-sm text-foreground/60 leading-relaxed text-pretty">
            A daily companion designed to disappear into the rituals of modern life.
          </p>
        </div>
      </div>
    </section>
  );
}