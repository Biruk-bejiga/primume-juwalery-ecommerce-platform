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
    caratWeight: 1.25,
    price: 124999,
    makingCharge: 9500,
    discountPercent: 10,
    stock: 9,
    featured: true,
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
      },
      {
        type: "video",
        url: "https://res.cloudinary.com/demo/video/upload/v1699098453/samples/sea-turtle.mp4",
        thumbnail:
          "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=80",
        alt: "Aurora solitaire ring 360 video"
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
    caratWeight: 0.85,
    price: 88999,
    makingCharge: 7800,
    discountPercent: 8,
    stock: 12,
    featured: true,
    media: [
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=1200&q=80",
        alt: "Celeste emerald necklace model shot"
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1543294001-f7cd5d7fb516?auto=format&fit=crop&w=1200&q=80",
        alt: "Celeste emerald necklace close-up"
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
    caratWeight: 0.62,
    price: 46999,
    makingCharge: 5600,
    discountPercent: 5,
    stock: 18,
    featured: true,
    media: [
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=1200&q=80",
        alt: "Verve diamond hoops"
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=1200&q=80",
        alt: "Verve hoops side view"
      }
    ]
  },
  {
    name: "Regalia Temple Bangle",
    slug: "regalia-temple-bangle",
    sku: "AJ-BNG-004",
    description:
      "A handcrafted temple-style bangle with intricate motifs and polished detailing inspired by heirloom South Indian artistry.",
    collection: "Bangles",
    metal: "22K Gold",
    gemstone: "Ruby",
    caratWeight: 0.44,
    price: 134999,
    makingCharge: 13000,
    discountPercent: 12,
    stock: 6,
    featured: true,
    media: [
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=1200&q=80",
        alt: "Regalia temple bangle"
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=1200&q=80",
        alt: "Regalia bangle engraving detail"
      }
    ]
  },
  {
    name: "Sovereign Couple Bands",
    slug: "sovereign-couple-bands",
    sku: "AJ-CPL-005",
    description:
      "A matching pair of minimalist bands with brushed finish and hidden diamond accents for modern couples.",
    collection: "Couple Bands",
    metal: "18K White Gold",
    gemstone: "Natural Diamond",
    caratWeight: 0.22,
    price: 52999,
    makingCharge: 4200,
    discountPercent: 0,
    stock: 20,
    featured: false,
    media: [
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1627293509201-fc8519d6d8f2?auto=format&fit=crop&w=1200&q=80",
        alt: "Sovereign couple bands pair"
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=1200&q=80",
        alt: "Sovereign bands close detail"
      }
    ]
  },
  {
    name: "Luna Daily Pendant",
    slug: "luna-daily-pendant",
    sku: "AJ-NCK-006",
    description:
      "A lightweight moon-inspired pendant designed for everyday luxury with a subtle sparkle and layered-styling versatility.",
    collection: "Daily Wear",
    metal: "14K Rose Gold",
    gemstone: "Moissanite",
    caratWeight: 0.18,
    price: 23999,
    makingCharge: 1800,
    discountPercent: 6,
    stock: 32,
    featured: false,
    media: [
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1544376664-80b17f09d399?auto=format&fit=crop&w=1200&q=80",
        alt: "Luna daily pendant"
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80",
        alt: "Luna pendant layered styling"
      }
    ]
  },
  {
    name: "Noor Polki Choker",
    slug: "noor-polki-choker",
    sku: "AJ-ETH-007",
    description:
      "A bridal polki choker with handcrafted detailing and statement profile tailored for festive and wedding occasions.",
    collection: "Ethnic Bridal",
    metal: "22K Gold",
    gemstone: "Polki Diamond",
    caratWeight: 2.8,
    price: 248999,
    makingCharge: 22000,
    discountPercent: 7,
    stock: 4,
    featured: true,
    media: [
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=1200&q=80",
        alt: "Noor polki choker"
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=1200&q=80",
        alt: "Noor choker ceremonial look"
      }
    ]
  },
  {
    name: "Linea Stackable Ring",
    slug: "linea-stackable-ring",
    sku: "AJ-DLY-008",
    description:
      "A contemporary stackable ring with geometric silhouette made for layering with engagement and anniversary bands.",
    collection: "Daily Wear",
    metal: "14K Yellow Gold",
    gemstone: "Natural Diamond",
    caratWeight: 0.12,
    price: 19999,
    makingCharge: 1200,
    discountPercent: 4,
    stock: 42,
    featured: false,
    media: [
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1603561596112-d65f3ff0fbc8?auto=format&fit=crop&w=1200&q=80",
        alt: "Linea stackable ring"
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1601821765780-754fa98637c1?auto=format&fit=crop&w=1200&q=80",
        alt: "Linea ring styling"
      }
    ]
  }
];

async function seedProducts() {
  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: product,
      create: product
    });
  }
}

async function main() {
  await seedProducts();
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
