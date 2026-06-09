import { useEffect, useMemo, useState } from "react";
import { AlertCircle, LoaderCircle, X } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  adminOrdersQueryKey,
  formatCurrency,
  formatOrderDateTime,
  ORDER_STATUS_COLORS,
  ORDER_STATUS_LABELS,
  type AdminOrderRow,
  type LineItem,
  type OrderStatus,
} from "@/lib/admin-orders";
import { useQueryClient } from "@tanstack/react-query";

interface OrderDetailsModalProps {
  order: AdminOrderRow | null;
  isOpen: boolean;
  onClose: () => void;
  onOrderUpdated?: () => void;
}

export function OrderDetailsModal({ order, isOpen, onClose, onOrderUpdated }: OrderDetailsModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "">(order?.status ?? "");
  const queryClient = useQueryClient();

  useEffect(() => {
    if (order) {
      setSelectedStatus(order.status);
    }
  }, [order]);

  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: OrderStatus) => {
      const response = await fetch("/api/update-order-status", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ orderId: order?.id, status: newStatus }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to update order status");
      }

      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: adminOrdersQueryKey });
      toast.success("Order status updated successfully.");
      onOrderUpdated?.();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to update order status.");
      setSelectedStatus(order?.status ?? "");
    },
  });

  const handleStatusChange = async (newStatus: OrderStatus) => {
    setSelectedStatus(newStatus);
    await updateStatusMutation.mutateAsync(newStatus);
  };

  if (!order) return null;

  const totalItems = order.line_items?.length ?? 0;
  const totalQuantity = order.line_items?.reduce((sum, item) => sum + (item.quantity ?? 0), 0) ?? 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle>Order {order.order_number}</DialogTitle>
              <DialogDescription className="mt-2">
                Placed on {formatOrderDateTime(order.created_at)}
              </DialogDescription>
            </div>
            <button
              onClick={onClose}
              className="rounded-md p-1 hover:bg-foreground/10 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Status */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-3">Order Status</h3>
            <div className="flex items-center gap-3 mb-4">
              <Badge
                variant="outline"
                className={`${ORDER_STATUS_COLORS[order.status]} font-medium`}
              >
                {ORDER_STATUS_LABELS[order.status]}
              </Badge>
              <span className="text-sm text-foreground/60">
                Payment: {order.payment_status ? (order.payment_status === "paid" ? "✓ Paid" : order.payment_status) : "—"}
              </span>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Update Status</label>
              <Select value={selectedStatus} onValueChange={(value) => handleStatusChange(value as OrderStatus)}>
                <SelectTrigger disabled={updateStatusMutation.isPending}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              {updateStatusMutation.isPending && (
                <div className="flex items-center gap-2 text-sm text-foreground/60 mt-2">
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Updating...
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-3">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-foreground/60">Order Total:</span>
                <span className="font-medium">{formatCurrency(order.total, order.currency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground/60">Items:</span>
                <span>{totalQuantity} item{totalQuantity !== 1 ? "s" : ""} ({totalItems} product{totalItems !== 1 ? "s" : ""})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground/60">Currency:</span>
                <span>{order.currency?.toUpperCase() || "USD"}</span>
              </div>
            </div>
          </div>

          {/* Products */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-3">Ordered Products ({totalItems})</h3>
            {order.line_items && order.line_items.length > 0 ? (
              <div className="space-y-3">
                {order.line_items.map((item: LineItem, idx: number) => (
                  <div key={idx} className="border-b pb-3 last:border-b-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-sm">{item.description || "Product"}</p>
                        <p className="text-xs text-foreground/60 mt-1">
                          Qty: {item.quantity} × {formatCurrency(item.price?.unit_amount, order.currency)}
                        </p>
                      </div>
                      <p className="font-medium text-sm">
                        {formatCurrency(item.amount_total, order.currency)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-foreground/60 py-4">
                <AlertCircle className="h-4 w-4" />
                No product details available
              </div>
            )}
          </div>

          {/* Customer Information */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-3">Customer Information</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-foreground/60">Name:</span>
                <p className="font-medium">{order.customer_name || "—"}</p>
              </div>
              <div>
                <span className="text-foreground/60">Email:</span>
                <p className="font-medium break-all">{order.customer_email || "—"}</p>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          {order.shipping_address && (
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-3">Shipping Address</h3>
              <div className="space-y-2 text-sm">
                {order.shipping_address.recipient && (
                  <p className="font-medium">{order.shipping_address.recipient}</p>
                )}
                {order.shipping_address.line1 && (
                  <p>{order.shipping_address.line1}</p>
                )}
                {order.shipping_address.line2 && (
                  <p>{order.shipping_address.line2}</p>
                )}
                {(order.shipping_address.city || order.shipping_address.region || order.shipping_address.postal_code) && (
                  <p>
                    {order.shipping_address.city}
                    {order.shipping_address.city && order.shipping_address.region ? ", " : ""}
                    {order.shipping_address.region} {order.shipping_address.postal_code}
                  </p>
                )}
                {order.shipping_address.country && (
                  <p>{order.shipping_address.country}</p>
                )}
                {order.shipping_address.phone && (
                  <p className="text-foreground/60">Phone: {order.shipping_address.phone}</p>
                )}
                {order.shipping_address.delivery_notes && (
                  <p className="text-foreground/60 italic">Delivery Notes: {order.shipping_address.delivery_notes}</p>
                )}
              </div>
            </div>
          )}

          {/* Order ID */}
          <div className="border rounded-lg p-4 bg-foreground/5">
            <div className="text-xs text-foreground/60 mb-1">Stripe Session ID</div>
            <p className="font-mono text-xs break-all">{order.id}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
