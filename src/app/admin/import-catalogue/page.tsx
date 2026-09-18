import ImportCatalogueClient from "@/components/admin/ImportCatalogueClient";

export default function ImportCataloguePage() {
  return (
    <div>
      <p className="cd-eyebrow text-[var(--cd-gold-700)]">Outil ponctuel</p>
      <h1 className="cd-ad-title mt-2">Import du catalogue initial</h1>
      <p className="cd-ad-sub mt-4">
        Outil temporaire à usage unique pour importer les 39 produits préparés (photos, pointures,
        prix). Vérifiez l&apos;aperçu ci-dessous avant de lancer l&apos;import — l&apos;opération
        écrit directement dans la base de données et le stockage de photos.
      </p>
      <div className="mt-7">
        <ImportCatalogueClient />
      </div>
    </div>
  );
}
