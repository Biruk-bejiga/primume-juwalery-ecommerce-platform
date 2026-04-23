export type MediaType = "image" | "video";

export type MediaItem = {
  type: MediaType;
  url: string;
  alt?: string;
  thumbnail?: string;
};

export type VariantOptions = {
  sizes: string[];
  metalColors: string[];
  customization: string[];
};

export type CustomizationOptions = {
  allowEngraving: boolean;
  allowSizeAdjustment: boolean;
  notes: string | null;
};

export type ProductView = {
  id: number;
  name: string;
  slug: string;
  sku: string;
  description: string;
  collection: string;
  metal: string;
  gemstone: string | null;
  gender: string | null;
  occasions: string[];
  caratWeight: number | null;
  price: number;
  makingCharge: number;
  discountPercent: number;
  finalPrice: number;
  stock: number;
  featured: boolean;
  active: boolean;
  media: MediaItem[];
  variantOptions: VariantOptions;
  customizationOptions: CustomizationOptions;
  primaryImage: string;
};

export type CatalogFilters = {
  minPrice?: number;
  maxPrice?: number;
  minWeight?: number;
  maxWeight?: number;
  metal?: string;
  stone?: string;
  gender?: string;
  occasion?: string;
  sort?: "newest" | "price_asc" | "price_desc";
};

export type CartItem = {
  id: number;
  slug: string;
  name: string;
  price: number;
  quantity: number;
  thumbnail: string;
  selectedSize?: string;
  engravingText?: string;
};

export type UserSession = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
};

export type AddressView = {
  id: number;
  label: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
};

export type OrderTrackingEvent = {
  status: string;
  at: string;
  note: string;
};

export type TrackOrderView = {
  orderNumber: string;
  trackingId: string | null;
  status: string;
  total: number;
  createdAt: string;
  events: OrderTrackingEvent[];
};
