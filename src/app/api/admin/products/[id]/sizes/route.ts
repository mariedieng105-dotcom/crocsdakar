import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const addSizeSchema = z.object({
  label: z.string().trim().min(1, "La pointure est requise."),
  available: z.coerce.boolean().default(true),
});

export async function POST(
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

  const parsed = addSizeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Données invalides." }, { status: 400 });
  }

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return NextResponse.json({ error: "Produit introuvable." }, { status: 404 });

  const existingSize = await prisma.productSize.findUnique({
    where: { productId_label: { productId: id, label: parsed.data.label } },
  });
  if (existingSize) {
    return NextResponse.json({ error: "Cette pointure existe déjà pour ce produit." }, { status: 409 });
  }

  const size = await prisma.productSize.create({
    data: { productId: id, label: parsed.data.label, available: parsed.data.available },
  });

  return NextResponse.json({ size }, { status: 201 });
}
