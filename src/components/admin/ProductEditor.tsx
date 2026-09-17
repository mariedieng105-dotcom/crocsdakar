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
  const [price, setPrice] = useState(product.price !== null ? String(product.price) : "");
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
        price: price.trim() === "" ? null : Number(price),
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
            <input type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Vide = Prix à confirmer" className="w-full rounded-lg border border-[var(--color-navy)]/20 px-4 py-2.5 text-sm" />
            {price.trim() === "" && (
              <p className="text-xs text-amber-600 mt-1">
                Le produit s&apos;affichera avec « Prix à confirmer » et ne pourra pas être commandé tant qu&apos;un prix n&apos;est pas saisi.
              </p>
            )}
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
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
          {product.images.map((img) => (
            <ImageThumb
              key={img.id}
              productId={product.id}
              image={img}
              productName={product.name}
              onSetMain={() => setMain(img.id)}
              onDelete={() => deleteImage(img.id)}
              onChanged={onChanged}
            />
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

function ImageThumb({
  productId,
  image,
  productName,
  onSetMain,
  onDelete,
  onChanged,
}: {
  productId: string;
  image: SerializedProduct["images"][number];
  productName: string;
  onSetMain: () => void;
  onDelete: () => void;
  onChanged: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [alt, setAlt] = useState(image.alt);
  const [saving, setSaving] = useState(false);

  const saveAlt = async () => {
    setSaving(true);
    await fetch(`/api/admin/products/${productId}/images/${image.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alt }),
    });
    setSaving(false);
    setEditing(false);
    onChanged();
  };

  return (
    <div className="rounded-lg overflow-hidden bg-[var(--color-cream-dark)] border border-[var(--color-navy)]/10">
      <div className="relative aspect-square group">
        <Image src={image.url} alt={image.alt || productName} fill sizes="200px" className="object-cover" />
        {image.isMain && (
          <span className="absolute top-1 left-1 bg-[var(--color-gold)] text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
            Principale
          </span>
        )}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
          {!image.isMain && (
            <button onClick={onSetMain} className="text-white text-xs font-semibold underline">
              Définir principale
            </button>
          )}
          <button onClick={onDelete} className="text-white text-xs font-semibold underline">
            Supprimer
          </button>
        </div>
      </div>
      <div className="p-2">
        {editing ? (
          <div className="flex gap-1">
            <input
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              placeholder="Légende de la photo"
              className="w-full rounded border border-[var(--color-navy)]/20 px-2 py-1 text-xs"
            />
            <button onClick={saveAlt} disabled={saving} className="text-xs font-semibold text-[var(--color-gold-dark)] shrink-0">
              OK
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="w-full text-left text-xs text-[var(--color-navy)]/60 truncate hover:text-[var(--color-navy)]"
            title="Modifier la légende de cette photo"
          >
            {image.alt || "Ajouter une légende..."}
          </button>
        )}
      </div>
    </div>
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
