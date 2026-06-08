import { Link, createFileRoute } from "@tanstack/react-router";
import {
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { ArrowLeft, LoaderCircle, Package, RefreshCw, Search } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { AdminGate } from "@/components/site/auth/AdminGate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/auth";
import {
  adminInventoryQueryKey,
  fetchInventoryProducts,
  updateInventoryStock,
  type InventoryProductRow,
} from "@/lib/admin-inventory";

type AdminProfile = {
  id: string;
  role: string | null;
};

type InventoryFilter = "all" | "in-stock" | "low-stock" | "out-of-stock";

const LOW_STOCK_THRESHOLD = 10;

export const Route = createFileRoute("/admin/inventory")({
  head: () => ({
    meta: [{ title: "Inventory admin — Zyro" }],
  }),
  component: AdminInventoryPage,
});

function AdminInventoryPage() {
  const [profile, setProfile] = useState<AdminProfile | null>(null);

  return (
    <AdminGate nextPath="/admin/inventory" onProfileResolved={setProfile}>
      <AdminInventoryContent profile={profile} />
    </AdminGate>
  );
}

function AdminInventoryContent({ profile }: { profile: AdminProfile | null }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const inventoryQuery = useQuery({
    queryKey: adminInventoryQueryKey,
    queryFn: fetchInventoryProducts,
  });

  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState<InventoryFilter>("all");
  const [stockValues, setStockValues] = useState<Record<string, string>>({});
  const [savingProductId, setSavingProductId] = useState<string | null>(null);

  useEffect(() => {
    if (!inventoryQuery.data) {
      return;
    }

    setStockValues((current) => {
      const updated = { ...current };
      for (const product of inventoryQuery.data) {
        if (updated[product.id] === undefined) {
          updated[product.id] = String(product.stock);
        }
      }
      return updated;
    });
  }, [inventoryQuery.data]);

  const deferredSearch = useDeferredValue(search.trim().toLowerCase());

  const inventory = useMemo(() => inventoryQuery.data ?? [], [inventoryQuery.data]);

  const filteredInventory = useMemo(() => {
    return inventory.filter((product) => {
      const matchesSearch =
        deferredSearch.length === 0 ||
        [product.name, product.sku].some((field) => field.toLowerCase().includes(deferredSearch));

      const productStockCategory = getStockCategory(product.stock);
      const matchesFilter = stockFilter === "all" || stockFilter === productStockCategory;

      return matchesSearch && matchesFilter;
    });
  }, [deferredSearch, inventory, stockFilter]);

  const totals = useMemo(() => {
    const lowStock = inventory.filter((product) => product.stock > 0 && product.stock <= LOW_STOCK_THRESHOLD).length;
    const outOfStock = inventory.filter((product) => product.stock === 0).length;
    const inStock = inventory.filter((product) => product.stock > LOW_STOCK_THRESHOLD).length;

    return {
      total: inventory.length,
      lowStock,
      outOfStock,
      inStock,
    };
  }, [inventory]);

  const updateMutation = useMutation({
    mutationFn: async ({ productId, stock }: { productId: string; stock: number }) => {
      return updateInventoryStock(productId, stock);
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: adminInventoryQueryKey });
      setStockValues((current) => ({
        ...current,
        [data.id]: String(data.stock),
      }));
      toast.success("Inventory updated.");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Unable to update stock."));
    },
  });

  const isLoading = inventoryQuery.isPending && inventory.length === 0;
  const isBusy = inventoryQuery.isFetching || updateMutation.isPending;

  async function handleUpdateStock(event: FormEvent<HTMLFormElement>, product: InventoryProductRow) {
    event.preventDefault();

    const rawValue = stockValues[product.id] ?? String(product.stock);
    const nextStock = Number(rawValue);

    if (Number.isNaN(nextStock) || nextStock < 0) {
      toast.error("Stock must be a number greater than or equal to 0.");
      return;
    }

    setSavingProductId(product.id);
    try {
      await updateMutation.mutateAsync({ productId: product.id, stock: nextStock });
    } finally {
      setSavingProductId(null);
    }
  }

  function handleStockInputChange(productId: string, value: string) {
    setStockValues((current) => ({
      ...current,
      [productId]: value,
    }));
  }

  if (inventoryQuery.isError) {
    return (
      <InventoryPageShell
        profile={profile}
        userEmail={user?.email ?? "Unknown email"}
        totals={totals}
        toolbar={null}
      >
        <InventoryError
          error={
            inventoryQuery.error instanceof Error
              ? inventoryQuery.error
              : new Error("Unable to load inventory.")
          }
          onRetry={() => void inventoryQuery.refetch()}
        />
      </InventoryPageShell>
    );
  }

  return (
    <InventoryPageShell
      profile={profile}
      userEmail={user?.email ?? "Unknown email"}
      totals={totals}
      toolbar={
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="grid flex-1 gap-3 md:grid-cols-[minmax(0,1fr)_200px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground/35" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search SKUs or product names"
                className="h-11 rounded-2xl border-white/10 bg-white/[0.03] pl-10"
              />
            </div>

            <Select value={stockFilter} onValueChange={(value) => setStockFilter(value as InventoryFilter)}>
              <SelectTrigger className="h-11 rounded-2xl border-white/10 bg-white/[0.03]">
                <SelectValue placeholder="Filter stock levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All inventory</SelectItem>
                <SelectItem value="in-stock">In stock</SelectItem>
                <SelectItem value="low-stock">Low stock</SelectItem>
                <SelectItem value="out-of-stock">Out of stock</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full border-white/10 bg-white/[0.03]"
              onClick={() => void inventoryQuery.refetch()}
              disabled={inventoryQuery.isFetching}
            >
              <RefreshCw className={`size-4 ${inventoryQuery.isFetching ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>
      }
    >
      {isLoading ? (
        <InventoryLoadingState />
      ) : (
        <div className="overflow-hidden rounded-[2rem] border border-white/8 bg-white/[0.03] shadow-[0_24px_80px_rgba(0,0,0,0.18)]">
          <div className="flex items-center justify-between border-b border-white/8 px-5 py-4 text-sm text-foreground/55">
            <span>
              Showing {filteredInventory.length} of {inventory.length} products
            </span>
            <span>{isBusy ? "Saving stock..." : "Ready"}</span>
          </div>

          {filteredInventory.length === 0 ? (
            <InventoryEmptyState
              title={inventory.length === 0 ? "No inventory records" : "No matching products"}
              description={
                inventory.length === 0
                  ? "There are no products in Supabase to monitor yet."
                  : "Try a different search or stock filter to locate SKUs."
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[960px] border-collapse text-left text-sm">
                <thead className="bg-white/[0.02] text-[11px] uppercase tracking-[0.22em] text-foreground/40">
                  <tr>
                    <th className="px-5 py-4 font-medium">Product</th>
                    <th className="px-5 py-4 font-medium">SKU</th>
                    <th className="px-5 py-4 font-medium">Stock</th>
                    <th className="px-5 py-4 font-medium">Availability</th>
                    <th className="px-5 py-4 font-medium">Status</th>
                    <th className="px-5 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInventory.map((product) => {
                    const stockCategory = getStockCategory(product.stock);
                    const isSaving = savingProductId === product.id;
                    return (
                      <tr
                        key={product.id}
                        className={`border-t border-white/8 align-top transition-colors hover:bg-white/[0.03] ${
                          stockCategory === "out-of-stock"
                            ? "bg-rose-500/5"
                            : stockCategory === "low-stock"
                            ? "bg-amber-500/5"
                            : ""
                        }`}
                      >
                        <td className="px-5 py-4">
                          <div className="space-y-1">
                            <div className="font-medium text-foreground">{product.name}</div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-foreground/70">{product.sku || "—"}</td>
                        <td className="px-5 py-4">
                          <form onSubmit={(event) => void handleUpdateStock(event, product)}>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                min={0}
                                step={1}
                                value={stockValues[product.id] ?? String(product.stock)}
                                onChange={(event) =>
                                  handleStockInputChange(product.id, event.target.value)
                                }
                                className="h-11 w-28 rounded-2xl border-white/10 bg-white/[0.03] text-right"
                              />
                              <Button
                                type="submit"
                                size="sm"
                                className="rounded-full bg-foreground text-background hover:bg-foreground/90"
                                disabled={isSaving || updateMutation.isPending}
                              >
                                {isSaving ? (
                                  <LoaderCircle className="size-4 animate-spin" />
                                ) : (
                                  "Update"
                                )}
                              </Button>
                            </div>
                          </form>
                        </td>
                        <td className="px-5 py-4">
                          <StockStatusBadge stock={product.stock} />
                        </td>
                        <td className="px-5 py-4">
                          <Badge className="rounded-full border border-white/10 bg-white/[0.03] text-xs uppercase tracking-[0.25em] text-foreground/65">
                            {product.status}
                          </Badge>
                        </td>
                        <td className="px-5 py-4 text-right text-foreground/55">
                          <div className="text-xs">Last updated via inventory page</div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </InventoryPageShell>
  );
}

function InventoryPageShell({
  profile,
  userEmail,
  totals,
  toolbar,
  children,
}: {
  profile: AdminProfile | null;
  userEmail: string;
  totals: { total: number; lowStock: number; outOfStock: number; inStock: number };
  toolbar: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-7xl px-6 py-20 sm:py-24">
      <header className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl space-y-4">
          <div className="flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-foreground/35">
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-foreground/65 transition-colors hover:bg-white/[0.06] hover:text-foreground"
            >
              <ArrowLeft className="size-3.5" />
              Admin
            </Link>
            <span>Inventory module</span>
          </div>
          <div className="space-y-3">
            <h1 className="text-4xl font-light tracking-tight sm:text-5xl">Inventory</h1>
            <p className="max-w-2xl text-sm leading-6 text-foreground/60">
              Track SKU stock levels directly in Supabase, highlight low inventory, and update
              quantities without leaving the inventory workflow.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-xs text-foreground/45">
            <span>Signed in as {userEmail}</span>
            <span>Role: {profile?.role ?? "admin"}</span>
          </div>
        </div>
      </header>

      <section className="grid gap-3 md:grid-cols-4">
        <SummaryCard label="Total SKUs" value={totals.total} />
        <SummaryCard label="In stock" value={totals.inStock} />
        <SummaryCard label="Low stock" value={totals.lowStock} />
        <SummaryCard label="Out of stock" value={totals.outOfStock} />
      </section>

      <section className="mt-8 space-y-4">
        {toolbar}
        {children}
      </section>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <article className="rounded-3xl border border-white/8 bg-white/[0.03] p-5 shadow-[0_16px_50px_rgba(0,0,0,0.12)]">
      <div className="text-[11px] uppercase tracking-[0.22em] text-foreground/35">{label}</div>
      <div className="mt-3 text-3xl font-light tracking-tight text-foreground">{value}</div>
    </article>
  );
}

function StockStatusBadge({ stock }: { stock: number }) {
  const category = getStockCategory(stock);
  const label = getStockLabel(stock);
  const colorClass =
    category === "out-of-stock"
      ? "border-rose-500/20 bg-rose-500/10 text-rose-100"
      : category === "low-stock"
      ? "border-amber-500/20 bg-amber-500/10 text-amber-100"
      : "border-emerald-500/20 bg-emerald-500/10 text-emerald-100";

  return (
    <Badge className={`rounded-full border ${colorClass} text-xs uppercase tracking-[0.25em]`}>
      {label}
    </Badge>
  );
}

function getStockCategory(stock: number): InventoryFilter {
  if (stock === 0) {
    return "out-of-stock";
  }
  if (stock <= LOW_STOCK_THRESHOLD) {
    return "low-stock";
  }
  return "in-stock";
}

function getStockLabel(stock: number) {
  if (stock === 0) {
    return "Out of stock";
  }
  if (stock <= LOW_STOCK_THRESHOLD) {
    return "Low stock";
  }
  return "In stock";
}

function InventoryLoadingState() {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-white/8 bg-white/[0.03]">
      <div className="border-b border-white/8 px-5 py-4">
        <div className="h-4 w-44 animate-pulse rounded-full bg-white/[0.07]" />
      </div>
      <div className="space-y-3 p-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_140px] gap-4 rounded-2xl border border-white/6 bg-white/[0.02] p-4"
          >
            <div className="h-4 animate-pulse rounded-full bg-white/[0.07]" />
            <div className="h-4 animate-pulse rounded-full bg-white/[0.07]" />
            <div className="h-4 animate-pulse rounded-full bg-white/[0.07]" />
            <div className="h-4 animate-pulse rounded-full bg-white/[0.07]" />
            <div className="h-4 animate-pulse rounded-full bg-white/[0.07]" />
            <div className="h-4 animate-pulse rounded-full bg-white/[0.07]" />
          </div>
        ))}
      </div>
    </div>
  );
}

function InventoryEmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center gap-4 px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-foreground/55">
        <Package className="size-6" />
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-medium tracking-tight">{title}</h2>
        <p className="max-w-xl text-sm leading-6 text-foreground/55">{description}</p>
      </div>
    </div>
  );
}

function InventoryError({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-500/20 bg-rose-500/10 text-rose-200">
        <div className="size-6">!</div>
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-medium tracking-tight">Unable to load inventory</h2>
        <p className="max-w-xl text-sm leading-6 text-foreground/55">{error.message}</p>
      </div>
      <Button
        className="rounded-full bg-foreground text-background hover:bg-foreground/90"
        onClick={onRetry}
      >
        Retry
      </Button>
    </div>
  );
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
}
