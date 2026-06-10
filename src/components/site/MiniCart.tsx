import { Link } from "@tanstack/react-router";
import { useCart } from "@/contexts/cart";
import { useEffect, useRef, useState } from "react";
import { formatPrice } from "@/lib/utils";

export function MiniCart({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { state, removeItem, updateQty, clear } = useCart();
  const closeRef = useRef<HTMLButtonElement | null>(null);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) {
      document.addEventListener("keydown", onKey);
      // small mount delay so transitions run
      const prefersReduced = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReduced) {
        setMounted(true);
        setTimeout(() => closeRef.current?.focus(), 0);
      } else {
        setMounted(false);
        // trigger animation on next tick
        const t = setTimeout(() => {
          setMounted(true);
          closeRef.current?.focus();
        }, 10);
        return () => clearTimeout(t);
      }
    }
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  // Focus trap: keep focus inside the dialog while open
  useEffect(() => {
    if (!isOpen) return;
    const root = document.getElementById('mini-cart');
    if (!root) return;

    const focusable = Array.from(root.querySelectorAll<HTMLElement>(
      'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
    )).filter((el) => !el.hasAttribute('disabled'));
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    function onKey(e: KeyboardEvent) {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen]);

  if (!isOpen) return null;

  const total = state.items.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-200 ${mounted ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
        aria-hidden
      />

      <div
        id="mini-cart"
        role="dialog"
        aria-modal="true"
        className={`fixed right-6 top-16 z-50 w-80 bg-background border border-white/5 rounded-sm shadow-2xl p-6 transform transition-all duration-200 ease-out ${mounted ? "translate-x-0 opacity-100" : "translate-x-6 opacity-0"}`}
      >
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-light text-lg tracking-tight">Cart</h3>
        <button ref={closeRef} onClick={onClose} aria-label="Close cart" className="text-foreground/40 hover:text-foreground transition-colors">✕</button>
      </div>

      {state.items.length === 0 ? (
        <div className="text-foreground/40 text-sm font-light">Your cart is empty.</div>
      ) : (
        <div className="space-y-4">
          {state.items.map((item) => (
            <div key={`${item.productId}-${item.variantId ?? "default"}`} className="flex gap-3 items-start pb-4 border-b border-white/5">
              <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-sm flex-shrink-0" />
              <div className="flex-1 text-sm">
                <div className="font-medium text-foreground/90">{item.name}</div>
                <div className="text-foreground/50 text-xs mt-1">{formatPrice(item.price)}</div>
                <div className="mt-3 inline-flex items-center gap-2 border border-white/10 rounded-sm">
                  <button
                    onClick={() => updateQty(item.productId, item.variantId, Math.max(1, item.qty - 1))}
                    className="w-6 h-6 flex items-center justify-center text-foreground/60 hover:text-[#2B7FFF] transition-colors"
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <div className="w-6 text-center text-xs">{item.qty}</div>
                  <button
                    onClick={() => updateQty(item.productId, item.variantId, item.qty + 1)}
                    className="w-6 h-6 flex items-center justify-center text-foreground/60 hover:text-[#2B7FFF] transition-colors"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <button onClick={() => removeItem(item.productId, item.variantId)} className="text-foreground/40 hover:text-foreground/80 text-xs font-light transition-colors">Remove</button>
              </div>
            </div>
          ))}

          <div className="border-t border-white/5 pt-4 flex justify-between items-center">
            <div className="font-light text-foreground/80">Total</div>
            <div className="font-medium text-[#2B7FFF]">{formatPrice(total)}</div>
          </div>

          <div className="mt-4 space-y-3">
            <Link to="/cart" className="btn-primary w-full inline-block text-center">View Cart</Link>
            <button onClick={() => { clear(); onClose(); }} className="btn-secondary w-full">Clear</button>
          </div>
        </div>
      )}
    </div>
    </>
  );
}

export default MiniCart;
