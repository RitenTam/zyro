import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Zyro" },
      { name: "description", content: "Learn about Zyro and how we build phone cases." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="pt-20 pb-32 max-w-3xl mx-auto px-6">
      <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-12">
        About Zyro
      </h1>

      <div className="space-y-6 text-foreground/70 leading-relaxed">
        <p>
          We make phone cases. They're built to take impacts, resist daily wear, and look clean doing it. No fuss, no unnecessary features.
        </p>

        <p>
          Every case is drop tested, uses quality materials, and comes with real support if something happens. We stand behind our work.
        </p>

        <p>
          We started because most phone cases feel like an afterthought. We wanted to build something better — protection that doesn't feel bulky, design that's intentional, and a company that actually takes care of customers.
        </p>

        <p>
          We're small. We make what we believe in. If you have questions or feedback, we'd like to hear it.
        </p>

        <div className="pt-8">
          <Link to="/collections" className="btn-primary inline-block">
            Shop Cases
          </Link>
        </div>
      </div>
    </div>
  );
}