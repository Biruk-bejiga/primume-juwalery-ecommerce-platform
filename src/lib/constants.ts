import { makeSlug } from "@/lib/format";

export const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || "Aurelia Jewels";

export const collections = [
  "Bridal Rings",
  "Necklaces",
  "Earrings",
  "Bangles",
  "Daily Wear",
  "Ethnic Bridal",
  "Couple Bands"
].map((name) => ({
  name,
  slug: makeSlug(name)
}));

export const navLinks = [
  { label: "Shop All", href: "/" },
  { label: "Bridal", href: `/collections/${makeSlug("Bridal Rings")}` },
  { label: "Daily Wear", href: `/collections/${makeSlug("Daily Wear")}` },
  { label: "Ethnic", href: `/collections/${makeSlug("Ethnic Bridal")}` },
  { label: "Admin", href: "/admin" }
];

export const trustSignals = [
  "BIS Hallmarked Gold",
  "Certified Natural & Lab Diamonds",
  "15-Day Easy Returns",
  "Free Insured Shipping"
];
