"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/shop";

type PendingProduct = {
  slug: string;
  name: string;
  model: string;
  price: number | null;
  quantity: number | null;
  sizes: { label: string; available: boolean }[];
  imagesCount: number;
};

type Preview = {
  blobConfigured: boolean;
  totalInSource: number;
  totalImagesInSource: number;
  totalSizesInSource: number;
  alreadyImportedCount: number;
  alreadyImported: { slug: string; name: string; model: string }[];
  pendingImportCount: number;
  pendingImport: PendingProduct[];
};

type ImportResult = {
  productsCreated: number;
  imagesUploaded: number;
  sizesCreated: number;
  created: { slug: string; name: string; imagesUploaded: number; sizesCreated: number }[];
  errors: { slug: string; error: string }[];
};

export default function ImportCatalogueClient() {
  const [preview, setPreview] = useState<Preview | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(true);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [resultError, setResultError] = useState<string | null>(null);

  const loadPreview = async () => {
    setLoadingPreview(true);
    setPreviewError(null);
    try {
      const res = await fetch("/api/admin/import-catalogue");
      const data = await res.json();
      if (!res.ok) {
        setPreviewError(data.error || "Erreur lors de la vérification.");
      } else {
        setPreview(data);
      }
    } catch {
      setPreviewError("Impossible de contacter le serveur.");
    } finally {
      setLoadingPreview(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- chargement initial depuis l'API au montage
    loadPreview();
  }, []);

  const handleImport = async () => {
    if (!preview || preview.pendingImportCount === 0) return;
    if (
      !confirm(
        `Importer ${preview.pendingImportCount} produits et leurs photos maintenant ? Cette action écrit dans la base de données de production.`
      )
    ) {
      return;
    }
    setImporting(true);
    setResultError(null);
    try {
      const res = await fetch("/api/admin/import-catalogue", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setResultError(data.error || "Erreur lors de l'importation.");
      } else {
        setResult(data);
      }
    } catch {
      setResultError("Impossible de contacter le serveur.");
    } finally {
      setImporting(false);
      loadPreview();
    }
  };

  if (loadingPreview) {
    return <p className="text-sm text-[var(--color-navy)]/60">Vérification du catalogue à importer...</p>;
  }

  if (previewError) {
    return <p className="text-sm text-red-600 font-medium">{previewError}</p>;
  }

  if (!preview) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white rounded-2xl card-shadow p-5">
        <h2 className="font-semibold text-[var(--color-navy)] mb-3">Vérification avant import</h2>
        <ul className="text-sm text-[var(--color-navy)]/80 flex flex-col gap-1">
          <li>Produits dans le fichier source : <strong>{preview.totalInSource}</strong></li>
          <li>Photos dans le fichier source : <strong>{preview.totalImagesInSource}</strong></li>
          <li>Pointures dans le fichier source : <strong>{preview.totalSizesInSource}</strong></li>
          <li>Déjà importés (seront ignorés) : <strong>{preview.alreadyImportedCount}</strong></li>
          <li>Restant à importer : <strong>{preview.pendingImportCount}</strong></li>
          <li>
            Stockage photos (Vercel Blob) :{" "}
            <strong className={preview.blobConfigured ? "text-green-700" : "text-red-600"}>
              {preview.blobConfigured ? "configuré" : "NON configuré"}
            </strong>
          </li>
        </ul>
        {!preview.blobConfigured && (
          <p className="text-sm text-red-600 font-medium mt-3">
            L&apos;import des photos échouera tant que BLOB_READ_WRITE_TOKEN n&apos;est pas configuré sur Vercel.
          </p>
        )}
      </div>

      {preview.pendingImportCount === 0 ? (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-green-800 text-sm">
          Tous les produits du catalogue initial sont déjà importés. Aucune action nécessaire.
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl card-shadow p-5">
            <h2 className="font-semibold text-[var(--color-navy)] mb-3">
              Aperçu des {preview.pendingImportCount} produits à importer
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[640px]">
                <thead>
                  <tr className="text-left text-[var(--color-navy)]/50 border-b border-[var(--color-navy)]/10">
                    <th className="py-1.5 pr-3">Nom</th>
                    <th className="py-1.5 pr-3">Modèle</th>
                    <th className="py-1.5 pr-3">Prix</th>
                    <th className="py-1.5 pr-3">Pointures</th>
                    <th className="py-1.5 pr-3">Photos</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.pendingImport.map((p) => (
                    <tr key={p.slug} className="border-b border-[var(--color-navy)]/5 last:border-0">
                      <td className="py-1.5 pr-3">{p.name}</td>
                      <td className="py-1.5 pr-3 text-[var(--color-navy)]/70">{p.model}</td>
                      <td className="py-1.5 pr-3">{formatPrice(p.price)}</td>
                      <td className="py-1.5 pr-3">
                        {p.sizes.filter((s) => s.available).length}/{p.sizes.length} dispo.
                      </td>
                      <td className="py-1.5 pr-3">{p.imagesCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <button onClick={handleImport} disabled={importing || !preview.blobConfigured} className="btn-primary disabled:opacity-50">
              {importing ? "Importation en cours (peut prendre plusieurs minutes)..." : `Importer ${preview.pendingImportCount} produits`}
            </button>
            <p className="text-xs text-[var(--color-navy)]/50 mt-2 max-w-lg">
              Avec {preview.totalImagesInSource} photos à envoyer, l&apos;import peut prendre plusieurs
              minutes. Si la page affiche une erreur de temporisation, c&apos;est normal avec ce volume
              de photos — recliquez simplement sur « Importer », les produits déjà créés sont
              automatiquement ignorés (aucun doublon), seuls les produits restants seront traités.
              Répétez jusqu&apos;à ce que « Restant à importer » affiche 0.
            </p>
          </div>
        </>
      )}

      {resultError && <p className="text-sm text-red-600 font-medium">{resultError}</p>}

      {result && (
        <div className="bg-white rounded-2xl card-shadow p-5">
          <h2 className="font-semibold text-[var(--color-navy)] mb-3">Résultat de l&apos;import</h2>
          <ul className="text-sm text-[var(--color-navy)]/80 flex flex-col gap-1 mb-3">
            <li>Produits créés : <strong>{result.productsCreated}</strong></li>
            <li>Photos envoyées : <strong>{result.imagesUploaded}</strong></li>
            <li>Pointures créées : <strong>{result.sizesCreated}</strong></li>
          </ul>
          {result.errors.length > 0 && (
            <div className="text-sm text-red-600">
              <p className="font-semibold mb-1">{result.errors.length} erreur(s) :</p>
              <ul className="list-disc pl-5">
                {result.errors.map((e, i) => (
                  <li key={i}>{e.slug} : {e.error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
