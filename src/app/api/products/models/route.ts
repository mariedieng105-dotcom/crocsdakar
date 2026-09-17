import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const rows = await prisma.product.findMany({
    where: { available: true },
    select: { model: true },
    distinct: ["model"],
    orderBy: { model: "asc" },
  });

  return NextResponse.json({ models: rows.map((r) => r.model) });
}
