import type { Product, ProductImage, ProductSize } from "@prisma/client";

export type ProductWithRelations = Product & {
  images: ProductImage[];
  sizes: ProductSize[];
};

export function serializeProduct(product: ProductWithRelations) {
  return {
    id: product.id,
    name: product.name,
    model: product.model,
    slug: product.slug,
    price: product.price,
    description: product.description,
    category: product.category,
    available: product.available,
    quantity: product.quantity,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    images: [...product.images]
      .sort((a, b) => (b.isMain ? 1 : 0) - (a.isMain ? 1 : 0) || a.position - b.position)
      .map((img) => ({ id: img.id, url: img.url, alt: img.alt, isMain: img.isMain, position: img.position })),
    sizes: [...product.sizes]
      .sort((a, b) => a.label.localeCompare(b.label, "fr", { numeric: true }))
      .map((s) => ({ id: s.id, label: s.label, available: s.available })),
  };
}

export type SerializedProduct = ReturnType<typeof serializeProduct>;
