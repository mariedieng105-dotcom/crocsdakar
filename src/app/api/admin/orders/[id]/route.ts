import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { orderUpdateSchema } from "@/lib/validation";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) return NextResponse.json({ error: "Commande introuvable." }, { status: 404 });
  return NextResponse.json({ order });
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

  const parsed = orderUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides." }, { status: 400 });
  }

  const existing = await prisma.order.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Commande introuvable." }, { status: 404 });

  const deliveryFee =
    parsed.data.deliveryFee !== undefined ? parsed.data.deliveryFee : existing.deliveryFee;
  const total = existing.subtotal + (deliveryFee ?? 0);

  const order = await prisma.order.update({
    where: { id },
    data: {
      status: parsed.data.status ?? existing.status,
      deliveryFee,
      total,
    },
    include: { items: true },
  });

  return NextResponse.json({ order });
}
