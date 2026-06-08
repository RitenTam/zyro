# Orders Management System Documentation

Complete orders management implementation for the Zyro e-commerce platform, including customer order creation, admin dashboard, and order tracking.

## Overview

The system automatically creates orders when customers complete checkout, stores all order data in Supabase, and provides a full-featured admin dashboard for order management and fulfillment tracking.

### Features

✅ **Automatic Order Creation**: Orders created immediately after successful Stripe payment
✅ **Unique Order Numbers**: Format: `ORD-{timestamp}-{randomString}`
✅ **Complete Order Data**: Products, quantities, prices, customer info, and shipping address
✅ **Status Tracking**: Pending → Processing → Shipped → Delivered or Cancelled
✅ **Searchable Admin Dashboard**: Filter by order number, customer name, email
✅ **Sortable Table**: Sort by date, customer, amount, or status
✅ **Order Details Modal**: View all order details including products and shipping address
✅ **Real-time Status Updates**: Update order status with automatic dashboard refresh
✅ **Error Handling**: Loading states, error messages, and automatic retry

---

## Setup Instructions

### 1. Database Migration

Run the migration in Supabase Dashboard (SQL Editor):

```sql
-- File: supabase/migrations/001_orders_management.sql
-- This creates the orders table with all necessary columns and indices
```

Or run directly:
```bash
npm.cmd exec supabase -- migration up
```

**Tables Created**:
- `orders` - Main orders table with full order data
- Indices on: order_number, status, customer_email, created_at

**Columns**:
- `id` (TEXT PRIMARY KEY) - Stripe session ID
- `order_number` (TEXT UNIQUE) - Human-readable order number
- `customer_email` (TEXT) - Customer email
- `customer_name` (TEXT) - Customer name from shipping address
- `amount_total` (INTEGER) - Total in cents
- `currency` (TEXT) - Currency code (e.g., "usd")
- `payment_status` (TEXT) - Stripe payment status
- `status` (order_status ENUM) - Order status (pending, processing, shipped, delivered, cancelled)
- `line_items` (JSONB) - Stripe line items
- `raw_session` (JSONB) - Full Stripe session data
- `shipping_address` (JSONB) - Shipping address from checkout
- `created_at` (TIMESTAMP) - Order creation date
- `updated_at` (TIMESTAMP) - Last update date

### 2. Environment Variables

Ensure these are set in your `.env` (already configured):

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
STRIPE_SECRET=your_stripe_secret
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_role_key
```

---

## Customer Side Implementation

### Order Creation Flow (Automatic)

1. **Checkout Initiated** → Customer selects address
2. **Address Passed to Stripe** → Via create-checkout-session API
3. **Stripe Payment** → Customer completes payment
4. **Success Redirect** → Browser redirects to `/success?session_id=xxx`
5. **Order Finalization** → complete-checkout-session API:
   - Fetches Stripe session and line items
   - Generates unique order number
   - Extracts shipping address from metadata
   - Creates order record in Supabase
6. **Success Page** → Shows order confirmation

**File**: `src/routes/api/complete-checkout-session.ts`

Key Logic:
```typescript
// Generate unique order number
const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

// Extract customer name from shipping address
const customerName = shippingAddress.recipient || session.customer_details?.name || "Guest";

// Create order with initial status
const order = {
  id: session.id,
  order_number: orderNumber,
  customer_email: session.customer_details?.email ?? null,
  customer_name: customerName,
  amount_total: session.amount_total ?? null,
  currency: session.currency ?? null,
  payment_status: session.payment_status ?? null,
  status: "pending",
  line_items: JSON.stringify(lineItems?.data ?? []),
  raw_session: JSON.stringify(session),
  shipping_address: JSON.stringify(shippingAddress),
};
```

---

## Admin Side Implementation

### Admin Orders Page

**Route**: `/admin/orders`
**File**: `src/routes/admin.orders.tsx`

#### Features

1. **Searchable Table**
   - Search by: order number, customer name, customer email
   - Real-time filtering with debounce

2. **Status Filtering**
   - Filter by: All, Pending, Processing, Shipped, Delivered, Cancelled

3. **Sortable Columns**
   - Date (created_at)
   - Customer (customer_name)
   - Total (amount_total)
   - Status (status)
   - Click column header to toggle sort order

4. **Order Details Modal**
   - Click any row to open details
   - Shows: Products, customer info, shipping address, totals
   - In-modal status updates

5. **Auto-Refresh**
   - Refresh button to reload orders
   - Auto-refresh after status updates

#### UI Layout

```
Header
  ├─ Back to Admin
  ├─ Title: "Orders"
  └─ Count: "X order(s)"

