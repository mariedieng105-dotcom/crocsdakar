"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatFCFA } from "@/lib/shop";

type OrderItem = {
  id: string;
  productName: string;
  model: string;
  size: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

type Order = {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  address: string;
  zone: string | null;
  notes: string | null;
  subtotal: number;
  deliveryFee: number | null;
  total: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
};

const STATUS_OPTIONS = [
  { value: "NOUVELLE", label: "Nouvelle" },
  { value: "CONFIRMEE", label: "Confirmée" },
  { value: "EN_PREPARATION", label: "En préparation" },
  { value: "LIVREE", label: "Livrée" },
  { value: "ANNULEE", label: "Annulée" },
];

const STATUS_COLORS: Record<string, string> = {
  NOUVELLE: "bg-blue-100 text-blue-700",
  CONFIRMEE: "bg-amber-100 text-amber-700",
  EN_PREPARATION: "bg-purple-100 text-purple-700",
  LIVREE: "bg-green-100 text-green-700",
  ANNULEE: "bg-red-100 text-red-700",
};

export default function AdminOrderCard({ order }: { order: Order }) {
  const router = useRouter();
  const [status, setStatus] = useState(order.status);
  const [deliveryFee, setDeliveryFee] = useState(order.deliveryFee !== null ? String(order.deliveryFee) : "");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const save = async () => {
    setSaving(true);
    setMessage(null);
    const res = await fetch(`/api/admin/orders/${order.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status,
        deliveryFee: deliveryFee === "" ? null : Number(deliveryFee),
      }),
    });
    setSaving(false);
    if (res.ok) {
      setMessage("Commande mise à jour.");
      router.refresh();
    } else {
      setMessage("Erreur lors de la mise à jour.");
    }
  };

  return (
    <div className="bg-white rounded-2xl card-shadow p-5">
      <button onClick={() => setOpen((v) => !v)} className="w-full flex items-center justify-between gap-4 text-left">
        <div>
          <p className="font-semibold text-[var(--color-navy)]">{order.orderNumber} — {order.customerName}</p>
          <p className="text-xs text-[var(--color-navy)]/50">
            {new Date(order.createdAt).toLocaleString("fr-FR")} · {order.phone}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[order.status] || ""}`}>
            {STATUS_OPTIONS.find((s) => s.value === order.status)?.label || order.status}
          </span>
          <span className="font-semibold text-[var(--color-navy)]">{formatFCFA(order.total)}</span>
          <span className="text-[var(--color-navy)]/40">{open ? "▲" : "▼"}</span>
        </div>
      </button>

      {open && (
        <div className="mt-4 pt-4 border-t border-[var(--color-navy)]/10 flex flex-col gap-4">
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-[var(--color-navy)]/50">Adresse</p>
              <p className="text-[var(--color-navy)]">{order.address}{order.zone ? ` (${order.zone})` : ""}</p>
            </div>
            {order.notes && (
              <div>
                <p className="text-[var(--color-navy)]/50">Notes</p>
                <p className="text-[var(--color-navy)]">{order.notes}</p>
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[480px]">
              <thead>
                <tr className="text-left text-[var(--color-navy)]/50 border-b border-[var(--color-navy)]/10">
                  <th className="py-1.5 pr-3">Produit</th>
                  <th className="py-1.5 pr-3">Pointure</th>
                  <th className="py-1.5 pr-3">Qté</th>
                  <th className="py-1.5 pr-3">Prix</th>
                  <th className="py-1.5 pr-3">Sous-total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.id} className="border-b border-[var(--color-navy)]/5 last:border-0">
                    <td className="py-1.5 pr-3">{item.productName} <span className="text-[var(--color-navy)]/50">({item.model})</span></td>
                    <td className="py-1.5 pr-3">{item.size}</td>
                    <td className="py-1.5 pr-3">{item.quantity}</td>
                    <td className="py-1.5 pr-3">{formatFCFA(item.unitPrice)}</td>
                    <td className="py-1.5 pr-3">{formatFCFA(item.lineTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--color-navy)] mb-1">Statut</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg border border-[var(--color-navy)]/20 px-3 py-2 text-sm">
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--color-navy)] mb-1">Frais de livraison (FCFA)</label>
              <input
                type="number"
                min={0}
                value={deliveryFee}
                onChange={(e) => setDeliveryFee(e.target.value)}
                placeholder="Ex : 2000"
                className="rounded-lg border border-[var(--color-navy)]/20 px-3 py-2 text-sm w-36"
              />
            </div>
            <button onClick={save} disabled={saving} className="btn-primary disabled:opacity-50">
              {saving ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>

          <div className="text-sm flex flex-col gap-1 max-w-xs">
            <div className="flex justify-between">
              <span className="text-[var(--color-navy)]/60">Sous-total produits</span>
              <span>{formatFCFA(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-navy)]/60">Livraison</span>
              <span>{order.deliveryFee !== null ? formatFCFA(order.deliveryFee) : "Non définie"}</span>
            </div>
            <div className="flex justify-between font-semibold text-[var(--color-navy)]">
              <span>Total</span>
              <span>{formatFCFA(order.total)}</span>
            </div>
          </div>

          {message && <p className="text-sm text-[var(--color-navy)] font-medium">{message}</p>}
        </div>
      )}
    </div>
  );
}
