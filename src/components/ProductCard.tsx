import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/shop";
import type { SerializedProduct } from "@/lib/serialize";

export default function ProductCard({ product }: { product: SerializedProduct }) {
  const mainImage = product.images[0];
  const hasAvailableSize = product.sizes.some((s) => s.available);

  return (
    <Link
      href={`/produit/${product.slug}`}
      className="group flex flex-col rounded-2xl overflow-hidden bg-white card-shadow hover:-translate-y-1 transition-transform duration-200"
    >
      <div className="relative aspect-square bg-[var(--color-cream-dark)]">
        {mainImage ? (
          <Image
            src={mainImage.url}
            alt={mainImage.alt || product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[var(--color-navy)]/30 text-sm">
            Photo à venir
          </div>
        )}
        {!product.available || !hasAvailableSize ? (
          <span className="absolute top-2 left-2 bg-[var(--color-navy)] text-white text-[11px] font-semibold px-2.5 py-1 rounded-full">
            Indisponible
          </span>
        ) : null}
      </div>
      <div className="p-3 sm:p-4 flex flex-col gap-1">
        <p className="text-[11px] uppercase tracking-wide text-[var(--color-gold-dark)] font-semibold">
          {product.model}
        </p>
        <h3 className="font-semibold text-[var(--color-navy)] leading-snug line-clamp-2">{product.name}</h3>
        <p
          className={`font-display font-bold ${
            product.price === null ? "text-[var(--color-navy)]/50 text-sm" : "text-[var(--color-navy)]"
          }`}
        >
          {formatPrice(product.price)}
        </p>
      </div>
    </Link>
  );
}
