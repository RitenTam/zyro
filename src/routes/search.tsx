import { createFileRoute, Link } from "@tanstack/react-router";

import ProductCard from "@/components/site/ProductCard";
import { productSearchQueryOptions, type Product } from "@/lib/products";

export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search.q === "string" ? search.q : "",
  }),
  loaderDeps: ({ search }) => ({
    q: typeof search?.q === "string" ? search.q : "",
  }),
  loader: async ({ deps: { q }, context }) => {
    const query = q.trim();

    if (query.length === 0) {
      return { query, products: [] as Product[] };
    }

    const products = await context.queryClient.ensureQueryData(productSearchQueryOptions(query));
    return { query, products };
  },
  head: ({ loaderData }) => {
    const title = loaderData?.query ? `Search results for "${loaderData.query}" — Zyro` : "Search — Zyro";
    return { meta: [{ title }] };
  },
  component: SearchPage,
});

function SearchPage() {
  const { query, products } = Route.useLoaderData() as { query: string; products: Product[] };

  return (
    <div className="relative pt-24 pb-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-3xl space-y-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-foreground/45">Search</p>
          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            {query ? `Results for “${query}”` : "Find the right product for your next creation."}
          </h1>
          <p className="max-w-2xl text-sm leading-7 text-foreground/60 sm:text-base">
            {query
              ? `Search results are filtered to published products matching your query by name or description.`
              : "Enter a search term in the header search input to look through our active product catalog."}
          </p>
        </div>

        {query.length === 0 ? (
          <div className="mt-12 rounded-[2rem] border border-white/10 bg-white/[0.03] p-12 text-sm text-foreground/60">
            Search by product name or description. Try terms like "gold", "ring", or "handmade".
          </div>
        ) : products.length === 0 ? (
          <div className="mt-12 rounded-[2rem] border border-white/10 bg-white/[0.03] p-12 text-sm text-foreground/60">
            <p className="mb-4 font-semibold text-foreground">No products found</p>
            <p>We couldn’t find any active products matching “{query}”. Try a broader term or check spelling.</p>
            <div className="mt-6">
              <Link
                to="/collections"
                className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-sm text-foreground/80 transition-colors hover:bg-white/[0.08]"
              >
                Browse all products
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-12 space-y-6">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 text-sm text-foreground/60">
              Showing <span className="font-semibold text-foreground">{products.length}</span> result{products.length === 1 ? "" : "s"} for “{query}”.
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} label={product.collection} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Route;
