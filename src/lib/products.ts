import siliconeImg from "@/assets/collection-silicone.jpg";
import wovenImg from "@/assets/collection-woven.jpg";
import magsafeImg from "@/assets/collection-magsafe.jpg";
import obsidianImg from "@/assets/spotlight-obsidian.jpg";

export type ProductColor = { name: string; hex: string };
export type ProductMaterial = "Silicone" | "Woven" | "MagSafe" | "Protective";

export type Product = {
  id: string;
  name: string;
  collection: string;
  material: ProductMaterial;
  price: number;
  tagline: string;
  description: string;
  image: string;
  colors: ProductColor[];
  features: { label: string; detail: string }[];
};

export const products: Product[] = [
  {
    id: "core-silicone-onyx",
    name: "Core Silicone",
    collection: "Silicone Series",
    material: "Silicone",
    price: 55,
    tagline: "Liquid silicone, refined.",
    description:
      "A hydrophobic, soft-touch chassis molded from medical-grade liquid silicone. Engineered for the modern nomad — featherweight, fingerprint-resistant, and architecturally precise.",
    image: siliconeImg,
    colors: [
      { name: "Onyx", hex: "#0a0a0a" },
      { name: "Bone", hex: "#e6e1d6" },
      { name: "Sand", hex: "#b89c7c" },
      { name: "Slate", hex: "#7a8088" },
    ],
    features: [
      { label: "10ft Drop Proof", detail: "Proprietary AeroShock lining absorbs 95% of impact." },
      { label: "Soft-Touch Finish", detail: "Oil and fingerprint resistant micro-coating." },
      { label: "MagSafe Aligned", detail: "N52 magnet array for instant snap." },
      { label: "FSC Packaging", detail: "Compostable technical packaging." },
    ],
  },
  {
    id: "woven-industrial-charcoal",
    name: "Industrial Woven",
    collection: "Textile Series",
    material: "Woven",
    price: 75,
    tagline: "Tactile precision grip.",
    description:
      "A precision-milled ballistic weave bonded to an aerospace polymer chassis. Engineered to age with character.",
    image: wovenImg,
    colors: [
      { name: "Charcoal", hex: "#2a2a2c" },
      { name: "Graphite", hex: "#3d3d40" },
      { name: "Ivory", hex: "#dcd6c8" },
    ],
    features: [
      { label: "Mil-Spec Rated", detail: "MIL-STD-810G drop-tested at 12ft." },
      { label: "Tactile Weave", detail: "1.2mm grain provides confident grip." },
      { label: "MagSafe Aligned", detail: "Optimized magnet ring under textile." },
      { label: "Lifetime Warranty", detail: "Repaired or replaced, indefinitely." },
    ],
  },
  {
    id: "magsafe-ultra-frost",
    name: "MagSafe Ultra",
    collection: "Magnetic Ecosystem",
    material: "MagSafe",
    price: 65,
    tagline: "Snap with conviction.",
    description:
      "Frosted polymer with an integrated N52 neodymium array. The strongest snap in the ecosystem — engineered for wireless power and accessory pairing.",
    image: magsafeImg,
    colors: [
      { name: "Frost", hex: "#cdd5dc" },
      { name: "Onyx", hex: "#0a0a0a" },
      { name: "Storm", hex: "#525a66" },
    ],
    features: [
      { label: "N52 Magnet Array", detail: "Strongest magnetic alignment in class." },
      { label: "Frosted Polymer", detail: "Translucent finish that won't yellow." },
      { label: "15W Wireless", detail: "Optimized for full-speed MagSafe charging." },
      { label: "Reinforced Edge", detail: "Raised camera bezel and screen lip." },
    ],
  },
  {
    id: "obsidian-protective-midnight",
    name: "Obsidian Pro",
    collection: "Protective Series",
    material: "Protective",
    price: 95,
    tagline: "Engineered for impact.",
    description:
      "Aerospace-grade polymer with a micro-etched finish. Built to survive — designed to disappear.",
    image: obsidianImg,
    colors: [
      { name: "Midnight", hex: "#0a0a0a" },
      { name: "Bone", hex: "#e6e1d6" },
      { name: "Sand", hex: "#b89c7c" },
      { name: "Storm", hex: "#525a66" },
    ],
    features: [
      { label: "15ft Drop Proof", detail: "Reinforced corner ImpactX columns." },
      { label: "Micro-Etched Finish", detail: "Resists scratches and patina with use." },
      { label: "MagSafe Aligned", detail: "N52 magnet array, fully concealed." },
      { label: "Lifetime Warranty", detail: "Repaired or replaced, indefinitely." },
    ],
  },
];

export const collections = [
  {
    slug: "silicone",
    name: "Silicone",
    eyebrow: "Tactile Precision",
    image: siliconeImg,
  },
  {
    slug: "woven",
    name: "Woven",
    eyebrow: "Textile Series",
    image: wovenImg,
  },
  {
    slug: "magsafe",
    name: "MagSafe",
    eyebrow: "Power Integrated",
    image: magsafeImg,
  },
];

export function getProduct(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}