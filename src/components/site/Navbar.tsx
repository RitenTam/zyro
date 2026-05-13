import { Link } from "@tanstack/react-router";
import { useState } from "react";
import MiniCart from "./MiniCart";
import { useCart } from "@/contexts/cart";
import ResponsiveImage from "@/components/ui/responsive-image";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { state } = useCart();
  const count = state.items.reduce((s, i) => s + i.qty, 0);

  return (
    <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/10 bg-background/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="font-bold text-base tracking-tight">
          Zyro
        </Link>

        <div className="hidden sm:flex gap-8 text-sm">
          <Link
            to="/collections"
            activeProps={{ className: "font-semibold" }}
            className="text-foreground/70 hover:text-foreground transition-colors"
          >
            Shop
          </Link>
          <Link
            to="/about"
            activeProps={{ className: "font-semibold" }}
            className="text-foreground/70 hover:text-foreground transition-colors"
          >
            About
          </Link>
        </div>

        <div className="flex gap-6 text-sm items-center">
          <button className="hidden sm:inline text-foreground/70 hover:text-foreground transition-colors">
            Search
          </button>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mini-cart"
            className="relative text-foreground/70 hover:text-foreground transition-colors"
          >
            Cart
            {count > 0 && (
              <span className="absolute -right-3 -top-2 inline-flex items-center justify-center px-2 py-1 text-xs font-semibold leading-none text-background bg-foreground rounded-full">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>

      <MiniCart isOpen={open} onClose={() => setOpen(false)} />
    </nav>
  );
}