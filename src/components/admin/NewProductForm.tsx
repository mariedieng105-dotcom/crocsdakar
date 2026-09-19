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
    <form onSubmit={handleSubmit} className="cd-ad-card flex flex-col gap-5 max-w-xl">
      <div>
        <label htmlFor="name" className="cd-ad-label">Nom du produit *</label>
        <input id="name" required value={name} onChange={(e) => setName(e.target.value)} className="cd-ad-field" />
      </div>

      <div>
        <label htmlFor="model" className="cd-ad-label">Modèle *</label>
        <input id="model" required value={model} onChange={(e) => setModel(e.target.value)} className="cd-ad-field" />
      </div>

      <div>
        <label htmlFor="price" className="cd-ad-label">Prix (FCFA)</label>
        <input
          id="price"
          type="number"
          min={0}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Laisser vide si prix à confirmer"
          className="cd-ad-field cd-num"
        />
        <p className="text-xs text-[var(--cd-ink-faint)] mt-2">
          Laissez vide pour afficher « Prix à confirmer » — le produit restera visible mais non
          commandable jusqu&apos;à ce que vous renseigniez un prix.
        </p>
      </div>

      <div>
        <label htmlFor="description" className="cd-ad-label">Description</label>
        <textarea id="description" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className="cd-ad-field" />
      </div>

      <div>
        <label htmlFor="quantity" className="cd-ad-label">Quantité disponible (optionnel)</label>
        <input id="quantity" type="number" min={0} value={quantity} onChange={(e) => setQuantity(e.target.value)} className="cd-ad-field cd-num" />
      </div>

      <div>
        <label htmlFor="sizes" className="cd-ad-label">Pointures initiales (séparées par des virgules)</label>
        <input id="sizes" value={sizesText} onChange={(e) => setSizesText(e.target.value)} className="cd-ad-field cd-num" />
        <p className="text-xs text-[var(--cd-ink-faint)] mt-2">
          Laissez vide pour un accessoire sans pointure. Vous pourrez ajouter, modifier ou désactiver
          des pointures après la création.
        </p>
      </div>

      <label className="flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          checked={available}
          onChange={(e) => setAvailable(e.target.checked)}
          className="mt-0.5 w-4 h-4 accent-[var(--cd-navy-800)]"
        />
        <span className="font-semibold">Visible dans la boutique</span>
      </label>

      {error && <p className="cd-ad-note cd-ad-note--danger">{error}</p>}

      <button type="submit" disabled={submitting} className="cd-ad-btn cd-ad-btn--solid self-start">
        {submitting ? "Création…" : "Créer le produit"}
      </button>

      <p className="text-xs text-[var(--cd-ink-faint)]">
        Vous pourrez ajouter les photos juste après la création du produit.
      </p>
    </form>
  );
}
