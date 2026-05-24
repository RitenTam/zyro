import { Link } from "@tanstack/react-router";
import ResponsiveImage from "@/components/ui/responsive-image";
import {
  getProductPathParam,
  pickFeaturedProduct,
  useProductsQuery,
} from "@/lib/products";

export function ProductSpotlight() {
  const { data: products = [], isPending, isError } = useProductsQuery();
  const product = pickFeaturedProduct(products);

  if (isPending) {
    return (
      <section className="py-32 border-t border-white/5 bg-surface/30">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 grid md:grid-cols-2 gap-16 lg:gap-24 items-center">
          <div className="aspect-[3/4] rounded-[1.25rem] bg-white/[0.04] animate-pulse" />
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="h-12 w-3/5 rounded-full bg-white/[0.05] animate-pulse" />
              <div className="h-4 w-4/5 rounded-full bg-white/[0.04] animate-pulse" />
            </div>
            <div className="space-y-5">
              <div className="h-12 rounded-full bg-white/[0.04] animate-pulse" />
              <div className="h-12 rounded-full bg-white/[0.04] animate-pulse" />
              <div className="h-12 rounded-full bg-white/[0.04] animate-pulse" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (isError || !product) {
    return (
      <section className="py-32 border-t border-white/5 bg-surface/30">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-8">
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tighter text-balance">Featured.</h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-foreground/60">
            The featured product is not available right now.
          </p>
          <Link
            to="/collections"
            className="mt-8 inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-[10px] font-bold uppercase tracking-[0.3em] text-foreground/80 transition-colors hover:bg-white/[0.08]"
          >
            Browse products
          </Link>
        </div>
      </section>
    );
  }

  const price = product.variants[0]?.price ?? product.price;

  return (
    <section className="py-32 border-t border-white/5 bg-surface/30">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 grid md:grid-cols-2 gap-16 lg:gap-24 items-center">
        <div className="order-2 md:order-1 relative">
          {product.image ? (
            <ResponsiveImage
              src={product.image}
              alt={product.name}
              loading="lazy"
              width={1080}
              height={1500}
              className="aspect-[3/4] w-full object-cover rounded-sm shadow-2xl"
            />
          ) : (
            <div className="aspect-[3/4] w-full rounded-sm bg-white/[0.04]" />
          )}
        </div>
        <div className="order-1 md:order-2 space-y-10">
          <div className="space-y-4">
            <h2 className="text-5xl sm:text-6xl font-bold tracking-tighter text-balance">Featured.</h2>
            <p className="text-foreground/60 leading-relaxed text-sm max-w-md text-pretty">
              {product.description}
            </p>
          </div>

          <div className="space-y-6">
            <SpotlightFeature badge="01" title={product.collection} detail={product.material} />
            <SpotlightFeature badge="02" title={`${price}`} detail="Selected from the live catalog" />
            <SpotlightFeature badge="03" title={product.colors[0]?.name ?? "Direct order"} detail="Available in the color set from the database" />
          </div>

          <div className="flex items-center gap-4 pt-4">
            <Link
              to="/products/$productId"
              params={{ productId: getProductPathParam(product) }}
              className="flex-1 py-4 text-center bg-foreground text-background text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-foreground/90 transition-all"
            >
              View product — ${price}
            </Link>
            <button
              aria-label="Save"
              className="size-12 flex items-center justify-center border border-white/10 hover:border-white/30 transition-all"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function SpotlightFeature({ badge, title, detail }: { badge: string; title: string; detail: string }) {
  return (
    <div className="flex gap-4 items-center">
      <div className="size-12 shrink-0 bg-white/5 rounded-full border border-white/10 flex items-center justify-center text-[10px] font-bold tracking-tighter">
        {badge}
      </div>
      <div className="flex flex-col justify-center">
        <span className="text-[11px] font-bold uppercase tracking-wider">{title}</span>
        <span className="text-[11px] text-foreground/40">{detail}</span>
      </div>
    </div>
  );
}