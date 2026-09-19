"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/shop";

type ProductRow = {
  slug: string;
  name: string;
  model: string;
  price: number | null;
  quantity: number | null;
  sizes: { label: string; available: boolean }[];
  imagesCount: number;
  imagesPresent: number;
  missingImages: number;
  missingSizes: number;
  status: "absent" | "partiel" | "complet";
};

type Connection = { host: string | null; database: string | null; pooled: boolean } | null;

type Preview = {
  database: {
    runtime: Connection;
    migrations: Connection;
    sameTarget: boolean | null;
    productsInDatabase: number;
  };
  blobConfigured: boolean;
  totalInSource: number;
  totalImagesInSource: number;
  totalSizesInSource: number;
  alreadyImportedCount: number;
  partialCount: number;
  pendingImportCount: number;
  remainingImages: number;
  products: ProductRow[];
  pendingImport: ProductRow[];
};

type ImportRound = {
  productsCreated: number;
  productsCompleted: number;
  imagesUploaded: number;
  sizesCreated: number;
  remainingProducts: number;
  done: boolean;
  errors: { slug: string; error: string }[];
};

type Progress = {
  productsCreated: number;
  imagesUploaded: number;
  sizesCreated: number;
  remainingProducts: number;
  done: boolean;
  errors: { slug: string; error: string }[];
};

/** Garde-fou : l'import complet demande une dizaine de tranches, jamais cent. */
const MAX_ROUNDS = 100;

