import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import type { SerializedProduct } from "@/lib/serialize";

/**
 * Rangée de produits titrée. Sur mobile elle défile horizontalement, ce qui
 * laisse voir plusieurs modèles sans allonger la page ; à partir du grand
 * écran elle redevient une grille de quatre.
 */
export default function ProductRow({
  title,
  subtitle,
  href,
  linkLabel = "Voir tout",
  products,
  priority = false,
}: {
  title: string;
  subtitle?: string;
  href: string;
  linkLabel?: string;
  products: SerializedProduct[];
  priority?: boolean;
}) {
  if (products.length === 0) return null;

  return (
    <section className="cd-container cd-section">
      <div className="cd-head">
        <div>
          <h2 className="cd-display cd-display-l">{title}</h2>
          {subtitle && (
            <p className="text-[var(--cd-ink-soft)] mt-2 text-[0.95rem]">{subtitle}</p>
          )}
        </div>
        <span className="cd-head__rule" aria-hidden="true" />
        <Link href={href} className="cd-head__link">
          {linkLabel}
        </Link>
      </div>

      <div className="cd-rail">
        {products.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            priority={priority && index < 2}
          />
        ))}
      </div>
    </section>
  );
}