Controls
  ├─ Search input (order #, customer, email)
  ├─ Status filter dropdown
  └─ Refresh button

Table
  ├─ Headers: Date | Customer | Order # | Total | Status
  ├─ Rows: Clickable order rows
  └─ Empty/Loading/Error states

Order Details Modal (on row click)
  ├─ Order number & date
  ├─ Status selector (dropdown)
  ├─ Order summary (total, items, currency)
  ├─ Ordered products (with quantities & prices)
  ├─ Customer info (name, email)
  ├─ Shipping address
  └─ Stripe session ID
```

### Admin Orders Library

**File**: `src/lib/admin-orders.ts`

#### Functions

```typescript
// Fetch all orders
fetchAdminOrders(): Promise<AdminOrderRow[]>

// Fetch single order by ID
fetchOrderById(orderId: string): Promise<AdminOrderRow>

// Update order status
updateOrderStatus(orderId: string, status: OrderStatus): Promise<AdminOrderRow>

// Formatting helpers
formatOrderDate(dateString: string): string         // "Jan 15, 2024"
formatOrderDateTime(dateString: string): string     // "Jan 15, 2024, 02:30 PM"
formatCurrency(cents: number, currency: string): string  // "$99.99"
```

#### Types

```typescript
type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled"

interface AdminOrderRow {
  id: string
  order_number: string
  customer_email: string | null
  customer_name: string | null
  amount_total: number | null  // in cents
  currency: string | null
  payment_status: string | null
  status: OrderStatus
  line_items: LineItem[]
  raw_session?: Record<string, any>
  shipping_address: ShippingAddress
  created_at: string
  updated_at: string
}
```

#### Constants

```typescript
ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled"
}

ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  processing: "bg-blue-100 text-blue-800 border-blue-200",
  shipped: "bg-purple-100 text-purple-800 border-purple-200",
  delivered: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200"
}
```

### Order Details Modal

**File**: `src/components/site/OrderDetailsModal.tsx`

**Props**:
```typescript
interface OrderDetailsModalProps {
  order: AdminOrderRow | null      // The order to display
  isOpen: boolean                  // Whether modal is visible
  onClose: () => void              // Callback when modal closes
  onOrderUpdated?: () => void      // Callback after status update (for refresh)
}
```

**Features**:
- Display in modal (Dialog component)
- Show all order details
- Status selector with update functionality
- In-modal status update with loading state
- Error handling and toast notifications
- Auto-refresh orders list after update

---

## API Endpoints

### Update Order Status

**Endpoint**: `POST /api/update-order-status`

**Request Body**:
```json
{
  "orderId": "ch_3Oxxxxxxxx",
  "status": "processing"
}
```

**Response**:
```json
{
  "success": true,
  "order": {
    "id": "ch_3Oxxxxxxxx",
    "order_number": "ORD-1705329600000-ABC123XYZ",
    "status": "processing",
    ...
  }
}
```

**Status Codes**:
- `200` - Success
- `400` - Missing orderId/status or invalid status
- `404` - Order not found
- `501` - Supabase not configured
- `502` - Supabase error
- `500` - Server error

**File**: `src/routes/api/update-order-status.ts`

---

## Navigation & Links

### Admin Dashboard

After adding the Orders page, the admin dashboard (`/admin`) includes:

1. **Products** → `/admin/products`
2. **Inventory** → `/admin/inventory`
3. **Orders** → `/admin/orders` (NEW)
4. **Customers** → Placeholder

Each card shows on the dashboard when not viewing that section. Click the "Open orders" button to navigate.

---

## Status Workflow

Recommended order status flow:

```
Order Created
    ↓
