import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { serializeProduct } from "@/lib/serialize";
import AdminProductRow from "@/components/admin/AdminProductRow";
import { UNCLASSIFIED } from "@/lib/categories";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { images: true, sizes: true },
  });

  const toClassify = products.filter((p) => p.category === UNCLASSIFIED).length;
  const hidden = products.filter((p) => !p.available).length;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="cd-eyebrow text-[var(--cd-gold-700)]">Catalogue</p>
          <h1 className="cd-ad-title mt-2">
            Produits <span className="cd-num text-[var(--cd-ink-faint)]">({products.length})</span>
          </h1>
        </div>
        <Link href="/admin/produits/nouveau" className="cd-ad-btn cd-ad-btn--solid">
          Ajouter un produit
        </Link>
      </div>

      {toClassify > 0 && (
        <p className="cd-ad-note cd-ad-note--warn mt-6">
          {toClassify} produit{toClassify > 1 ? "s" : ""} encore à classer. Tant qu&apos;un produit
          est « à classer », il n&apos;apparaît dans aucune catégorie de la boutique. Choisissez sa
          catégorie directement dans la colonne « Catégorie » ci-dessous.
        </p>
      )}

      {hidden > 0 && (
        <p className="cd-ad-note mt-3">
          {hidden} produit{hidden > 1 ? "s sont masqués" : " est masqué"} de la boutique.
          Un produit masqué reste en base et se réaffiche en un clic sur « Masqué ».
        </p>
      )}

      <div className="cd-ad-card mt-6">
        {products.length === 0 ? (
          <p className="text-sm text-[var(--cd-ink-faint)] py-8 text-center">
            Aucun produit pour le moment. Ajoutez votre premier Crocs.
          </p>
        ) : (
          <div className="relative overflow-x-auto">
            {/* « relative » rattache les libellés sr-only du tableau à ce
                conteneur : sans cela, leur position absolue les sort du
                défilement horizontal et élargit la page sur mobile. */}
          <table className="cd-ad-table min-w-[820px]">
            <thead>
              <tr>
                <th>Photo</th>
                <th>Nom</th>
                <th>Modèle</th>
                <th>Prix</th>
                <th>Catégorie</th>
                <th>Boutique</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <AdminProductRow key={p.id} product={serializeProduct(p)} />
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </div>
  );
}
