import { prisma } from "@/lib/prisma";
import { serializeProduct } from "@/lib/serialize";
import { FAMILIES, familyOf } from "@/lib/families";
import Hero from "@/components/Hero";
import CategoryGrid, { type FamilyTile } from "@/components/CategoryGrid";
import ProductRow from "@/components/ProductRow";
import BrandBlock from "@/components/BrandBlock";
import WhatsAppBlock from "@/components/WhatsAppBlock";

export const revalidate = 60;

async function getHomeData() {
  const products = await prisma.product.findMany({
    where: { available: true },
    orderBy: { createdAt: "desc" },
    include: { images: true, sizes: true },
  });

  const serialized = products.map(serializeProduct);

  // Les familles étant déduites de l'identifiant du produit, on les compte ici
  // plutôt que de multiplier les requêtes.
  const tiles: FamilyTile[] = FAMILIES.map((family) => {
    const inFamily = serialized.filter((p) => familyOf(p.slug) === family.key);
    const cover =
      inFamily.find((p) => p.slug === family.cover) ??
      inFamily.find((p) => p.images.length > 0);

    return {
      key: family.key,
      label: family.label,
      tagline: family.tagline,
      href: `/catalogue?famille=${family.key}`,
      image: cover?.images[0]?.url ?? null,
      count: inFamily.length,
    };
  });

  return {
    newArrivals: serialized.slice(0, 4),
    // Les best-sellers ne sont pas encore mesurés : on met en avant les
    // Classic, qui sont le cœur du catalogue, en attendant des ventes à
    // compter.
    bestSellers: serialized.filter((p) => familyOf(p.slug) === "classiques").slice(0, 4),
    tiles,
    isEmpty: serialized.length === 0,
  };
}

export default async function Home() {
  const { newArrivals, bestSellers, tiles, isEmpty } = await getHomeData();

  return (
    <>
      <Hero />

      {isEmpty ? (
        <section className="cd-container cd-section">
          <div className="border border-dashed border-[var(--cd-rule)] p-12 text-center">
            <p className="cd-display cd-display-m">Le catalogue arrive</p>
            <p className="text-[var(--cd-ink-soft)] mt-3">
              De nouveaux modèles seront ajoutés très prochainement.
            </p>
          </div>
        </section>
      ) : (
        <>
          <CategoryGrid tiles={tiles} />

          <ProductRow
            title="Nouveautés"
            href="/catalogue"
            linkLabel="Voir la boutique"
            products={newArrivals}
            priority
          />

          <ProductRow
            title="Best-sellers"
            href="/catalogue"
            linkLabel="Voir la boutique"
            products={bestSellers}
          />

          <BrandBlock />
        </>
      )}

      <WhatsAppBlock />
    </>
  );
}
