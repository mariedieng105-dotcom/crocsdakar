import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatFCFA } from "@/lib/shop";
import { ArrowRightIcon } from "@/components/Icons";

const STATUS_LABELS: Record<string, string> = {
  NOUVELLE: "Nouvelle",
  CONFIRMEE: "Confirmée",
  EN_PREPARATION: "En préparation",
  LIVREE: "Livrée",
  ANNULEE: "Annulée",
};

export default async function AdminDashboard() {
  const [productCount, unavailableCount, newOrdersCount, orders] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { available: false } }),
    prisma.order.count({ where: { status: "NOUVELLE" } }),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
  ]);

  return (
    <div>
      <p className="cd-eyebrow text-[var(--cd-gold-700)]">Vue d&rsquo;ensemble</p>
      <h1 className="cd-ad-title mt-2">Tableau de bord</h1>

      <div className="grid grid-cols-3 gap-px bg-[var(--cd-rule)] border border-[var(--cd-rule)] mt-8">
        <StatCard label="Produits au catalogue" value={productCount} />
        <StatCard label="Nouvelles commandes" value={newOrdersCount} accent />
        <StatCard label="Produits masqués" value={unavailableCount} />
      </div>

      <div className="flex flex-wrap gap-3 mt-8">
        <Link href="/admin/produits/nouveau" className="cd-ad-btn cd-ad-btn--solid">
          Ajouter un produit
        </Link>
        <Link href="/admin/commandes" className="cd-ad-btn cd-ad-btn--ghost">
          Voir les commandes
        </Link>
      </div>

      <section className="cd-ad-card mt-8">
        <h2 className="cd-ad-card__title">Dernières commandes</h2>

        {orders.length === 0 ? (
          <p className="text-sm text-[var(--cd-ink-faint)] mt-5">Aucune commande pour le moment.</p>
        ) : (
          <>
            <div className="overflow-x-auto mt-5">
              <table className="cd-ad-table min-w-[520px]">
                <thead>
                  <tr>
                    <th>N°</th>
                    <th>Client</th>
                    <th>Total</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id}>
                      <td className="cd-num font-semibold">{o.orderNumber}</td>
                      <td>{o.customerName}</td>
                      <td className="cd-num">{formatFCFA(o.total)}</td>
                      <td>
                        <span
                          className={`cd-ad-pill ${
                            o.status === "NOUVELLE" ? "cd-ad-pill--info" : "cd-ad-pill--off"
                          }`}
                        >
                          {STATUS_LABELS[o.status] || o.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Link href="/admin/commandes" className="cd-ad-link inline-flex items-center gap-2 mt-5">
              Toutes les commandes
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </Link>
          </>
        )}
      </section>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className={`p-5 ${accent ? "bg-[var(--cd-navy-900)]" : "bg-[var(--cd-surface)]"}`}>
      <p
        className={`cd-num text-3xl sm:text-4xl font-bold ${
          accent ? "text-[var(--cd-gold-500)]" : "text-[var(--cd-navy-900)]"
        }`}
      >
        {value}
      </p>
      <p
        className={`cd-eyebrow text-[0.58rem] mt-2 ${
          accent ? "text-[var(--cd-on-navy-soft)]" : "text-[var(--cd-ink-faint)]"
        }`}
      >
        {label}
      </p>
    </div>
  );
}
