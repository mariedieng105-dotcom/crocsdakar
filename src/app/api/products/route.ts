import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeProduct } from "@/lib/serialize";
import type { Prisma } from "@prisma/client";
import { familyOf, isFamilyKey } from "@/lib/families";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const model = searchParams.get("model")?.trim();
  const size = searchParams.get("size")?.trim();
  const sort = searchParams.get("sort") || "newest";
  const familyParam = searchParams.get("famille");
  const onlyAvailable = searchParams.get("available") !== "false";

  const where: Prisma.ProductWhereInput = {};

  if (onlyAvailable) {
    where.available = true;
  }

  // « classic bleu » doit trouver « Crocs Classic — Bleu marine » : chaque mot
  // saisi doit apparaître dans le nom ou dans le modèle, sans obliger le
  // visiteur à taper le libellé exact.
  if (q) {
    where.AND = q
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => ({
        OR: [
          { name: { contains: word, mode: "insensitive" as const } },
          { model: { contains: word, mode: "insensitive" as const } },
        ],
      }));
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

  // Sans ce filet, une base injoignable renvoie au visiteur le message brut de
  // Prisma, qui cite l'hôte et le port du serveur de base de données.
  let products;
  try {
    products = await prisma.product.findMany({
      where,
      orderBy,
      include: { images: true, sizes: true },
    });
  } catch (err) {
    console.error("GET /api/products", err);
    return NextResponse.json(
      { error: "Le catalogue est momentanément indisponible. Réessayez dans un instant." },
      { status: 503 }
    );
  }

  // La famille se déduit de l'identifiant du produit et n'existe donc pas en
  // base : le filtrage se fait après la requête, sur un catalogue de quelques
  // dizaines de références.
  const filtered = isFamilyKey(familyParam)
    ? products.filter((p) => familyOf(p.slug) === familyParam)
    : products;

  return NextResponse.json({ products: filtered.map(serializeProduct) });
}
