import { Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { LoaderCircle, LogOut, UserCircle2 } from "lucide-react";
import MiniCart from "./MiniCart";
import { useCart } from "@/contexts/cart";
import { useAuth } from "@/contexts/auth";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { state } = useCart();
  const { ready, user, signOut } = useAuth();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const count = state.items.reduce((s, i) => s + i.qty, 0);

  async function handleSignOut() {
    setSigningOut(true);
    const result = await signOut();
    setSigningOut(false);

    if (!result.error) {
      router.navigate({ to: "/" });
    }
  }

  const authHref = `/auth?next=${encodeURIComponent("/account")}`;

  return (
    <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/5 bg-background/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="font-bold text-base tracking-tight text-foreground hover:text-[#2B7FFF] transition-colors duration-200">
          Zyro
        </Link>

        <div className="hidden sm:flex gap-12 text-sm">
          <Link
            to="/collections"
            activeProps={{ className: "text-[#2B7FFF] font-medium" }}
            className="text-foreground/60 hover:text-foreground transition-colors duration-200"
          >
            Shop
          </Link>
          <Link
            to="/about"
            activeProps={{ className: "text-[#2B7FFF] font-medium" }}
            className="text-foreground/60 hover:text-foreground transition-colors duration-200"
          >
            About
          </Link>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <button className="hidden sm:inline text-foreground/60 hover:text-foreground transition-colors duration-200">
            Search
          </button>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mini-cart"
            className="relative text-foreground/60 hover:text-foreground transition-colors duration-200"
          >
            Cart
            {count > 0 && (
              <span className="absolute -right-3 -top-2 inline-flex items-center justify-center px-2 py-1 text-xs font-semibold leading-none text-white bg-[#2B7FFF] rounded-full">
                {count}
              </span>
            )}
          </button>
          <div className="hidden sm:flex items-center gap-3">
            {ready && user ? (
              <>
                <Link
                  to="/account"
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-foreground/75 transition-colors duration-200 hover:border-white/20 hover:bg-white/[0.08]"
                >
                  <UserCircle2 className="size-4 text-[#7DB1FF]" />
                  Account
                </Link>
                <button
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-foreground/50 transition-colors duration-200 hover:border-white/20 hover:text-foreground disabled:opacity-60"
                >
                  {signingOut ? <LoaderCircle className="size-4 animate-spin" /> : <LogOut className="size-4" />}
                  Sign out
                </button>
              </>
            ) : (
              <a
                href={authHref}
                className="inline-flex items-center gap-2 rounded-full bg-white/[0.04] px-4 py-2 text-foreground/75 transition-colors duration-200 hover:bg-white/[0.08]"
              >
                Sign in
              </a>
            )}
          </div>
        </div>
      </div>

      <MiniCart isOpen={open} onClose={() => setOpen(false)} />
    </nav>
  );
}