/**
 * Familles de modèles, déduites des données réellement présentes au catalogue
 * (le nom de code du produit). Elles servent d'entrées de navigation sur la
 * page d'accueil et de filtre dans la boutique.
 *
 * À ne pas confondre avec les catégories commerciales du client
 * (Femme / Homme / Enfant / Accessoires) : celles-là demandent une information
 * que le catalogue ne contient pas, et sont saisies depuis l'administration.
 */

export type FamilyKey = "classiques" | "personnages" | "collaborations" | "sandales";

export type Family = {
  key: FamilyKey;
  label: string;
  tagline: string;
  /** Produit dont la photo principale illustre la famille. */
  cover: string;
};

export const FAMILIES: Family[] = [
  {
    key: "classiques",
    label: "Classiques",
    tagline: "Le modèle culte, toutes couleurs",
    cover: "classic-noir",
  },
  {
    key: "personnages",
    label: "Personnages",
    tagline: "Modèles sous licence",
    cover: "moana-maui",
  },
  {
    key: "collaborations",
    label: "Collaborations",
    tagline: "Séries limitées",
    cover: "bape-marron",
  },
  {
    key: "sandales",
    label: "Sandales & accessoires",
    tagline: "Claquettes et jibbitz",
    cover: "saturday-blanc",
  },
];

/** Famille d'un produit, d'après son identifiant de catalogue. */
export function familyOf(slug: string): FamilyKey {
  if (slug.startsWith("classic")) return "classiques";
  if (slug.startsWith("bape")) return "collaborations";
  if (slug.startsWith("saturday") || slug === "pins-crocs") return "sandales";
  return "personnages";
}

export function isFamilyKey(value: string | null | undefined): value is FamilyKey {
  return FAMILIES.some((f) => f.key === value);
}

export function familyLabel(key: FamilyKey): string {
  return FAMILIES.find((f) => f.key === key)?.label ?? key;
}
