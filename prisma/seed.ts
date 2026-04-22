import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const products = [
  {
    name: "Aurora Solitaire Ring",
    slug: "aurora-solitaire-ring",
    sku: "AJ-RNG-001",
    description:
      "A timeless bridal solitaire ring crafted in 18K rose gold with a radiant-cut centerpiece that captures light from every angle.",
    collection: "Bridal Rings",
    metal: "18K Rose Gold",
    gemstone: "Lab-Grown Diamond",
    caratWeight: "1.25",
    price: 124999,
    makingCharge: 9500,
    discountPercent: 10,
    stock: 9,
    featured: true,
    active: true,
    media: [
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=80",
        alt: "Aurora solitaire ring front view"
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=80",
        alt: "Aurora solitaire ring side profile"
      }
    ]
  },
  {
    name: "Celeste Emerald Necklace",
    slug: "celeste-emerald-necklace",
    sku: "AJ-NCK-002",
    description:
      "An emerald halo pendant suspended on a delicate chain, designed to elevate cocktail and occasion wear with refined brilliance.",
    collection: "Necklaces",
    metal: "18K Yellow Gold",
    gemstone: "Emerald",
    caratWeight: "0.85",
    price: 88999,
    makingCharge: 7800,
    discountPercent: 8,
    stock: 12,
    featured: true,
    active: true,
    media: [
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=1200&q=80",
        alt: "Celeste emerald necklace model shot"
      }
    ]
  },
  {
    name: "Verve Diamond Hoops",
    slug: "verve-diamond-hoops",
    sku: "AJ-ERP-003",
    description:
      "Inside-out diamond hoops balancing contemporary edge and everyday elegance in lightweight 14K white gold.",
    collection: "Earrings",
    metal: "14K White Gold",
    gemstone: "Natural Diamond",
    caratWeight: "0.62",
    price: 46999,
    makingCharge: 5600,
    discountPercent: 5,
    stock: 18,
    featured: true,
    active: true,
    media: [
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=1200&q=80",
        alt: "Verve diamond hoops"
      }
    ]
  }
];

async function main() {
  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: product,
      create: product
    });
  }

  // eslint-disable-next-line no-console
  console.log(`Seeded ${products.length} products.`);
}

main()
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
