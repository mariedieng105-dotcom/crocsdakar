"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewProductForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [model, setModel] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [available, setAvailable] = useState(true);
  const [quantity, setQuantity] = useState("");
  const [sizesText, setSizesText] = useState("36, 37, 38, 39, 40, 41");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const sizes = sizesText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          model,
          price: price.trim() === "" ? null : Number(price),
          description,
          available,
          quantity: quantity ? Number(quantity) : null,
          sizes,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erreur lors de la création du produit.");
        setSubmitting(false);
        return;
      }

      router.push(`/admin/produits/${data.product.id}`);
    } catch {
      setError("Impossible de contacter le serveur.");
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl card-shadow p-6 flex flex-col gap-4 max-w-xl">
      <div>
        <label htmlFor="name" className="block text-sm font-semibold text-[var(--color-navy)] mb-1">Nom du produit *</label>
        <input id="name" required value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg border border-[var(--color-navy)]/20 px-4 py-2.5 text-sm" />
      </div>
      <div>
        <label htmlFor="model" className="block text-sm font-semibold text-[var(--color-navy)] mb-1">Modèle *</label>
        <input id="model" required value={model} onChange={(e) => setModel(e.target.value)} className="w-full rounded-lg border border-[var(--color-navy)]/20 px-4 py-2.5 text-sm" />
      </div>
      <div>
        <label htmlFor="price" className="block text-sm font-semibold text-[var(--color-navy)] mb-1">Prix (FCFA)</label>
        <input id="price" type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Laisser vide si prix à confirmer" className="w-full rounded-lg border border-[var(--color-navy)]/20 px-4 py-2.5 text-sm" />
        <p className="text-xs text-[var(--color-navy)]/50 mt-1">
          Laissez vide pour afficher « Prix à confirmer » — le produit restera visible mais non commandable jusqu&apos;à ce que vous renseigniez un prix.
        </p>
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-semibold text-[var(--color-navy)] mb-1">Description</label>
        <textarea id="description" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full rounded-lg border border-[var(--color-navy)]/20 px-4 py-2.5 text-sm" />
      </div>
      <div>
        <label htmlFor="quantity" className="block text-sm font-semibold text-[var(--color-navy)] mb-1">Quantité disponible (optionnel)</label>
        <input id="quantity" type="number" min={0} value={quantity} onChange={(e) => setQuantity(e.target.value)} className="w-full rounded-lg border border-[var(--color-navy)]/20 px-4 py-2.5 text-sm" />
      </div>
      <div>
        <label htmlFor="sizes" className="block text-sm font-semibold text-[var(--color-navy)] mb-1">Pointures initiales (séparées par des virgules)</label>
        <input id="sizes" value={sizesText} onChange={(e) => setSizesText(e.target.value)} className="w-full rounded-lg border border-[var(--color-navy)]/20 px-4 py-2.5 text-sm" />
        <p className="text-xs text-[var(--color-navy)]/50 mt-1">Vous pourrez ajouter, modifier ou désactiver des pointures après la création.</p>
      </div>
      <label className="flex items-center gap-2 text-sm font-medium text-[var(--color-navy)]">
        <input type="checkbox" checked={available} onChange={(e) => setAvailable(e.target.checked)} />
        Produit disponible à la vente
      </label>

      {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

      <button type="submit" disabled={submitting} className="btn-primary disabled:opacity-50">
        {submitting ? "Création..." : "Créer le produit"}
      </button>
      <p className="text-xs text-[var(--color-navy)]/50">
        Vous pourrez ajouter les photos juste après la création du produit.
      </p>
    </form>
  );
}
