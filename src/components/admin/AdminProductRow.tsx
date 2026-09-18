"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatPrice } from "@/lib/shop";
import type { SerializedProduct } from "@/lib/serialize";
import type { ProductCategory } from "@prisma/client";
import { CATEGORY_VALUES, CATEGORY_LABELS, UNCLASSIFIED } from "@/lib/categories";

export default function AdminProductRow({ product }: { product: SerializedProduct }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const patch = async (body: Record<string, unknown>) => {
    setBusy(true);
    await fetch(`/api/admin/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    router.refresh();
    setBusy(false);
  };

  const handleDelete = async () => {
    if (!confirm(`Supprimer définitivement "${product.name}" ? Cette action est irréversible.`)) return;
    setBusy(true);
    await fetch(`/api/admin/products/${product.id}`, { method: "DELETE" });
    router.refresh();
    setBusy(false);
  };

  const mainImage = product.images[0];
  const toClassify = product.category === UNCLASSIFIED;

  return (
    <tr className={busy ? "opacity-50" : undefined}>
      <td>
        <div className="relative w-12 h-12 overflow-hidden bg-[var(--cd-cream-100)]">
          {mainImage ? (
            <Image
              src={mainImage.url}
              alt={mainImage.alt || product.name}
              fill
              sizes="48px"
              className="object-cover"
            />
          ) : null}
        </div>
      </td>
      <td className="font-semibold text-[var(--cd-navy-900)]">{product.name}</td>
      <td className="text-[var(--cd-ink-soft)]">{product.model}</td>
      <td className="cd-num whitespace-nowrap">{formatPrice(product.price)}</td>
      <td>
        <label className="sr-only" htmlFor={`cat-${product.id}`}>
          Catégorie de {product.name}
        </label>
        {/* Classer 39 produits en ouvrant chaque fiche serait fastidieux : la
            catégorie se change directement depuis la liste. */}
        <select
          id={`cat-${product.id}`}
          value={product.category}
          disabled={busy}
          onChange={(e) => patch({ category: e.target.value as ProductCategory })}
          className={`cd-eyebrow text-[0.6rem] px-2.5 py-1.5 border bg-transparent ${
            toClassify
              ? "border-[var(--cd-gold-300)] bg-[var(--cd-gold-100)] text-[var(--cd-gold-700)]"
              : "border-[var(--cd-rule)] text-[var(--cd-navy-800)]"
          }`}
        >
          {CATEGORY_VALUES.map((value) => (
            <option key={value} value={value}>
              {CATEGORY_LABELS[value]}
            </option>
          ))}
        </select>
      </td>
      <td>
        <button
          type="button"
          onClick={() => patch({ available: !product.available })}
          disabled={busy}
          title={
            product.available
              ? "Cliquer pour masquer ce produit de la boutique"
              : "Cliquer pour afficher ce produit dans la boutique"
          }
          className={`cd-ad-pill ${product.available ? "cd-ad-pill--on" : "cd-ad-pill--off"}`}
        >
          {product.available ? "Visible" : "Masqué"}
        </button>
      </td>
      <td>
        <div className="flex gap-4 whitespace-nowrap">
          <Link href={`/admin/produits/${product.id}`} className="cd-ad-link">
            Modifier
          </Link>
          <button type="button" onClick={handleDelete} disabled={busy} className="cd-ad-link cd-ad-link--danger">
            Supprimer
          </button>
        </div>
      </td>
    </tr>
  );
}
