"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { formatFCFA, formatPriceShort } from "@/lib/shop";
import { SINGLE_SIZE_LABEL } from "@/lib/cart-types";
import { CloseIcon, ArrowRightIcon } from "@/components/Icons";

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal } = useCart();

  if (items.length === 0) {
    return (
      <div className="cd-container py-20 sm:py-28 text-center">
        <p className="cd-eyebrow text-[var(--cd-gold-700)]">Panier</p>
        <h1 className="cd-display cd-display-l mt-3">Votre panier est vide</h1>
        <p className="cd-lead mx-auto mt-4">
          Parcourez la boutique pour trouver votre paire.
        </p>
        <Link href="/catalogue" className="cd-btn cd-btn--solid mt-8">
          Voir la boutique
          <ArrowRightIcon className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="cd-container py-10 sm:py-14">
      <p className="cd-eyebrow text-[var(--cd-gold-700)]">Panier</p>
      <h1 className="cd-display cd-display-l mt-3 mb-10">
        {items.length} article{items.length > 1 ? "s" : ""}
      </h1>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-14">
        <ul className="min-w-0 border-t border-[var(--cd-rule)]">
          {items.map((item) => (
            <li
              key={`${item.productId}-${item.size}`}
              className="flex gap-4 sm:gap-6 py-6 border-b border-[var(--cd-rule)]"
            >
              <Link
                href={`/produit/${item.slug}`}
                className="cd-tile w-24 sm:w-32 shrink-0"
                aria-label={item.name}
              >
                {item.image ? (
                  <Image
                    src={item.image}
                    alt=""
                    fill
                    sizes="128px"
                    className="object-cover"
                  />
                ) : null}
              </Link>

              <div className="flex-1 min-w-0 flex flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="cd-eyebrow text-[0.58rem] text-[var(--cd-gold-700)] truncate">
                      {item.model}
                    </p>
                    <Link
                      href={`/produit/${item.slug}`}
                      className="block font-semibold mt-1.5 leading-snug"
                    >
                      <span className="cd-link-underline">{item.name}</span>
                    </Link>
                    <p className="text-sm text-[var(--cd-ink-soft)] mt-1">
                      {item.size === SINGLE_SIZE_LABEL
                        ? SINGLE_SIZE_LABEL
                        : `Pointure ${item.size}`}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItem(item.productId, item.size)}
                    aria-label={`Retirer ${item.name} du panier`}
                    className="p-1.5 text-[var(--cd-ink-faint)] hover:text-[var(--cd-navy-800)] shrink-0"
                  >
                    <CloseIcon className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex flex-wrap items-end justify-between gap-3 mt-auto pt-4">
                  <div className="inline-flex items-center border border-[var(--cd-rule)]">
                    <button
                      type="button"
                      aria-label="Diminuer la quantité"
                      onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                      className="w-9 h-9 hover:bg-[var(--cd-cream-100)]"
                    >
                      −
                    </button>
                    <span className="cd-num w-9 text-center text-sm font-semibold">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      aria-label="Augmenter la quantité"
                      onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                      className="w-9 h-9 hover:bg-[var(--cd-cream-100)]"
                    >
                      +
                    </button>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-[var(--cd-ink-faint)]">
                      {formatPriceShort(item.price)} l&rsquo;unité
                    </p>
                    <p className="cd-num font-semibold mt-0.5">
                      {formatFCFA(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="min-w-0 lg:sticky lg:top-[108px] lg:self-start bg-[var(--cd-bg-alt)] p-6 sm:p-7">
          <h2 className="cd-display cd-display-m">Résumé</h2>

          <dl className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--cd-ink-soft)]">Sous-total produits</dt>
              <dd className="cd-num font-semibold">{formatFCFA(subtotal)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--cd-ink-soft)]">Livraison</dt>
              <dd className="text-[var(--cd-ink-soft)]">à confirmer</dd>
            </div>
          </dl>

          <p className="text-xs text-[var(--cd-ink-soft)] mt-5 leading-relaxed">
            Les frais de livraison dépendent de votre adresse et vous sont confirmés sur WhatsApp
            avant l&rsquo;expédition. Vous payez à la réception.
          </p>

          <Link href="/commande" className="cd-btn cd-btn--solid w-full mt-6">
            Passer la commande
            <ArrowRightIcon className="w-4 h-4" />
          </Link>

          <Link
            href="/catalogue"
            className="cd-eyebrow text-[0.62rem] text-[var(--cd-gold-700)] block text-center mt-5"
          >
            Continuer mes achats
          </Link>
        </aside>
      </div>
    </div>
  );
}
