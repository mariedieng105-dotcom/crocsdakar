import Image from "next/image";
import Link from "next/link";
import { SHOP } from "@/lib/shop";
import { ArrowRightIcon } from "@/components/Icons";

/**
 * Respiration éditoriale entre les deux rangées produit : le visuel à gauche,
 * la parole de la boutique sur un aplat marine à droite.
 */
export default function BrandBlock() {
  return (
    <section className="grid lg:grid-cols-2">
      <div className="relative bg-[var(--cd-bg-alt)] min-h-[260px] lg:min-h-[420px]">
        <Image
          src="/images/hero-crocs.jpg"
          alt=""
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover object-center"
        />
        <p className="cd-script absolute left-5 top-5 sm:left-8 sm:top-8 text-[var(--cd-navy-700)] text-[1.5rem] sm:text-[2rem] leading-tight">
          Original.
          <br />
          Confortable.
          <br />
          Toujours stylé.
        </p>
      </div>

      <div className="bg-[var(--cd-navy-800)] text-[var(--cd-on-navy)] flex items-center">
        <div className="px-6 sm:px-10 lg:px-14 py-12 lg:py-16 max-w-[34rem]">
          <p className="cd-eyebrow text-[var(--cd-gold-500)]">Depuis Dakar</p>
          <h2 className="cd-display cd-display-l text-white mt-4">
            Crocs
            <br />à Dakar
          </h2>
          <p className="mt-5 text-[var(--cd-on-navy-soft)] leading-relaxed max-w-[42ch]">
            {SHOP.storeName}, votre boutique spécialisée dans les Crocs originaux. Nous vous
            proposons une large gamme de modèles pour toute la famille, avec un service fiable
            et une livraison partout au {SHOP.country}.
          </p>
          <Link href="/a-propos" className="cd-btn cd-btn--gold mt-8">
            En savoir plus
            <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
