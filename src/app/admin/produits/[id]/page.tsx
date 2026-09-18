import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { serializeProduct } from "@/lib/serialize";
import ProductEditor from "@/components/admin/ProductEditor";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { images: true, sizes: true },
  });

  if (!product) notFound();

  return (
    <div>
      <Link href="/admin/produits" className="cd-ad-link">
        ← Retour aux produits
      </Link>
      <p className="cd-eyebrow text-[var(--cd-gold-700)] mt-4">{product.model}</p>
      <h1 className="cd-ad-title mt-2 mb-7">{product.name}</h1>
      <ProductEditor initialProduct={serializeProduct(product)} />
    </div>
  );
}
