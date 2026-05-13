import { createContext, useContext, useEffect, useReducer } from "react";

export interface CartItem {
  productId: string;
  variantId?: string;
  name: string;
  price: number;
  qty: number;
  image?: string;
  color?: string;
}

interface CartState {
  items: CartItem[];
  lastAdded?: CartItem | null;
}

type Action =
  | { type: "ADD"; item: CartItem }
  | { type: "REMOVE"; productId: string; variantId?: string }
  | { type: "UPDATE_QTY"; productId: string; variantId?: string; qty: number }
  | { type: "CLEAR" }
  | { type: "SET_LAST_ADDED"; item?: CartItem | null };

const STORAGE_KEY = "zyro_cart_v1";

function reducer(state: CartState, action: Action): CartState {
  switch (action.type) {
    case "ADD": {
      const existingIndex = state.items.findIndex(
        (i) => i.productId === action.item.productId && i.variantId === action.item.variantId
      );
      let items = [...state.items];
      if (existingIndex > -1) {
        const existing = items[existingIndex];
        items[existingIndex] = { ...existing, qty: existing.qty + action.item.qty };
      } else {
        items.push(action.item);
      }
      return { items, lastAdded: action.item };
    }
    case "REMOVE": {
      const items = state.items.filter(
        (i) => !(i.productId === action.productId && i.variantId === action.variantId)
      );
      return { ...state, items };
    }
    case "UPDATE_QTY": {
      const items = state.items.map((i) => {
        if (i.productId === action.productId && i.variantId === action.variantId) {
          return { ...i, qty: action.qty };
        }
        return i;
      });
      return { ...state, items };
    }
    case "CLEAR":
      return { items: [], lastAdded: null };
    case "SET_LAST_ADDED":
      return { ...state, lastAdded: action.item ?? null };
    default:
      return state;
  }
}

const CartContext = createContext<{
  state: CartState;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, variantId?: string) => void;
  updateQty: (productId: string, variantId: string | undefined, qty: number) => void;
  clear: () => void;
} | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [], lastAdded: null }, (init) => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return init;
      return { ...init, items: JSON.parse(raw) } as CartState;
    } catch (e) {
      return init;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    } catch (e) {
      // ignore storage errors
    }
  }, [state.items]);

  useEffect(() => {
    if (state.lastAdded) {
      const t = setTimeout(() => dispatch({ type: "SET_LAST_ADDED", item: null }), 3000);
      return () => clearTimeout(t);
    }
  }, [state.lastAdded]);

  const value = {
    state,
    addItem(item: CartItem) {
      dispatch({ type: "ADD", item });
    },
    removeItem(productId: string, variantId?: string) {
      dispatch({ type: "REMOVE", productId, variantId });
    },
    updateQty(productId: string, variantId: string | undefined, qty: number) {
      dispatch({ type: "UPDATE_QTY", productId, variantId, qty });
    },
    clear() {
      dispatch({ type: "CLEAR" });
    },
  };

  return (
    <CartContext.Provider value={value}>
      {children}
      {state.lastAdded && (
        <div
          aria-live="polite"
          className="fixed right-6 bottom-6 z-50 bg-foreground text-background px-4 py-3 rounded-md shadow-lg"
        >
          Added to cart — {state.lastAdded.name}
        </div>
      )}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

export default CartProvider;
