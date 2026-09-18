import { Suspense } from "react";
import type { Metadata } from "next";
import CatalogueClient from "@/components/CatalogueClient";

export const metadata: Metadata = {
  title: "Boutique — tous les modèles",
  description:
    "Parcourez tous les modèles de Crocs disponibles chez Diaby Store à Dakar : recherche, filtres par pointure, tri par prix.",
};

export default function CataloguePage() {
  return (
    <Suspense
      fallback={
        <div className="cd-container py-16 cd-eyebrow text-[var(--cd-ink-faint)]">
          Chargement de la boutique…
        </div>
      }
    >
      <CatalogueClient />
    </Suspense>
  );
}
