# Orders Management System - Quick Reference

## ⚡ Quick Start (5 minutes)

### 1. Set up database (Supabase)
```
Go to: Supabase Dashboard → SQL Editor → New Query
Paste & Run: supabase/migrations/001_orders_management.sql
```

### 2. Verify env vars
```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
STRIPE_SECRET
SUPABASE_URL
SUPABASE_SERVICE_KEY
```

### 3. Test it
- Complete a Stripe checkout (test card: 4242 4242 4242 4242)
- Go to `/admin/orders` to see your order
- Click it to view details and test status updates

---

## 📁 File Structure

```
src/
├── lib/
│   └── admin-orders.ts          # Orders queries & utilities
├── routes/
│   ├── admin.orders.tsx         # Admin orders page
│   └── api/
│       ├── complete-checkout-session.ts  # [UPDATED]
│       └── update-order-status.ts         # Status updates
├── components/site/
│   └── OrderDetailsModal.tsx    # Order details view
└── docs/
    └── orders-management.md     # Full documentation

supabase/
└── migrations/
    └── 001_orders_management.sql    # Database setup
```

---

## 🔄 Data Flow

### Creating an Order
```
Customer Checkout
    ↓
Address Selected
    ↓
Stripe Payment
    ↓
Redirect: /success?session_id=xxx
    ↓
complete-checkout-session API
    - Fetch Stripe session & line items
    - Generate order number: ORD-{timestamp}-{random}
    - Save to Supabase with status='pending'
    ↓
Success Page Shows Order #
```

### Updating Order Status
```
Admin Views /admin/orders
    ↓
Clicks Order Row
    ↓
OrderDetailsModal Opens
    ↓
Admin Selects New Status
    ↓
update-order-status API Called
    ↓
Supabase Updates Status
    ↓
Modal & Table Auto-Refresh
```

---

## 📊 Database Schema

### Orders Table
```sql
id                TEXT PRIMARY KEY       -- Stripe session ID
order_number      TEXT UNIQUE           -- ORD-{timestamp}-{random}
customer_email    TEXT                  -- From Stripe
customer_name     TEXT                  -- From shipping address
amount_total      INTEGER               -- Cents
currency          TEXT                  -- USD, etc.
payment_status    TEXT                  -- From Stripe
status            order_status ENUM     -- pending|processing|shipped|delivered|cancelled
line_items        JSONB                 -- Stripe line items
raw_session       JSONB                 -- Full Stripe session
shipping_address  JSONB                 -- From checkout
created_at        TIMESTAMP             -- Auto
updated_at        TIMESTAMP             -- Auto
```

---

## 🎨 Status Colors

| Status | Color | Meaning |
|--------|-------|---------|
| Pending | Yellow | Just created, awaiting fulfillment |
| Processing | Blue | Being prepared for shipment |
| Shipped | Purple | On its way |
| Delivered | Green | Successfully delivered |
| Cancelled | Red | Order cancelled |

---

## 🔍 Admin Features

### Orders Table
- **Search**: Order #, Customer Name, Email
- **Filter**: By status (All, Pending, Processing, etc.)
- **Sort**: By Date, Customer, Total, Status (click column header)
- **Rows**: Click any row to open details

### Order Details Modal
- **View**: Products, quantities, prices, customer info, address
- **Update**: Status selector with live updates
- **Info**: Order number, date, payment status, totals

---

## 📡 API Endpoints

### POST /api/update-order-status
```
Request:
{
  "orderId": "ch_3Oxxxxxxxx",
  "status": "processing"
}

Response:
{
  "success": true,
  "order": { ... updated order ... }
}

Errors:
- 400: Missing orderId/status or invalid status
- 404: Order not found
- 501: Supabase not configured
- 502: Supabase error
- 500: Server error
```

---

## 🎯 Order Statuses

```
PENDING → PROCESSING → SHIPPED → DELIVERED
    ↓
    └─→ CANCELLED (from any state)
```

Status can be changed to any other status at any time.

---

## 🧪 Test Checklist

- [ ] Migration ran successfully in Supabase
- [ ] Orders table exists with all columns
- [ ] Environment variables are set
- [ ] Complete a test checkout
- [ ] Order appears in `/admin/orders`
- [ ] Can search for order by number
- [ ] Can filter by status
- [ ] Can sort by columns
- [ ] Can click row to open details
- [ ] Can change status in modal
- [ ] Status updates reflected in table
- [ ] Error messages display correctly
- [ ] Loading states show properly

---

## ⚠️ Troubleshooting

### Orders not appearing after checkout
```
1. Check Supabase: SELECT * FROM orders;
2. Check browser console for errors
3. Verify complete-checkout-session returns 200
4. Check SUPABASE_SERVICE_KEY is set
```

### Status updates failing
```
1. Check Supabase service key
2. Verify POST to /api/update-order-status succeeds
3. Check browser network tab
4. Look for Supabase error in response
```

### Orders table doesn't exist
```
1. Go to Supabase SQL Editor
2. Run: SELECT * FROM information_schema.tables WHERE table_name='orders';
3. If empty, run migration: 001_orders_management.sql
```

---

## 📚 Full Documentation

See: `src/docs/orders-management.md` for:
- Complete setup instructions
- Detailed API documentation
- Data types and interfaces
- Architecture overview
- Real-world usage examples
- Performance notes
- Security details
- Future enhancements

---

## 🚀 What's Next?

Future enhancements:
- [ ] Email notifications on status changes
- [ ] Customer order history page
- [ ] Invoice generation & PDF download
- [ ] Shipment tracking
- [ ] Bulk status updates
- [ ] Order history timeline
- [ ] Export to CSV
- [ ] Admin notes on orders
- [ ] Refund workflow
