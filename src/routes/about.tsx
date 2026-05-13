import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Studio — Aether" },
      {
        name: "description",
        content:
          "Aether is a small design studio in San Francisco engineering quietly essential tech accessories.",
      },
      { property: "og:title", content: "Studio — Aether" },
      { property: "og:description", content: "Quietly essential tech accessories, designed in San Francisco." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <>
      <header className="pt-40 pb-20 px-6 sm:px-8 max-w-5xl mx-auto">
        <p className="text-[10px] uppercase tracking-[0.3em] text-foreground/40 mb-6 animate-rise">
          The Studio
        </p>
        <h1 className="text-5xl sm:text-7xl font-bold tracking-tighter text-balance animate-rise delay-100">
          A small studio,
          <br />
          obsessed with the millimeter.
        </h1>
      </header>

      <section className="px-6 sm:px-8 max-w-3xl mx-auto pb-32 space-y-8 text-foreground/70 leading-relaxed text-pretty">
        <p>
          Aether is a design studio based in San Francisco. We make a small catalog of tech accessories engineered to aerospace tolerance — built to outlast the devices they carry.
        </p>
        <p>
          We believe the most sustainable product is the one you never need to replace. Every artifact is designed to age with character, repaired indefinitely, and packaged in compostable materials.
        </p>
        <p>
          We're starting with cases. Next: AirPods sleeves, watch straps, tech organizers, and quiet desk artifacts. The system is built for what comes next.
        </p>
        <div className="pt-8">
          <Link
            to="/collections"
            className="inline-block px-8 py-4 bg-foreground text-background text-[10px] font-bold uppercase tracking-[0.3em] rounded-full hover:bg-foreground/90 transition-all"
          >
            Browse the Catalog
          </Link>
        </div>
      </section>
    </>
  );
}