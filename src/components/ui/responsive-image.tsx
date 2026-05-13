import React from "react";

type Props = React.ImgHTMLAttributes<HTMLImageElement> & {
  src: string;
  alt: string;
  sizes?: string;
  priority?: boolean; // if true, load eagerly and high fetch priority
};

export function ResponsiveImage({ src, alt, sizes, priority = false, className, decoding = "async", loading, ...rest }: Props) {
  const actualLoading = loading ?? (priority ? "eager" : "lazy");
  const fetchPriority = priority ? "high" : undefined;

  return (
    <img
      src={src}
      alt={alt}
      sizes={sizes}
      loading={actualLoading}
      decoding={decoding}
      fetchPriority={fetchPriority as any}
      className={className}
      {...rest}
    />
  );
}

export default ResponsiveImage;
