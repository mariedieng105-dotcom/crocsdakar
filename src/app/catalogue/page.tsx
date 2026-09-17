import { Suspense } from "react";
import type { Metadata } from "next";
import CatalogueClient from "@/components/CatalogueClient";

export const metadata: Metadata = {
  title: "Catalogue Crocs Dakar",
  description:
    "Parcourez tous les modèles de Crocs disponibles chez Diaby Store à Dakar : recherche, filtres par pointure, tri par prix.",
};

export default function CataloguePage() {
  return (
    <Suspense fallback={<div className="container-shop py-10">Chargement du catalogue...</div>}>
      <CatalogueClient />
    </Suspense>
  );
}
