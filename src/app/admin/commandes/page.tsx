import { prisma } from "@/lib/prisma";
import AdminOrderCard from "@/components/admin/AdminOrderCard";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  const newCount = orders.filter((o) => o.status === "NOUVELLE").length;

  return (
    <div>
      <p className="cd-eyebrow text-[var(--cd-gold-700)]">Ventes</p>
      <h1 className="cd-ad-title mt-2">
        Commandes <span className="cd-num text-[var(--cd-ink-faint)]">({orders.length})</span>
      </h1>

      {newCount > 0 && (
        <p className="cd-ad-note mt-6">
          {newCount} commande{newCount > 1 ? "s" : ""} à traiter. Ouvrez une commande pour saisir les
          frais de livraison et changer son statut.
        </p>
      )}

      {orders.length === 0 ? (
        <div className="cd-ad-card mt-6 text-center text-sm text-[var(--cd-ink-faint)] py-10">
          Aucune commande pour le moment.
        </div>
      ) : (
        <div className="flex flex-col gap-3 mt-6">
          {orders.map((order) => (
            <AdminOrderCard
              key={order.id}
              order={{
                ...order,
                createdAt: order.createdAt.toISOString(),
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
