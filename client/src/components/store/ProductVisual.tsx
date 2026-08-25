import { Gem } from "lucide-react";

export function ProductVisual({ image, name, small = false }: { image?: string; name: string; small?: boolean }) {
  if (image) return <img className="product-image" src={image} alt={name} loading="lazy" />;
  return <div className={`product-fallback ${small ? "small" : ""}`} role="img" aria-label={`${name} image to follow`}><div className="ring-shape"><Gem size={small ? 24 : 38} strokeWidth={1} /></div><span>LA GLITZ</span></div>;
}
