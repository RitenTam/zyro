# Currency Formatter Quick Reference

## Overview
This document provides quick guidance on using the centralized currency formatters in Zyro.

---

## Two Main Formatters

### 1. `formatPrice()` - For Product/Cart Prices
**Import:** `import { formatPrice } from "@/lib/utils";`

**Use When:** Displaying product prices, cart items, checkout totals
**Input:** Direct currency amount (e.g., 2500 = NPR 2,500)

```typescript
// Examples
formatPrice(2500)           // → "NPR 2,500"
formatPrice(15999.99)       // → "NPR 15,999.99"
formatPrice(null)           // → "—"
formatPrice(0)              // → "NPR 0.00"
```

**In JSX:**
```jsx
import { formatPrice } from "@/lib/utils";

function CartItem({ price }) {
  return <div className="price">{formatPrice(price)}</div>;
}
```

---

### 2. `formatCurrency()` - For Order Prices
**Import:** `import { formatCurrency } from "@/lib/admin-orders";`

**Use When:** Displaying order totals, line items, shipping costs (from Supabase)
**Input:** Amount in cents/smallest unit (e.g., 250000 cents = NPR 2,500)

```typescript
// Examples
formatCurrency(250000)      // → "NPR 2,500"
formatCurrency(1599900)     // → "NPR 15,999.00"
formatCurrency(null)        // → "—"
formatCurrency(0)           // → "NPR 0.00"
```

**In JSX:**
```jsx
import { formatCurrency } from "@/lib/admin-orders";

function OrderSummary({ orderTotal, orderCurrency }) {
  return (
    <div className="total">
      {formatCurrency(orderTotal, orderCurrency)}
    </div>
  );
}
```

---

## Decision Tree

```
Does the price need to be displayed?
├─ YES: Is it from Supabase orders?
│  ├─ YES: Use formatCurrency()
│  │       Input: amount_in_cents
│  └─ NO:  Use formatPrice()
│          Input: amount_in_currency_units
└─ NO: Skip formatting
```

---

## Common Scenarios

### Scenario 1: Display Product Price (Shopping Page)
```jsx
import { formatPrice } from "@/lib/utils";

export function ProductCard({ product }) {
  return (
    <div>
      <h3>{product.name}</h3>
      <p>{formatPrice(product.price)}</p>
    </div>
  );
}

// Output: "NPR 2,500"
```

---

### Scenario 2: Display Cart Item (Shopping Cart)
```jsx
import { formatPrice } from "@/lib/utils";

export function CartItem({ item }) {
  const totalPrice = item.price * item.quantity;
  
  return (
    <div>
      <span>Unit Price: {formatPrice(item.price)}</span>
      <span>Total: {formatPrice(totalPrice)}</span>
    </div>
  );
}

// Output: 
// "Unit Price: NPR 2,500"
// "Total: NPR 7,500"
```

---

### Scenario 3: Display Order from Database
```jsx
import { formatCurrency } from "@/lib/admin-orders";

export function OrderHistory({ orders }) {
  return (
    <div>
      {orders.map((order) => (
        <div key={order.id}>
          <p>Total: {formatCurrency(order.total, order.currency)}</p>
        </div>
      ))}
    </div>
  );
}

// Output:
// "Total: NPR 2,500"
// "Total: NPR 15,999"
```

---

### Scenario 4: Checkout Summary
```jsx
import { formatPrice } from "@/lib/utils";

export function CheckoutSummary({ items, shippingCost }) {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const total = subtotal + shippingCost;
  
  return (
    <div>
      <p>Subtotal: {formatPrice(subtotal)}</p>
      <p>Shipping: {formatPrice(shippingCost)}</p>
      <p>Total: {formatPrice(total)}</p>
    </div>
  );
}

// Output:
// "Subtotal: NPR 2,500"
// "Shipping: NPR 250"
// "Total: NPR 2,750"
```

---

### Scenario 5: Order Confirmation
```jsx
import { formatCurrency } from "@/lib/admin-orders";

export function OrderConfirmation({ order }) {
  return (
    <div>
      <h2>Order Confirmed</h2>
      <p>Order #{order.order_number}</p>
      <p>Total: {formatCurrency(order.total, order.currency)}</p>
      {order.line_items?.map((item) => (
        <div key={item.id}>
          <span>{item.description}</span>
          <span>{formatCurrency(item.amount_total, order.currency)}</span>
        </div>
      ))}
    </div>
  );
}

// Output:
// "Total: NPR 2,500"
// "Item 1: NPR 2,500"
```

---

## Advanced Usage

### Custom Currency (Not Recommended - Keep as NPR)
```jsx
// If you really need a different currency
formatPrice(2500, "USD")        // → "USD 2,500"
formatPrice(2500, "EUR")        // → "EUR 2,500"

// For orders (not recommended)
formatCurrency(250000, "USD")   // → "USD 2,500"
```

### Custom Locale (Not Recommended - Keep as en-NP)
```jsx
// If you need different formatting
formatPrice(2500, "NPR", "en-US")   // → "₨2,500.00" (different format)
formatPrice(2500, "NPR", "ne-NP")   // → "नेपाली" (Nepali numerals)
```

---

## DO's and DON'Ts

### ✅ DO
- Import `formatPrice` for product/cart prices
- Import `formatCurrency` for order prices
- Always null-check before calling (functions handle it)
- Use formatters consistently throughout app
- Keep default currency as NPR

### ❌ DON'T
- Hard-code `$` symbols (use formatters instead)
- Mix `toFixed()` with formatters
- Use `Intl.NumberFormat` directly (use formatters instead)
- Try to switch currencies without updating formatter defaults
- Forget to specify currency when displaying order data

---

## Troubleshooting

### Q: Getting wrong currency code?
**A:** Use the `currency` parameter:
```jsx
formatCurrency(amount, "NPR")  // Explicit currency
```

### Q: Wrong format/separators?
**A:** Currently locked to "en-NP" for consistency. To change, update formatter defaults in `src/lib/utils.ts`

### Q: Function not found?
**A:** Verify imports:
```jsx
// For product prices
import { formatPrice } from "@/lib/utils";

// For order prices
import { formatCurrency } from "@/lib/admin-orders";
```

### Q: Null/undefined handling?
**A:** Both formatters return "—" for null/NaN:
```jsx
formatPrice(null)          // → "—"
formatCurrency(undefined)  // → "—"
```

---

## Performance Notes

- Formatters use native `Intl.NumberFormat` (optimized)
- Minimal overhead per call
- Safe to use in rendered lists/loops
- No caching needed for normal usage

---

## Future Migration Path

If you need to change the default currency in future:

1. Update `src/lib/utils.ts`:
   ```typescript
   export function formatPrice(
     amount: number | null,
     currency: string = "USD",  // ← Change here
     locale: string = "en-US"    // ← Change here
   ) { ... }
   ```

2. Update `src/lib/admin-orders.ts`:
   ```typescript
   export function formatCurrency(
     cents: number | null,
     currency: string = "USD",  // ← Change here
     locale: string = "en-US"    // ← Change here
   ) { ... }
   ```

All application code will automatically use new defaults!

---

**Need Help?** Check the examples in the files that are already using these formatters:
- `src/routes/cart.tsx`
- `src/routes/checkout.tsx`
- `src/routes/success.tsx`
- `src/components/site/MiniCart.tsx`
