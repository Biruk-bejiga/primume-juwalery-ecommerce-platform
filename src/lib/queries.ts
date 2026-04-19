import { prisma } from "@/lib/prisma";
import { mapProduct } from "@/lib/product-mapper";

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

export async function getProductsByCollection(collectionSlug: string) {
  const products = await prisma.product.findMany({
    where: {
      active: true,
      collection: {
        contains: collectionSlug.replace(/-/g, " "),
        mode: "insensitive"
      }
    },
    orderBy: { createdAt: "desc" }
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
