import { Link } from "@tanstack/react-router";

export function Navbar() {
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

        <div className="flex gap-6 text-sm">
          <button className="hidden sm:inline text-foreground/70 hover:text-foreground transition-colors">
            Search
          </button>
          <button className="text-foreground/70 hover:text-foreground transition-colors">
            Cart
          </button>
        </div>
      </div>
    </nav>
  );
}