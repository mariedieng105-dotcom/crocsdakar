import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/prisma";

const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8 Mo
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const product = await prisma.product.findUnique({ where: { id }, include: { images: true } });
  if (!product) return NextResponse.json({ error: "Produit introuvable." }, { status: 404 });

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "Le stockage d'images (Vercel Blob) n'est pas configuré. Ajoutez BLOB_READ_WRITE_TOKEN." },
      { status: 500 }
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const alt = (formData.get("alt") as string) || product.name;

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Aucun fichier reçu." }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Format d'image non supporté (jpeg, png, webp, avif)." }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "Image trop volumineuse (max 8 Mo)." }, { status: 400 });
  }

  const blob = await put(`produits/${id}/${Date.now()}-${file.name}`, file, {
    access: "public",
    addRandomSuffix: true,
  });

  const isFirstImage = product.images.length === 0;

  const image = await prisma.productImage.create({
    data: {
      productId: id,
      url: blob.url,
      alt,
      position: product.images.length,
      isMain: isFirstImage,
    },
  });

  return NextResponse.json({ image }, { status: 201 });
}
