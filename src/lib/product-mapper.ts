import { Product } from "@prisma/client";

import { CustomizationOptions, MediaItem, ProductView, VariantOptions } from "@/lib/types";

const fallbackImage =
  "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?auto=format&fit=crop&w=1200&q=80";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((entry): entry is string => typeof entry === "string" && entry.trim().length > 0);
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

function parseOccasions(value: string | null) {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseVariantOptions(value: unknown): VariantOptions {
  if (!isRecord(value)) {
    return {
      sizes: [],
      metalColors: [],
      customization: []
    };
  }

  return {
    sizes: parseStringArray(value.sizes),
    metalColors: parseStringArray(value.metalColors),
    customization: parseStringArray(value.customization)
  };
}

function parseCustomizationOptions(value: unknown): CustomizationOptions {
  if (!isRecord(value)) {
    return {
      allowEngraving: false,
      allowSizeAdjustment: false,
      notes: null
    };
  }

  return {
    allowEngraving: value.allowEngraving === true,
    allowSizeAdjustment: value.allowSizeAdjustment === true,
    notes: typeof value.notes === "string" && value.notes.trim().length > 0 ? value.notes : null
  };
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
    gender: product.gender,
    occasions: parseOccasions(product.occasion),
    caratWeight: product.caratWeight ? Number(product.caratWeight) : null,
    price: product.price,
    makingCharge: product.makingCharge,
    discountPercent: product.discountPercent,
    finalPrice: discounted,
    stock: product.stock,
    featured: product.featured,
    active: product.active,
    media,
    variantOptions: parseVariantOptions(product.variantOptions),
    customizationOptions: parseCustomizationOptions(product.customizationOptions),
    primaryImage: media[0]?.type === "video" ? media[0].thumbnail || fallbackImage : media[0]?.url || fallbackImage
  };
}
