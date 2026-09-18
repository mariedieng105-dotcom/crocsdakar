import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { SHOP, REASSURANCE, whatsappLink } from "@/lib/shop";
import { REASSURANCE_ICONS, WhatsAppGlyph } from "@/components/Icons";

export const metadata: Metadata = {
  title: "À propos",
  description: `${SHOP.storeName} est une boutique spécialisée dans les Crocs originaux à ${SHOP.city}. Large choix de modèles et de pointures, paiement à la livraison, livraison partout au ${SHOP.country}.`,
  alternates: { canonical: "/a-propos" },
};

export default function AProposPage() {
  return (
    <>
      <section className="bg-[var(--cd-navy-800)] text-[var(--cd-on-navy)]">
        <div className="cd-container cd-section grid gap-10 lg:grid-cols-[1.2fr_auto] lg:items-center">
          <div>
            <p className="cd-eyebrow text-[var(--cd-gold-500)]">
              {SHOP.city}, {SHOP.country}
            </p>
            <h1 className="cd-display cd-display-l text-white mt-4">
              Crocs
              <br />à Dakar
            </h1>
            <p className="cd-lead !text-[var(--cd-on-navy-soft)] mt-6">
              {SHOP.storeName}, votre boutique spécialisée dans les Crocs originaux. Nous vous
              proposons une large gamme de modèles pour toute la famille, avec un service fiable et
              une livraison partout au {SHOP.country}.
            </p>
          </div>

          <Image
            src="/images/logo-badge.jpg"
            alt={`Logo ${SHOP.siteName} — ${SHOP.storeName}`}
            width={560}
            height={560}
            className="w-32 h-32 sm:w-44 sm:h-44 rounded-full object-cover justify-self-start lg:justify-self-end"
          />
        </div>
      </section>

      <section className="cd-container cd-section">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="cd-display cd-display-m">Notre sélection</h2>
            <div className="mt-5 space-y-4 text-[var(--cd-ink-soft)] leading-relaxed max-w-[54ch]">
              <p>
                Nous choisissons chaque modèle nous-mêmes : les Classic dans toutes leurs couleurs,
                les collaborations, les modèles sous licence et les sandales. Les arrivages sont
                réguliers et les pointures disponibles sont mises à jour en continu sur le site.
              </p>
              <p>
                Quand un prix n&rsquo;est pas encore arrêté, nous l&rsquo;indiquons clairement
                plutôt que d&rsquo;afficher un montant approximatif. Vous pouvez alors nous écrire
                sur WhatsApp pour le connaître avant de commander.
              </p>
            </div>
          </div>

          <div>
            <h2 className="cd-display cd-display-m">Commander</h2>
            <div className="mt-5 space-y-4 text-[var(--cd-ink-soft)] leading-relaxed max-w-[54ch]">
              <p>
                Choisissez votre modèle et votre pointure, ajoutez-le au panier, puis validez votre
                commande. Vous recevez un numéro de commande et vous finalisez avec nous sur
                WhatsApp, où les frais de livraison vous sont confirmés selon votre adresse.
              </p>
              <p>Vous ne payez qu&rsquo;à la réception de votre commande.</p>
            </div>
            <div className="flex flex-wrap gap-3 mt-7">
              <Link href="/catalogue" className="cd-btn cd-btn--solid">
                Voir la boutique
              </Link>
              <a
                href={whatsappLink(`Bonjour ${SHOP.storeName}, j'ai une question.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="cd-btn cd-btn--ghost"
              >
                <WhatsAppGlyph className="w-4 h-4" />
                Nous écrire
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[var(--cd-bg-alt)]">
        <div className="cd-container py-12">
          <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {REASSURANCE.map((item) => {
              const Icon = REASSURANCE_ICONS[item.icon];
              return (
                <li key={item.title} className="flex items-center gap-3.5">
                  <Icon className="w-8 h-8 shrink-0 text-[var(--cd-navy-700)]" />
                  <span className="text-sm leading-snug">
                    <span className="block font-semibold">{item.title}</span>
                    <span className="text-[var(--cd-ink-soft)]">{item.detail}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </>
  );
}
