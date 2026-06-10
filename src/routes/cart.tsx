import { createFileRoute, Link } from "@tanstack/react-router";
import { useCart } from "@/contexts/cart";
import { formatPrice } from "@/lib/utils";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Cart — Zyro" },
      { name: "description", content: "Your shopping cart" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { state, updateQty, removeItem } = useCart();

  const subtotal = state.items.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <div className="pt-24 pb-20 px-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Your Cart</h1>

      {state.items.length === 0 ? (
        <div className="text-foreground/60">Your cart is empty. <Link to="/collections" className="underline">Browse cases</Link></div>
      ) : (
        <div className="space-y-6">
          {state.items.map((item) => (
            <div key={`${item.productId}-${item.variantId ?? "default"}`} className="flex items-center gap-4">
              <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-md" />
              <div className="flex-1">
                <div className="font-semibold">{item.name}</div>
                <div className="text-foreground/60">{formatPrice(item.price)}</div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => updateQty(item.productId, item.variantId, Math.max(1, item.qty - 1))} className="px-3 py-1 border rounded">−</button>
                <div className="w-8 text-center">{item.qty}</div>
                <button onClick={() => updateQty(item.productId, item.variantId, item.qty + 1)} className="px-3 py-1 border rounded">+</button>
              </div>
              <div className="w-24 text-right font-medium">{formatPrice(item.price * item.qty)}</div>
              <button onClick={() => removeItem(item.productId, item.variantId)} className="text-foreground/60">Remove</button>
            </div>
          ))}

          <div className="border-t border-white/10 pt-4 flex justify-between items-center">
            <div className="text-lg font-semibold">Subtotal</div>
            <div className="text-lg font-semibold">{formatPrice(subtotal)}</div>
          </div>

          <p className="text-sm text-foreground/60">
            Ready to complete your order? Use checkout to enter shipping details and place your order with cash on delivery.
          </p>

          <div className="flex gap-3">
            <Link to="/checkout" className="btn-primary">Checkout</Link>
            <Link to="/collections" className="btn-secondary">Continue shopping</Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default Route;
