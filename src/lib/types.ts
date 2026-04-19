export type MediaType = "image" | "video";

export type MediaItem = {
  type: MediaType;
  url: string;
  alt?: string;
  thumbnail?: string;
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
  caratWeight: number | null;
  price: number;
  makingCharge: number;
  discountPercent: number;
  finalPrice: number;
  stock: number;
  featured: boolean;
  active: boolean;
  media: MediaItem[];
  primaryImage: string;
};

export type CartItem = {
  id: number;
  slug: string;
  name: string;
  price: number;
  quantity: number;
  thumbnail: string;
};
