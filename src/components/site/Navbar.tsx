import { Link } from "@tanstack/react-router";

const navItems = [
  { to: "/collections", label: "Collections" },
  { to: "/collections", label: "iPhone 15", search: { material: "Silicone" } },
  { to: "/about", label: "Studio" },
  { to: "/about", label: "The Journal" },
] as const;

export function Navbar() {
  return (
    <nav className="fixed top-0 inset-x-0 z-50 glass border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="text-base font-bold tracking-tighter uppercase">
          Aether
        </Link>
        <div className="hidden md:flex gap-10 text-[11px] uppercase tracking-[0.2em] font-semibold">
          <Link to="/collections" className="text-foreground/70 hover:text-foreground transition-colors" activeProps={{ className: "text-foreground" }}>
            Collections
          </Link>
          <Link to="/collections" className="text-foreground/70 hover:text-foreground transition-colors">
            iPhone 15
          </Link>
          <Link to="/about" className="text-foreground/70 hover:text-foreground transition-colors" activeProps={{ className: "text-foreground" }}>
            Studio
          </Link>
          <Link to="/about" className="text-foreground/70 hover:text-foreground transition-colors">
            Journal
          </Link>
        </div>
        <div className="flex items-center gap-6 text-[11px] uppercase tracking-[0.2em] font-semibold">
          <button className="hidden sm:inline text-foreground/70 hover:text-foreground transition-colors">
            Search
          </button>
          <button className="text-foreground hover:text-foreground/70 transition-colors">
            Cart (0)
          </button>
        </div>
      </div>
    </nav>
  );
}