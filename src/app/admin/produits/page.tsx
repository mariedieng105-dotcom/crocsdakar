import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { serializeProduct } from "@/lib/serialize";
import AdminProductRow from "@/components/admin/AdminProductRow";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { images: true, sizes: true },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display font-bold text-2xl text-[var(--color-navy)]">Produits</h1>
        <Link href="/admin/produits/nouveau" className="btn-primary">Ajouter un produit</Link>
      </div>

      <div className="bg-white rounded-2xl card-shadow p-5 overflow-x-auto">
        {products.length === 0 ? (
          <p className="text-sm text-[var(--color-navy)]/50 py-8 text-center">
            Aucun produit pour le moment. Ajoutez votre premier Crocs.
          </p>
        ) : (
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="text-left text-[var(--color-navy)]/50 border-b border-[var(--color-navy)]/10">
                <th className="py-2 pr-4">Photo</th>
                <th className="py-2 pr-4">Nom</th>
                <th className="py-2 pr-4">Modèle</th>
                <th className="py-2 pr-4">Prix</th>
                <th className="py-2 pr-4">Statut</th>
                <th className="py-2 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <AdminProductRow key={p.id} product={serializeProduct(p)} />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
