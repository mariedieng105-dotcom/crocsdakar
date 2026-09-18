"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { SerializedProduct } from "@/lib/serialize";
import type { ProductCategory } from "@prisma/client";
import { CATEGORY_VALUES, CATEGORY_LABELS, UNCLASSIFIED } from "@/lib/categories";

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
    <div className="flex flex-col gap-6">
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
  const [category, setCategory] = useState<ProductCategory>(product.category);
  const [available, setAvailable] = useState(product.available);
  const [quantity, setQuantity] = useState(product.quantity !== null ? String(product.quantity) : "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
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
        category,
        available,
        quantity: quantity ? Number(quantity) : null,
      }),
    });
    setSaving(false);
    if (res.ok) {
      setFailed(false);
      setMessage("Modifications enregistrées.");
      onSaved();
    } else {
      const data = await res.json();
      setFailed(true);
      setMessage(data.error || "Erreur lors de l'enregistrement.");
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Supprimer définitivement "${product.name}" ? Cette action est irréversible.`)) return;
    await fetch(`/api/admin/products/${product.id}`, { method: "DELETE" });
    router.push("/admin/produits");
  };

  return (
    <section className="cd-ad-card">
      <h2 className="cd-ad-card__title">Informations</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-5">
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="product-name" className="cd-ad-label">Nom</label>
            <input
              id="product-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="cd-ad-field"
            />
          </div>
          <div>
            <label htmlFor="product-model" className="cd-ad-label">Modèle</label>
            <input
              id="product-model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="cd-ad-field"
            />
          </div>
          <div>
            <label htmlFor="product-price" className="cd-ad-label">Prix (FCFA)</label>
            <input
              id="product-price"
              type="number"
              min={0}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Vide = prix à confirmer"
              className="cd-ad-field cd-num"
            />
            {price.trim() === "" && (
              <p className="text-xs text-[var(--cd-gold-700)] mt-2">
                Le produit s&apos;affichera avec « Prix à confirmer » et ne pourra pas être commandé
                tant qu&apos;un prix n&apos;est pas saisi.
              </p>
            )}
          </div>
          <div>
            <label htmlFor="product-quantity" className="cd-ad-label">Quantité disponible</label>
            <input
              id="product-quantity"
              type="number"
              min={0}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="cd-ad-field cd-num"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="product-category" className="cd-ad-label">Catégorie</label>
            <select
              id="product-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as ProductCategory)}
              className="cd-ad-field sm:max-w-xs"
            >
              {CATEGORY_VALUES.map((value) => (
                <option key={value} value={value}>
                  {CATEGORY_LABELS[value]}
                </option>
              ))}
            </select>
            {category === UNCLASSIFIED && (
              <p className="text-xs text-[var(--cd-gold-700)] mt-2">
                Tant que le produit est « à classer », il n&apos;apparaît dans aucune catégorie de
                la boutique. Il reste visible dans le catalogue et la recherche.
              </p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="product-description" className="cd-ad-label">Description</label>
          <textarea
            id="product-description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="cd-ad-field"
          />
        </div>

        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            checked={available}
            onChange={(e) => setAvailable(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-[var(--cd-navy-800)]"
          />
          <span>
            <span className="font-semibold block">Visible dans la boutique</span>
            <span className="text-[var(--cd-ink-soft)] text-xs">
              Décoché, le produit reste en base et dans l&apos;administration, mais disparaît de la
              boutique et des recherches.
            </span>
          </span>
        </label>

        {message && (
          <p className={`cd-ad-note ${failed ? "cd-ad-note--danger" : "cd-ad-note--ok"}`} role="status">
            {message}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-4 pt-1">
          <button type="submit" disabled={saving} className="cd-ad-btn cd-ad-btn--solid">
            {saving ? "Enregistrement…" : "Enregistrer"}
          </button>
          <Link href={`/produit/${product.slug}`} target="_blank" className="cd-ad-link">
            Voir la fiche publique
          </Link>
          <button type="button" onClick={handleDelete} className="cd-ad-link cd-ad-link--danger ml-auto">
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
    <section className="cd-ad-card">
      <h2 className="cd-ad-card__title">
        Photos <span className="cd-num text-[var(--cd-ink-faint)]">({product.images.length})</span>
      </h2>

      {product.images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
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

      <label className="cd-ad-btn cd-ad-btn--ghost cursor-pointer mt-5">
        {uploading ? "Envoi en cours…" : "Ajouter une photo"}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="hidden"
          onChange={handleUpload}
          disabled={uploading}
        />
      </label>

      {error && <p className="cd-ad-note cd-ad-note--danger mt-3">{error}</p>}

      <p className="text-xs text-[var(--cd-ink-faint)] mt-3 max-w-lg">
        Ajoutez plusieurs photos (devant, côté, arrière…). La photo marquée « Principale » est celle
        qui apparaît dans la boutique.
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
    <div className="border border-[var(--cd-rule)] bg-[var(--cd-cream-50)]">
      <div className="relative aspect-square group bg-[var(--cd-cream-100)]">
        <Image src={image.url} alt={image.alt || productName} fill sizes="200px" className="object-cover" />
        {image.isMain && (
          <span className="cd-eyebrow absolute top-1.5 left-1.5 bg-[var(--cd-navy-900)] text-[var(--cd-gold-500)] text-[0.5rem] px-1.5 py-1">
            Principale
          </span>
        )}
        <div className="absolute inset-0 bg-[var(--cd-navy-900)]/70 opacity-0 group-hover:opacity-100 focus-within:opacity-100 flex flex-col items-center justify-center gap-2 transition-opacity">
          {!image.isMain && (
            <button type="button" onClick={onSetMain} className="cd-eyebrow text-[0.55rem] text-white underline underline-offset-2">
              Définir principale
            </button>
          )}
          <button type="button" onClick={onDelete} className="cd-eyebrow text-[0.55rem] text-white underline underline-offset-2">
            Supprimer
          </button>
        </div>
      </div>

      <div className="p-2 border-t border-[var(--cd-rule)]">
        {editing ? (
          <div className="flex gap-1">
            <input
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              placeholder="Légende de la photo"
              className="w-full min-w-0 border border-[var(--cd-rule)] px-2 py-1 text-xs outline-none focus:border-[var(--cd-navy-800)]"
            />
            <button type="button" onClick={saveAlt} disabled={saving} className="cd-ad-link shrink-0">
              OK
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="w-full text-left text-xs text-[var(--cd-ink-faint)] truncate hover:text-[var(--cd-navy-800)]"
            title="Modifier la légende de cette photo"
          >
            {image.alt || "Ajouter une légende…"}
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
    <section className="cd-ad-card">
      <h2 className="cd-ad-card__title">Pointures</h2>

      {product.sizes.length > 0 ? (
        <div className="flex flex-wrap gap-2 mt-5">
          {product.sizes.map((s) => (
            <div
              key={s.id}
              className={`flex items-center gap-2.5 border px-3 py-2 ${
                s.available
                  ? "border-[var(--cd-rule)] bg-[var(--cd-surface)]"
                  : "border-[var(--cd-cream-300)] bg-[var(--cd-cream-100)] text-[var(--cd-ink-faint)]"
              }`}
            >
              <span className={`cd-num text-sm font-semibold ${s.available ? "" : "line-through"}`}>
                {s.label}
              </span>
              <button
                type="button"
                onClick={() => toggleSize(s.id, s.available)}
                className="cd-eyebrow text-[0.55rem] text-[var(--cd-gold-700)]"
              >
                {s.available ? "Désactiver" : "Activer"}
              </button>
              <button
                type="button"
                onClick={() => deleteSize(s.id)}
                aria-label={`Supprimer la pointure ${s.label}`}
                className="text-[var(--cd-ink-faint)] hover:text-[#9b302a] text-xs leading-none"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-[var(--cd-ink-faint)] mt-5">
          Aucune pointure enregistrée. Ce produit se commande en « Taille unique ».
        </p>
      )}

      <form onSubmit={addSize} className="flex flex-wrap gap-2 mt-5">
        <label htmlFor="new-size" className="sr-only">Nouvelle pointure</label>
        <input
          id="new-size"
          value={newSize}
          onChange={(e) => setNewSize(e.target.value)}
          placeholder="Ex : 42-43"
          className="cd-ad-field cd-num w-36"
        />
        <button type="submit" disabled={busy} className="cd-ad-btn cd-ad-btn--ghost">
          Ajouter
        </button>
      </form>

      {error && <p className="cd-ad-note cd-ad-note--danger mt-3">{error}</p>}
    </section>
  );
}
