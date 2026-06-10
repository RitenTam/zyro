import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency for order amounts (stored in cents)
 * Used for order totals, line items, etc. from Supabase
 * 
 * @param cents - Amount in smallest currency unit (e.g., 250000 cents = NPR 2,500)
 * @param currency - Currency code (default: "NPR")
 * @param locale - Locale for formatting (default: "en-NP")
 * @returns Formatted currency string (e.g., "NPR 2,500" or "—" if null)
 */
export function formatCurrency(
  cents: number | null,
  currency: string = "NPR",
  locale: string = "en-NP"
): string {
  if (cents === null || Number.isNaN(cents)) return "—";
  const amount = cents / 100;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount);
}

/**
 * Format price for product/cart display (stored in currency units)
 * Used for product prices, cart items, etc. in the application
 * 
 * @param amount - Amount in currency units (e.g., 2500 = NPR 2,500)
 * @param currency - Currency code (default: "NPR")
 * @param locale - Locale for formatting (default: "en-NP")
 * @returns Formatted currency string (e.g., "NPR 2,500" or "—" if null)
 */
export function formatPrice(
  amount: number | null,
  currency: string = "NPR",
  locale: string = "en-NP"
): string {
  if (amount === null || Number.isNaN(amount)) return "—";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount);
}
