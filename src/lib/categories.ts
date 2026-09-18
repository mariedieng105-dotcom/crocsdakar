import type { ProductCategory } from "@prisma/client";

/**
 * Catégories commerciales du client. Le catalogue importé ne porte aucune
 * information femme / homme / enfant : les produits arrivent en A_CLASSER et
 * sont rangés à la main depuis l'administration. Tant qu'une catégorie est
 * vide, elle n'apparaît pas côté boutique.
 */

export const CATEGORY_VALUES = [
  "FEMME",
  "HOMME",
  "ENFANT",
  "ACCESSOIRES",
  "A_CLASSER",
] as const satisfies readonly ProductCategory[];

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  FEMME: "Femme",
  HOMME: "Homme",
  ENFANT: "Enfant",
  ACCESSOIRES: "Accessoires",
  A_CLASSER: "À classer",
};

/** Catégorie de travail : jamais proposée comme filtre au visiteur. */
export const UNCLASSIFIED: ProductCategory = "A_CLASSER";

/** Les catégories montrées au public, dans l'ordre de la maquette. */
export const PUBLIC_CATEGORIES: ProductCategory[] = [
  "FEMME",
  "HOMME",
  "ENFANT",
  "ACCESSOIRES",
];

/** Segment d'URL d'une catégorie : `/catalogue?categorie=femme`. */
export function categorySlug(category: ProductCategory): string {
  return CATEGORY_LABELS[category]
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function categoryFromSlug(slug: string | null | undefined): ProductCategory | null {
  if (!slug) return null;
  const wanted = slug.trim().toLowerCase();
  return (
    PUBLIC_CATEGORIES.find((category) => categorySlug(category) === wanted) ?? null
  );
}

export function categoryLabel(category: ProductCategory): string {
  return CATEGORY_LABELS[category];
}

export function isProductCategory(value: unknown): value is ProductCategory {
  return typeof value === "string" && (CATEGORY_VALUES as readonly string[]).includes(value);
}
