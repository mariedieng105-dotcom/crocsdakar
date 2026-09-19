import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import {
  catalogueSourceExists,
  loadCatalogueSource,
  readCatalogueImageFile,
  transformProduct,
  imageAltFor,
  HIDDEN_ON_IMPORT_SLUGS,
} from "@/lib/catalogue-import";

// 232 photos à envoyer peuvent dépasser la durée par défaut d'une fonction
// Vercel. On demande le maximum autorisé par le plan ; si la limite du plan
// est plus basse, Vercel l'applique quand même (pas d'erreur de config).
// L'import reste sûr en cas de coupure : il est idempotent (voir plus bas),
// un nouveau clic sur "Importer" reprend uniquement les produits restants.
export const maxDuration = 300;

/**
 * Route d'import ponctuel du catalogue initial. Protégée par l'authentification
 * admin existante (couverte par le middleware sur /api/admin/*). À supprimer
 * (ce fichier + src/lib/catalogue-import.ts + le dossier catalogue-import/)
 * une fois l'import confirmé réussi.
 *
 * GET  : vérification avant exécution, aucune écriture en base.
 * POST : exécute l'import. Idempotent : un produit dont le slug existe déjà
 *        en base est ignoré (jamais dupliqué), ce qui protège contre un
 *        double déclenchement accidentel.
 */

export async function GET() {
  if (!catalogueSourceExists()) {
    return NextResponse.json(
      { error: "Aucune donnée de catalogue trouvée (catalogue-import/products.json manquant)." },
      { status: 404 }
    );
  }

  const source = loadCatalogueSource();
  const existingSlugs = new Set(
    (await prisma.product.findMany({ where: { slug: { in: source.map((p) => p.id) } }, select: { slug: true } })).map(
      (p) => p.slug
    )
  );

  const alreadyImported = source.filter((p) => existingSlugs.has(p.id));
  const pendingImport = source.filter((p) => !existingSlugs.has(p.id));

  const totalImages = source.reduce((sum, p) => sum + p.images.length, 0);
  const totalSizes = source.reduce((sum, p) => sum + p.sizes.length, 0);

  return NextResponse.json({
    blobConfigured: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
    totalInSource: source.length,
    totalImagesInSource: totalImages,
    totalSizesInSource: totalSizes,
    alreadyImportedCount: alreadyImported.length,
    alreadyImported: alreadyImported.map((p) => ({ slug: p.id, name: p.name, model: p.model })),
    pendingImportCount: pendingImport.length,
    pendingImport: pendingImport.map((p) => {
      const t = transformProduct(p);
      return {
        slug: p.id,
        name: p.name,
        model: p.model,
        price: t.price,
        quantity: t.quantity,
        sizes: t.sizes,
        imagesCount: p.images.length,
      };
    }),
  });
}

export async function POST() {
  if (!catalogueSourceExists()) {
    return NextResponse.json(
      { error: "Aucune donnée de catalogue trouvée (catalogue-import/products.json manquant)." },
      { status: 404 }
    );
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "Le stockage d'images (Vercel Blob) n'est pas configuré. Ajoutez BLOB_READ_WRITE_TOKEN." },
      { status: 500 }
    );
  }

  const source = loadCatalogueSource();
  const existingSlugs = new Set(
    (await prisma.product.findMany({ where: { slug: { in: source.map((p) => p.id) } }, select: { slug: true } })).map(
      (p) => p.slug
    )
  );

  const pending = source.filter((p) => !existingSlugs.has(p.id));

  if (pending.length === 0) {
    return NextResponse.json(
      {
        error:
          "Le catalogue initial a déjà été importé (les 39 produits existent déjà en base). Aucune nouvelle importation n'a été effectuée.",
      },
      { status: 409 }
    );
  }

  const created: { slug: string; name: string; imagesUploaded: number; sizesCreated: number }[] = [];
  const errors: { slug: string; error: string }[] = [];

  for (const p of pending) {
    try {
      const t = transformProduct(p);

      const product = await prisma.product.create({
        data: {
          name: p.name,
          model: p.model,
          slug: p.id,
          price: t.price,
          description: p.notes || "",
          available: !HIDDEN_ON_IMPORT_SLUGS.has(p.id),
          quantity: t.quantity,
          sizes: { create: t.sizes },
        },
      });

      let imagesUploaded = 0;
      for (let i = 0; i < p.images.length; i++) {
        const relativePath = p.images[i];
        try {
          const buffer = readCatalogueImageFile(relativePath);
          const filename = relativePath.split("/").pop() ?? `image-${i}.jpg`;
          const blob = await put(`produits/${product.id}/${i}-${filename}`, buffer, {
            access: "public",
            addRandomSuffix: true,
            contentType: "image/jpeg",
          });
          await prisma.productImage.create({
            data: {
              productId: product.id,
              url: blob.url,
              alt: imageAltFor(p, i),
              position: i,
              isMain: i === 0,
            },
          });
          imagesUploaded += 1;
        } catch (imgErr) {
          errors.push({ slug: p.id, error: `Photo ${relativePath}: ${(imgErr as Error).message}` });
        }
      }

      created.push({ slug: p.id, name: p.name, imagesUploaded, sizesCreated: t.sizes.length });
    } catch (err) {
      errors.push({ slug: p.id, error: (err as Error).message });
    }
  }

  return NextResponse.json({
    productsCreated: created.length,
    productsSkippedAlreadyPresent: existingSlugs.size,
    imagesUploaded: created.reduce((sum, c) => sum + c.imagesUploaded, 0),
    sizesCreated: created.reduce((sum, c) => sum + c.sizesCreated, 0),
    created,
    errors,
  });
}
