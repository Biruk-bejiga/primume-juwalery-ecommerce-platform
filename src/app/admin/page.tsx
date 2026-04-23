"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

import { formatINR } from "@/lib/format";
import { ProductView } from "@/lib/types";

type AdminFormState = {
  name: string;
  slug: string;
  sku: string;
  description: string;
  collection: string;
  metal: string;
  gemstone: string;
  gender: string;
  occasion: string;
  caratWeight: string;
  sizeOptions: string;
  metalColorOptions: string;
  customizationList: string;
  allowEngraving: boolean;
  allowSizeAdjustment: boolean;
  customizationNotes: string;
  price: string;
  makingCharge: string;
  discountPercent: string;
  stock: string;
  featured: boolean;
  active: boolean;
  imageOne: string;
  imageTwo: string;
  videoUrl: string;
  videoThumbnail: string;
};

type AdminOrder = {
  id: number;
  orderNumber: string;
  customerName: string;
  email: string;
  status: "PENDING" | "PAID" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  total: number;
  createdAt: string;
  paymentStatus: "PENDING" | "PARTIALLY_PAID" | "PAID" | "FAILED";
};

type AdminCustomer = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  _count: {
    orders: number;
    addresses: number;
    wishlist: number;
    customOrders: number;
  };
};

type AdminCoupon = {
  id: number;
  code: string;
  type: "PERCENT" | "FLAT";
  value: number;
  isActive: boolean;
  usedCount: number;
};

type AdminCampaign = {
  id: number;
  name: string;
  channel: string;
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  conversions: number;
  isActive: boolean;
};

const initialFormState: AdminFormState = {
  name: "",
  slug: "",
  sku: "",
  description: "",
  collection: "",
  metal: "",
  gemstone: "",
  gender: "",
  occasion: "",
  caratWeight: "",
  sizeOptions: "",
  metalColorOptions: "",
  customizationList: "",
  allowEngraving: false,
  allowSizeAdjustment: false,
  customizationNotes: "",
  price: "",
  makingCharge: "0",
  discountPercent: "0",
  stock: "0",
  featured: false,
  active: true,
  imageOne: "",
  imageTwo: "",
  videoUrl: "",
  videoThumbnail: ""
};

