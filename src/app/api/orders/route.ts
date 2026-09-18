import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { orderInputSchema } from "@/lib/validation";
import { SINGLE_SIZE_LABEL } from "@/lib/cart-types";

function generateOrderNumber(): string {
  const date = new Date();
  const y = date.getFullYear().toString().slice(-2);
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `CD-${y}${m}${d}-${rand}`;
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const parsed = orderInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Données invalides." }, { status: 400 });
  }

  const { customerName, phone, address, zone, notes, items } = parsed.data;

  const productIds = Array.from(new Set(items.map((i) => i.productId)));

  // Une base injoignable renverrait sinon au client le message brut de Prisma,
  // qui cite l'hôte et le port du serveur de base de données.
  let products;
  try {
    products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: { sizes: true },
    });
  } catch (err) {
    console.error("POST /api/orders (lecture produits)", err);
    return NextResponse.json(
      { error: "Commande impossible pour le moment. Réessayez dans un instant." },
      { status: 503 }
    );
  }

  const productMap = new Map(products.map((p) => [p.id, p]));

  const orderItemsData: {
    productId: string;
    productName: string;
    model: string;
    size: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }[] = [];

  for (const item of items) {
    const product = productMap.get(item.productId);
    if (!product) {
      return NextResponse.json({ error: "Un des produits du panier n'existe plus." }, { status: 400 });
    }
    if (!product.available) {
      return NextResponse.json({ error: `Le produit "${product.name}" n'est plus disponible.` }, { status: 400 });
    }
    // Un produit sans aucune pointure déclarée est un accessoire : il se commande
    // en taille unique. Pour tous les autres, la pointure doit exister et être
    // disponible.
    if (product.sizes.length === 0) {
      if (item.size !== SINGLE_SIZE_LABEL) {
        return NextResponse.json(
          { error: `"${product.name}" se commande en ${SINGLE_SIZE_LABEL.toLowerCase()}.` },
          { status: 400 }
        );
      }
    } else {
      const size = product.sizes.find((s) => s.label === item.size);
      if (!size || !size.available) {
        return NextResponse.json(
          { error: `La pointure ${item.size} n'est plus disponible pour "${product.name}".` },
          { status: 400 }
        );
      }
    }

    if (product.price === null) {
      return NextResponse.json(
        { error: `Le prix de "${product.name}" n'est pas encore confirmé, cette commande ne peut pas être passée.` },
        { status: 400 }
      );
    }

    const lineTotal = product.price * item.quantity;
    orderItemsData.push({
      productId: product.id,
      productName: product.name,
      model: product.model,
      size: item.size,
      quantity: item.quantity,
      unitPrice: product.price,
      lineTotal,
    });
  }

  const subtotal = orderItemsData.reduce((sum, i) => sum + i.lineTotal, 0);

  // Après cinq tirages, un numéro déjà pris ferait échouer la création sur la
  // contrainte d'unicité : le message d'erreur reste alors lisible pour le
  // client, et la commande n'est simplement pas enregistrée.
  let order;
  try {
    let orderNumber = generateOrderNumber();
    for (let attempts = 0; attempts < 5; attempts++) {
      const existing = await prisma.order.findUnique({ where: { orderNumber } });
      if (!existing) break;
      orderNumber = generateOrderNumber();
    }

    order = await prisma.order.create({
      data: {
        orderNumber,
        customerName,
        phone,
        address,
        zone: zone || null,
        notes: notes || null,
        subtotal,
        deliveryFee: null,
        total: subtotal,
        items: { create: orderItemsData },
      },
      include: { items: true },
    });
  } catch (err) {
    console.error("POST /api/orders (création)", err);
    return NextResponse.json(
      { error: "Votre commande n'a pas pu être enregistrée. Réessayez dans un instant." },
      { status: 503 }
    );
  }

  return NextResponse.json({ order }, { status: 201 });
}
