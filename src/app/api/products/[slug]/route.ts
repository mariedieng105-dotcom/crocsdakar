import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeProduct } from "@/lib/serialize";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: { images: true, sizes: true },
  });

  if (!product) {
    return NextResponse.json({ error: "Produit introuvable." }, { status: 404 });
  }

  return NextResponse.json({ product: serializeProduct(product) });
}
