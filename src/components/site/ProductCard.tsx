import { Link } from "@tanstack/react-router";
import { type ReactNode } from "react";

import ResponsiveImage from "@/components/ui/responsive-image";
import { formatPrice } from "@/lib/utils";
import { getProductPathParam, type Product } from "@/lib/products";

interface ProductCardProps {
  product: Product;
  label?: string;
  details?: ReactNode;
  footer?: ReactNode;
}

export default function ProductCard({ product, label, details, footer }: ProductCardProps) {
  return (
    <Link
      to="/products/$productId"
      params={{ productId: getProductPathParam(product) }}
      className="group rounded-[1.75rem] border border-white/5 bg-white/[0.02] p-4 transition-transform duration-300 hover:-translate-y-1 hover:border-white/10"
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-[1.4rem] bg-surface">
        {product.image ? (
          <ResponsiveImage
            src={product.image}
            alt={product.name}
            loading="lazy"
            width={800}
            height={1000}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-white/[0.03] text-sm text-foreground/40">
            Image coming soon
          </div>
        )}
      </div>

      <div className="space-y-3 px-1 pt-5">
        {label ? (
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-foreground/40">{label}</p>
        ) : null}

        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-medium tracking-tight">{product.name}</h3>
            {details}
          </div>
          <div className="text-sm font-medium tabular-nums text-foreground/80">{formatPrice(product.price)}</div>
        </div>

        {footer}
      </div>
    </Link>
  );
}
