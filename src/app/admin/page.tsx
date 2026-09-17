import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatFCFA } from "@/lib/shop";

export default async function AdminDashboard() {
  const [productCount, unavailableCount, newOrdersCount, orders] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { available: false } }),
    prisma.order.count({ where: { status: "NOUVELLE" } }),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  return (
    <div>
      <h1 className="font-display font-bold text-2xl text-[var(--color-navy)] mb-6">Tableau de bord</h1>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Produits au catalogue" value={productCount} />
        <StatCard label="Produits indisponibles" value={unavailableCount} />
        <StatCard label="Nouvelles commandes" value={newOrdersCount} highlight />
      </div>

      <div className="flex flex-wrap gap-3 mb-8">
        <Link href="/admin/produits/nouveau" className="btn-primary">Ajouter un produit</Link>
        <Link href="/admin/commandes" className="btn-outline">Voir les commandes</Link>
      </div>

      <div className="bg-white rounded-2xl card-shadow p-5">
        <h2 className="font-semibold text-[var(--color-navy)] mb-4">Dernières commandes</h2>
        {orders.length === 0 ? (
          <p className="text-sm text-[var(--color-navy)]/50">Aucune commande pour le moment.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[var(--color-navy)]/50 border-b border-[var(--color-navy)]/10">
                  <th className="py-2 pr-4">N°</th>
                  <th className="py-2 pr-4">Client</th>
                  <th className="py-2 pr-4">Total</th>
                  <th className="py-2 pr-4">Statut</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-b border-[var(--color-navy)]/5 last:border-0">
                    <td className="py-2.5 pr-4 font-medium text-[var(--color-navy)]">{o.orderNumber}</td>
                    <td className="py-2.5 pr-4">{o.customerName}</td>
                    <td className="py-2.5 pr-4">{formatFCFA(o.total)}</td>
                    <td className="py-2.5 pr-4">{o.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl card-shadow p-5 ${highlight ? "bg-[var(--color-navy)] text-white" : "bg-white text-[var(--color-navy)]"}`}>
      <p className={`text-3xl font-display font-bold ${highlight ? "text-[var(--color-gold)]" : ""}`}>{value}</p>
      <p className={`text-sm mt-1 ${highlight ? "text-white/70" : "text-[var(--color-navy)]/60"}`}>{label}</p>
    </div>
  );
}
