import { z } from "zod";

// Un prix vide, null ou une chaîne vide signifie "prix à confirmer" (le produit
// reste visible mais non commandable tant qu'un prix n'est pas renseigné).
export const priceInputSchema = z.preprocess(
  (val) => (val === "" || val === null || val === undefined ? null : val),
  z.union([z.coerce.number().int().positive("Le prix doit être positif."), z.null()])
);

export const productInputSchema = z.object({
  name: z.string().trim().min(1, "Le nom est requis."),
  model: z.string().trim().min(1, "Le modèle est requis."),
  price: priceInputSchema,
  description: z.string().trim().default(""),
  available: z.coerce.boolean().default(true),
  quantity: z.coerce.number().int().nonnegative().nullable().optional(),
  sizes: z.array(z.string().trim().min(1)).default([]),
});

export const orderItemInputSchema = z.object({
  productId: z.string().min(1),
  size: z.string().min(1),
  quantity: z.coerce.number().int().positive(),
});

export const orderInputSchema = z.object({
  customerName: z.string().trim().min(2, "Le nom complet est requis."),
  phone: z.string().trim().min(6, "Le numéro de téléphone est requis."),
  address: z.string().trim().min(3, "L'adresse est requise."),
  zone: z.string().trim().optional(),
  notes: z.string().trim().optional(),
  items: z.array(orderItemInputSchema).min(1, "Le panier est vide."),
});

export const orderUpdateSchema = z.object({
  status: z.enum(["NOUVELLE", "CONFIRMEE", "EN_PREPARATION", "LIVREE", "ANNULEE"]).optional(),
  deliveryFee: z.coerce.number().int().nonnegative().nullable().optional(),
});

export function slugify(input: string): string {
  return input
    .toString()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}
