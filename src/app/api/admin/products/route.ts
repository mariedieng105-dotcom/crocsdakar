import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeProduct } from "@/lib/serialize";
import { productInputSchema, slugify } from "@/lib/validation";

export async function GET() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { images: true, sizes: true },
  });
  return NextResponse.json({ products: products.map(serializeProduct) });
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const parsed = productInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Données invalides." }, { status: 400 });
  }

  const data = parsed.data;
  const baseSlug = slugify(`${data.name}-${data.model}`) || slugify(data.name) || "produit";

  let slug = baseSlug;
  let counter = 1;
  while (await prisma.product.findUnique({ where: { slug } })) {
    counter += 1;
    slug = `${baseSlug}-${counter}`;
  }

  const uniqueSizes = Array.from(new Set(data.sizes.map((s) => s.trim()).filter(Boolean)));

  const product = await prisma.product.create({
    data: {
      name: data.name,
      model: data.model,
      slug,
      price: data.price,
      description: data.description,
      available: data.available,
      quantity: data.quantity ?? null,
      sizes: {
        create: uniqueSizes.map((label) => ({ label, available: true })),
      },
    },
    include: { images: true, sizes: true },
  });

  return NextResponse.json({ product: serializeProduct(product) }, { status: 201 });
}
