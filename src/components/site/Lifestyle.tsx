import lifestyleImg from "@/assets/lifestyle.jpg";
import ResponsiveImage from "@/components/ui/responsive-image";

export function Lifestyle() {
  return (
    <section className="relative min-h-[34rem] overflow-hidden bg-card/40">
      <ResponsiveImage
        src={lifestyleImg}
        alt="Phone case in use"
        sizes="100vw"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_50%,rgba(10,16,28,0.1),transparent_34%),linear-gradient(90deg,rgba(6,10,20,0.9)_0%,rgba(6,10,20,0.6)_42%,rgba(6,10,20,0.18)_100%)]" />

      <div className="relative flex h-full max-w-7xl mx-auto items-end px-8 pb-16 pt-24 lg:px-12 xl:px-16">
        <div className="max-w-lg space-y-4">
          <h2 className="text-3xl font-light tracking-tighter sm:text-4xl lg:text-[3.1rem]">
            Designed for Your Lifestyle
          </h2>
          <p className="max-w-md text-lg font-light leading-8 text-foreground/56">
            Built tough for daily use, refined for any setting.
          </p>
        </div>
      </div>
    </section>
  );
}