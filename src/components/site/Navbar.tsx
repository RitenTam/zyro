import { Link, useRouter } from "@tanstack/react-router";
import { FormEvent, useState } from "react";
import { LoaderCircle, LogOut, UserCircle2 } from "lucide-react";
import MiniCart from "./MiniCart";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCart } from "@/contexts/cart";
import { useAuth } from "@/contexts/auth";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { state } = useCart();
  const { ready, user, signOut } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [signingOut, setSigningOut] = useState(false);
  const count = state.items.reduce((s, i) => s + i.qty, 0);
  const displayName = user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? user?.email ?? "Customer";
  const initials = getInitials(displayName, user?.email ?? "");

  async function handleSignOut() {
    setSigningOut(true);
    const result = await signOut();
    setSigningOut(false);

    if (!result.error) {
      router.navigate({ to: "/" });
    }
  }

  const authHref = `/auth?next=${encodeURIComponent("/account")}`;

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmed = searchQuery.trim();
    if (trimmed.length === 0) {
      return;
    }

    router.navigate({
      to: "/search",
      search: { q: trimmed },
    });
  }

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
          <form onSubmit={handleSearchSubmit} className="hidden sm:flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">
            <input
              type="search"
              name="q"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search products"
              className="h-10 min-w-[12rem] bg-transparent text-sm text-foreground placeholder:text-foreground/50 outline-none"
            />
            <button
              type="submit"
              className="inline-flex items-center rounded-full bg-[#2B7FFF] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1a64d7]"
            >
              Search
            </button>
          </form>
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="rounded-full outline-none ring-offset-background transition-transform duration-200 hover:scale-[1.03] focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    aria-label="Open account menu"
                  >
                    <Avatar className="h-10 w-10 border border-white/10 bg-white/[0.04] shadow-[0_10px_30px_rgba(0,0,0,0.24)]">
                      <AvatarFallback className="bg-gradient-to-br from-white/18 to-white/6 text-[11px] font-semibold tracking-[0.22em] text-white/90">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-2xl border border-white/10 bg-[#0d0d0d] p-2 text-foreground shadow-[0_24px_80px_rgba(0,0,0,0.4)]">
                  <div className="px-3 py-2">
                    <div className="text-[11px] uppercase tracking-[0.24em] text-foreground/35">Signed in as</div>
                    <div className="mt-1 truncate text-sm text-foreground/80">{displayName}</div>
                  </div>
                  <DropdownMenuSeparator className="my-1 bg-white/8" />
                  <DropdownMenuItem asChild className="rounded-xl px-3 py-2.5 text-sm text-foreground/75 focus:bg-white/[0.06] focus:text-foreground">
                    <a href="/account#profile">Profile</a>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-xl px-3 py-2.5 text-sm text-foreground/75 focus:bg-white/[0.06] focus:text-foreground">
                    <a href="/account#addresses">Addresses</a>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-xl px-3 py-2.5 text-sm text-foreground/75 focus:bg-white/[0.06] focus:text-foreground">
                    <a href="/account#orders">Orders</a>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-1 bg-white/8" />
                  <DropdownMenuItem
                    className="rounded-xl px-3 py-2.5 text-sm text-foreground/75 focus:bg-white/[0.06] focus:text-foreground"
                    onSelect={(event) => {
                      event.preventDefault();
                      void handleSignOut();
                    }}
                  >
                    <LogOut className="size-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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

function getInitials(name: string, email: string) {
  const fromName = name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("");

  if (fromName) {
    return fromName.toUpperCase();
  }

  return email
    .split("@")[0]
    .split(/[._-]/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}