import siliconeImg from "@/assets/collection-silicone.jpg";
import wovenImg from "@/assets/collection-woven.jpg";
import magsafeImg from "@/assets/collection-magsafe.jpg";
import obsidianImg from "@/assets/spotlight-obsidian.jpg";

export type ProductColor = { name: string; hex: string };
export type ProductMaterial = "Silicone" | "Woven" | "MagSafe" | "Protective";

export interface Variant {
  id: string;
  sku?: string;
  price?: number;
  available?: number;
  images?: string[];
  options?: Record<string, string>;
}

export interface Specification {
  name: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  collection: string;
  material: ProductMaterial;
  price: number;
  description: string;
  image: string;
  colors: ProductColor[];
  variants?: Variant[];
  specs: Specification[];
}

export const products: Product[] = [
  {
    id: "core-silicone-onyx",
    name: "Core Silicone",
    collection: "Silicone Series",
    material: "Silicone",
    price: 55,
    description:
      "Liquid silicone base with soft-touch finish. Drop tested to 10 feet. Oil resistant, fingerprint free.",
    image: siliconeImg,
    colors: [
      { name: "Onyx", hex: "#0a0a0a" },
      { name: "Bone", hex: "#e6e1d6" },
      { name: "Sand", hex: "#b89c7c" },
      { name: "Slate", hex: "#7a8088" },
    ],
    variants: [
      { id: "core-silicone-onyx-onyx", price: 55, available: 120, images: [siliconeImg], options: { color: "Onyx" } },
      { id: "core-silicone-onyx-bone", price: 55, available: 80, images: [siliconeImg], options: { color: "Bone" } },
      { id: "core-silicone-onyx-sand", price: 55, available: 60, images: [siliconeImg], options: { color: "Sand" } },
      { id: "core-silicone-onyx-slate", price: 55, available: 40, images: [siliconeImg], options: { color: "Slate" } },
    ],
    specs: [
      { name: "Drop Protection", value: "10 feet" },
      { name: "Finish", value: "Soft-touch matte" },
      { name: "MagSafe", value: "Compatible" },
      { name: "Warranty", value: "1 year" },
    ],
  },
  {
    id: "woven-industrial-charcoal",
    name: "Industrial Woven",
    collection: "Textile Series",
    material: "Woven",
    price: 75,
    description:
      "Ballistic nylon woven exterior on aerospace polymer. Tactile grip, designed to age with character.",
    image: wovenImg,
    colors: [
      { name: "Charcoal", hex: "#2a2a2c" },
      { name: "Graphite", hex: "#3d3d40" },
      { name: "Ivory", hex: "#dcd6c8" },
    ],
    variants: [
      { id: "woven-industrial-charcoal-charcoal", price: 75, available: 80, images: [wovenImg], options: { color: "Charcoal" } },
      { id: "woven-industrial-charcoal-graphite", price: 75, available: 60, images: [wovenImg], options: { color: "Graphite" } },
      { id: "woven-industrial-charcoal-ivory", price: 75, available: 40, images: [wovenImg], options: { color: "Ivory" } },
    ],
    specs: [
      { name: "Drop Protection", value: "12 feet" },
      { name: "Material", value: "Ballistic nylon" },
      { name: "MagSafe", value: "Compatible" },
      { name: "Warranty", value: "Lifetime repair" },
    ],
  },
  {
    id: "magsafe-ultra-frost",
    name: "MagSafe Ultra",
    collection: "Magnetic Series",
    material: "MagSafe",
    price: 65,
    description:
      "Frosted polymer with N52 magnet array. Optimized for wireless charging and magnetic accessories.",
    image: magsafeImg,
    colors: [
      { name: "Frost", hex: "#cdd5dc" },
      { name: "Onyx", hex: "#0a0a0a" },
      { name: "Storm", hex: "#525a66" },
    ],
    variants: [
      { id: "magsafe-ultra-frost-frost", price: 65, available: 90, images: [magsafeImg], options: { color: "Frost" } },
      { id: "magsafe-ultra-frost-onyx", price: 65, available: 70, images: [magsafeImg], options: { color: "Onyx" } },
      { id: "magsafe-ultra-frost-storm", price: 65, available: 50, images: [magsafeImg], options: { color: "Storm" } },
    ],
    specs: [
      { name: "Drop Protection", value: "10 feet" },
      { name: "Magnet Strength", value: "N52 grade" },
      { name: "Charging", value: "15W wireless" },
      { name: "Warranty", value: "1 year" },
    ],
  },
  {
    id: "obsidian-protective-midnight",
    name: "Obsidian Pro",
    collection: "Protective Series",
    material: "Protective",
    price: 95,
    description:
      "Aerospace polymer with reinforced corners. 15-foot drop tested. Built for daily impact.",
    image: obsidianImg,
    colors: [
      { name: "Midnight", hex: "#0a0a0a" },
      { name: "Bone", hex: "#e6e1d6" },
      { name: "Sand", hex: "#b89c7c" },
      { name: "Storm", hex: "#525a66" },
    ],
    variants: [
      { id: "obsidian-protective-midnight-midnight", price: 95, available: 50, images: [obsidianImg], options: { color: "Midnight" } },
      { id: "obsidian-protective-midnight-bone", price: 95, available: 30, images: [obsidianImg], options: { color: "Bone" } },
      { id: "obsidian-protective-midnight-sand", price: 95, available: 20, images: [obsidianImg], options: { color: "Sand" } },
      { id: "obsidian-protective-midnight-storm", price: 95, available: 25, images: [obsidianImg], options: { color: "Storm" } },
    ],
    specs: [
      { name: "Drop Protection", value: "15 feet" },
      { name: "Material", value: "Aerospace polymer" },
      { name: "MagSafe", value: "Compatible" },
      { name: "Warranty", value: "Lifetime repair" },
    ],
  },
];

export const collections = [
  {
    slug: "silicone",
    name: "Silicone",
    description: "Soft-touch protection",
    image: siliconeImg,
  },
  {
    slug: "woven",
    name: "Woven",
    description: "Tactile textile",
    image: wovenImg,
  },
  {
    slug: "magsafe",
    name: "Magnetic",
    description: "Wireless charging",
    image: magsafeImg,
  },
];

export function getProduct(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getRelatedProducts(productId: string, limit: number = 3): Product[] {
  return products.filter((p) => p.id !== productId).slice(0, limit);
}