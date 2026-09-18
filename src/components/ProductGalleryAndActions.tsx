"use client";

import { useState } from "react";
import Image from "next/image";
import { useCart } from "@/components/CartProvider";
import { SHOP, formatPriceShort, formatFCFA, whatsappLink } from "@/lib/shop";
import { WhatsAppGlyph } from "@/components/Icons";
import { SINGLE_SIZE_LABEL } from "@/lib/cart-types";
import type { SerializedProduct } from "@/lib/serialize";

export default function ProductGalleryAndActions({ product }: { product: SerializedProduct }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [feedback, setFeedback] = useState<string | null>(null);
  const { addItem } = useCart();

  const images = product.images;
  const activeImage = images[activeIndex];
  const priceConfirmed = product.price !== null;

  // Un accessoire (jibbitz) n'a pas de pointure : il se commande en taille
  // unique plutôt que d'être bloqué comme un modèle en rupture.
  const hasSizes = product.sizes.length > 0;
  const sizeAvailable = hasSizes
    ? product.sizes.some((s) => s.available)
    : true;
  const canOrder = product.available && priceConfirmed && sizeAvailable;
  const chosenSize = hasSizes ? selectedSize : SINGLE_SIZE_LABEL;

  const buildItem = () => {
    if (product.price === null) return null;
    if (!chosenSize) {
      setFeedback("Choisissez une pointure avant de continuer.");
      return null;
    }
    return {
      productId: product.id,
      slug: product.slug,
      name: product.name,
      model: product.model,
      price: product.price,
      image: images[0]?.url ?? null,
      size: chosenSize,
      quantity,
    };
  };

  const handleAddToCart = () => {
    const item = buildItem();
    if (!item) return;
    addItem(item);
    setFeedback("Ajouté au panier.");
  };

  const askOnWhatsapp = whatsappLink(
    `Bonjour ${SHOP.storeName}, je suis intéressé(e) par « ${product.name} » (${product.model})` +
      (priceConfirmed ? `, à ${formatFCFA(product.price!)}.` : ". Quel est son prix ?")
  );

  return (
    <div className="cd-container py-6 sm:py-10">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-14">
        <div className="min-w-0">
          <div className="cd-tile !aspect-[4/5] sm:!aspect-square">
            {activeImage ? (
              <Image
                src={activeImage.url}
                alt={activeImage.alt || product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 52vw"
                className="object-cover"
              />
            ) : (
              <span className="absolute inset-0 flex items-center justify-center text-[var(--cd-ink-faint)]">
                Photo à venir
              </span>
            )}
          </div>

          {images.length > 1 && (
            <div className="flex gap-2 mt-2.5 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  aria-label={`Voir la photo ${idx + 1} sur ${images.length}`}
                  aria-current={idx === activeIndex}
                  className={`relative shrink-0 w-16 h-16 sm:w-20 sm:h-20 overflow-hidden bg-[var(--cd-cream-100)] border-2 transition-colors ${
                    idx === activeIndex
                      ? "border-[var(--cd-navy-800)]"
                      : "border-transparent hover:border-[var(--cd-cream-300)]"
                  }`}
                >
                  <Image
                    src={img.url}
                    alt=""
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {activeImage?.alt && (
            <p className="mt-3 text-sm text-[var(--cd-ink-faint)]">{activeImage.alt}</p>
          )}
        </div>

        <div className="min-w-0 lg:sticky lg:top-[108px] lg:self-start">
          <p className="cd-eyebrow text-[0.62rem] text-[var(--cd-gold-700)]">{product.model}</p>
          <h1 className="cd-display cd-display-l mt-3">{product.name}</h1>

          <p
            className={`cd-num mt-4 ${
              priceConfirmed
                ? "cd-display text-[1.6rem] tracking-normal"
                : "text-[var(--cd-ink-soft)]"
            }`}
          >
            {formatPriceShort(product.price)}
          </p>

          {!priceConfirmed && (
            <div className="mt-4 border-l-2 border-[var(--cd-gold-500)] pl-4 py-1">
              <p className="text-sm text-[var(--cd-ink-soft)]">
                Le prix de ce modèle n&rsquo;est pas encore arrêté. Écrivez-nous sur WhatsApp pour
                le connaître.
              </p>
            </div>
          )}

          {priceConfirmed && !canOrder && (
            <div className="mt-4 border-l-2 border-[var(--cd-navy-400)] pl-4 py-1">
              <p className="text-sm text-[var(--cd-ink-soft)]">
                Ce modèle n&rsquo;est pas disponible en ce moment.
              </p>
            </div>
          )}

          {product.description && (
            <p className="mt-6 text-[var(--cd-ink-soft)] leading-relaxed whitespace-pre-line max-w-[52ch]">
              {product.description}
            </p>
          )}

          <div className="mt-8">
            <h2 className="cd-eyebrow text-[0.62rem] text-[var(--cd-ink-faint)] mb-3">
              {hasSizes ? "Pointure" : "Taille"}
            </h2>

            {hasSizes ? (
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => {
                  const isSelected = selectedSize === s.label;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      disabled={!s.available}
                      aria-pressed={isSelected}
                      onClick={() => {
                        setSelectedSize(s.label);
                        setFeedback(null);
                      }}
                      className={`cd-num min-w-[3.75rem] px-3 h-11 border text-sm font-semibold transition-colors ${
                        !s.available
                          ? "border-[var(--cd-rule)] text-[var(--cd-ink-faint)] line-through cursor-not-allowed"
                          : isSelected
                          ? "bg-[var(--cd-navy-800)] text-white border-[var(--cd-navy-800)]"
                          : "border-[var(--cd-rule)] hover:border-[var(--cd-navy-800)]"
                      }`}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-[var(--cd-ink-soft)]">{SINGLE_SIZE_LABEL}</p>
            )}
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-4">
            <div>
              <h2 className="cd-eyebrow text-[0.62rem] text-[var(--cd-ink-faint)] mb-3">Quantité</h2>
              <div className="inline-flex items-center border border-[var(--cd-rule)]">
                <button
                  type="button"
                  aria-label="Diminuer la quantité"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-11 h-11 text-lg hover:bg-[var(--cd-cream-100)]"
                >
                  −
                </button>
                <span className="cd-num w-10 text-center font-semibold" aria-live="polite">
                  {quantity}
                </span>
                <button
                  type="button"
                  aria-label="Augmenter la quantité"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-11 h-11 text-lg hover:bg-[var(--cd-cream-100)]"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {feedback && (
            <p className="mt-5 text-sm font-semibold text-[var(--cd-gold-700)]" role="status">
              {feedback}
            </p>
          )}

          <div className="grid sm:grid-cols-2 gap-3 mt-7">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!canOrder}
              className="cd-btn cd-btn--solid"
            >
              Ajouter au panier
            </button>
            <a
              href={askOnWhatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="cd-btn cd-btn--whatsapp"
            >
              <WhatsAppGlyph className="w-4 h-4" />
              {priceConfirmed ? "Commander sur WhatsApp" : "Demander le prix"}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
