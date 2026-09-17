"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatPrice } from "@/lib/shop";
import type { SerializedProduct } from "@/lib/serialize";

export default function AdminProductRow({ product }: { product: SerializedProduct }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const toggleAvailable = async () => {
    setBusy(true);
    await fetch(`/api/admin/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ available: !product.available }),
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

  return (
    <tr className="border-b border-[var(--color-navy)]/5 last:border-0">
      <td className="py-2.5 pr-4">
        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-[var(--color-cream-dark)]">
          {mainImage ? (
            <Image src={mainImage.url} alt={mainImage.alt || product.name} fill sizes="48px" className="object-cover" />
          ) : null}
        </div>
      </td>
      <td className="py-2.5 pr-4 font-medium text-[var(--color-navy)]">{product.name}</td>
      <td className="py-2.5 pr-4 text-[var(--color-navy)]/70">{product.model}</td>
      <td className="py-2.5 pr-4">{formatPrice(product.price)}</td>
      <td className="py-2.5 pr-4">
        <button
          onClick={toggleAvailable}
          disabled={busy}
          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
            product.available ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          {product.available ? "Disponible" : "Indisponible"}
        </button>
      </td>
      <td className="py-2.5 pr-4 flex gap-2">
        <Link href={`/admin/produits/${product.id}`} className="text-sm font-medium text-[var(--color-gold-dark)] hover:underline">
          Modifier
        </Link>
        <button onClick={handleDelete} disabled={busy} className="text-sm font-medium text-red-600 hover:underline">
          Supprimer
        </button>
      </td>
    </tr>
  );
}
