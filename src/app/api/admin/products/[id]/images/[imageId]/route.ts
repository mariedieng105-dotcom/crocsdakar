import { NextRequest, NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateImageSchema = z.object({
  isMain: z.coerce.boolean().optional(),
  alt: z.string().trim().optional(),
  position: z.coerce.number().int().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  const { id, imageId } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const parsed = updateImageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides." }, { status: 400 });
  }

  const image = await prisma.productImage.findFirst({ where: { id: imageId, productId: id } });
  if (!image) return NextResponse.json({ error: "Image introuvable." }, { status: 404 });

  if (parsed.data.isMain) {
    await prisma.productImage.updateMany({ where: { productId: id }, data: { isMain: false } });
  }

  const updated = await prisma.productImage.update({
    where: { id: imageId },
    data: parsed.data,
  });

  return NextResponse.json({ image: updated });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  const { id, imageId } = await params;

  const image = await prisma.productImage.findFirst({ where: { id: imageId, productId: id } });
  if (!image) return NextResponse.json({ error: "Image introuvable." }, { status: 404 });

  await prisma.productImage.delete({ where: { id: imageId } });

  if (image.isMain) {
    const nextImage = await prisma.productImage.findFirst({
      where: { productId: id },
      orderBy: { position: "asc" },
    });
    if (nextImage) {
      await prisma.productImage.update({ where: { id: nextImage.id }, data: { isMain: true } });
    }
  }

  if (process.env.BLOB_READ_WRITE_TOKEN && image.url.includes("blob.vercel-storage.com")) {
    try {
      await del(image.url);
    } catch (err) {
      console.error("Suppression du blob échouée:", err);
    }
  }

  return NextResponse.json({ ok: true });
}
