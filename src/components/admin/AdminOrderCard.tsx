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

const STATUS_TONES: Record<string, string> = {
  NOUVELLE: "cd-ad-pill--info",
  CONFIRMEE: "cd-ad-pill--warn",
  EN_PREPARATION: "cd-ad-pill--warn",
  LIVREE: "cd-ad-pill--on",
  ANNULEE: "cd-ad-pill--danger",
};

export default function AdminOrderCard({ order }: { order: Order }) {
  const router = useRouter();
  const [status, setStatus] = useState(order.status);
  const [deliveryFee, setDeliveryFee] = useState(order.deliveryFee !== null ? String(order.deliveryFee) : "");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

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
      setFailed(false);
      setMessage("Commande mise à jour.");
      router.refresh();
    } else {
      setFailed(true);
      setMessage("Erreur lors de la mise à jour.");
    }
  };

  return (
    <div className="bg-[var(--cd-surface)] border border-[var(--cd-rule)]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-4 text-left p-4 sm:p-5"
      >
        <span className="min-w-0">
          <span className="block font-semibold text-[var(--cd-navy-900)] truncate">
            <span className="cd-num">{order.orderNumber}</span> — {order.customerName}
          </span>
          <span className="block text-xs text-[var(--cd-ink-faint)] mt-1">
            {new Date(order.createdAt).toLocaleString("fr-FR")} · {order.phone}
          </span>
        </span>
        <span className="flex items-center gap-3 shrink-0">
          <span className={`cd-ad-pill ${STATUS_TONES[order.status] || "cd-ad-pill--off"}`}>
            {STATUS_OPTIONS.find((s) => s.value === order.status)?.label || order.status}
          </span>
          <span className="cd-num font-semibold hidden sm:inline">{formatFCFA(order.total)}</span>
          <span className="text-[var(--cd-ink-faint)] text-xs" aria-hidden="true">
            {open ? "▲" : "▼"}
          </span>
        </span>
      </button>

      {open && (
        <div className="px-4 sm:px-5 pb-5 pt-5 border-t border-[var(--cd-rule)] flex flex-col gap-6">
          <div className="grid sm:grid-cols-2 gap-5 text-sm">
            <div>
              <p className="cd-ad-label">Adresse</p>
              <p>{order.address}{order.zone ? ` (${order.zone})` : ""}</p>
            </div>
            {order.notes && (
              <div>
                <p className="cd-ad-label">Notes du client</p>
                <p>{order.notes}</p>
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="cd-ad-table min-w-[520px]">
              <thead>
                <tr>
                  <th>Produit</th>
                  <th>Taille</th>
                  <th>Qté</th>
                  <th>Prix</th>
                  <th>Sous-total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      {item.productName}{" "}
                      <span className="text-[var(--cd-ink-faint)]">({item.model})</span>
                    </td>
                    <td className="cd-num">{item.size}</td>
                    <td className="cd-num">{item.quantity}</td>
                    <td className="cd-num">{formatFCFA(item.unitPrice)}</td>
                    <td className="cd-num">{formatFCFA(item.lineTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label htmlFor={`status-${order.id}`} className="cd-ad-label">Statut</label>
              <select
                id={`status-${order.id}`}
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="cd-ad-field w-48"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor={`fee-${order.id}`} className="cd-ad-label">Frais de livraison (FCFA)</label>
              <input
                id={`fee-${order.id}`}
                type="number"
                min={0}
                value={deliveryFee}
                onChange={(e) => setDeliveryFee(e.target.value)}
                placeholder="Ex : 2000"
                className="cd-ad-field cd-num w-40"
              />
            </div>
            <button type="button" onClick={save} disabled={saving} className="cd-ad-btn cd-ad-btn--solid">
              {saving ? "Enregistrement…" : "Enregistrer"}
            </button>
          </div>

          <dl className="text-sm flex flex-col gap-2 max-w-xs">
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--cd-ink-soft)]">Sous-total produits</dt>
              <dd className="cd-num">{formatFCFA(order.subtotal)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--cd-ink-soft)]">Livraison</dt>
              <dd className="cd-num">
                {order.deliveryFee !== null ? formatFCFA(order.deliveryFee) : "Non définie"}
              </dd>
            </div>
            <div className="flex justify-between gap-4 font-semibold pt-2 border-t border-[var(--cd-rule)]">
              <dt>Total</dt>
              <dd className="cd-num">{formatFCFA(order.total)}</dd>
            </div>
          </dl>

          {message && (
            <p className={`cd-ad-note ${failed ? "cd-ad-note--danger" : "cd-ad-note--ok"}`} role="status">
              {message}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
