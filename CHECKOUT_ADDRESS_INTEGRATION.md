# Address System Integration in Checkout

This document outlines the complete integration of the customer address system into the checkout flow.

## Overview

Users can now manage their shipping addresses during checkout without leaving the purchase flow. Addresses are automatically synced from their account, and users can:
- Select from saved addresses
- Pre-select their default address
- Add new addresses inline
- See address details and delivery notes

## Database Schema Requirements

### Orders Table
The `orders` table requires a new column to store shipping address information:

```sql
ALTER TABLE orders ADD COLUMN shipping_address JSONB;
```

This column stores the address information in JSON format with the following structure:
```json
{
  "label": "Home",
  "recipient": "John Doe",
  "phone": "+1234567890",
  "line1": "123 Main St",
  "line2": "Apt 4B",
  "city": "New York",
  "region": "NY",
  "postal_code": "10001",
  "country": "US",
  "delivery_notes": "Ring bell twice"
}
```

## Architecture

### New Components

#### 1. AddressSelector (`src/components/site/AddressSelector.tsx`)
Displays all saved addresses with radio-style selection UI:
- Shows address label, recipient, full address
- Displays delivery notes if present
- Highlights selected address
- "Add New Address" button to initiate new address form

Props:
- `addresses`: Array of CheckoutAddress
- `selectedAddressId`: Current selection
- `onSelectAddress`: Callback when address is selected
- `onAddNew`: Callback to show address form
- `isLoading`: Show loading state

#### 2. CheckoutAddressForm (`src/components/site/CheckoutAddressForm.tsx`)
Form for adding a new address during checkout:
- All required fields (label, recipient, phone, street, city, region, postal code, country)
- Optional fields (apt/suite, delivery notes)
- Client-side validation
- "Use this address" and "Cancel" buttons

Props:
- `onSubmit`: Callback with new address
- `onCancel`: Hide form
- `isLoading`: Disable during submission

### New Context

#### CheckoutContext (`src/contexts/checkout.tsx`)
Manages selected address state during checkout session:
- `selectedAddress`: Currently selected address
- `isAddingNewAddress`: Toggle address form visibility
- `selectAddress()`: Select an address
- `clearAddress()`: Clear selection
- `setIsAddingNewAddress()`: Show/hide form
- `addNewAddress()`: Add new address and select it

**Type**: `CheckoutAddress`
```typescript
type CheckoutAddress = {
  id: string;
  label: string;
  recipient: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  deliveryNotes: string;
};
```

### Updated Routes

#### Checkout Route (`src/routes/checkout.tsx`)
Major overhaul to integrate address management:

**Changes:**
1. Loads user's saved addresses from profiles table on component mount
2. Pre-selects default address automatically
3. Displays AddressSelector component
4. Allows inline addition of new addresses via CheckoutAddressForm
5. Passes selected address to checkout session creation
6. Shows error messages if no address selected
7. Disables checkout button if cart empty or address not selected

**Flow:**
```
Load addresses from user profile
    ↓
Display existing addresses with selector
    ↓
User selects or adds address
    ↓
Click "Proceed to payment"
    ↓
Send items + selected address to create-checkout-session
    ↓
Redirect to Stripe checkout
```

#### API: Create Checkout Session (`src/routes/api/create-checkout-session.ts`)

**New Request Body:**
```typescript
{
  items: CartItem[],
  address: CheckoutAddress,  // Required
  customerEmail?: string     // Optional
}
```

**Changes:**
1. Validates address is provided
2. Stores all address fields in Stripe session metadata with `address_*` prefix
3. Sets shipping address country collection to the selected address country
4. Requires billing address collection

**Metadata stored in Stripe:**
- `address_label`
- `address_recipient`
- `address_phone`
- `address_line1`
- `address_line2`
- `address_city`
- `address_region`
- `address_postal_code`
- `address_country`
- `address_delivery_notes`

#### API: Complete Checkout Session (`src/routes/api/complete-checkout-session.ts`)

