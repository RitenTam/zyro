import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "@/components/site/Hero";
import { CollectionGrid } from "@/components/site/CollectionGrid";
import { ProductSpotlight } from "@/components/site/ProductSpotlight";
import { BestSellers } from "@/components/site/BestSellers";
import { Lifestyle } from "@/components/site/Lifestyle";
import { BrandValues } from "@/components/site/BrandValues";
import { Testimonials } from "@/components/site/Testimonials";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Zyro — Premium Tech Cases" },
      { name: "description", content: "Premium phone cases with tactile materials, MagSafe-ready detail, and studio-grade finish." },
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
      <Testimonials />
    </>
  );
}
