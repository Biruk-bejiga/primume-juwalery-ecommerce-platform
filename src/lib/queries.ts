import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { mapProduct } from "@/lib/product-mapper";
import { CatalogFilters } from "@/lib/types";

function toOrderBy(sort: CatalogFilters["sort"]): Prisma.ProductOrderByWithRelationInput[] {
  if (sort === "price_asc") {
    return [{ price: "asc" }];
  }

  if (sort === "price_desc") {
    return [{ price: "desc" }];
  }

  return [{ featured: "desc" }, { createdAt: "desc" }];
}

function buildFilterWhere(filters: CatalogFilters) {
  const where: Record<string, unknown> = {
    active: true
  };

  if (typeof filters.minPrice === "number" || typeof filters.maxPrice === "number") {
    where.price = {
      gte: filters.minPrice,
      lte: filters.maxPrice
    };
  }

  if (typeof filters.minWeight === "number" || typeof filters.maxWeight === "number") {
    where.caratWeight = {
      gte: typeof filters.minWeight === "number" ? new Prisma.Decimal(filters.minWeight) : undefined,
      lte: typeof filters.maxWeight === "number" ? new Prisma.Decimal(filters.maxWeight) : undefined
    };
  }

  if (filters.metal) {
    where.metal = { contains: filters.metal };
  }

  if (filters.stone) {
    where.gemstone = { contains: filters.stone };
  }

  if (filters.gender) {
    where.gender = { contains: filters.gender };
  }

  if (filters.occasion) {
    where.occasion = { contains: filters.occasion };
  }

  return where as Prisma.ProductWhereInput;
}

export async function getFeaturedProducts(limit = 8) {
  const products = await prisma.product.findMany({
    where: { active: true, featured: true },
    orderBy: { updatedAt: "desc" },
    take: limit
  });

  return products.map(mapProduct);
}

export async function getAllActiveProducts() {
  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: { createdAt: "desc" }
  });

  return products.map(mapProduct);
}

export async function getProductsByCollection(collectionSlug: string, filters: CatalogFilters = {}) {
  const filterWhere = buildFilterWhere(filters);
  const where: Record<string, unknown> = {
    ...filterWhere,
    collection: {
      contains: collectionSlug.replace(/-/g, " ")
    }
  };

  const products = await prisma.product.findMany({
    where: where as Prisma.ProductWhereInput,
    orderBy: toOrderBy(filters.sort)
  });

  return products.map(mapProduct);
}

export async function getProductBySlug(slug: string) {
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product || !product.active) {
    return null;
  }

  return mapProduct(product);
}

export async function getAdminProducts() {
  const products = await prisma.product.findMany({ orderBy: { updatedAt: "desc" } });
  return products.map(mapProduct);
}

export async function getFilteredProducts(filters: CatalogFilters = {}) {
  const products = await prisma.product.findMany({
    where: buildFilterWhere(filters),
    orderBy: toOrderBy(filters.sort)
  });

  return products.map(mapProduct);
}

export async function getRelatedProducts(productId: number, limit = 4) {
  const current = await prisma.product.findUnique({ where: { id: productId } });
  if (!current) {
    return [];
  }

  const related = await prisma.product.findMany({
    where: {
      active: true,
      id: { not: productId },
      OR: [
        { collection: current.collection },
        current.gemstone ? { gemstone: current.gemstone } : undefined,
        { metal: current.metal }
      ].filter(Boolean) as Prisma.ProductWhereInput[]
    },
    orderBy: [{ featured: "desc" }, { updatedAt: "desc" }],
    take: limit
  });

  return related.map(mapProduct);
}
