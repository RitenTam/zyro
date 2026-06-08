import { CirclePlus, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { CheckoutAddress } from "@/contexts/checkout";

interface AddressSelectorProps {
  addresses: CheckoutAddress[];
  selectedAddressId: string | null;
  onSelectAddress: (address: CheckoutAddress) => void;
  onAddNew: () => void;
  isLoading?: boolean;
}

export function AddressSelector({
  addresses,
  selectedAddressId,
  onSelectAddress,
  onAddNew,
  isLoading = false,
}: AddressSelectorProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-24 rounded-2xl border border-white/8 bg-white/[0.03] animate-pulse" />
        <div className="h-24 rounded-2xl border border-white/8 bg-white/[0.03] animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {addresses.length === 0 ? (
        <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-5 text-center text-sm text-foreground/55">
          <p>No saved addresses yet.</p>
          <p className="mt-2 text-xs">Add an address to continue with checkout.</p>
        </div>
      ) : (
        addresses.map((address) => {
          const isSelected = selectedAddressId === address.id;
          return (
            <button
              key={address.id}
              onClick={() => onSelectAddress(address)}
              className={cn(
                "w-full text-left rounded-2xl border transition-all duration-200 p-4",
                isSelected ? "border-white/25 bg-white/[0.08]" : "border-white/8 bg-white/[0.03] hover:border-white/15 hover:bg-white/[0.05]"
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <MapPin className="size-4 text-foreground/60" />
                    <span className="font-medium text-foreground/88">{address.label}</span>
                    {address.id === addresses.find((a) => a.id === selectedAddressId)?.id && (
                      <span className="text-[11px] uppercase tracking-[0.22em] text-foreground/45">Selected</span>
                    )}
                  </div>
                  <p className="text-sm leading-6 text-foreground/58 ml-6">
                    {address.recipient}
                    <br />
                    {address.line1}
                    {address.line2 ? <span>, {address.line2}</span> : null}
                    <br />
                    {address.city}, {address.region} {address.postalCode}
                    <br />
                    {address.country}
                  </p>
                  {address.deliveryNotes && (
                    <p className="text-xs leading-5 text-foreground/45 ml-6 mt-2">
                      <span className="text-foreground/40">Note: </span>
                      {address.deliveryNotes}
                    </p>
                  )}
                </div>
                <div className="ml-3 flex-shrink-0">
                  <div
                    className={cn(
                      "size-5 rounded-full border-2 flex items-center justify-center transition-all",
                      isSelected ? "border-white/40 bg-white/[0.1]" : "border-white/15 bg-transparent"
                    )}
                  >
                    {isSelected && <div className="size-2.5 rounded-full bg-white/60" />}
                  </div>
                </div>
              </div>
            </button>
          );
        })
      )}

      <Button
        type="button"
        variant="outline"
        onClick={onAddNew}
        className="w-full h-12 rounded-full border-white/10 bg-white/[0.03] text-foreground/75 hover:bg-white/[0.06]"
      >
        <CirclePlus className="mr-2 size-4" />
        Add New Address
      </Button>
    </div>
  );
}
