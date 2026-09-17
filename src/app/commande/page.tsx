"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { formatFCFA, whatsappLink, SHOP } from "@/lib/shop";

type OrderItemResult = {
  productName: string;
  model: string;
  size: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

type OrderResult = {
  orderNumber: string;
  subtotal: number;
  total: number;
  customerName: string;
  phone: string;
  address: string;
  zone: string | null;
  items: OrderItemResult[];
};

function buildWhatsappMessage(order: OrderResult): string {
  const lines: string[] = [];
  lines.push("Bonjour Diaby Store,");
  lines.push("");
  lines.push(`Je souhaite passer cette commande (N° ${order.orderNumber}) :`);
  lines.push("");

  for (const item of order.items) {
    lines.push(`Produit : ${item.productName}`);
    lines.push(`Modèle : ${item.model}`);
    lines.push(`Pointure : ${item.size}`);
    lines.push(`Quantité : ${item.quantity}`);
    lines.push(`Prix unitaire : ${formatFCFA(item.unitPrice)}`);
    lines.push(`Sous-total : ${formatFCFA(item.lineTotal)}`);
    lines.push("");
  }

  lines.push(`Total produits : ${formatFCFA(order.subtotal)}`);
  lines.push("Frais de livraison : à confirmer par Diaby Store");
  lines.push(`Total (hors livraison) : ${formatFCFA(order.total)}`);
  lines.push("");
  lines.push(`Nom : ${order.customerName}`);
  lines.push(`Téléphone : ${order.phone}`);
  lines.push(`Adresse : ${order.address}${order.zone ? " (" + order.zone + ")" : ""}`);
  lines.push("");
  lines.push("Paiement à la livraison.");
  lines.push("");
  lines.push("Merci.");

  return lines.join("\n");
}

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCart();

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [zone, setZone] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<OrderResult | null>(null);

  if (items.length === 0 && !confirmedOrder) {
    return (
      <div className="container-shop py-16 text-center">
        <h1 className="font-display font-bold text-2xl text-[var(--color-navy)] mb-3">Votre panier est vide</h1>
        <Link href="/catalogue" className="btn-primary">Voir le catalogue</Link>
      </div>
    );
  }

  if (confirmedOrder) {
    const waLink = whatsappLink(buildWhatsappMessage(confirmedOrder));
    return (
      <div className="container-shop py-16 max-w-lg mx-auto text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="font-display font-bold text-2xl text-[var(--color-navy)] mb-2">
          Commande enregistrée
        </h1>
        <p className="text-[var(--color-navy)]/70 mb-1">
          Numéro de commande : <span className="font-semibold">{confirmedOrder.orderNumber}</span>
        </p>
        <p className="text-[var(--color-navy)]/60 mb-6">
          Finalisez votre commande en l&apos;envoyant à {SHOP.storeName} sur WhatsApp. Les frais de
          livraison vous seront confirmés selon votre adresse.
        </p>
        <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn-whatsapp w-full sm:w-auto">
          Envoyer la commande sur WhatsApp
        </a>
        <div className="mt-6">
          <Link href="/catalogue" className="text-sm text-[var(--color-gold-dark)] hover:underline">
            Continuer mes achats
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!customerName.trim() || !phone.trim() || !address.trim()) {
      setError("Merci de remplir votre nom, votre téléphone et votre adresse.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          phone,
          address,
          zone: zone || undefined,
          notes: notes || undefined,
          items: items.map((i) => ({ productId: i.productId, size: i.size, quantity: i.quantity })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Une erreur est survenue. Merci de réessayer.");
        setSubmitting(false);
        return;
      }

      setConfirmedOrder(data.order);
      clear();
    } catch {
      setError("Impossible de contacter le serveur. Vérifiez votre connexion et réessayez.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-shop py-10">
      <h1 className="font-display font-bold text-2xl sm:text-3xl text-[var(--color-navy)] mb-8">
        Informations de livraison
      </h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <form onSubmit={handleSubmit} className="lg:col-span-2 flex flex-col gap-4 bg-white rounded-2xl p-5 sm:p-6 card-shadow">
          <div>
            <label htmlFor="customerName" className="block text-sm font-semibold text-[var(--color-navy)] mb-1">
              Nom complet *
            </label>
            <input
              id="customerName"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full rounded-lg border border-[var(--color-navy)]/20 px-4 py-2.5 text-sm outline-none focus:border-[var(--color-gold)]"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-semibold text-[var(--color-navy)] mb-1">
              Numéro de téléphone *
            </label>
            <input
              id="phone"
              required
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="77 123 45 67"
              className="w-full rounded-lg border border-[var(--color-navy)]/20 px-4 py-2.5 text-sm outline-none focus:border-[var(--color-gold)]"
            />
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-semibold text-[var(--color-navy)] mb-1">
              Adresse de livraison *
            </label>
            <input
              id="address"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full rounded-lg border border-[var(--color-navy)]/20 px-4 py-2.5 text-sm outline-none focus:border-[var(--color-gold)]"
            />
          </div>

          <div>
            <label htmlFor="zone" className="block text-sm font-semibold text-[var(--color-navy)] mb-1">
              Quartier / zone
            </label>
            <input
              id="zone"
              value={zone}
              onChange={(e) => setZone(e.target.value)}
              className="w-full rounded-lg border border-[var(--color-navy)]/20 px-4 py-2.5 text-sm outline-none focus:border-[var(--color-gold)]"
            />
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-semibold text-[var(--color-navy)] mb-1">
              Informations supplémentaires
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-[var(--color-navy)]/20 px-4 py-2.5 text-sm outline-none focus:border-[var(--color-gold)]"
            />
          </div>

          {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

          <button type="submit" disabled={submitting} className="btn-primary disabled:opacity-50">
            {submitting ? "Enregistrement..." : "Valider la commande"}
          </button>
          <p className="text-xs text-[var(--color-navy)]/50">
            Paiement à la livraison. Vous confirmerez votre commande sur WhatsApp à l&apos;étape suivante.
          </p>
        </form>

        <div className="bg-white rounded-2xl p-5 card-shadow h-fit">
          <h2 className="font-display font-bold text-lg text-[var(--color-navy)] mb-4">Récapitulatif</h2>
          <ul className="flex flex-col gap-3 mb-4">
            {items.map((item) => (
              <li key={`${item.productId}-${item.size}`} className="flex justify-between text-sm">
                <span className="text-[var(--color-navy)]/70">
                  {item.name} ({item.model}) — P.{item.size} × {item.quantity}
                </span>
                <span className="font-semibold text-[var(--color-navy)]">{formatFCFA(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="border-t border-[var(--color-navy)]/10 pt-3 flex justify-between font-semibold text-[var(--color-navy)]">
            <span>Sous-total</span>
            <span>{formatFCFA(subtotal)}</span>
          </div>
          <p className="text-xs text-[var(--color-navy)]/50 mt-2">+ frais de livraison à confirmer</p>
        </div>
      </div>
    </div>
  );
}
