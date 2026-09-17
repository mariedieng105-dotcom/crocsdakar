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
      <h1 className="font-display font-bold text-2xl text-[var(--color-navy)] mb-6">Modifier le produit</h1>
      <ProductEditor initialProduct={serializeProduct(product)} />
    </div>
  );
}
