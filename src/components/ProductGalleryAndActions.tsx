"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartProvider";
import { formatFCFA } from "@/lib/shop";
import type { SerializedProduct } from "@/lib/serialize";

export default function ProductGalleryAndActions({ product }: { product: SerializedProduct }) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [feedback, setFeedback] = useState<string | null>(null);
  const { addItem } = useCart();
  const router = useRouter();

  const images = product.images.length > 0 ? product.images : [];
  const activeImage = images[activeImageIndex];
  const canOrder = product.available && product.sizes.some((s) => s.available);

  const handleAddToCart = () => {
    if (!selectedSize) {
      setFeedback("Veuillez sélectionner une pointure.");
      return;
    }
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      model: product.model,
      price: product.price,
      image: activeImage?.url ?? null,
      size: selectedSize,
      quantity,
    });
    setFeedback("Ajouté au panier !");
  };

  const handleBuyNow = () => {
    if (!selectedSize) {
      setFeedback("Veuillez sélectionner une pointure.");
      return;
    }
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      model: product.model,
      price: product.price,
      image: activeImage?.url ?? null,
      size: selectedSize,
      quantity,
    });
    router.push("/panier");
  };

  return (
    <div className="grid lg:grid-cols-2 gap-10">
      <div>
        <div className="relative aspect-square rounded-2xl overflow-hidden bg-[var(--color-cream-dark)] card-shadow">
          {activeImage ? (
            <Image
              src={activeImage.url}
              alt={activeImage.alt || product.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[var(--color-navy)]/30">
              Photo à venir
            </div>
          )}
        </div>
        {images.length > 1 && (
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
            {images.map((img, idx) => (
              <button
                key={img.id}
                onClick={() => setActiveImageIndex(idx)}
                aria-label={`Voir la photo ${idx + 1}`}
                className={`relative shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                  idx === activeImageIndex ? "border-[var(--color-gold)]" : "border-transparent"
                }`}
              >
                <Image src={img.url} alt={img.alt || product.name} fill sizes="64px" className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <p className="text-xs uppercase tracking-wide text-[var(--color-gold-dark)] font-semibold mb-1">
          {product.model}
        </p>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-[var(--color-navy)] mb-2">{product.name}</h1>
        <p className="font-display font-bold text-2xl text-[var(--color-navy)] mb-4">{formatFCFA(product.price)}</p>

        {!canOrder && (
          <p className="inline-block mb-4 bg-red-50 text-red-700 text-sm font-medium px-3 py-1.5 rounded-full">
            Ce produit n&apos;est actuellement pas disponible.
          </p>
        )}

        {product.description && (
          <p className="text-[var(--color-navy)]/75 mb-6 whitespace-pre-line leading-relaxed">{product.description}</p>
        )}

        <div className="mb-6">
          <h2 className="text-sm font-semibold text-[var(--color-navy)] mb-2">Pointure</h2>
          {product.sizes.length === 0 ? (
            <p className="text-sm text-[var(--color-navy)]/50">Aucune pointure renseignée pour ce produit.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((s) => {
                const isSelected = selectedSize === s.label;
                return (
                  <button
                    key={s.id}
                    type="button"
                    disabled={!s.available}
                    onClick={() => {
                      setSelectedSize(s.label);
                      setFeedback(null);
                    }}
                    aria-pressed={isSelected}
                    className={`min-w-12 h-11 px-3 rounded-lg border text-sm font-semibold transition-colors ${
                      !s.available
                        ? "border-[var(--color-navy)]/10 text-[var(--color-navy)]/30 line-through cursor-not-allowed"
                        : isSelected
                        ? "bg-[var(--color-navy)] text-white border-[var(--color-navy)]"
                        : "border-[var(--color-navy)]/30 text-[var(--color-navy)] hover:border-[var(--color-navy)]"
                    }`}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="mb-6">
          <h2 className="text-sm font-semibold text-[var(--color-navy)] mb-2">Quantité</h2>
          <div className="inline-flex items-center border border-[var(--color-navy)]/20 rounded-full">
            <button
              type="button"
              aria-label="Diminuer la quantité"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-10 h-10 flex items-center justify-center text-lg"
            >
              −
            </button>
            <span className="w-8 text-center font-semibold" aria-live="polite">{quantity}</span>
            <button
              type="button"
              aria-label="Augmenter la quantité"
              onClick={() => setQuantity((q) => q + 1)}
              className="w-10 h-10 flex items-center justify-center text-lg"
            >
              +
            </button>
          </div>
        </div>

        {feedback && (
          <p className="text-sm mb-4 text-[var(--color-navy)] font-medium" role="status">{feedback}</p>
        )}

        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={handleAddToCart} disabled={!canOrder} className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed">
            Ajouter au panier
          </button>
          <button type="button" onClick={handleBuyNow} disabled={!canOrder} className="btn-outline disabled:opacity-40 disabled:cursor-not-allowed">
            Commander maintenant
          </button>
        </div>

        <Link href="/catalogue" className="inline-block mt-6 text-sm text-[var(--color-gold-dark)] hover:underline">
          ← Retour au catalogue
        </Link>
      </div>
    </div>
  );
}
