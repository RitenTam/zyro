import { Link, createFileRoute } from "@tanstack/react-router";
console.log("[admin-orders] module imported: src/routes/admin.orders.tsx");
import {
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  ArrowLeft,
  ArrowUpDown,
  AlertCircle,
  LoaderCircle,
  Search,
  RefreshCw,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { AdminGate } from "@/components/site/auth/AdminGate";
import { OrderDetailsModal } from "@/components/site/OrderDetailsModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/auth";
import {
  adminOrdersQueryKey,
  fetchAdminOrders,
  formatCurrency,
  formatOrderDate,
  ORDER_STATUS_COLORS,
  ORDER_STATUS_LABELS,
  type AdminOrderRow,
  type OrderStatus,
} from "@/lib/admin-orders";

type AdminProfile = {
  id: string;
  role: string | null;
};

type SortField = "date" | "customer" | "amount" | "status";
type SortOrder = "asc" | "desc";
type StatusFilter = OrderStatus | "all";

export const Route = createFileRoute("/admin/orders")({
  head: () => ({
    meta: [{ title: "Orders admin — Zyro" }],
  }),
  component: AdminOrdersPage,
});

function AdminOrdersPage() {
  console.log("[admin-orders] component mounted: AdminOrdersPage");
  const [profile, setProfile] = useState<AdminProfile | null>(null);

  return (
    <AdminGate nextPath="/admin/orders" onProfileResolved={setProfile}>
      <AdminOrdersContent profile={profile} />
    </AdminGate>
  );
}

function AdminOrdersContent({ profile }: { profile: AdminProfile | null }) {
  console.log("[admin-orders] component mounted: AdminOrdersContent");
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const ordersQuery = useQuery({
    queryKey: adminOrdersQueryKey,
    queryFn: fetchAdminOrders,
    enabled: !!profile && !!user,
    onSuccess: (data) => {
      console.debug('[admin-orders] fetchAdminOrders onSuccess, count=', Array.isArray(data) ? data.length : 0);
    },
    onError: (err) => {
      console.debug('[admin-orders] fetchAdminOrders onError', err);
    },
    onSettled: (data, err) => {
      console.debug('[admin-orders] fetchAdminOrders onSettled', { dataCount: Array.isArray(data) ? data.length : data, err });
    },
  });

  useEffect(() => {
    if (!profile || !user) {
      console.debug('[admin-orders] fetch disabled until profile/user available', { profile, user });
      return;
    }

    let mounted = true;
    console.debug('[admin-orders] profile available — manually invoking fetchAdminOrders for verification');
    fetchAdminOrders()
      .then((data) => {
        if (!mounted) return;
        console.debug('[admin-orders] manual fetchAdminOrders result count=', Array.isArray(data) ? data.length : 0);
      })
      .catch((err) => {
        console.debug('[admin-orders] manual fetchAdminOrders error', err);
      });

    return () => {
      mounted = false;
    };
  }, [profile, user]);

  useEffect(() => {
    console.debug('[admin-orders] useAuth user', user);
    console.debug('[admin-orders] resolved profile', profile);
    console.debug('[admin-orders] ordersQuery state', { isLoading: ordersQuery.isLoading, isError: ordersQuery.isError, isFetching: ordersQuery.isFetching });
    console.debug('[admin-orders] ordersQuery error', ordersQuery.error);
    console.debug('[admin-orders] ordersQuery data (count)', Array.isArray(ordersQuery.data) ? ordersQuery.data.length : ordersQuery.data);
  }, [user, profile, ordersQuery.isLoading, ordersQuery.isError, ordersQuery.isFetching, ordersQuery.error, ordersQuery.data]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [selectedOrder, setSelectedOrder] = useState<AdminOrderRow | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const orders = useMemo(() => ordersQuery.data ?? [], [ordersQuery.data]);
  const deferredSearch = useDeferredValue(search.trim().toLowerCase());

  const filteredAndSortedOrders = useMemo(() => {
    let result = orders.filter((order) => {
      const matchesSearch =
        deferredSearch.length === 0 ||
        [
          order.order_number,
          order.customer_name,
          order.customer_email,
        ].some((field) => field?.toLowerCase().includes(deferredSearch));

      const matchesStatus = statusFilter === "all" || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    // Sort
    result.sort((a, b) => {
      let compareValue = 0;

      switch (sortField) {
        case "date":
          compareValue =
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case "customer":
          compareValue = (a.customer_name || "").localeCompare(b.customer_name || "");
          break;
        case "amount":
          compareValue = (a.total || 0) - (b.total || 0);
          break;
        case "status":
          compareValue = a.status.localeCompare(b.status);
          break;
      }

      return sortOrder === "asc" ? compareValue : -compareValue;
    });

    return result;
  }, [orders, deferredSearch, statusFilter, sortField, sortOrder]);

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: adminOrdersQueryKey });
    toast.success("Orders refreshed.");
  };

  const handleRowClick = (order: AdminOrderRow) => {
    setSelectedOrder(order);
    setDetailsOpen(true);
  };

  const handleDetailsClose = () => {
    setDetailsOpen(false);
    setSelectedOrder(null);
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const isLoading = ordersQuery.isLoading;
  const isError = ordersQuery.isError;

  return (
    <div className="mx-auto max-w-7xl px-6 py-20 sm:py-24">
      <header className="mb-10 space-y-3">
        <div className="flex items-center gap-3">
          <Link to="/admin" className="rounded-md p-1 hover:bg-foreground/10 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-4xl font-light tracking-tight sm:text-5xl">Orders</h1>
            <p className="text-sm text-foreground/60 mt-2">
              {isLoading ? "Loading..." : `${filteredAndSortedOrders.length} order${filteredAndSortedOrders.length !== 1 ? "s" : ""}`}
            </p>
          </div>
        </div>
      </header>

      {/* Controls */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40 pointer-events-none" />
            <Input
              placeholder="Search orders, customers, emails..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={ordersQuery.isFetching}
          >
            <RefreshCw className={`h-4 w-4 ${ordersQuery.isFetching ? "animate-spin" : ""}`} />
          </Button>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div>
            <label className="text-xs font-medium text-foreground/60 mb-1 block">
              Status Filter
            </label>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Error State */}
      {isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 mb-6 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <div>
            <p className="font-medium text-red-900">Failed to load orders</p>
            <p className="text-sm text-red-800">{getErrorMessage(ordersQuery.error, "An unexpected error occurred.")}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <LoaderCircle className="h-8 w-8 animate-spin text-foreground/40" />
            <p className="text-sm text-foreground/60">Loading orders...</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && filteredAndSortedOrders.length === 0 && (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-foreground/60 mb-2">
            {orders.length === 0
              ? "No orders yet."
              : "No orders match your filters."}
          </p>
          {orders.length === 0 && (
            <p className="text-sm text-foreground/40">Orders will appear here after checkout is completed.</p>
          )}
        </div>
      )}

      {/* Table */}
      {!isLoading && !isError && filteredAndSortedOrders.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left px-4 py-3 font-semibold text-foreground/80">
                  <button
                    onClick={() => toggleSort("date")}
                    className="flex items-center gap-2 hover:text-foreground transition-colors"
                  >
                    Date
                    <ArrowUpDown className={`h-4 w-4 ${sortField === "date" ? "text-foreground" : "text-foreground/40"}`} />
                  </button>
                </th>
                <th className="text-left px-4 py-3 font-semibold text-foreground/80">
                  <button
                    onClick={() => toggleSort("customer")}
                    className="flex items-center gap-2 hover:text-foreground transition-colors"
                  >
                    Customer
                    <ArrowUpDown className={`h-4 w-4 ${sortField === "customer" ? "text-foreground" : "text-foreground/40"}`} />
                  </button>
                </th>
                <th className="text-left px-4 py-3 font-semibold text-foreground/80">Order #</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground/80">
                  <button
                    onClick={() => toggleSort("amount")}
                    className="flex items-center gap-2 hover:text-foreground transition-colors"
                  >
                    Total
                    <ArrowUpDown className={`h-4 w-4 ${sortField === "amount" ? "text-foreground" : "text-foreground/40"}`} />
                  </button>
                </th>
                <th className="text-left px-4 py-3 font-semibold text-foreground/80">
                  <button
                    onClick={() => toggleSort("status")}
                    className="flex items-center gap-2 hover:text-foreground transition-colors"
                  >
                    Status
                    <ArrowUpDown className={`h-4 w-4 ${sortField === "status" ? "text-foreground" : "text-foreground/40"}`} />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedOrders.map((order) => (
                <tr
                  key={order.id}
                  onClick={() => handleRowClick(order)}
                  className="border-b hover:bg-foreground/5 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 text-foreground/80">
                    {formatOrderDate(order.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">{order.customer_name || "—"}</div>
                    <div className="text-xs text-foreground/60">{order.customer_email || "—"}</div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-foreground/80">
                    {order.order_number}
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {formatCurrency(order.total, order.currency)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant="outline"
                      className={`${ORDER_STATUS_COLORS[order.status]} font-medium cursor-pointer`}
                    >
                      {ORDER_STATUS_LABELS[order.status]}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Order Details Modal */}
      <OrderDetailsModal
        order={selectedOrder}
        isOpen={detailsOpen}
        onClose={handleDetailsClose}
        onOrderUpdated={handleRefresh}
      />
    </div>
  );
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (!error) return fallback;
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (typeof error === "object" && "message" in error && typeof (error as any).message === "string") {
    return (error as any).message;
  }
  return fallback;
}
