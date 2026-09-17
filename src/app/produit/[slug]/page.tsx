import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { serializeProduct } from "@/lib/serialize";
import { SHOP, formatFCFA } from "@/lib/shop";
import ProductGalleryAndActions from "@/components/ProductGalleryAndActions";

export const revalidate = 60;

async function getProduct(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { images: true, sizes: true },
  });
  return product ? serializeProduct(product) : null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Produit introuvable" };

  const title = `${product.name} — ${product.model} | Crocs à Dakar`;
  const description = `${product.name} (${product.model}) à ${formatFCFA(product.price)}. Disponible chez ${SHOP.storeName} à Dakar. Commandez en ligne, paiement à la livraison.`;

  return {
    title,
    description,
    alternates: { canonical: `/produit/${product.slug}` },
    openGraph: {
      title,
      description,
      images: product.images[0] ? [product.images[0].url] : undefined,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    model: product.model,
    description: product.description || product.name,
    image: product.images.map((i) => i.url),
    sku: product.id,
    offers: {
      "@type": "Offer",
      priceCurrency: "XOF",
      price: product.price,
      availability: product.available
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: `${SHOP.siteUrl}/produit/${product.slug}`,
      seller: {
        "@type": "Organization",
        name: SHOP.storeName,
      },
    },
  };

  return (
    <div className="container-shop py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductGalleryAndActions product={product} />
    </div>
  );
}
