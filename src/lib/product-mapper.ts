import { Product } from "@prisma/client";

import { MediaItem, ProductView } from "@/lib/types";

const fallbackImage =
  "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?auto=format&fit=crop&w=1200&q=80";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isMediaItem(value: unknown): value is MediaItem {
  return (
    isRecord(value) &&
    (value.type === "image" || value.type === "video") &&
    typeof value.url === "string"
  );
}

export function parseProductMedia(value: unknown): MediaItem[] {
  if (!Array.isArray(value)) {
    return [{ type: "image", url: fallbackImage, alt: "Jewellery product image" }];
  }

  const media = value
    .filter(isMediaItem)
    .map((item) => ({
      type: item.type,
      url: item.url,
      alt: typeof item.alt === "string" ? item.alt : "Jewellery product image",
      thumbnail: typeof item.thumbnail === "string" ? item.thumbnail : undefined
    }));

  if (!media.length) {
    return [{ type: "image", url: fallbackImage, alt: "Jewellery product image" }];
  }

  return media;
}

export function mapProduct(product: Product): ProductView {
  const media = parseProductMedia(product.media);
  const discounted = Math.round(product.price * (1 - product.discountPercent / 100));

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    description: product.description,
    collection: product.collection,
    metal: product.metal,
    gemstone: product.gemstone,
    caratWeight: product.caratWeight ? Number(product.caratWeight) : null,
    price: product.price,
    makingCharge: product.makingCharge,
    discountPercent: product.discountPercent,
    finalPrice: discounted,
    stock: product.stock,
    featured: product.featured,
    active: product.active,
    media,
    primaryImage: media[0]?.type === "video" ? media[0].thumbnail || fallbackImage : media[0]?.url || fallbackImage
  };
}
