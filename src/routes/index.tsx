import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "@/components/site/Hero";
import { CollectionGrid } from "@/components/site/CollectionGrid";
import { ProductSpotlight } from "@/components/site/ProductSpotlight";
import { BestSellers } from "@/components/site/BestSellers";
import { Lifestyle } from "@/components/site/Lifestyle";
import { BrandValues } from "@/components/site/BrandValues";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Zyro" },
      {
        name: "description",
        content:
          "Premium silicone, woven, and MagSafe phone cases. Engineered to aerospace tolerance. Designed in San Francisco.",
      },
      { property: "og:title", content: "Zyro" },
      {
        property: "og:description",
        content: "Engineered for the modern nomad. Liquid silicone meets architectural precision.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <>
      <Hero />
      <CollectionGrid />
      <ProductSpotlight />
      <BestSellers />
      <Lifestyle />
      <BrandValues />
    </>
  );
}
