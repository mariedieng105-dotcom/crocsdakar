import Image from "next/image";
import Link from "next/link";
import { formatPriceShort } from "@/lib/shop";
import type { SerializedProduct } from "@/lib/serialize";

/**
 * Carte produit éditoriale : la photo est posée sur une tuile crème en
 * `contain`, ce qui met au même format des visuels officiels sur fond blanc et
 * des photos prises en boutique. Le texte vit sur le fond de page, sans carte
 * ni ombre, pour une lecture de lookbook plutôt que de catalogue.
 */
export default function ProductCard({
  product,
  priority = false,
}: {
  product: SerializedProduct;
  priority?: boolean;
}) {
  const mainImage = product.images[0];
  // Un produit sans aucune pointure déclarée est un accessoire (jibbitz), pas
  // un modèle en rupture : seules les pointures existantes comptent.
  const sizesKnown = product.sizes.length > 0;
  const soldOut =
    !product.available || (sizesKnown && !product.sizes.some((s) => s.available));

  return (
    <Link href={`/produit/${product.slug}`} className="cd-card group block">
      <div className="cd-tile">
        {mainImage ? (
          <Image
            src={mainImage.url}
            alt={mainImage.alt || product.name}
            fill
            priority={priority}
            sizes="(max-width: 560px) 63vw, (max-width: 900px) 38vw, 24vw"
            className="object-cover"
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-sm text-[var(--cd-ink-faint)]">
            Photo à venir
          </span>
        )}

        {soldOut && (
          <span className="cd-eyebrow absolute top-3 left-3 bg-[var(--cd-navy-800)] text-white text-[0.6rem] px-2.5 py-1.5">
            Épuisé
          </span>
        )}
      </div>

      <div className="pt-3.5">
        <p className="cd-eyebrow text-[0.6rem] text-[var(--cd-gold-700)] truncate">
          {product.model}
        </p>
        <h3 className="mt-1.5 font-semibold leading-snug line-clamp-2">
          <span className="cd-link-underline">{product.name}</span>
        </h3>
        <p
          className={`cd-num mt-1 ${
            product.price === null
              ? "text-sm text-[var(--cd-ink-faint)]"
              : "font-semibold"
          }`}
        >
          {formatPriceShort(product.price)}
        </p>
      </div>
    </Link>
  );
}