**Changes:**
1. Extracts address from Stripe session metadata
2. Reconstructs address object from metadata fields
3. Stores as `shipping_address` JSON in orders table
4. Maintains existing order creation logic

## Data Flow

### Address Management
```
User Profile (Supabase)
    ↑
    │ Load addresses
    │
Checkout Route
    │
    ├─→ AddressSelector (display & select)
    │
    └─→ CheckoutAddressForm (add new)
        │
        └─→ Local state only (not saved to account)
```

### Checkout to Order
```
Selected Address
    ↓
create-checkout-session
    ├─→ Stripe Session (metadata)
    ├─→ Redirect to Stripe
    ↓
Stripe Payment
    ↓
Redirect to /success
    ↓
complete-checkout-session
    ├─→ Fetch Stripe Session
    ├─→ Extract address from metadata
    └─→ Create order with shipping_address
```

## Key Features

### ✅ Address Synchronization
- Addresses are loaded from the user's account (profiles table)
- Changes made in account page are immediately visible in checkout
- New addresses added in checkout are NOT auto-saved to account (user can save later)

### ✅ Default Address Pre-selection
- When checkout loads, automatically selects the user's default address
- User can change selection or add a new address

### ✅ Inline Address Addition
- Users can add new addresses without leaving checkout
- Form validation ensures all required fields are present
- New addresses are selected automatically upon submission

### ✅ Address Persistence with Orders
- Selected address is stored with order in Supabase
- Full address information available for fulfillment
- Delivery notes preserved for special handling

### ✅ Error Handling
- Clear error messages if addresses fail to load
- Required field validation in address form
- Checkout disabled if address not selected

## Frontend State Management

### During Checkout Session:
```
checkout.tsx state:
├─ addresses: CheckoutAddress[]
├─ selectedAddressId: string | null
├─ isAddingNewAddress: boolean
├─ isLoadingAddresses: boolean
├─ isProcessing: boolean
└─ error: string | null
```

## Testing Checklist

- [ ] Load checkout page - addresses load and default is selected
- [ ] Switch between different saved addresses
- [ ] Add new address inline - form validates and submits
- [ ] Cancel adding new address - form closes, previous selection maintained
- [ ] Proceed to payment with selected address
- [ ] Complete payment - address stored with order in Supabase
- [ ] Try checkout with no addresses - can add inline
- [ ] Try checkout with empty cart - checkout disabled
- [ ] Network error handling - errors display gracefully
- [ ] Return to checkout from Stripe - state preserved

## Future Enhancements

1. **Address Persistence**: Save new addresses from checkout to account automatically
2. **Address Validation**: Integrate address validation API (e.g., Google Places)
3. **Multiple Shipping Methods**: Show different shipping costs per address
4. **Address History**: Track frequently used addresses
5. **Billing Address**: Support separate billing address option
6. **Address Book**: Quick access to all addresses in cart

## Configuration Requirements

Ensure these environment variables are set:
- `VITE_SUPABASE_URL` - For client-side address loading
- `VITE_SUPABASE_ANON_KEY` - For client-side address loading
- `STRIPE_SECRET` - For server-side checkout session
- `SUPABASE_URL` - For server-side order creation
- `SUPABASE_SERVICE_KEY` - For server-side order creation

## Related Files

**New Files:**
- `src/contexts/checkout.tsx` - Context for checkout state
- `src/components/site/AddressSelector.tsx` - Address selection UI
- `src/components/site/CheckoutAddressForm.tsx` - Address form

**Modified Files:**
- `src/routes/checkout.tsx` - Main checkout flow
- `src/routes/api/create-checkout-session.ts` - Add address to Stripe
- `src/routes/api/complete-checkout-session.ts` - Store address with order

**Existing Files (No Changes):**
- `src/routes/account.tsx` - Address management page
- `src/contexts/cart.tsx` - Cart state
- `src/contexts/auth.tsx` - Authentication
