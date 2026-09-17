import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSizeSchema = z.object({
  label: z.string().trim().min(1).optional(),
  available: z.coerce.boolean().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sizeId: string }> }
) {
  const { id, sizeId } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const parsed = updateSizeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides." }, { status: 400 });
  }

  const size = await prisma.productSize.findFirst({ where: { id: sizeId, productId: id } });
  if (!size) return NextResponse.json({ error: "Pointure introuvable." }, { status: 404 });

  const updated = await prisma.productSize.update({
    where: { id: sizeId },
    data: parsed.data,
  });

  return NextResponse.json({ size: updated });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; sizeId: string }> }
) {
  const { id, sizeId } = await params;

  const size = await prisma.productSize.findFirst({ where: { id: sizeId, productId: id } });
  if (!size) return NextResponse.json({ error: "Pointure introuvable." }, { status: 404 });

  await prisma.productSize.delete({ where: { id: sizeId } });
  return NextResponse.json({ ok: true });
}
