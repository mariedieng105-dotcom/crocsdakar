"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { SerializedProduct } from "@/lib/serialize";

export default function ProductEditor({ initialProduct }: { initialProduct: SerializedProduct }) {
  const router = useRouter();
  const [product, setProduct] = useState(initialProduct);

  const refresh = async () => {
    const res = await fetch(`/api/admin/products/${product.id}`);
    const data = await res.json();
    if (res.ok) setProduct(data.product);
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-8 max-w-3xl">
      <InfoSection product={product} onSaved={refresh} />
      <ImagesSection product={product} onChanged={refresh} />
      <SizesSection product={product} onChanged={refresh} />
    </div>
  );
}

function InfoSection({ product, onSaved }: { product: SerializedProduct; onSaved: () => void }) {
  const [name, setName] = useState(product.name);
  const [model, setModel] = useState(product.model);
  const [price, setPrice] = useState(String(product.price));
  const [description, setDescription] = useState(product.description);
  const [available, setAvailable] = useState(product.available);
  const [quantity, setQuantity] = useState(product.quantity !== null ? String(product.quantity) : "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    const res = await fetch(`/api/admin/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        model,
        price: Number(price),
        description,
        available,
        quantity: quantity ? Number(quantity) : null,
      }),
    });
    setSaving(false);
    if (res.ok) {
      setMessage("Modifications enregistrées.");
      onSaved();
    } else {
      const data = await res.json();
      setMessage(data.error || "Erreur lors de l'enregistrement.");
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Supprimer définitivement "${product.name}" ? Cette action est irréversible.`)) return;
    await fetch(`/api/admin/products/${product.id}`, { method: "DELETE" });
    router.push("/admin/produits");
  };

  return (
    <section className="bg-white rounded-2xl card-shadow p-6">
      <h2 className="font-display font-bold text-lg text-[var(--color-navy)] mb-4">Informations</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-[var(--color-navy)] mb-1">Nom</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg border border-[var(--color-navy)]/20 px-4 py-2.5 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[var(--color-navy)] mb-1">Modèle</label>
            <input value={model} onChange={(e) => setModel(e.target.value)} className="w-full rounded-lg border border-[var(--color-navy)]/20 px-4 py-2.5 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[var(--color-navy)] mb-1">Prix (FCFA)</label>
            <input type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value)} className="w-full rounded-lg border border-[var(--color-navy)]/20 px-4 py-2.5 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[var(--color-navy)] mb-1">Quantité disponible</label>
            <input type="number" min={0} value={quantity} onChange={(e) => setQuantity(e.target.value)} className="w-full rounded-lg border border-[var(--color-navy)]/20 px-4 py-2.5 text-sm" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-[var(--color-navy)] mb-1">Description</label>
          <textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full rounded-lg border border-[var(--color-navy)]/20 px-4 py-2.5 text-sm" />
        </div>
        <label className="flex items-center gap-2 text-sm font-medium text-[var(--color-navy)]">
          <input type="checkbox" checked={available} onChange={(e) => setAvailable(e.target.checked)} />
          Produit disponible à la vente
        </label>

        {message && <p className="text-sm text-[var(--color-navy)] font-medium">{message}</p>}

        <div className="flex flex-wrap gap-3">
          <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
          <button type="button" onClick={handleDelete} className="text-sm font-semibold text-red-600 hover:underline">
            Supprimer ce produit
          </button>
        </div>
      </form>
    </section>
  );
}

function ImagesSection({ product, onChanged }: { product: SerializedProduct; onChanged: () => void }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("alt", product.name);

    const res = await fetch(`/api/admin/products/${product.id}/images`, {
      method: "POST",
      body: formData,
    });

    setUploading(false);
    e.target.value = "";

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Erreur lors de l'envoi de l'image.");
      return;
    }
    onChanged();
  };

  const setMain = async (imageId: string) => {
    await fetch(`/api/admin/products/${product.id}/images/${imageId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isMain: true }),
    });
    onChanged();
  };

  const deleteImage = async (imageId: string) => {
    if (!confirm("Supprimer cette photo ?")) return;
    await fetch(`/api/admin/products/${product.id}/images/${imageId}`, { method: "DELETE" });
    onChanged();
  };

  return (
    <section className="bg-white rounded-2xl card-shadow p-6">
      <h2 className="font-display font-bold text-lg text-[var(--color-navy)] mb-4">Photos</h2>

      {product.images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-4">
          {product.images.map((img) => (
            <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden bg-[var(--color-cream-dark)] group">
              <Image src={img.url} alt={img.alt || product.name} fill sizes="150px" className="object-cover" />
              {img.isMain && (
                <span className="absolute top-1 left-1 bg-[var(--color-gold)] text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                  Principale
                </span>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                {!img.isMain && (
                  <button onClick={() => setMain(img.id)} className="text-white text-xs font-semibold underline">
                    Définir principale
                  </button>
                )}
                <button onClick={() => deleteImage(img.id)} className="text-white text-xs font-semibold underline">
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <label className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-navy)] cursor-pointer btn-outline">
        {uploading ? "Envoi en cours..." : "Ajouter une photo"}
        <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="hidden" onChange={handleUpload} disabled={uploading} />
      </label>
      {error && <p className="text-sm text-red-600 font-medium mt-2">{error}</p>}
      <p className="text-xs text-[var(--color-navy)]/50 mt-2">
        Ajoutez plusieurs photos (devant, côté, arrière...). La première photo ajoutée devient l&apos;image principale.
      </p>
    </section>
  );
}

function SizesSection({ product, onChanged }: { product: SerializedProduct; onChanged: () => void }) {
  const [newSize, setNewSize] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const addSize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSize.trim()) return;
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/admin/products/${product.id}/sizes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: newSize.trim(), available: true }),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Erreur lors de l'ajout de la pointure.");
      return;
    }
    setNewSize("");
    onChanged();
  };

  const toggleSize = async (sizeId: string, available: boolean) => {
    await fetch(`/api/admin/products/${product.id}/sizes/${sizeId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ available: !available }),
    });
    onChanged();
  };

  const deleteSize = async (sizeId: string) => {
    if (!confirm("Supprimer cette pointure du produit ?")) return;
    await fetch(`/api/admin/products/${product.id}/sizes/${sizeId}`, { method: "DELETE" });
    onChanged();
  };

  return (
    <section className="bg-white rounded-2xl card-shadow p-6">
      <h2 className="font-display font-bold text-lg text-[var(--color-navy)] mb-4">Pointures</h2>

      {product.sizes.length > 0 ? (
        <div className="flex flex-wrap gap-2 mb-4">
          {product.sizes.map((s) => (
            <div
              key={s.id}
              className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold ${
                s.available ? "border-green-300 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-500"
              }`}
            >
              <span>{s.label}</span>
              <button onClick={() => toggleSize(s.id, s.available)} className="underline text-xs">
                {s.available ? "Désactiver" : "Activer"}
              </button>
              <button onClick={() => deleteSize(s.id)} aria-label={`Supprimer la pointure ${s.label}`} className="text-xs">
                ✕
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-[var(--color-navy)]/50 mb-4">Aucune pointure enregistrée.</p>
      )}

      <form onSubmit={addSize} className="flex gap-2">
        <input
          value={newSize}
          onChange={(e) => setNewSize(e.target.value)}
          placeholder="Ex : 42"
          className="rounded-lg border border-[var(--color-navy)]/20 px-4 py-2 text-sm w-32"
        />
        <button type="submit" disabled={busy} className="btn-outline disabled:opacity-50">
          Ajouter
        </button>
      </form>
      {error && <p className="text-sm text-red-600 font-medium mt-2">{error}</p>}
    </section>
  );
}