[pending] - Initial state after payment
    ↓
[processing] - Order is being prepared
    ↓
[shipped] - Order has been shipped
    ↓
[delivered] - Order delivered to customer
```

Or:

```
[pending] → [cancelled] - If customer cancels or payment issue
```

Status can be changed to any other status at any time via the admin dashboard.

---

## Error Handling

### Customer Side (Checkout)

1. **Missing address** → 400 Bad Request
2. **Stripe error** → 502 Bad Gateway with error message
3. **Supabase error** → 502 Bad Gateway with error message
4. **Network error** → Error message on success page

### Admin Side

1. **Supabase not configured** → Alert banner with error
2. **Failed to load orders** → Alert banner with error
3. **Failed to update status** → Toast error notification
4. **Order not found** → Toast error notification

### Loading States

- Table rows show loading skeleton while fetching
- Status update shows spinner while updating
- Refresh button shows spin animation while fetching
- Empty state shows when no orders exist

---

## Real-World Flow Example

### Customer Creates Order

1. Customer adds products to cart
2. Navigates to checkout (`/checkout`)
3. Selects or creates shipping address
4. Completes Stripe payment
5. Redirected to `/success?session_id=cs_xxx`
6. Order finalized and saved to Supabase:
   - Order #: `ORD-1705329600000-ABC123XYZ`
   - Status: `pending`
   - Customer: `John Doe` (from address)
   - Total: `$129.99`

### Admin Reviews & Ships Order

1. Admin navigates to `/admin/orders`
2. Sees new order in list
3. Searches for customer or order number (optional)
4. Clicks row to open order details
5. Views products, address, and customer info
6. Updates status: `pending` → `processing`
7. Order is packed and ready
8. Updates status: `processing` → `shipped`
9. System automatically refreshes list
10. Order moves to new status with updated badge

---

## Troubleshooting

### Orders not appearing

**Symptoms**: Admin orders page is empty despite completed checkouts

**Solutions**:
1. Check Supabase dashboard → SQL Editor → Run `SELECT * FROM orders;`
2. Verify migration was run: Check for `orders` table in Supabase
3. Check browser console for errors during checkout
4. Verify `SUPABASE_SERVICE_KEY` is set in environment
5. Check network tab: POST to `/api/complete-checkout-session` should return 200

### Status updates not saving

**Symptoms**: Status selector changes but order doesn't update

**Solutions**:
1. Check Supabase service key is correct
2. Check network tab: POST to `/api/update-order-status` should return 200
3. Check browser console for errors
4. Verify order exists in Supabase
5. Check Supabase row-level security policies aren't blocking updates

### Missing order details

**Symptoms**: Order appears in list but details modal is empty

**Solutions**:
1. Verify line_items and shipping_address are stored as JSON
2. Check data was stored correctly: `SELECT * FROM orders WHERE id='xxx';`
3. Verify JSON parsing in OrderDetailsModal component
4. Check browser console for parse errors

---

## Performance Notes

- Orders table indexed on: order_number, status, customer_email, created_at
- Queries optimized for typical admin use cases
- Loading states prevent UI blocking
- Debounced search input reduces unnecessary queries
- Real-time updates use React Query for efficient caching

---

## Security

- Order data only accessible via authenticated admin routes (AdminGate component)
- Status updates use server-side API with SUPABASE_SERVICE_KEY
- Row-level security policies on orders table
- No sensitive data exposed to client

---

## Future Enhancements

Potential improvements for future versions:

- Order history/timeline view
- Bulk status updates
- Email notifications on status changes
- Invoice generation and PDF download
- Shipment tracking integration
- Customer order history page
- Refund/cancellation workflow
- Order notes/comments for admins
- Export orders to CSV/Excel
