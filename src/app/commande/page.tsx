"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { formatFCFA, whatsappLink, SHOP } from "@/lib/shop";
import { SINGLE_SIZE_LABEL } from "@/lib/cart-types";
import { WhatsAppGlyph, ArrowRightIcon } from "@/components/Icons";

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
  lines.push(`Bonjour ${SHOP.storeName},`);
  lines.push("");
  lines.push(`Je souhaite passer cette commande (N° ${order.orderNumber}) :`);
  lines.push("");

  for (const item of order.items) {
    lines.push(`Produit : ${item.productName}`);
    lines.push(`Modèle : ${item.model}`);
    lines.push(
      item.size === SINGLE_SIZE_LABEL ? `Taille : ${item.size}` : `Pointure : ${item.size}`
    );
    lines.push(`Quantité : ${item.quantity}`);
    lines.push(`Prix unitaire : ${formatFCFA(item.unitPrice)}`);
    lines.push(`Sous-total : ${formatFCFA(item.lineTotal)}`);
    lines.push("");
  }

  lines.push(`Total produits : ${formatFCFA(order.subtotal)}`);
  lines.push(`Frais de livraison : à confirmer par ${SHOP.storeName}`);
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

const FIELD_CLASS =
  "w-full border border-[var(--cd-rule)] bg-[var(--cd-surface)] px-4 py-3 text-base outline-none focus:border-[var(--cd-navy-800)] transition-colors";

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
      <div className="cd-container py-20 sm:py-28 text-center">
        <h1 className="cd-display cd-display-l">Votre panier est vide</h1>
        <Link href="/catalogue" className="cd-btn cd-btn--solid mt-8">
          Voir la boutique
          <ArrowRightIcon className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  if (confirmedOrder) {
    const waLink = whatsappLink(buildWhatsappMessage(confirmedOrder));
    return (
      <div className="cd-container py-16 sm:py-24 max-w-xl mx-auto text-center">
        <p className="cd-eyebrow text-[var(--cd-gold-700)]">Commande enregistrée</p>
        <h1 className="cd-display cd-display-l mt-4">
          Merci,
          <br />
          {confirmedOrder.customerName.split(" ")[0]}
        </h1>

        <p className="cd-num cd-display text-[1.3rem] mt-7 tracking-normal">
          N° {confirmedOrder.orderNumber}
        </p>

        <p className="text-[var(--cd-ink-soft)] mt-5 leading-relaxed">
          Dernière étape : envoyez-nous votre commande sur WhatsApp. Nous vous confirmons les frais
          de livraison selon votre adresse, et vous payez à la réception.
        </p>

        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="cd-btn cd-btn--whatsapp w-full mt-8"
        >
          <WhatsAppGlyph className="w-5 h-5" />
          Envoyer ma commande
        </a>

        <Link
          href="/catalogue"
          className="cd-eyebrow text-[0.62rem] text-[var(--cd-gold-700)] inline-block mt-7"
        >
          Continuer mes achats
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!customerName.trim() || !phone.trim() || !address.trim()) {
      setError("Merci de renseigner votre nom, votre téléphone et votre adresse.");
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
          items: items.map((i) => ({
            productId: i.productId,
            size: i.size,
            quantity: i.quantity,
          })),
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
    <div className="cd-container py-10 sm:py-14">
      <p className="cd-eyebrow text-[var(--cd-gold-700)]">Commande</p>
      <h1 className="cd-display cd-display-l mt-3 mb-10">Vos coordonnées</h1>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-14">
        <form onSubmit={handleSubmit} className="min-w-0 flex flex-col gap-5">
          <div>
            <label htmlFor="customerName" className="cd-eyebrow text-[0.62rem] text-[var(--cd-ink-faint)] block mb-2">
              Nom complet *
            </label>
            <input
              id="customerName"
              required
              autoComplete="name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className={FIELD_CLASS}
            />
          </div>

          <div>
            <label htmlFor="phone" className="cd-eyebrow text-[0.62rem] text-[var(--cd-ink-faint)] block mb-2">
              Téléphone *
            </label>
            <input
              id="phone"
              required
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="77 123 45 67"
              className={FIELD_CLASS}
            />
          </div>

          <div>
            <label htmlFor="address" className="cd-eyebrow text-[0.62rem] text-[var(--cd-ink-faint)] block mb-2">
              Adresse de livraison *
            </label>
            <input
              id="address"
              required
              autoComplete="street-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className={FIELD_CLASS}
            />
          </div>

          <div>
            <label htmlFor="zone" className="cd-eyebrow text-[0.62rem] text-[var(--cd-ink-faint)] block mb-2">
              Quartier ou zone
            </label>
            <input
              id="zone"
              value={zone}
              onChange={(e) => setZone(e.target.value)}
              className={FIELD_CLASS}
            />
          </div>

          <div>
            <label htmlFor="notes" className="cd-eyebrow text-[0.62rem] text-[var(--cd-ink-faint)] block mb-2">
              Précisions pour la livraison
            </label>
            <textarea
              id="notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={FIELD_CLASS}
            />
          </div>

          {error && (
            <p className="text-sm font-semibold text-[#a3302a]" role="alert">
              {error}
            </p>
          )}

          <button type="submit" disabled={submitting} className="cd-btn cd-btn--solid">
            {submitting ? "Enregistrement…" : "Valider la commande"}
          </button>

          <p className="text-xs text-[var(--cd-ink-soft)]">
            Paiement à la livraison. Vous confirmerez votre commande sur WhatsApp à l&rsquo;étape
            suivante.
          </p>
        </form>

        <aside className="min-w-0 lg:sticky lg:top-[108px] lg:self-start bg-[var(--cd-bg-alt)] p-6 sm:p-7 h-fit">
          <h2 className="cd-display cd-display-m">Récapitulatif</h2>

          <ul className="mt-6 space-y-4">
            {items.map((item) => (
              <li key={`${item.productId}-${item.size}`} className="flex justify-between gap-4 text-sm">
                <span className="min-w-0">
                  <span className="block font-semibold leading-snug">{item.name}</span>
                  <span className="block text-[var(--cd-ink-soft)] text-[0.82rem] mt-0.5">
                    {item.size === SINGLE_SIZE_LABEL ? item.size : `Pointure ${item.size}`} ×{" "}
                    {item.quantity}
                  </span>
                </span>
                <span className="cd-num font-semibold shrink-0">
                  {formatFCFA(item.price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-6 pt-5 border-t border-[var(--cd-cream-300)] flex justify-between gap-4">
            <span className="cd-eyebrow text-[0.62rem] text-[var(--cd-ink-faint)]">Sous-total</span>
            <span className="cd-num font-semibold">{formatFCFA(subtotal)}</span>
          </div>
          <p className="text-xs text-[var(--cd-ink-soft)] mt-3">
            Frais de livraison confirmés sur WhatsApp selon votre adresse.
          </p>
        </aside>
      </div>
    </div>
  );
}
