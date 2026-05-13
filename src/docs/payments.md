# Nepal Wallets Integration (Khalti / eSewa / IME Pay)

This document outlines a lightweight integration plan for Nepali digital wallets (Khalti, eSewa, IME Pay). It covers API flow, server verification, UX considerations, and fallback options.

## Objectives
- Allow customers to pay with local wallets in Nepal.
- Verify payments server-side and record orders in Supabase (or other DB).
- Provide graceful fallback to bank transfer or cash-on-delivery.

## High-level flow
1. Client initiates checkout and selects a wallet (Khalti/eSewa/IME Pay).
2. Client requests a payment intent from our server with order details.
3. Server creates a wallet-specific payment request using the provider's API (requires secret key) and returns a checkout token/URL to client.
4. Client completes payment in wallet SDK/webview/redirect.
5. Provider calls our webhook or client returns with proof (transaction id). Server verifies transaction via provider API.
6. Once verified, server records order in `orders` table and responds to client with success.

## Provider Notes
- Khalti: offers a server-side verification endpoint and frontend widget. Documentation: https://khalti.com/developers
- eSewa: supports server-side verification and redirect flows. Docs: https://esewa.com.np/merchant
- IME Pay: wallet and QR payments; provides APIs for transaction creation and verification.

## Server endpoints (suggested)
- `POST /api/create-wallet-payment` — create a provider-specific payment and return client token/URL.
- `POST /api/verify-wallet-payment` — verify a transaction using provider's verify API (server-only; uses provider secret key).
- `POST /api/webhooks/wallet` — optional webhook endpoint to receive asynchronous confirmations.

## Security
- Keep provider secret keys in environment variables (`KHALTI_SECRET`, `ESEWA_SECRET`, `IMEPAY_SECRET`).
- Verify signatures for webhooks when available.
- Use idempotency keys when creating payment requests to avoid duplicate charges.

## Data model (Supabase `orders` table)
- id (uuid)
- user_id (nullable)
- provider ("khalti" | "esewa" | "imepay" | "stripe")
- provider_txn_id (text)
- amount (numeric)
- currency (text)
- status (text) — pending/confirmed/failed
- items jsonb — cart snapshot
- created_at, updated_at

## UX considerations
- Show clear confirmation and transaction id after payment.
- Handle failures with a clear retry/fallback flow.
- For wallets that redirect, show an intermediate "Waiting for payment confirmation" page and poll verification endpoint.

## Next steps
1. Pick primary wallet(s) to implement first (recommend: Khalti, then eSewa).
2. Create server endpoint scaffolding with tests that mock provider responses.
3. Implement webhook verification and persist orders.
4. Add e2e test for checkout flow.
