import Image from "next/image";
import Link from "next/link";
import { FAMILIES } from "@/lib/families";
import { ArrowRightIcon } from "@/components/Icons";

export type FamilyTile = {
  key: string;
  label: string;
  tagline: string;
  href: string;
  image: string | null;
  count: number;
};

/**
 * Les quatre portes d'entrée du catalogue. Les familles viennent des données
 * réellement disponibles ; une famille sans produit n'est pas affichée, pour
 * ne jamais envoyer vers une page vide.
 */
export default function CategoryGrid({ tiles }: { tiles: FamilyTile[] }) {
  const shown = tiles.filter((t) => t.count > 0);
  if (shown.length === 0) return null;

  return (
    <section className="cd-container cd-section">
      <div className="cd-head">
        <div>
          <h2 className="cd-display cd-display-l">Nos catégories</h2>
          <p className="text-[var(--cd-ink-soft)] mt-2 text-[0.95rem]">
            {FAMILIES.length} familles de modèles, une seule adresse à Dakar.
          </p>
        </div>
        <span className="cd-head__rule" aria-hidden="true" />
        <Link href="/catalogue" className="cd-head__link">
          Toute la boutique
        </Link>
      </div>

      <ul className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {shown.map((tile) => (
          <li key={tile.key}>
            <Link href={tile.href} className="cd-card group block h-full">
              <div className="cd-tile">
                {tile.image && (
                  <Image
                    src={tile.image}
                    alt=""
                    fill
                    sizes="(max-width: 1024px) 48vw, 24vw"
                    className="object-cover"
                  />
                )}
              </div>

              {/* Le libellé vit sur un aplat marine plutôt qu'en surimpression :
                  les photos vont du fond blanc au fond sombre, un dégradé ne
                  garantirait pas la lisibilité. */}
              <div className="bg-[var(--cd-navy-800)] text-white px-3 py-3 sm:px-4 sm:py-3.5">
                <span className="cd-display block text-[0.9rem] sm:text-[1.05rem] leading-tight">
                  {tile.label}
                </span>
                <span className="flex items-center gap-1.5 mt-1.5 text-[0.72rem] text-[var(--cd-on-navy-soft)]">
                  <span className="cd-num">{tile.count}</span> modèle
                  {tile.count > 1 ? "s" : ""}
                  <ArrowRightIcon className="w-3.5 h-3.5 text-[var(--cd-gold-500)] transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
