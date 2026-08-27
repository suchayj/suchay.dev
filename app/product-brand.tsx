import Image from "next/image";

type ProductSlug = "rentora" | "edvora" | "loom";

export function ProductMark({ slug }: { slug: ProductSlug }) {
  if (slug === "rentora") {
    return <Image className="product-mark" src="/brands/rentora/rentora-mark.png" width={64} height={64} alt="" />;
  }

  if (slug === "edvora") {
    return <span className="product-mark-pair" aria-hidden="true"><Image className="product-mark product-mark-dark-theme" src="/brands/edvora/edvora-mark-white.svg" width={100} height={100} alt="" /><Image className="product-mark product-mark-light-theme" src="/brands/edvora/edvora-mark-blue.svg" width={100} height={100} alt="" /></span>;
  }

  return <span className="product-mark-pair" aria-hidden="true"><Image className="product-mark product-mark-dark-theme" src="/brands/loom/loom-logo.png" width={768} height={768} alt="" /><Image className="product-mark product-mark-light-theme" src="/brands/loom/loom-logo-dark.png" width={768} height={768} alt="" /></span>;
}

export function ProductName({ slug, name, as: Element = "span" }: { slug: ProductSlug; name: string; as?: "span" | "h1" | "h3" }) {
  return <Element className="product-name"><ProductMark slug={slug} /><span>{name}</span></Element>;
}
