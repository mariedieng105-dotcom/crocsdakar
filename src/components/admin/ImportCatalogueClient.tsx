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
    return <p className="text-sm text-[var(--cd-ink-soft)]">Vérification du catalogue à importer…</p>;
  }

  if (previewError) {
    return <p className="cd-ad-note cd-ad-note--danger">{previewError}</p>;
  }

  if (!preview) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="cd-ad-card">
        <h2 className="cd-ad-card__title">Vérification avant import</h2>
        <ul className="text-sm text-[var(--cd-ink-soft)] flex flex-col gap-1.5 mt-5">
          <li>Produits dans le fichier source : <strong>{preview.totalInSource}</strong></li>
          <li>Photos dans le fichier source : <strong>{preview.totalImagesInSource}</strong></li>
          <li>Pointures dans le fichier source : <strong>{preview.totalSizesInSource}</strong></li>
          <li>Déjà importés (seront ignorés) : <strong>{preview.alreadyImportedCount}</strong></li>
          <li>Restant à importer : <strong>{preview.pendingImportCount}</strong></li>
          <li>
            Stockage photos (Vercel Blob) :{" "}
            <strong className={preview.blobConfigured ? "text-[#24603a]" : "text-[#9b302a]"}>
              {preview.blobConfigured ? "configuré" : "NON configuré"}
            </strong>
          </li>
        </ul>
        {!preview.blobConfigured && (
          <p className="cd-ad-note cd-ad-note--danger mt-4">
            L&apos;import des photos échouera tant que BLOB_READ_WRITE_TOKEN n&apos;est pas configuré sur Vercel.
          </p>
        )}
      </div>

      {preview.pendingImportCount === 0 ? (
        <div className="cd-ad-note cd-ad-note--ok">
          Tous les produits du catalogue initial sont déjà importés. Aucune action nécessaire.
        </div>
      ) : (
        <>
          <div className="cd-ad-card">
            <h2 className="cd-ad-card__title">
              Aperçu des {preview.pendingImportCount} produits à importer
            </h2>
            <div className="overflow-x-auto mt-5">
              <table className="cd-ad-table min-w-[640px]">
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Modèle</th>
                    <th>Prix</th>
                    <th>Pointures</th>
                    <th>Photos</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.pendingImport.map((p) => (
                    <tr key={p.slug}>
                      <td>{p.name}</td>
                      <td className="text-[var(--cd-ink-soft)]">{p.model}</td>
                      <td className="cd-num whitespace-nowrap">{formatPrice(p.price)}</td>
                      <td className="cd-num">
                        {p.sizes.filter((s) => s.available).length}/{p.sizes.length} dispo.
                      </td>
                      <td className="cd-num">{p.imagesCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <button onClick={handleImport} disabled={importing || !preview.blobConfigured} className="cd-ad-btn cd-ad-btn--solid">
              {importing ? "Importation en cours (peut prendre plusieurs minutes)…" : `Importer ${preview.pendingImportCount} produits`}
            </button>
            <p className="text-xs text-[var(--cd-ink-faint)] mt-3 max-w-lg">
              Avec {preview.totalImagesInSource} photos à envoyer, l&apos;import peut prendre plusieurs
              minutes. Si la page affiche une erreur de temporisation, c&apos;est normal avec ce volume
              de photos — recliquez simplement sur « Importer », les produits déjà créés sont
              automatiquement ignorés (aucun doublon), seuls les produits restants seront traités.
              Répétez jusqu&apos;à ce que « Restant à importer » affiche 0.
            </p>
          </div>
        </>
      )}

      {resultError && <p className="cd-ad-note cd-ad-note--danger">{resultError}</p>}

      {result && (
        <div className="cd-ad-card">
          <h2 className="cd-ad-card__title">Résultat de l&apos;import</h2>
          <ul className="text-sm text-[var(--cd-ink-soft)] flex flex-col gap-1.5 mt-5 mb-4">
            <li>Produits créés : <strong>{result.productsCreated}</strong></li>
            <li>Photos envoyées : <strong>{result.imagesUploaded}</strong></li>
            <li>Pointures créées : <strong>{result.sizesCreated}</strong></li>
          </ul>
          {result.errors.length > 0 && (
            <div className="text-sm text-[#9b302a]">
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
