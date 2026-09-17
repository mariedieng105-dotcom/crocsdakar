import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeProduct } from "@/lib/serialize";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().trim().min(1).optional(),
  model: z.string().trim().min(1).optional(),
  price: z.coerce.number().int().positive().optional(),
  description: z.string().trim().optional(),
  available: z.coerce.boolean().optional(),
  quantity: z.coerce.number().int().nonnegative().nullable().optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { images: true, sizes: true },
  });
  if (!product) return NextResponse.json({ error: "Produit introuvable." }, { status: 404 });
  return NextResponse.json({ product: serializeProduct(product) });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Données invalides." }, { status: 400 });
  }

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Produit introuvable." }, { status: 404 });

  const product = await prisma.product.update({
    where: { id },
    data: parsed.data,
    include: { images: true, sizes: true },
  });

  return NextResponse.json({ product: serializeProduct(product) });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Produit introuvable." }, { status: 404 });

  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