function parseCsv(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function csvFromArray(values: string[]) {
  return values.join(", ");
}

function toPayload(form: AdminFormState) {
  const media = [
    form.imageOne
      ? {
          type: "image" as const,
          url: form.imageOne,
          alt: `${form.name} view 1`
        }
      : null,
    form.imageTwo
      ? {
          type: "image" as const,
          url: form.imageTwo,
          alt: `${form.name} view 2`
        }
      : null,
    form.videoUrl
      ? {
          type: "video" as const,
          url: form.videoUrl,
          thumbnail: form.videoThumbnail || form.imageOne,
          alt: `${form.name} product video`
        }
      : null
  ].filter(Boolean);

  return {
    name: form.name,
    slug: form.slug,
    sku: form.sku,
    description: form.description,
    collection: form.collection,
    metal: form.metal,
    gemstone: form.gemstone || null,
    gender: form.gender || null,
    occasion: form.occasion || null,
    caratWeight: form.caratWeight ? Number(form.caratWeight) : null,
    variantOptions: {
      sizes: parseCsv(form.sizeOptions),
      metalColors: parseCsv(form.metalColorOptions),
      customization: parseCsv(form.customizationList)
    },
    customizationOptions: {
      allowEngraving: form.allowEngraving,
      allowSizeAdjustment: form.allowSizeAdjustment,
      notes: form.customizationNotes || null
    },
    price: Number(form.price),
    makingCharge: Number(form.makingCharge),
    discountPercent: Number(form.discountPercent),
    stock: Number(form.stock),
    featured: form.featured,
    active: form.active,
    media
  };
}

function mapToForm(product: ProductView): AdminFormState {
  const imageMedia = product.media.filter((item) => item.type === "image");
  const video = product.media.find((item) => item.type === "video");

  return {
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    description: product.description,
    collection: product.collection,
    metal: product.metal,
    gemstone: product.gemstone || "",
    gender: product.gender || "",
    occasion: csvFromArray(product.occasions),
    caratWeight: product.caratWeight ? String(product.caratWeight) : "",
    sizeOptions: csvFromArray(product.variantOptions.sizes),
    metalColorOptions: csvFromArray(product.variantOptions.metalColors),
    customizationList: csvFromArray(product.variantOptions.customization),
    allowEngraving: product.customizationOptions.allowEngraving,
    allowSizeAdjustment: product.customizationOptions.allowSizeAdjustment,
    customizationNotes: product.customizationOptions.notes || "",
    price: String(product.price),
    makingCharge: String(product.makingCharge),
    discountPercent: String(product.discountPercent),
    stock: String(product.stock),
    featured: product.featured,
    active: product.active,
    imageOne: imageMedia[0]?.url || "",
    imageTwo: imageMedia[1]?.url || "",
    videoUrl: video?.url || "",
    videoThumbnail: video?.thumbnail || ""
  };
}

export default function AdminPage() {
  const [apiKey, setApiKey] = useState("");
  const [products, setProducts] = useState<ProductView[]>([]);
  const [form, setForm] = useState<AdminFormState>(initialFormState);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [coupons, setCoupons] = useState<AdminCoupon[]>([]);
  const [campaigns, setCampaigns] = useState<AdminCampaign[]>([]);
  const [analytics, setAnalytics] = useState<{
    totalOrders: number;
    totalUsers: number;
    grossRevenue: number;
    paidRevenue: number;
    averageOrderValue: number;
    paymentSuccessRate: number;
    ctr: number;
    conversionRate: number;
  } | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [couponType, setCouponType] = useState<"PERCENT" | "FLAT">("PERCENT");
  const [couponValue, setCouponValue] = useState("10");
  const [campaignName, setCampaignName] = useState("");
  const [campaignChannel, setCampaignChannel] = useState("Instagram");
  const [campaignBudget, setCampaignBudget] = useState("100000");

  useEffect(() => {
    const saved = window.localStorage.getItem("admin_api_key");
    if (saved) {
      setApiKey(saved);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    if (!apiKey) {
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const response = await fetch("/api/admin/products", {
        headers: { "x-admin-key": apiKey }
      });

      const data = (await response.json()) as { message?: string; products?: ProductView[] };
      if (!response.ok) {
        throw new Error(data.message || "Unable to load products.");
      }

      setProducts(data.products || []);
      window.localStorage.setItem("admin_api_key", apiKey);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [apiKey]);

  const fetchAdminData = useCallback(async () => {
    if (!apiKey) {
      return;
    }

    const headers = { "x-admin-key": apiKey };

    const [ordersResponse, customersResponse, couponsResponse, campaignsResponse, analyticsResponse] =
      await Promise.all([
        fetch("/api/admin/orders", { headers }),
        fetch("/api/admin/customers", { headers }),
        fetch("/api/admin/coupons", { headers }),
        fetch("/api/admin/campaigns", { headers }),
        fetch("/api/admin/analytics", { headers })
      ]);

    const ordersData = (await ordersResponse.json()) as { orders?: AdminOrder[] };
    const customersData = (await customersResponse.json()) as { customers?: AdminCustomer[] };
    const couponsData = (await couponsResponse.json()) as { coupons?: AdminCoupon[] };
    const campaignsData = (await campaignsResponse.json()) as { campaigns?: AdminCampaign[] };
    const analyticsData = (await analyticsResponse.json()) as { summary?: typeof analytics };

    setOrders(ordersData.orders || []);
    setCustomers(customersData.customers || []);
    setCoupons(couponsData.coupons || []);
    setCampaigns(campaignsData.campaigns || []);
    setAnalytics((analyticsData.summary as NonNullable<typeof analytics>) || null);
  }, [apiKey]);

  useEffect(() => {
    if (apiKey) {
      void fetchProducts();
      void fetchAdminData();
    }
  }, [apiKey, fetchProducts, fetchAdminData]);

  const createCoupon = async () => {
    if (!apiKey) {
      setStatus("Enter admin API key first.");
      return;
    }

    const response = await fetch("/api/admin/coupons", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-key": apiKey
      },
      body: JSON.stringify({
        code: couponCode,
        type: couponType,
        value: Number(couponValue),
        minOrder: 0,
        isActive: true
      })
    });

    const data = (await response.json()) as { message?: string };
    if (!response.ok) {
      setStatus(data.message || "Failed to create coupon.");
      return;
    }

    setCouponCode("");
    setCouponValue("10");
    setStatus("Coupon created.");
    await fetchAdminData();
  };

  const createCampaign = async () => {
    if (!apiKey) {
      setStatus("Enter admin API key first.");
      return;
    }

    const response = await fetch("/api/admin/campaigns", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-key": apiKey
      },
      body: JSON.stringify({
        name: campaignName,
        channel: campaignChannel,
        budget: Number(campaignBudget)
      })
    });

    const data = (await response.json()) as { message?: string };
    if (!response.ok) {
      setStatus(data.message || "Failed to create campaign.");
      return;
    }

    setCampaignName("");
    setCampaignBudget("100000");
    setStatus("Campaign created.");
    await fetchAdminData();
  };

  const updateOrderStatus = async (orderId: number, statusValue: AdminOrder["status"]) => {
    if (!apiKey) {
      return;
    }

    const response = await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-admin-key": apiKey
      },
      body: JSON.stringify({
        orderId,
        status: statusValue
      })
    });

    if (response.ok) {
      await fetchAdminData();
    }
  };

  const resetForm = () => {
    setForm(initialFormState);
    setEditingId(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!apiKey) {
      setStatus("Enter admin API key first.");
      return;
    }

    const payload = toPayload(form);
    if (!payload.media.length) {
      setStatus("At least one product image is required.");
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const endpoint = editingId ? `/api/admin/products/${editingId}` : "/api/admin/products";
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": apiKey
        },
        body: JSON.stringify(payload)
      });

      const data = (await response.json()) as { message?: string };
      if (!response.ok) {
        throw new Error(data.message || "Action failed.");
      }

      resetForm();
      setStatus(editingId ? "Product updated." : "Product added.");
      await fetchProducts();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!apiKey) {
      setStatus("Enter admin API key first.");
      return;
    }

    if (!window.confirm("Delete this product?")) {
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
        headers: {
          "x-admin-key": apiKey
        }
      });

      const data = (await response.json()) as { message?: string };
      if (!response.ok) {
        throw new Error(data.message || "Delete failed.");
      }

      setStatus("Product removed.");
      await fetchProducts();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const totalInventory = useMemo(
    () => products.reduce((sum, product) => sum + product.stock, 0),
    [products]
  );

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700/70">Admin console</p>
        <h1 className="font-display text-4xl text-ink">Product management</h1>
      </div>

      <div className="rounded-2xl border border-amber-100 bg-white p-4">
        <label className="space-y-1 text-sm">
          <span>Admin API key</span>
          <div className="mt-1 flex flex-col gap-2 sm:flex-row">
            <input
              type="password"
              value={apiKey}
              onChange={(event) => setApiKey(event.target.value)}
              className="w-full rounded-xl border border-amber-200 px-3 py-2 outline-none ring-brand-300 focus:ring"
              placeholder="Paste ADMIN_API_KEY"
            />
            <button
              type="button"
              onClick={() => void fetchProducts()}
              className="rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-ink/90"
            >
              Connect
            </button>
          </div>
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-amber-100 bg-white p-4">
          <p className="text-xs uppercase tracking-[0.12em] text-ink/50">Products</p>
          <p className="mt-1 text-2xl font-bold text-ink">{products.length}</p>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-white p-4">
          <p className="text-xs uppercase tracking-[0.12em] text-ink/50">Inventory units</p>
          <p className="mt-1 text-2xl font-bold text-ink">{totalInventory}</p>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-white p-4">
          <p className="text-xs uppercase tracking-[0.12em] text-ink/50">Featured products</p>
          <p className="mt-1 text-2xl font-bold text-ink">{products.filter((item) => item.featured).length}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl border border-amber-100 bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-3xl text-ink">{editingId ? "Edit product" : "Add product"}</h2>
          {editingId ? (
            <button type="button" onClick={resetForm} className="text-sm font-semibold text-brand-700">
              Cancel edit
            </button>
          ) : null}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1 text-sm">
            <span>Name</span>
            <input
              required
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              className="w-full rounded-xl border border-amber-200 px-3 py-2 outline-none ring-brand-300 focus:ring"
            />
          </label>
          <label className="space-y-1 text-sm">
            <span>Slug</span>
            <input
              required
              value={form.slug}
              onChange={(event) => setForm((prev) => ({ ...prev, slug: event.target.value }))}
              className="w-full rounded-xl border border-amber-200 px-3 py-2 outline-none ring-brand-300 focus:ring"
            />
          </label>
          <label className="space-y-1 text-sm">
            <span>SKU</span>
            <input
              required
              value={form.sku}
              onChange={(event) => setForm((prev) => ({ ...prev, sku: event.target.value }))}
              className="w-full rounded-xl border border-amber-200 px-3 py-2 outline-none ring-brand-300 focus:ring"
            />
          </label>
          <label className="space-y-1 text-sm">
            <span>Collection</span>
            <input
              required
              value={form.collection}
              onChange={(event) => setForm((prev) => ({ ...prev, collection: event.target.value }))}
              className="w-full rounded-xl border border-amber-200 px-3 py-2 outline-none ring-brand-300 focus:ring"
            />
          </label>
          <label className="space-y-1 text-sm">
            <span>Metal</span>
            <input
              required
              value={form.metal}
              onChange={(event) => setForm((prev) => ({ ...prev, metal: event.target.value }))}
              className="w-full rounded-xl border border-amber-200 px-3 py-2 outline-none ring-brand-300 focus:ring"
            />
          </label>
          <label className="space-y-1 text-sm">
            <span>Gemstone</span>
            <input
              value={form.gemstone}
              onChange={(event) => setForm((prev) => ({ ...prev, gemstone: event.target.value }))}
              className="w-full rounded-xl border border-amber-200 px-3 py-2 outline-none ring-brand-300 focus:ring"
            />
          </label>
          <label className="space-y-1 text-sm">
            <span>Gender</span>
            <input
              value={form.gender}
              onChange={(event) => setForm((prev) => ({ ...prev, gender: event.target.value }))}
              placeholder="Women, Men, Unisex"
              className="w-full rounded-xl border border-amber-200 px-3 py-2 outline-none ring-brand-300 focus:ring"
            />
          </label>
          <label className="space-y-1 text-sm">
            <span>Occasion tags (comma separated)</span>
            <input
              value={form.occasion}
              onChange={(event) => setForm((prev) => ({ ...prev, occasion: event.target.value }))}
              placeholder="Wedding, Engagement, Party"
              className="w-full rounded-xl border border-amber-200 px-3 py-2 outline-none ring-brand-300 focus:ring"
            />
          </label>
          <label className="space-y-1 text-sm">
            <span>Carat weight</span>
            <input
              type="number"
              step="0.01"
              value={form.caratWeight}
              onChange={(event) => setForm((prev) => ({ ...prev, caratWeight: event.target.value }))}
              className="w-full rounded-xl border border-amber-200 px-3 py-2 outline-none ring-brand-300 focus:ring"
            />
          </label>
          <label className="space-y-1 text-sm">
            <span>Sizes (comma separated)</span>
            <input
              value={form.sizeOptions}
              onChange={(event) => setForm((prev) => ({ ...prev, sizeOptions: event.target.value }))}
              placeholder="6, 7, 8"
              className="w-full rounded-xl border border-amber-200 px-3 py-2 outline-none ring-brand-300 focus:ring"
            />
          </label>
          <label className="space-y-1 text-sm">
            <span>Metal colors (comma separated)</span>
            <input
              value={form.metalColorOptions}
              onChange={(event) => setForm((prev) => ({ ...prev, metalColorOptions: event.target.value }))}
              placeholder="Rose Gold, Yellow Gold"
              className="w-full rounded-xl border border-amber-200 px-3 py-2 outline-none ring-brand-300 focus:ring"
            />
          </label>
          <label className="space-y-1 text-sm md:col-span-2">
            <span>Customization options (comma separated)</span>
            <input
              value={form.customizationList}
              onChange={(event) => setForm((prev) => ({ ...prev, customizationList: event.target.value }))}
              placeholder="Name engraving, Birthstone setting"
              className="w-full rounded-xl border border-amber-200 px-3 py-2 outline-none ring-brand-300 focus:ring"
            />
          </label>
          <label className="space-y-1 text-sm md:col-span-2">
            <span>Customization notes</span>
            <input
              value={form.customizationNotes}
              onChange={(event) => setForm((prev) => ({ ...prev, customizationNotes: event.target.value }))}
              placeholder="Custom orders are processed in 10-12 business days"
              className="w-full rounded-xl border border-amber-200 px-3 py-2 outline-none ring-brand-300 focus:ring"
            />
          </label>
          <label className="space-y-1 text-sm">
            <span>Price (INR)</span>
            <input
              type="number"
              min="1000"
              required
              value={form.price}
              onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))}
              className="w-full rounded-xl border border-amber-200 px-3 py-2 outline-none ring-brand-300 focus:ring"
            />
          </label>
          <label className="space-y-1 text-sm">
            <span>Making charge</span>
            <input
              type="number"
              min="0"
              required
              value={form.makingCharge}
              onChange={(event) => setForm((prev) => ({ ...prev, makingCharge: event.target.value }))}
              className="w-full rounded-xl border border-amber-200 px-3 py-2 outline-none ring-brand-300 focus:ring"
            />
          </label>
          <label className="space-y-1 text-sm">
            <span>Discount (%)</span>
            <input
              type="number"
              min="0"
              max="80"
              required
              value={form.discountPercent}
              onChange={(event) => setForm((prev) => ({ ...prev, discountPercent: event.target.value }))}
              className="w-full rounded-xl border border-amber-200 px-3 py-2 outline-none ring-brand-300 focus:ring"
            />
          </label>
          <label className="space-y-1 text-sm">
            <span>Stock</span>
            <input
              type="number"
              min="0"
              required
              value={form.stock}
              onChange={(event) => setForm((prev) => ({ ...prev, stock: event.target.value }))}
              className="w-full rounded-xl border border-amber-200 px-3 py-2 outline-none ring-brand-300 focus:ring"
            />
          </label>
          <label className="space-y-1 text-sm md:col-span-2">
            <span>Description</span>
            <textarea
              required
              value={form.description}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
              rows={3}
              className="w-full rounded-xl border border-amber-200 px-3 py-2 outline-none ring-brand-300 focus:ring"
            />
          </label>
          <label className="space-y-1 text-sm">
            <span>Image URL 1</span>
            <input
              required
              value={form.imageOne}
              onChange={(event) => setForm((prev) => ({ ...prev, imageOne: event.target.value }))}
              className="w-full rounded-xl border border-amber-200 px-3 py-2 outline-none ring-brand-300 focus:ring"
            />
          </label>
          <label className="space-y-1 text-sm">
            <span>Image URL 2</span>
            <input
              value={form.imageTwo}
              onChange={(event) => setForm((prev) => ({ ...prev, imageTwo: event.target.value }))}
              className="w-full rounded-xl border border-amber-200 px-3 py-2 outline-none ring-brand-300 focus:ring"
            />
          </label>
          <label className="space-y-1 text-sm">
            <span>Video URL (optional)</span>
            <input
              value={form.videoUrl}
              onChange={(event) => setForm((prev) => ({ ...prev, videoUrl: event.target.value }))}
              className="w-full rounded-xl border border-amber-200 px-3 py-2 outline-none ring-brand-300 focus:ring"
            />
          </label>
          <label className="space-y-1 text-sm">
            <span>Video thumbnail (optional)</span>
            <input
              value={form.videoThumbnail}
              onChange={(event) => setForm((prev) => ({ ...prev, videoThumbnail: event.target.value }))}
              className="w-full rounded-xl border border-amber-200 px-3 py-2 outline-none ring-brand-300 focus:ring"
            />
          </label>
        </div>

        <div className="flex flex-wrap gap-6">
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(event) => setForm((prev) => ({ ...prev, featured: event.target.checked }))}
            />
            Featured
          </label>
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(event) => setForm((prev) => ({ ...prev, active: event.target.checked }))}
            />
            Active
          </label>
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.allowEngraving}
              onChange={(event) => setForm((prev) => ({ ...prev, allowEngraving: event.target.checked }))}
            />
            Engraving available
          </label>
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.allowSizeAdjustment}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, allowSizeAdjustment: event.target.checked }))
              }
            />
            Size adjustment available
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {editingId ? "Update product" : "Create product"}
        </button>

        {status ? <p className="text-sm text-ink/70">{status}</p> : null}
      </form>

      <section className="rounded-3xl border border-amber-100 bg-white p-6">
        <h2 className="font-display text-3xl text-ink">Catalog</h2>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-amber-100 text-left text-ink/55">
                <th className="py-3">Name</th>
                <th className="py-3">Collection</th>
                <th className="py-3">Gender</th>
                <th className="py-3">Price</th>
                <th className="py-3">Stock</th>
                <th className="py-3">Status</th>
                <th className="py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-amber-50">
                  <td className="py-3 font-semibold text-ink">{product.name}</td>
                  <td className="py-3 text-ink/70">{product.collection}</td>
                  <td className="py-3 text-ink/70">{product.gender || "-"}</td>
                  <td className="py-3 text-ink/70">{formatINR(product.finalPrice)}</td>
                  <td className="py-3 text-ink/70">{product.stock}</td>
                  <td className="py-3">
                    {product.active ? (
                      <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
                        Active
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-200 px-2 py-1 text-xs font-semibold text-slate-600">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-right">
                    <div className="inline-flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(product.id);
                          setForm(mapToForm(product));
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="rounded-lg border border-amber-200 px-3 py-1.5 text-xs font-semibold text-ink/70"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(product.id)}
                        className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-3xl border border-amber-100 bg-white p-6">
        <h2 className="font-display text-3xl text-ink">Order management</h2>
        <div className="mt-4 space-y-3">
          {orders.slice(0, 12).map((order) => (
            <div key={order.id} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-amber-100 p-4 text-sm">
              <div>
                <p className="font-semibold text-ink">{order.orderNumber}</p>
                <p className="text-ink/60">{order.customerName} • {order.email}</p>
                <p className="text-ink/60">{formatINR(order.total)} • Payment: {order.paymentStatus}</p>
              </div>
              <select
                value={order.status}
                onChange={(event) => void updateOrderStatus(order.id, event.target.value as AdminOrder["status"])}
                className="rounded-xl border border-amber-200 px-3 py-2"
                aria-label="Update order status"
              >
                <option value="PENDING">PENDING</option>
                <option value="PAID">PAID</option>
                <option value="SHIPPED">SHIPPED</option>
                <option value="DELIVERED">DELIVERED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-amber-100 bg-white p-6">
        <h2 className="font-display text-3xl text-ink">Customer database</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-amber-100 text-left text-ink/55">
                <th className="py-3">Name</th>
                <th className="py-3">Email</th>
                <th className="py-3">Phone</th>
                <th className="py-3">Orders</th>
                <th className="py-3">Addresses</th>
                <th className="py-3">Wishlist</th>
              </tr>
            </thead>
            <tbody>
              {customers.slice(0, 25).map((customer) => (
                <tr key={customer.id} className="border-b border-amber-50">
                  <td className="py-3 font-semibold text-ink">{customer.name}</td>
                  <td className="py-3 text-ink/70">{customer.email}</td>
                  <td className="py-3 text-ink/70">{customer.phone || "-"}</td>
                  <td className="py-3 text-ink/70">{customer._count.orders}</td>
                  <td className="py-3 text-ink/70">{customer._count.addresses}</td>
                  <td className="py-3 text-ink/70">{customer._count.wishlist}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-amber-100 bg-white p-6">
          <h2 className="font-display text-3xl text-ink">Offers</h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            <input
              placeholder="Coupon code"
              value={couponCode}
              onChange={(event) => setCouponCode(event.target.value.toUpperCase())}
              className="rounded-xl border border-amber-200 px-3 py-2 text-sm"
            />
            <select
              value={couponType}
              onChange={(event) => setCouponType(event.target.value as "PERCENT" | "FLAT")}
              className="rounded-xl border border-amber-200 px-3 py-2 text-sm"
              aria-label="Coupon type"
            >
              <option value="PERCENT">Percent</option>
              <option value="FLAT">Flat</option>
            </select>
            <input
              type="number"
              placeholder="Value"
              value={couponValue}
              onChange={(event) => setCouponValue(event.target.value)}
              className="rounded-xl border border-amber-200 px-3 py-2 text-sm"
            />
          </div>
          <button onClick={() => void createCoupon()} className="mt-3 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white">
            Create coupon
          </button>

          <div className="mt-4 space-y-2">
            {coupons.slice(0, 10).map((coupon) => (
              <div key={coupon.id} className="rounded-xl border border-amber-100 p-3 text-sm">
                <p className="font-semibold text-ink">{coupon.code}</p>
                <p className="text-ink/60">{coupon.type} • {coupon.value} • Used {coupon.usedCount}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-amber-100 bg-white p-6">
          <h2 className="font-display text-3xl text-ink">Campaign management</h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            <input
              placeholder="Campaign name"
              value={campaignName}
              onChange={(event) => setCampaignName(event.target.value)}
              className="rounded-xl border border-amber-200 px-3 py-2 text-sm"
            />
            <input
              placeholder="Channel"
              value={campaignChannel}
              onChange={(event) => setCampaignChannel(event.target.value)}
              className="rounded-xl border border-amber-200 px-3 py-2 text-sm"
            />
            <input
              type="number"
              placeholder="Budget"
              value={campaignBudget}
              onChange={(event) => setCampaignBudget(event.target.value)}
              className="rounded-xl border border-amber-200 px-3 py-2 text-sm"
            />
          </div>
          <button onClick={() => void createCampaign()} className="mt-3 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white">
            Create campaign
          </button>

          <div className="mt-4 space-y-2">
            {campaigns.slice(0, 10).map((campaign) => (
              <div key={campaign.id} className="rounded-xl border border-amber-100 p-3 text-sm">
                <p className="font-semibold text-ink">{campaign.name}</p>
                <p className="text-ink/60">{campaign.channel} • Budget {formatINR(campaign.budget)} • Spent {formatINR(campaign.spent)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-amber-100 bg-white p-6">
        <h2 className="font-display text-3xl text-ink">Analytics & reports</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-amber-100 p-4">
            <p className="text-xs uppercase text-ink/55">Gross revenue</p>
            <p className="mt-1 text-xl font-bold text-ink">{formatINR(analytics?.grossRevenue || 0)}</p>
          </div>
          <div className="rounded-2xl border border-amber-100 p-4">
            <p className="text-xs uppercase text-ink/55">Paid revenue</p>
            <p className="mt-1 text-xl font-bold text-ink">{formatINR(analytics?.paidRevenue || 0)}</p>
          </div>
          <div className="rounded-2xl border border-amber-100 p-4">
            <p className="text-xs uppercase text-ink/55">AOV</p>
            <p className="mt-1 text-xl font-bold text-ink">{formatINR(analytics?.averageOrderValue || 0)}</p>
          </div>
          <div className="rounded-2xl border border-amber-100 p-4">
            <p className="text-xs uppercase text-ink/55">Payment success</p>
            <p className="mt-1 text-xl font-bold text-ink">{analytics?.paymentSuccessRate || 0}%</p>
          </div>
        </div>
      </section>
    </div>
  );
}
