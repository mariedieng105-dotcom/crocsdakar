import { prisma } from "@/lib/prisma";
import AdminOrderCard from "@/components/admin/AdminOrderCard";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return (
    <div>
      <h1 className="font-display font-bold text-2xl text-[var(--color-navy)] mb-6">Commandes</h1>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl card-shadow p-8 text-center text-sm text-[var(--color-navy)]/50">
          Aucune commande pour le moment.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
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
