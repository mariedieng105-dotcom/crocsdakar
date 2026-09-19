import fs from "node:fs";
import path from "node:path";

export type CatalogueSourceProduct = {
  id: string;
  name: string;
  model: string;
  price_fcfa: number | null;
  sizes: string[];
  notes: string;
  category: string;
  images: string[];
  currency: string;
  price_status: "confirme" | "a_confirmer";
  available_sizes_current: string[];
  stock_quantity: string;
  stock_quantity_by_size?: Record<string, number>;
};

/**
 * Produits dont les photos actuelles ne sont pas exploitables publiquement.
 * « Pins Crocs » n'est illustré que par des captures d'écran du fournisseur :
 * le produit est importé normalement mais masqué de la boutique, et il suffit
 * d'un clic sur « Visible » dans l'administration pour le réactiver une fois
 * de vraies photos disponibles.
 */
export const HIDDEN_ON_IMPORT_SLUGS = new Set<string>(["pins-crocs"]);

const CATALOGUE_DIR = path.join(process.cwd(), "catalogue-import");
const CATALOGUE_JSON_PATH = path.join(CATALOGUE_DIR, "products.json");

export function catalogueSourceExists(): boolean {
  return fs.existsSync(CATALOGUE_JSON_PATH);
}

export function loadCatalogueSource(): CatalogueSourceProduct[] {
  const raw = fs.readFileSync(CATALOGUE_JSON_PATH, "utf-8");
  return JSON.parse(raw) as CatalogueSourceProduct[];
}

export function readCatalogueImageFile(relativePath: string): Buffer {
  // relativePath est du type "products/classic-noir/01_xxx.jpg", tel que déclaré
  // dans products.json. On résout depuis catalogue-import/ et on refuse toute
  // tentative de sortir de ce dossier (sécurité).
  const resolved = path.normalize(path.join(CATALOGUE_DIR, relativePath));
  if (!resolved.startsWith(CATALOGUE_DIR)) {
    throw new Error(`Chemin d'image invalide: ${relativePath}`);
  }
  return fs.readFileSync(resolved);
}

/**
 * Règles métier validées avec le vendeur avant import :
 * - price = null si price_status = "a_confirmer" (jamais de prix inventé).
 * - Si stock_quantity_by_size est renseigné (cas Moana Maui / Moana Classic),
 *   seules les pointures listées dedans sont disponibles ; les autres pointures
 *   restent présentes mais indisponibles (réactivables depuis l'admin), et la
 *   quantité du produit est la somme des quantités par pointure.
 * - Sinon, toutes les pointures de `sizes` sont marquées disponibles telles quelles
 *   (les pointures déjà en rupture ont été retirées de cette liste en amont).
 * - Le nom et le modèle sont inversés par rapport au fichier source : voir
 *   ci-dessous.
 */
export function transformProduct(p: CatalogueSourceProduct) {
  const price = p.price_status === "a_confirmer" || p.price_fcfa == null ? null : p.price_fcfa;

  const stockBySize = p.stock_quantity_by_size;
  const sizes = p.sizes.map((label) => ({
    label,
    available: stockBySize ? Boolean(stockBySize[label]) : true,
  }));
  const quantity = stockBySize
    ? Object.values(stockBySize).reduce((sum, n) => sum + n, 0)
    : null;

  return { ...labelsFor(p), price, quantity, sizes };
}

/**
 * Le fichier source met la famille dans `name` (« Crocs Classic ») et la
 * déclinaison dans `model` (« Crocs Classic — Bleu marine »). Le site attend
 * l'inverse : `name` est le titre de la carte et de la fiche produit, `model`
 * s'affiche en petites capitales au-dessus. Sans cette inversion, quinze
 * produits s'afficheraient sous le même titre « Crocs Classic » et la couleur
 * ne serait lisible que dans la ligne secondaire, tronquée sur mobile.
 */
export function labelsFor(p: CatalogueSourceProduct): { name: string; model: string } {
  return { name: p.model, model: p.name };
}

/**
 * Nom du fichier tel qu'il est déposé sur Vercel Blob. Le nom d'origine de la
 * photo est conservé à dessein : c'est lui qui permet, lors d'une reprise
 * d'import, de reconnaître les photos déjà envoyées.
 */
export function blobPathFor(p: CatalogueSourceProduct, index: number, productId: string): string {
  const filename = p.images[index].split("/").pop() ?? `image-${index}.jpg`;
  return `produits/${productId}/${index}-${filename}`;
}

/**
 * Fragment recherché dans l'URL d'une photo déjà en base pour savoir si la
 * photo n° `index` du fichier source a déjà été envoyée. L'extension est
 * exclue : Vercel Blob insère un suffixe aléatoire juste avant elle.
 */
export function blobMarkerFor(p: CatalogueSourceProduct, index: number): string {
  const filename = p.images[index].split("/").pop() ?? `image-${index}.jpg`;
  return `/${index}-${filename.replace(/\.[^.]+$/, "")}`;
}

/**
 * Légende de chaque photo. Cas particulier "Pins Crocs" : les 20 photos
 * représentent 20 designs différents (et non 20 angles du même objet), donc on
 * l'indique explicitement dans la légende affichée sur la fiche produit. Pour
 * tous les autres produits, la légende par défaut est le nom du produit
 * (modifiable ensuite depuis l'admin, photo par photo).
 */
export function imageAltFor(p: CatalogueSourceProduct, index: number): string {
  const { name } = labelsFor(p);
  if (p.id === "pins-crocs") {
    return `${name} — Design ${index + 1}/${p.images.length}`;
  }
  return name;
}
