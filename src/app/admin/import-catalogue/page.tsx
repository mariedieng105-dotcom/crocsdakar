import ImportCatalogueClient from "@/components/admin/ImportCatalogueClient";

export default function ImportCataloguePage() {
  return (
    <div>
      <h1 className="font-display font-bold text-2xl text-[var(--color-navy)] mb-2">
        Import du catalogue initial
      </h1>
      <p className="text-sm text-[var(--color-navy)]/60 mb-6">
        Outil temporaire à usage unique pour importer les 39 produits préparés (photos, pointures,
        prix). Vérifiez l&apos;aperçu ci-dessous avant de lancer l&apos;import — l&apos;opération
        écrit directement dans la base de données et le stockage de photos en production.
      </p>
      <ImportCatalogueClient />
    </div>
  );
}
