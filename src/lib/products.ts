import siliconeImg from "@/assets/collection-silicone.jpg";
import wovenImg from "@/assets/collection-woven.jpg";
import magsafeImg from "@/assets/collection-magsafe.jpg";

export * from "./catalog";

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
