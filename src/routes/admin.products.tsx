import { Link, createFileRoute } from "@tanstack/react-router";
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
  CircleAlert,
  LoaderCircle,
  Package,
  PencilLine,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { AdminGate } from "@/components/site/auth/AdminGate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/auth";
import {
  adminProductsQueryKey,
  deleteAdminProduct,
  emptyProductForm,
  fetchAdminProducts,
  productFormFromRow,
  saveAdminProduct,
  type AdminProductRow,
  type ProductFormValues,
  type ProductStatus,
} from "@/lib/admin-products";

type AdminProfile = {
  id: string;
  role: string | null;
};

type StatusFilter = ProductStatus | "all";

export const Route = createFileRoute("/admin/products")({
  head: () => ({
    meta: [{ title: "Products admin — Zyro" }],
  }),
  component: AdminProductsPage,
});

function AdminProductsPage() {
  const [profile, setProfile] = useState<AdminProfile | null>(null);

  return (
    <AdminGate nextPath="/admin/products" onProfileResolved={setProfile}>
      <AdminProductsContent profile={profile} />
    </AdminGate>
  );
}

function AdminProductsContent({ profile }: { profile: AdminProfile | null }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const productsQuery = useQuery({
    queryKey: adminProductsQueryKey,
    queryFn: fetchAdminProducts,
  });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProductRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminProductRow | null>(null);

  const saveMutation = useMutation({
    mutationFn: async (values: ProductFormValues) => {
      return saveAdminProduct(values, editingProduct?.id);
    },
    onSuccess: async (savedProduct) => {
      await queryClient.invalidateQueries({ queryKey: adminProductsQueryKey });
      toast.success(
        editingProduct ? `${savedProduct.name} updated.` : `${savedProduct.name} created.`,
      );
      setEditorOpen(false);
      setEditingProduct(null);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Unable to save the product."));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (productId: string) => {
      await deleteAdminProduct(productId);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: adminProductsQueryKey });
      toast.success("Product deleted.");
      setDeleteTarget(null);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Unable to delete the product."));
    },
  });

  const products = useMemo(() => productsQuery.data ?? [], [productsQuery.data]);
  const deferredSearch = useDeferredValue(search.trim().toLowerCase());

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        deferredSearch.length === 0 ||
        [product.name, product.slug, product.collection, product.sku].some((field) =>
          field.toLowerCase().includes(deferredSearch),
        );
      const matchesStatus = statusFilter === "all" || product.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [deferredSearch, products, statusFilter]);

  const totals = useMemo(() => {
    return products.reduce(
      (accumulator, product) => {
        accumulator.total += 1;
        accumulator.active += product.status === "active" ? 1 : 0;
        accumulator.draft += product.status === "draft" ? 1 : 0;
        accumulator.featured += product.featured ? 1 : 0;
        return accumulator;
      },
      { total: 0, active: 0, draft: 0, featured: 0 },
    );
  }, [products]);

  const loading = productsQuery.isPending && products.length === 0;
  const busy = saveMutation.isPending || deleteMutation.isPending;

  function openCreateDialog() {
    setEditingProduct(null);
    setEditorOpen(true);
  }

  function openEditDialog(product: AdminProductRow) {
    setEditingProduct(product);
    setEditorOpen(true);
  }

  function handleEditorOpenChange(nextOpen: boolean) {
    setEditorOpen(nextOpen);
    if (!nextOpen) {
      setEditingProduct(null);
    }
  }

  async function handleSave(values: ProductFormValues) {
    await saveMutation.mutateAsync(values);
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) {
      return;
    }

    await deleteMutation.mutateAsync(deleteTarget.id);
  }

  if (productsQuery.isError) {
    return (
      <ProductsPageShell
        profile={profile}
        userEmail={user?.email ?? "Unknown email"}
        onCreate={openCreateDialog}
        totals={totals}
        toolbar={null}
      >
        <AdminProductsError
          error={
            productsQuery.error instanceof Error
              ? productsQuery.error
              : new Error("Unable to load products.")
          }
          onRetry={() => void productsQuery.refetch()}
        />
      </ProductsPageShell>
    );
  }

  return (
    <ProductsPageShell
      profile={profile}
      userEmail={user?.email ?? "Unknown email"}
      onCreate={openCreateDialog}
      totals={totals}
      toolbar={
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="grid flex-1 gap-3 md:grid-cols-[minmax(0,1fr)_180px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground/35" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search products by name"
                className="h-11 rounded-2xl border-white/10 bg-white/[0.03] pl-10"
              />
            </div>

            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as StatusFilter)}
            >
              <SelectTrigger className="h-11 rounded-2xl border-white/10 bg-white/[0.03]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full border-white/10 bg-white/[0.03]"
              onClick={() => void productsQuery.refetch()}
              disabled={productsQuery.isFetching}
            >
              <RefreshCw className={`size-4 ${productsQuery.isFetching ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              size="sm"
              className="rounded-full bg-foreground text-background hover:bg-foreground/90"
              onClick={openCreateDialog}
            >
              <Plus className="size-4" />
              New product
            </Button>
          </div>
        </div>
      }
    >
      {loading ? (
        <ProductsLoadingState />
      ) : (
        <div className="overflow-hidden rounded-[2rem] border border-white/8 bg-white/[0.03] shadow-[0_24px_80px_rgba(0,0,0,0.18)]">
          <div className="flex items-center justify-between border-b border-white/8 px-5 py-4 text-sm text-foreground/55">
            <span>
              Showing {filteredProducts.length} of {products.length} products
            </span>
            <span>{busy ? "Saving changes..." : "Ready"}</span>
          </div>

          {filteredProducts.length === 0 ? (
            <EmptyState
              title={products.length === 0 ? "No products yet" : "No products match your filters"}
              description={
                products.length === 0
                  ? "Add the first product to start managing the catalog in Supabase."
                  : "Try a different search term or clear the status filter."
              }
              actionLabel="New product"
              onAction={openCreateDialog}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[960px] border-collapse text-left text-sm">
                <thead className="bg-white/[0.02] text-[11px] uppercase tracking-[0.22em] text-foreground/40">
                  <tr>
                    <th className="px-5 py-4 font-medium">Product</th>
                    <th className="px-5 py-4 font-medium">Collection</th>
                    <th className="px-5 py-4 font-medium">Price / stock</th>
                    <th className="px-5 py-4 font-medium">Flags</th>
                    <th className="px-5 py-4 font-medium">Status</th>
                    <th className="px-5 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr
                      key={product.id}
                      className="border-t border-white/8 align-top transition-colors hover:bg-white/[0.03]"
                    >
                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          <div className="font-medium text-foreground">{product.name}</div>
                          <div className="text-xs text-foreground/45">/{product.slug}</div>
                          <div className="text-xs text-foreground/35">
                            SKU: {product.sku || "—"}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          <div className="text-foreground/85">{product.collection || "—"}</div>
                          <div className="text-xs text-foreground/45">
                            {product.collectionSlug || "No collection slug"}
                          </div>
                          <div className="text-xs text-foreground/35">
                            {product.material || "No material set"}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          <div className="font-medium text-foreground">
                            {formatPrice(product.price)}
                          </div>
                          <div className="text-xs text-foreground/45">Stock: {product.stock}</div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-2">
                          {product.featured ? (
                            <Badge className="border-emerald-500/20 bg-emerald-500/10 text-emerald-100">
                              Featured
                            </Badge>
                          ) : null}
                          {product.bestSeller ? (
                            <Badge className="border-sky-500/20 bg-sky-500/10 text-sky-100">
                              Best seller
                            </Badge>
                          ) : null}
                          {!product.featured && !product.bestSeller ? (
                            <span className="text-xs text-foreground/35">
                              No merchandising flags
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={product.status} />
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full border-white/10 bg-white/[0.03]"
                            onClick={() => openEditDialog(product)}
                            disabled={busy}
                          >
                            <PencilLine className="size-4" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full border-white/10 bg-white/[0.03] text-rose-200 hover:bg-rose-500/10 hover:text-rose-100"
                            onClick={() => setDeleteTarget(product)}
                            disabled={busy}
                          >
                            <Trash2 className="size-4" />
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <ProductEditorDialog
        open={editorOpen}
        product={editingProduct}
        saving={saveMutation.isPending}
        onOpenChange={handleEditorOpenChange}
        onSave={handleSave}
      />

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete product?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes {deleteTarget?.name ?? "the selected product"} from the catalog. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                void handleDeleteConfirm();
              }}
              className="bg-rose-600 text-white hover:bg-rose-500"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? <LoaderCircle className="size-4 animate-spin" /> : null}
              Delete product
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ProductsPageShell>
  );
}

function ProductsPageShell({
  profile,
  userEmail,
  totals,
  onCreate,
  toolbar,
  children,
}: {
  profile: AdminProfile | null;
  userEmail: string;
  totals: { total: number; active: number; draft: number; featured: number };
  onCreate: () => void;
  toolbar: ReactNode;
  children: ReactNode;
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
            <span>Products module</span>
          </div>
          <div className="space-y-3">
            <h1 className="text-4xl font-light tracking-tight sm:text-5xl">Products</h1>
            <p className="max-w-2xl text-sm leading-6 text-foreground/60">
              Manage catalog records directly in Supabase with search, filtering, edits, and
              confirmations built for daily admin use.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-xs text-foreground/45">
            <span>Signed in as {userEmail}</span>
            <span>Role: {profile?.role ?? "admin"}</span>
          </div>
        </div>

        <Button
          className="rounded-full bg-foreground text-background hover:bg-foreground/90"
          onClick={onCreate}
        >
          <Plus className="size-4" />
          New product
        </Button>
      </header>

      <section className="grid gap-3 md:grid-cols-4">
        <SummaryCard label="Total products" value={totals.total} />
        <SummaryCard label="Active" value={totals.active} />
        <SummaryCard label="Draft" value={totals.draft} />
        <SummaryCard label="Featured" value={totals.featured} />
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

function ProductsLoadingState() {
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

function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-4 px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-foreground/55">
        <Package className="size-6" />
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-medium tracking-tight">{title}</h2>
        <p className="max-w-xl text-sm leading-6 text-foreground/55">{description}</p>
      </div>
      <Button
        className="rounded-full bg-foreground text-background hover:bg-foreground/90"
        onClick={onAction}
      >
        {actionLabel}
      </Button>
    </div>
  );
}

function AdminProductsError({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-500/20 bg-rose-500/10 text-rose-200">
        <CircleAlert className="size-6" />
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-medium tracking-tight">Unable to load products</h2>
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

function ProductEditorDialog({
  open,
  product,
  saving,
  onOpenChange,
  onSave,
}: {
  open: boolean;
  product: AdminProductRow | null;
  saving: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (values: ProductFormValues) => Promise<void>;
}) {
  const [form, setForm] = useState<ProductFormValues>(emptyProductForm());
  const [previewUrl, setPreviewUrl] = useState<string>("");

  useEffect(() => {
    if (!open) {
      return;
    }

    setForm(product ? productFormFromRow(product) : emptyProductForm());
  }, [open, product]);

  useEffect(() => {
    if (form.imageFile) {
      const url = URL.createObjectURL(form.imageFile);
      setPreviewUrl(url);

      return () => {
        URL.revokeObjectURL(url);
      };
    }

    setPreviewUrl(form.image ?? "");
    return undefined;
  }, [form.imageFile, form.image]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSave(form);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto rounded-[2rem] border-white/10 bg-background">
        <DialogHeader>
          <DialogTitle>{product ? "Edit product" : "Create product"}</DialogTitle>
          <DialogDescription>
            Keep the form focused on the fields that control how the product appears in the
            storefront and in admin.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Name" required>
              <Input
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({ ...current, name: event.target.value }))
                }
                placeholder="Magnetic Silicone Case"
                required
              />
            </Field>

            <Field label="Slug" helperText="Used in product URLs and internal lookups.">
              <Input
                value={form.slug}
                onChange={(event) =>
                  setForm((current) => ({ ...current, slug: event.target.value }))
                }
                placeholder="magnetic-silicone-case"
              />
            </Field>

            <Field label="Collection">
              <Input
                value={form.collection}
                onChange={(event) =>
                  setForm((current) => ({ ...current, collection: event.target.value }))
                }
                placeholder="Silicone"
              />
            </Field>

            <Field label="Collection slug">
              <Input
                value={form.collectionSlug}
                onChange={(event) =>
                  setForm((current) => ({ ...current, collectionSlug: event.target.value }))
                }
                placeholder="silicone"
              />
            </Field>

            <Field label="Material">
              <Input
                value={form.material}
                onChange={(event) =>
                  setForm((current) => ({ ...current, material: event.target.value }))
                }
                placeholder="Soft-touch silicone"
              />
            </Field>

            <Field label="SKU">
              <Input
                value={form.sku}
                onChange={(event) =>
                  setForm((current) => ({ ...current, sku: event.target.value }))
                }
                placeholder="ZYR-SIL-01"
              />
            </Field>

            <Field label="Price" required>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(event) =>
                  setForm((current) => ({ ...current, price: event.target.value }))
                }
                placeholder="49.00"
                required
              />
            </Field>

            <Field label="Stock" required>
              <Input
                type="number"
                min="0"
                step="1"
                value={form.stock}
                onChange={(event) =>
                  setForm((current) => ({ ...current, stock: event.target.value }))
                }
                placeholder="120"
                required
              />
            </Field>

            <Field label="Status" required>
              <Select
                value={form.status}
                onValueChange={(value) =>
                  setForm((current) => ({ ...current, status: value as ProductStatus }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field label="Description">
            <Textarea
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({ ...current, description: event.target.value }))
              }
              placeholder="Short merchandising copy or a product summary."
              rows={5}
            />
          </Field>

          <Field
            label="Product image"
            helperText="Upload one image. Selecting a new file replaces the current image."
          >
            <Input
              type="file"
              accept="image/*"
              onChange={(event) => {
                const file = event.currentTarget.files?.[0] ?? null;
                setForm((current) => ({ ...current, imageFile: file }));
              }}
            />
            {previewUrl ? (
              <div className="mt-3 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
                <img
                  src={previewUrl}
                  alt="Product preview"
                  className="h-44 w-full object-cover"
                />
              </div>
            ) : (
              <div className="mt-3 rounded-3xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-8 text-center text-sm text-foreground/45">
                No image selected
              </div>
            )}
          </Field>

          <div className="grid gap-4 rounded-3xl border border-white/8 bg-white/[0.03] p-4 sm:grid-cols-2">
            <ToggleField
              label="Featured"
              description="Promote this product in the featured module."
              checked={form.featured}
              onCheckedChange={(checked) =>
                setForm((current) => ({ ...current, featured: checked }))
              }
            />
            <ToggleField
              label="Best seller"
              description="Mark this product as a top seller."
              checked={form.bestSeller}
              onCheckedChange={(checked) =>
                setForm((current) => ({ ...current, bestSeller: checked }))
              }
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="rounded-full border-white/10 bg-white/[0.03]"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="rounded-full bg-foreground text-background hover:bg-foreground/90"
              disabled={saving}
            >
              {saving ? <LoaderCircle className="size-4 animate-spin" /> : null}
              {product ? "Save changes" : "Create product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  helperText,
  required,
  children,
}: {
  label: string;
  helperText?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-1.5 text-foreground/80">
        {label}
        {required ? <span className="text-xs text-foreground/35">*</span> : null}
      </Label>
      {children}
      {helperText ? <p className="text-xs leading-5 text-foreground/45">{helperText}</p> : null}
    </div>
  );
}

function ToggleField({
  label,
  description,
  checked,
  onCheckedChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl border border-white/8 bg-background/40 p-4">
      <div className="space-y-1">
        <div className="font-medium text-foreground">{label}</div>
        <p className="text-sm leading-6 text-foreground/50">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

function StatusBadge({ status }: { status: ProductStatus }) {
  if (status === "active") {
    return (
      <Badge className="border-emerald-500/20 bg-emerald-500/10 text-emerald-100">Active</Badge>
    );
  }

  return <Badge className="border-amber-500/20 bg-amber-500/10 text-amber-100">Draft</Badge>;
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}
