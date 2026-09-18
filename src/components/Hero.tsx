import Image from "next/image";
import Link from "next/link";
import { SHOP } from "@/lib/shop";
import { ArrowRightIcon } from "@/components/Icons";

/**
 * Ouverture de la page d'accueil. Le visuel est une composition réalisée à
 * partir des photos produit du projet : trois Crocs seuls, sans personne.
 */
export default function Hero() {
  return (
    <section className="bg-[var(--cd-bg-alt)] overflow-hidden">
      <div className="cd-container grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-10 lg:items-center pt-10 pb-8 lg:py-16">
        <div className="cd-rise">
          <p className="cd-eyebrow text-[var(--cd-gold-700)]">{SHOP.siteName}_221</p>

          <h1 className="cd-display cd-display-xl mt-4">
            Du style
            <br />à chaque{" "}
            <span className="text-[var(--cd-gold-600)]">pas</span>
          </h1>

          <p className="cd-lead mt-5">
            Des Crocs originaux, livrés partout au {SHOP.country}.
          </p>

          <Link href="/catalogue" className="cd-btn cd-btn--solid mt-7">
            Découvrir la collection
            <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </div>

        <div className="relative lg:-mr-12 xl:-mr-20">
          <Image
            src="/images/hero-crocs.jpg"
            alt="Trois modèles Crocs Classic : beige, bleu marine et noir"
            width={1600}
            height={880}
            priority
            sizes="(max-width: 1024px) 100vw, 55vw"
            className="w-full h-auto max-w-full"
          />
          <p className="cd-script text-[var(--cd-gold-700)] text-[1.25rem] sm:text-[1.7rem] absolute right-4 sm:right-8 lg:right-24 top-2 sm:top-4 max-w-[45%] text-right leading-tight pointer-events-none">
            Plus qu&rsquo;une paire,
            <br />
            un style de vie
          </p>
        </div>
      </div>
    </section>
  );
}
