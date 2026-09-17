"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { formatFCFA } from "@/lib/shop";

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal } = useCart();

  if (items.length === 0) {
    return (
      <div className="container-shop py-16 text-center">
        <h1 className="font-display font-bold text-2xl text-[var(--color-navy)] mb-3">Votre panier est vide</h1>
        <p className="text-[var(--color-navy)]/60 mb-6">Parcourez notre catalogue pour trouver votre paire de Crocs.</p>
        <Link href="/catalogue" className="btn-primary">Voir le catalogue</Link>
      </div>
    );
  }

  return (
    <div className="container-shop py-10">
      <h1 className="font-display font-bold text-2xl sm:text-3xl text-[var(--color-navy)] mb-8">Mon panier</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-4">
          {items.map((item) => (
            <div key={`${item.productId}-${item.size}`} className="flex gap-4 bg-white rounded-2xl p-3 sm:p-4 card-shadow">
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-[var(--color-cream-dark)] shrink-0">
                {item.image ? (
                  <Image src={item.image} alt={item.name} fill sizes="96px" className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] text-[var(--color-navy)]/30">
                    Photo
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <Link href={`/produit/${item.slug}`} className="font-semibold text-[var(--color-navy)] hover:underline line-clamp-1">
                      {item.name}
                    </Link>
                    <p className="text-xs text-[var(--color-navy)]/50">{item.model} · Pointure {item.size}</p>
                  </div>
                  <button
                    onClick={() => removeItem(item.productId, item.size)}
                    aria-label={`Retirer ${item.name} du panier`}
                    className="text-[var(--color-navy)]/40 hover:text-red-600 shrink-0"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
                    </svg>
                  </button>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <div className="inline-flex items-center border border-[var(--color-navy)]/20 rounded-full">
                    <button
                      aria-label="Diminuer la quantité"
                      onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center"
                    >
                      −
                    </button>
                    <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                    <button
                      aria-label="Augmenter la quantité"
                      onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[var(--color-navy)]/50">{formatFCFA(item.price)} / unité</p>
                    <p className="font-semibold text-[var(--color-navy)]">{formatFCFA(item.price * item.quantity)}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-5 card-shadow h-fit sticky top-24">
          <h2 className="font-display font-bold text-lg text-[var(--color-navy)] mb-4">Résumé</h2>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-[var(--color-navy)]/70">Sous-total produits</span>
            <span className="font-semibold text-[var(--color-navy)]">{formatFCFA(subtotal)}</span>
          </div>
          <p className="text-xs text-[var(--color-navy)]/50 mb-4">
            Les frais de livraison seront confirmés par Diaby Store selon votre adresse.
          </p>
          <Link href="/commande" className="btn-primary w-full">
            Passer la commande
          </Link>
        </div>
      </div>
    </div>
  );
}
