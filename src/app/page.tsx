import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { serializeProduct } from "@/lib/serialize";
import { SHOP, whatsappLink } from "@/lib/shop";
import ProductCard from "@/components/ProductCard";

export const revalidate = 60;

async function getHomeProducts() {
  const [newest, all] = await Promise.all([
    prisma.product.findMany({
      where: { available: true },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { images: true, sizes: true },
    }),
    prisma.product.findMany({
      where: { available: true },
      orderBy: { createdAt: "asc" },
      take: 8,
      include: { images: true, sizes: true },
    }),
  ]);

  return {
    newArrivals: newest.map(serializeProduct),
    popular: all.map(serializeProduct),
  };
}

export default async function Home() {
  const { newArrivals, popular } = await getHomeProducts();

  return (
    <>
      <section className="relative overflow-hidden bg-[var(--color-navy)] text-white">
        <div className="container-shop py-16 sm:py-24 grid lg:grid-cols-2 gap-10 items-center">
          <div className="animate-fade-in-up">
            <p className="uppercase tracking-[0.25em] text-[var(--color-gold)] text-sm font-semibold mb-4">
              {SHOP.city}, {SHOP.country}
            </p>
            <h1 className="font-display font-extrabold text-4xl sm:text-5xl leading-tight mb-4">
              {SHOP.siteName}
            </h1>
            <p className="text-lg text-white/80 mb-1">{SHOP.storeName}</p>
            <p className="italic text-[var(--color-gold)] font-medium mb-6">&ldquo;{SHOP.tagline}&rdquo;</p>
            <p className="text-white/70 mb-8 max-w-md">
              La boutique de référence pour acheter des Crocs authentiques à Dakar. Large choix de
              modèles et de pointures, commande simple, paiement à la livraison.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/catalogue" className="btn-primary bg-[var(--color-gold)] text-[var(--color-navy)] hover:bg-[var(--color-gold-dark)]">
                Découvrir le catalogue
              </Link>
              <a
                href={whatsappLink("Bonjour Diaby Store, je souhaite avoir des renseignements sur vos Crocs.")}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp"
              >
                Nous écrire sur WhatsApp
              </a>
            </div>
          </div>
          <div className="flex justify-center animate-fade-in-up">
            <div className="rounded-3xl bg-[var(--color-cream)] p-4 sm:p-6 max-w-sm w-full card-shadow">
              <Image
                src="/images/logo.jpg"
                alt={`${SHOP.siteName} - ${SHOP.storeName}`}
                width={640}
                height={347}
                priority
                className="w-full h-auto rounded-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="container-shop py-14">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-[var(--color-navy)]">
              Nouveaux arrivages
            </h2>
            <p className="text-sm text-[var(--color-navy)]/60 mt-1">Les derniers modèles reçus en boutique.</p>
          </div>
          <Link href="/catalogue?sort=newest" className="hidden sm:inline text-sm font-semibold text-[var(--color-gold-dark)] hover:underline">
            Voir tout →
          </Link>
        </div>

        {newArrivals.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {newArrivals.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <EmptyCatalogNotice />
        )}
      </section>

      {popular.length > 0 && (
        <section className="container-shop pb-16">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-[var(--color-navy)]">
                Produits populaires
              </h2>
              <p className="text-sm text-[var(--color-navy)]/60 mt-1">Les préférés de nos clients à Dakar.</p>
            </div>
            <Link href="/catalogue" className="hidden sm:inline text-sm font-semibold text-[var(--color-gold-dark)] hover:underline">
              Voir tout →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {popular.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <section className="bg-[var(--color-cream-dark)] py-14">
        <div className="container-shop grid sm:grid-cols-3 gap-8 text-center">
          <div>
            <h3 className="font-display font-bold text-[var(--color-navy)] mb-2">Paiement à la livraison</h3>
            <p className="text-sm text-[var(--color-navy)]/70">Vous payez uniquement à la réception de votre commande à Dakar.</p>
          </div>
          <div>
            <h3 className="font-display font-bold text-[var(--color-navy)] mb-2">Commande simple via WhatsApp</h3>
            <p className="text-sm text-[var(--color-navy)]/70">Choisissez votre pointure et validez votre commande directement sur WhatsApp.</p>
          </div>
          <div>
            <h3 className="font-display font-bold text-[var(--color-navy)] mb-2">Modèles originaux</h3>
            <p className="text-sm text-[var(--color-navy)]/70">Une sélection soignée de Crocs, avec de nouveaux arrivages régulièrement.</p>
          </div>
        </div>
      </section>
    </>
  );
}

function EmptyCatalogNotice() {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--color-navy)]/20 p-10 text-center text-[var(--color-navy)]/60">
      <p className="font-medium">Le catalogue est en cours de préparation.</p>
      <p className="text-sm mt-1">De nouveaux modèles de Crocs seront bientôt ajoutés par Diaby Store.</p>
    </div>
  );
}