export default function ImportCatalogueClient() {
  const [preview, setPreview] = useState<Preview | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(true);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState<Progress | null>(null);
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
        `Importer ${preview.pendingImportCount} produits et ${preview.remainingImages} photos maintenant ? Cette action écrit dans la base de données du site.`
      )
    ) {
      return;
    }

    setImporting(true);
    setResultError(null);
    const total: Progress = {
      productsCreated: 0,
      imagesUploaded: 0,
      sizesCreated: 0,
      remainingProducts: preview.pendingImportCount,
      done: false,
      errors: [],
    };
    setProgress({ ...total });

    // L'import avance par tranches : le serveur rend la main avant la coupure
    // de Vercel et indique ce qui reste. On relance tant que ce n'est pas fini,
    // sans jamais dupliquer quoi que ce soit (l'import est idempotent).
    for (let round = 0; round < MAX_ROUNDS; round++) {
      let data: ImportRound;
      try {
        const res = await fetch("/api/admin/import-catalogue", { method: "POST" });
        data = await res.json();
        if (!res.ok) {
          setResultError((data as unknown as { error?: string }).error || "Erreur lors de l'importation.");
          break;
        }
      } catch {
        setResultError(
          "La connexion a été interrompue pendant l'import. Les produits déjà importés sont conservés : recliquez sur « Importer » pour reprendre là où il s'est arrêté."
        );
        break;
      }

      total.productsCreated += data.productsCreated;
      total.imagesUploaded += data.imagesUploaded;
      total.sizesCreated += data.sizesCreated;
      total.remainingProducts = data.remainingProducts;
      total.done = data.done;
      total.errors = [...total.errors, ...data.errors];
      setProgress({ ...total });

      if (data.done) break;
    }

    setImporting(false);
    loadPreview();
  };

  if (loadingPreview && !preview) {
    return <p className="text-sm text-[var(--cd-ink-soft)]">Vérification du catalogue à importer…</p>;
  }

  if (previewError) {
    return <p className="cd-ad-note cd-ad-note--danger">{previewError}</p>;
  }

  if (!preview) return null;

  const { runtime, migrations, sameTarget, productsInDatabase } = preview.database;

  return (
    <div className="flex flex-col gap-6">
      <div className="cd-ad-card">
        <h2 className="cd-ad-card__title">Base de données visée</h2>
        <p className="text-sm text-[var(--cd-ink-soft)] mt-4">
          À comparer avec ce que Neon affiche pour la branche d&apos;aperçu, avant de lancer
          l&apos;import. Ni identifiant ni mot de passe n&apos;apparaissent ici.
        </p>
        <table className="cd-ad-table mt-5">
          <tbody>
            <tr>
              <td>Écritures du site</td>
              <td className="text-[var(--cd-ink-soft)]">{runtime?.host ?? "non configurée"}</td>
              <td className="text-[var(--cd-ink-soft)]">{runtime?.database ?? "—"}</td>
            </tr>
            <tr>
              <td>Migrations du build</td>
              <td className="text-[var(--cd-ink-soft)]">{migrations?.host ?? "non configurée"}</td>
              <td className="text-[var(--cd-ink-soft)]">{migrations?.database ?? "—"}</td>
            </tr>
            <tr>
              <td>Produits déjà dans cette base</td>
              <td className="cd-num" colSpan={2}>{productsInDatabase}</td>
            </tr>
          </tbody>
        </table>
        {sameTarget === false && (
          <p className="cd-ad-note cd-ad-note--danger mt-4">
            Les deux lignes ne désignent pas la même base. Les migrations du build s&apos;appliquent
            donc ailleurs que là où le site écrit : corrigez les variables avant d&apos;importer.
          </p>
        )}
        {sameTarget === null && (
          <p className="cd-ad-note cd-ad-note--warn mt-4">
            Une des deux variables est absente ou illisible : impossible de confirmer la base visée.
          </p>
        )}
      </div>

      <div className="cd-ad-card">
        <h2 className="cd-ad-card__title">Vérification avant import</h2>
        <ul className="text-sm text-[var(--cd-ink-soft)] flex flex-col gap-1.5 mt-5">
          <li>Produits dans le fichier source : <strong>{preview.totalInSource}</strong></li>
          <li>Photos dans le fichier source : <strong>{preview.totalImagesInSource}</strong></li>
          <li>Pointures dans le fichier source : <strong>{preview.totalSizesInSource}</strong></li>
          <li>Déjà importés en entier (seront ignorés) : <strong>{preview.alreadyImportedCount}</strong></li>
          <li>Importés à moitié (seront complétés) : <strong>{preview.partialCount}</strong></li>
          <li>Restant à importer ou compléter : <strong>{preview.pendingImportCount}</strong></li>
          <li>Photos restant à envoyer : <strong>{preview.remainingImages}</strong></li>
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
          Tout le catalogue initial est importé : {preview.totalInSource} produits,{" "}
          {preview.totalImagesInSource} photos et {preview.totalSizesInSource} pointures. Aucune
          action nécessaire.
        </div>
      ) : (
        <>
          <div className="cd-ad-card">
            <h2 className="cd-ad-card__title">
              Aperçu des {preview.pendingImportCount} produits à traiter
            </h2>
            <div className="overflow-x-auto relative mt-5">
              <table className="cd-ad-table min-w-[680px]">
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Modèle</th>
                    <th>Prix</th>
                    <th>Pointures</th>
                    <th>Photos</th>
                    <th>État</th>
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
                      <td className="cd-num">
                        {p.imagesPresent}/{p.imagesCount}
                      </td>
                      <td>
                        <span className={`cd-ad-pill ${p.status === "partiel" ? "cd-ad-pill--warn" : "cd-ad-pill--info"}`}>
                          {p.status === "partiel" ? "à compléter" : "à créer"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <button onClick={handleImport} disabled={importing || !preview.blobConfigured} className="cd-ad-btn cd-ad-btn--solid">
              {importing ? "Importation en cours…" : `Importer ${preview.pendingImportCount} produits`}
            </button>
            <p className="text-xs text-[var(--cd-ink-faint)] mt-3 max-w-lg">
              Avec {preview.remainingImages} photos à envoyer, l&apos;import dure plusieurs minutes et
              se fait en plusieurs passages automatiques : laissez simplement cette page ouverte.
              Si la connexion est coupée, rien n&apos;est perdu — recliquez sur « Importer » et
              l&apos;opération reprend exactement là où elle s&apos;était arrêtée, sans doublon.
            </p>
          </div>
        </>
      )}

      {resultError && <p className="cd-ad-note cd-ad-note--danger">{resultError}</p>}

      {progress && (
        <div className="cd-ad-card">
          <h2 className="cd-ad-card__title">
            {progress.done ? "Import terminé" : importing ? "Import en cours" : "Import interrompu"}
          </h2>
          <ul className="text-sm text-[var(--cd-ink-soft)] flex flex-col gap-1.5 mt-5 mb-4">
            <li>Produits créés : <strong>{progress.productsCreated}</strong></li>
            <li>Photos envoyées : <strong>{progress.imagesUploaded}</strong></li>
            <li>Pointures créées : <strong>{progress.sizesCreated}</strong></li>
            <li>Produits restants : <strong>{progress.remainingProducts}</strong></li>
          </ul>
          {progress.errors.length > 0 && (
            <div className="text-sm text-[#9b302a]">
              <p className="font-semibold mb-1">{progress.errors.length} erreur(s) :</p>
              <ul className="list-disc pl-5">
                {progress.errors.map((e, i) => (
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
