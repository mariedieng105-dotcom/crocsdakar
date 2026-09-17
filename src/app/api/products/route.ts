import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeProduct } from "@/lib/serialize";
import type { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const model = searchParams.get("model")?.trim();
  const size = searchParams.get("size")?.trim();
  const sort = searchParams.get("sort") || "newest";
  const onlyAvailable = searchParams.get("available") !== "false";

  const where: Prisma.ProductWhereInput = {};

  if (onlyAvailable) {
    where.available = true;
  }

  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { model: { contains: q, mode: "insensitive" } },
    ];
  }

  if (model) {
    where.model = { equals: model, mode: "insensitive" };
  }

  if (size) {
    where.sizes = { some: { label: size, available: true } };
  }

  // Les produits sans prix confirmé (price = null) sont toujours relégués en fin
  // de liste lors d'un tri par prix, quel que soit le sens du tri.
  let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };
  if (sort === "price_asc") orderBy = { price: { sort: "asc", nulls: "last" } };
  else if (sort === "price_desc") orderBy = { price: { sort: "desc", nulls: "last" } };
  else if (sort === "newest") orderBy = { createdAt: "desc" };

  const products = await prisma.product.findMany({
    where,
    orderBy,
    include: { images: true, sizes: true },
  });

  return NextResponse.json({ products: products.map(serializeProduct) });
}
