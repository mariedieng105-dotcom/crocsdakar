/** Pointure des produits qui n'en ont pas (accessoires, jibbitz). */
export const SINGLE_SIZE_LABEL = "Taille unique";

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  model: string;
  price: number;
  image: string | null;
  size: string;
  quantity: number;
};
