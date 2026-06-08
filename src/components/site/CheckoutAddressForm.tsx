import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { CheckoutAddress } from "@/contexts/checkout";

interface CheckoutAddressFormProps {
  onSubmit: (address: CheckoutAddress) => void;
  onCancel: () => void;
  isLoading?: boolean;
  initialAddress?: Partial<CheckoutAddress>;
  submitLabel?: string;
}

export const emptyCheckoutAddressForm: Partial<CheckoutAddress> = {
  id: "",
  label: "",
  recipient: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  region: "",
  postalCode: "",
  country: "Nepal",
  deliveryNotes: "",
};

export function CheckoutAddressForm({
  onSubmit,
  onCancel,
  isLoading = false,
  initialAddress,
  submitLabel = "Use this address",
}: CheckoutAddressFormProps) {
  const [form, setForm] = useState<Partial<CheckoutAddress>>({ ...emptyCheckoutAddressForm, ...initialAddress });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setForm({ ...emptyCheckoutAddressForm, ...initialAddress });
  }, [initialAddress]);

  function validateForm(): boolean {
    const newErrors: Record<string, string> = {};

    if (!form.label?.trim()) newErrors.label = "Address label is required";
    if (!form.recipient?.trim()) newErrors.recipient = "Recipient name is required";
    if (!form.phone?.trim()) newErrors.phone = "Phone number is required";
    if (!form.line1?.trim()) newErrors.line1 = "Street address is required";
    if (!form.city?.trim()) newErrors.city = "City is required";
    if (!form.region?.trim()) newErrors.region = "State/Region is required";
    if (!form.postalCode?.trim()) newErrors.postalCode = "Postal code is required";
    if (!form.country?.trim()) newErrors.country = "Country is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validateForm()) return;

    const newAddress: CheckoutAddress = {
      ...(form.id ? { id: form.id.trim() } : {}),
      label: form.label?.trim() || "",
      recipient: form.recipient?.trim() || "",
      phone: form.phone?.trim() || "",
      line1: form.line1?.trim() || "",
      line2: form.line2?.trim() || "",
      city: form.city?.trim() || "",
      region: form.region?.trim() || "",
      postalCode: form.postalCode?.trim() || "",
      country: form.country?.trim() || "",
      deliveryNotes: form.deliveryNotes?.trim() || "",
    };

    onSubmit(newAddress);
  }

  function updateField<K extends keyof CheckoutAddress>(key: K, value: CheckoutAddress[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    if (errors[key]) {
      setErrors((current) => ({ ...current, [key]: undefined }));
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Address label" error={errors.label}>
          <Input
            value={form.label || ""}
            onChange={(e) => updateField("label", e.target.value)}
            placeholder="Home, Office, etc."
            className="h-12 rounded-2xl border-white/10 bg-white/[0.03] px-4 text-sm text-foreground placeholder:text-foreground/30 focus-visible:ring-1 focus-visible:ring-white/20"
            disabled={isLoading}
          />
        </FormField>

        <FormField label="Recipient name" error={errors.recipient}>
          <Input
            value={form.recipient || ""}
            onChange={(e) => updateField("recipient", e.target.value)}
            placeholder="Full name"
            className="h-12 rounded-2xl border-white/10 bg-white/[0.03] px-4 text-sm text-foreground placeholder:text-foreground/30 focus-visible:ring-1 focus-visible:ring-white/20"
            disabled={isLoading}
          />
        </FormField>

        <FormField label="Phone" error={errors.phone}>
          <Input
            value={form.phone || ""}
            onChange={(e) => updateField("phone", e.target.value)}
            placeholder="Phone number"
            className="h-12 rounded-2xl border-white/10 bg-white/[0.03] px-4 text-sm text-foreground placeholder:text-foreground/30 focus-visible:ring-1 focus-visible:ring-white/20"
            disabled={isLoading}
          />
        </FormField>

        <FormField label="Country" error={errors.country}>
          <Input
            value={form.country || ""}
            onChange={(e) => updateField("country", e.target.value)}
            placeholder="Country"
            className="h-12 rounded-2xl border-white/10 bg-white/[0.03] px-4 text-sm text-foreground placeholder:text-foreground/30 focus-visible:ring-1 focus-visible:ring-white/20"
            disabled={isLoading}
          />
        </FormField>

        <FormField label="Street address" error={errors.line1} className="sm:col-span-2">
          <Input
            value={form.line1 || ""}
            onChange={(e) => updateField("line1", e.target.value)}
            placeholder="Street address"
            className="h-12 rounded-2xl border-white/10 bg-white/[0.03] px-4 text-sm text-foreground placeholder:text-foreground/30 focus-visible:ring-1 focus-visible:ring-white/20"
            disabled={isLoading}
          />
        </FormField>

        <FormField label="Apartment, suite, etc." error={errors.line2} className="sm:col-span-2">
          <Input
            value={form.line2 || ""}
            onChange={(e) => updateField("line2", e.target.value)}
            placeholder="Apartment, suite, etc. (optional)"
            className="h-12 rounded-2xl border-white/10 bg-white/[0.03] px-4 text-sm text-foreground placeholder:text-foreground/30 focus-visible:ring-1 focus-visible:ring-white/20"
            disabled={isLoading}
          />
        </FormField>

        <FormField label="City" error={errors.city}>
          <Input
            value={form.city || ""}
            onChange={(e) => updateField("city", e.target.value)}
            placeholder="City"
            className="h-12 rounded-2xl border-white/10 bg-white/[0.03] px-4 text-sm text-foreground placeholder:text-foreground/30 focus-visible:ring-1 focus-visible:ring-white/20"
            disabled={isLoading}
          />
        </FormField>

        <FormField label="State/Region" error={errors.region}>
          <Input
            value={form.region || ""}
            onChange={(e) => updateField("region", e.target.value)}
            placeholder="State or region"
            className="h-12 rounded-2xl border-white/10 bg-white/[0.03] px-4 text-sm text-foreground placeholder:text-foreground/30 focus-visible:ring-1 focus-visible:ring-white/20"
            disabled={isLoading}
          />
        </FormField>

        <FormField label="Postal code" error={errors.postalCode}>
          <Input
            value={form.postalCode || ""}
            onChange={(e) => updateField("postalCode", e.target.value)}
            placeholder="Postal code"
            className="h-12 rounded-2xl border-white/10 bg-white/[0.03] px-4 text-sm text-foreground placeholder:text-foreground/30 focus-visible:ring-1 focus-visible:ring-white/20"
            disabled={isLoading}
          />
        </FormField>

        <FormField label="Delivery notes (optional)" className="sm:col-span-2">
          <Textarea
            value={form.deliveryNotes || ""}
            onChange={(e) => updateField("deliveryNotes", e.target.value)}
            placeholder="Special instructions for delivery (optional)"
            className="min-h-20 rounded-2xl border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground placeholder:text-foreground/30 focus-visible:ring-1 focus-visible:ring-white/20"
            disabled={isLoading}
          />
        </FormField>
      </div>

      <div className="flex flex-wrap gap-3 pt-4">
        <Button type="submit" disabled={isLoading} className="h-12 rounded-full px-5">
          {isLoading ? "Saving address…" : submitLabel}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="h-12 rounded-full border-white/10 bg-white/[0.03] px-5 text-foreground/75 hover:bg-white/[0.06]"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

function FormField({
  label,
  error,
  children,
  className,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-foreground/70">{label}</Label>
      {children}
      {error && <p className="text-xs text-red-400/80">{error}</p>}
    </div>
  );
}
