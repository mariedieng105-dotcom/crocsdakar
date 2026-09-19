import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import {
  catalogueSourceExists,
  loadCatalogueSource,
  readCatalogueImageFile,
  transformProduct,
  imageAltFor,
  blobMarkerFor,
  blobPathFor,
  HIDDEN_ON_IMPORT_SLUGS,
  type CatalogueSourceProduct,
} from "@/lib/catalogue-import";

// 232 photos à envoyer dépassent largement la durée d'une seule requête. On
// demande le maximum autorisé par le plan Vercel, et surtout on s'arrête
// nous-mêmes avant la coupure (TIME_BUDGET_MS) pour répondre proprement avec
// ce qui reste à faire, plutôt que de laisser la plateforme tuer la fonction.
export const maxDuration = 300;

/** Marge prise avant la coupure de la plateforme : on rend la main avant. */
const TIME_BUDGET_MS = 45_000;

/**
 * Route d'import ponctuel du catalogue initial. Protégée par l'authentification
 * admin existante (couverte par le proxy sur /api/admin/*). À supprimer
 * (ce fichier + src/lib/catalogue-import.ts + le dossier catalogue-import/)
 * une fois l'import confirmé réussi.
 *
 * GET  : vérification avant exécution, aucune écriture en base.
 * POST : exécute l'import, par tranches, et reprend là où il s'est arrêté.
 *
 * Reprise et idempotence. L'import ne supprime jamais rien et ne réécrit
 * jamais une donnée existante :
 * - un produit dont le slug est déjà en base n'est jamais recréé ;
 * - une pointure déjà enregistrée n'est jamais dupliquée (contrainte
 *   d'unicité productId + label, écriture en skipDuplicates) ;
 * - une photo est reconnue à son nom de fichier d'origine, conservé dans
 *   l'URL du Blob : seules les photos absentes sont envoyées.
 * Un produit créé lors d'une exécution interrompue avant la fin de ses photos
 * est donc complété à l'exécution suivante, et non ignoré.
 */

type ProductState = {
  id: string;
  imageUrls: string[];
  sizeLabels: Set<string>;
};

async function loadState(source: CatalogueSourceProduct[]): Promise<Map<string, ProductState>> {
  const rows = await prisma.product.findMany({
    where: { slug: { in: source.map((p) => p.id) } },
    select: {
      id: true,
      slug: true,
      images: { select: { url: true } },
      sizes: { select: { label: true } },
    },
  });

  return new Map(
    rows.map((row) => [
      row.slug,
      {
        id: row.id,
        imageUrls: row.images.map((i) => i.url),
        sizeLabels: new Set(row.sizes.map((s) => s.label)),
      },
    ])
  );
}

/** Indices des photos du fichier source qui ne sont pas encore en base. */
function missingImageIndexes(p: CatalogueSourceProduct, state: ProductState | undefined): number[] {
  const urls = state?.imageUrls ?? [];
  const missing: number[] = [];
  for (let i = 0; i < p.images.length; i++) {
    const marker = blobMarkerFor(p, i);
    if (!urls.some((url) => url.includes(marker))) missing.push(i);
  }
  return missing;
}

/**
 * Identité de la base visée, sans aucun secret : seuls le serveur et le nom de
 * la base sont extraits de la chaîne de connexion, jamais l'utilisateur ni le
 * mot de passe. C'est ce qui permet de vérifier, depuis le site déployé, que
 * l'aperçu écrit bien dans la branche Neon d'aperçu et non en production : le
 * serveur affiché (`ep-...`) est celui que Neon indique pour chaque branche.
 *
 * DATABASE_URL sert aux écritures du site, DIRECT_URL aux migrations lancées
 * pendant le build : les deux doivent désigner la même base, sinon un
 * déploiement d'aperçu migrerait la base de production.
 */
function describeConnection(raw: string | undefined) {
  if (!raw) return null;
  try {
    const url = new URL(raw);
    return {
      host: url.hostname,
      database: url.pathname.replace(/^\//, "") || null,
      pooled: url.hostname.includes("-pooler"),
    };
  } catch {
    return { host: null, database: null, pooled: false };
  }
}

/**
 * Deux chaînes visent la même base si le nom de base et le serveur coïncident,
 * le suffixe « -pooler » près : Neon expose la même branche derrière deux
 * points d'entrée, l'un mis en file d'attente et l'autre direct.
 */
function sameDatabase(
  a: ReturnType<typeof describeConnection>,
  b: ReturnType<typeof describeConnection>
): boolean | null {
  if (!a || !b || !a.host || !b.host) return null;
  return a.database === b.database && a.host.replace("-pooler", "") === b.host.replace("-pooler", "");
}

export async function GET() {
  if (!catalogueSourceExists()) {
    return NextResponse.json(
      { error: "Aucune donnée de catalogue trouvée (catalogue-import/products.json manquant)." },
      { status: 404 }
    );
  }

  const source = loadCatalogueSource();
  const state = await loadState(source);
  const productsInDatabase = await prisma.product.count();

  const runtime = describeConnection(process.env.DATABASE_URL);
  const migrations = describeConnection(process.env.DIRECT_URL);

  const rows = source.map((p) => {
    const current = state.get(p.id);
    const t = transformProduct(p);
    const missingImages = missingImageIndexes(p, current);
    const missingSizes = t.sizes.filter((s) => !current?.sizeLabels.has(s.label));
    return {
      slug: p.id,
      name: t.name,
      model: t.model,
      price: t.price,
      quantity: t.quantity,
      sizes: t.sizes,
      imagesCount: p.images.length,
      imagesPresent: p.images.length - missingImages.length,
      missingImages: missingImages.length,
      missingSizes: missingSizes.length,
      status: !current
        ? ("absent" as const)
        : missingImages.length > 0 || missingSizes.length > 0
          ? ("partiel" as const)
          : ("complet" as const),
    };
  });

  const todo = rows.filter((r) => r.status !== "complet");

  return NextResponse.json({
    database: {
      runtime,
      migrations,
      sameTarget: sameDatabase(runtime, migrations),
      productsInDatabase,
    },
    blobConfigured: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
    totalInSource: source.length,
    totalImagesInSource: source.reduce((sum, p) => sum + p.images.length, 0),
    totalSizesInSource: source.reduce((sum, p) => sum + p.sizes.length, 0),
    alreadyImportedCount: rows.filter((r) => r.status === "complet").length,
    partialCount: rows.filter((r) => r.status === "partiel").length,
    pendingImportCount: todo.length,
    remainingImages: rows.reduce((sum, r) => sum + r.missingImages, 0),
    products: rows,
    pendingImport: todo,
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

  const startedAt = Date.now();
  const source = loadCatalogueSource();
  const state = await loadState(source);

  const todo = source.filter((p) => {
    const current = state.get(p.id);
    if (!current) return true;
    if (missingImageIndexes(p, current).length > 0) return true;
    return transformProduct(p).sizes.some((s) => !current.sizeLabels.has(s.label));
  });

  if (todo.length === 0) {
    return NextResponse.json(
      {
        error:
          "Le catalogue initial est déjà entièrement importé (produits, pointures et photos). Aucune nouvelle importation n'a été effectuée.",
      },
      { status: 409 }
    );
  }

  const created: string[] = [];
  const completed: { slug: string; imagesUploaded: number; sizesCreated: number }[] = [];
  const errors: { slug: string; error: string }[] = [];
  let processed = 0;
  let imagesUploaded = 0;
  let sizesCreated = 0;

  for (const p of todo) {
    // Toujours traiter au moins un produit : sinon, une base lente suffirait à
    // épuiser le budget avant la première écriture et l'import n'avancerait
    // jamais, tranche après tranche.
    if (processed > 0 && Date.now() - startedAt > TIME_BUDGET_MS) break;

    try {
      const t = transformProduct(p);
      let current = state.get(p.id);
      let sizesForProduct = 0;

      if (!current) {
        const product = await prisma.product.create({
          data: {
            name: t.name,
            model: t.model,
            slug: p.id,
            price: t.price,
            description: p.notes || "",
            available: !HIDDEN_ON_IMPORT_SLUGS.has(p.id),
            quantity: t.quantity,
            sizes: { create: t.sizes },
          },
        });
        current = { id: product.id, imageUrls: [], sizeLabels: new Set(t.sizes.map((s) => s.label)) };
        state.set(p.id, current);
        created.push(p.id);
        sizesForProduct = t.sizes.length;
      } else {
        // Produit créé lors d'une exécution précédente : on complète ce qui
        // manque, sans jamais toucher à ce qui est déjà enregistré.
        const missing = t.sizes.filter((s) => !current!.sizeLabels.has(s.label));
        if (missing.length > 0) {
          const res = await prisma.productSize.createMany({
            data: missing.map((s) => ({ productId: current!.id, label: s.label, available: s.available })),
            skipDuplicates: true,
          });
          missing.forEach((s) => current!.sizeLabels.add(s.label));
          sizesForProduct = res.count;
        }
      }

      let uploadedForProduct = 0;
      for (const i of missingImageIndexes(p, current)) {
        const relativePath = p.images[i];
        try {
          const buffer = readCatalogueImageFile(relativePath);
          const blob = await put(blobPathFor(p, i, current.id), buffer, {
            access: "public",
            addRandomSuffix: true,
            contentType: "image/jpeg",
          });
          await prisma.productImage.create({
            data: {
              productId: current.id,
              url: blob.url,
              alt: imageAltFor(p, i),
              position: i,
              isMain: i === 0,
            },
          });
          current.imageUrls.push(blob.url);
          uploadedForProduct += 1;
          imagesUploaded += 1;
        } catch (imgErr) {
          errors.push({ slug: p.id, error: `Photo ${relativePath}: ${(imgErr as Error).message}` });
        }
      }

      processed += 1;
      sizesCreated += sizesForProduct;
      completed.push({ slug: p.id, imagesUploaded: uploadedForProduct, sizesCreated: sizesForProduct });
    } catch (err) {
      errors.push({ slug: p.id, error: (err as Error).message });
      processed += 1;
    }
  }

  const remainingProducts = todo.length - processed;

  return NextResponse.json({
    productsCreated: created.length,
    productsCompleted: completed.length,
    imagesUploaded,
    sizesCreated,
    remainingProducts,
    done: remainingProducts === 0,
    created: completed,
    errors,
  });
}
