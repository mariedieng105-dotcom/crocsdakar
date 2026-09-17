# CrocsDakar — Diaby Store

Boutique en ligne de Crocs à Dakar, Sénégal. Catalogue dynamique et
administrable, panier, commande avec paiement à la livraison et finalisation
sur WhatsApp.

## Stack technique

- **Next.js 16** (App Router, TypeScript) — frontend + API (routes `/api/*`)
- **PostgreSQL + Prisma** — base de données (produits, photos, pointures, commandes)
- **Vercel Blob** — stockage des photos produits
- **Authentification maison** (cookie signé JWT via `jose`, mot de passe hashé
  avec `bcryptjs`) — pas de service tiers, juste des variables d'environnement
- **Tailwind CSS v4** — mise en page responsive
- **localStorage** — panier côté client

Tout le catalogue (produits, photos, pointures) et les commandes sont stockés
en base de données et gérés depuis `/admin`. Rien n'est codé en dur : ajouter,
modifier ou supprimer un produit ne nécessite aucune modification de code.

## Démarrage local

```bash
npm install
cp .env.example .env   # puis complétez les variables (voir plus bas)
npx prisma migrate dev # crée les tables en base
npm run dev
```

Le site est alors disponible sur http://localhost:3000, l'administration sur
http://localhost:3000/admin/login.

### Générer le mot de passe administrateur

```bash
node scripts/hash-password.js "VotreMotDePasse"
```

Le script affiche deux versions du hash : une pour un fichier `.env` local
(avec les `$` échappés en `\$`, requis par le chargeur d'environnement de
Next.js) et une pour les variables d'environnement Vercel (sans échappement).

## Variables d'environnement

| Variable | Description |
|---|---|
| `DATABASE_URL` | URL de connexion PostgreSQL |
| `ADMIN_EMAIL` | Email de connexion à l'administration |
| `ADMIN_PASSWORD_HASH` | Hash bcrypt du mot de passe admin (jamais en clair) |
| `AUTH_SECRET` | Chaîne aléatoire longue, signe les sessions admin (`openssl rand -base64 48`) |
| `BLOB_READ_WRITE_TOKEN` | Jeton Vercel Blob pour l'upload des photos produits |
| `NEXT_PUBLIC_SITE_URL` | URL publique du site (utilisée pour le SEO, sitemap, Open Graph) |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Numéro WhatsApp de la boutique (format international sans +) |

Voir `.env.example` pour le détail.

## Où sont stockées les données ?

- **Produits, photos (métadonnées), pointures, commandes** : base de données
  PostgreSQL, via Prisma (`prisma/schema.prisma`).
- **Fichiers image** : Vercel Blob (stockage objet, URL publique renvoyée et
  enregistrée en base).

## Comment le vendeur gère la boutique

1. Se connecter sur `/admin/login` avec l'email et le mot de passe définis
   dans les variables d'environnement.
2. **Ajouter un produit** : `Produits` → `Ajouter un produit`, remplir nom,
   modèle, prix, description, pointures initiales. Après la création, la page
   du produit permet d'ajouter des photos (plusieurs vues) et de gérer les
   pointures.
3. **Modifier une pointure** : sur la fiche produit (`/admin/produits/[id]`),
   section « Pointures » → bouton `Désactiver` / `Activer` pour rendre une
   pointure indisponible sans la supprimer, ou `Ajouter` pour une nouvelle
   pointure.
4. **Supprimer un produit** : bouton « Supprimer ce produit » sur sa fiche, ou
   depuis la liste des produits.
5. **Gérer une commande** : `Commandes` → cliquer sur une commande pour
   l'ouvrir, définir les frais de livraison (le total se recalcule
   automatiquement) et changer le statut (Nouvelle, Confirmée, En
   préparation, Livrée, Annulée).

## Déploiement (Vercel)

1. **Créer une base PostgreSQL gratuite** sur [Neon](https://neon.tech) ou
   [Supabase](https://supabase.com) et récupérer l'URL de connexion.
2. **Créer un projet Vercel** à partir de ce dépôt GitHub
   (https://vercel.com/new).
3. Dans les réglages du projet Vercel → **Storage** → créer un **Blob
   Store** : cela ajoute automatiquement `BLOB_READ_WRITE_TOKEN` aux
   variables d'environnement du projet.
4. Ajouter les autres variables d'environnement dans **Settings →
   Environment Variables** :
   - `DATABASE_URL` (fournie par Neon/Supabase)
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD_HASH` (généré avec `scripts/hash-password.js`, version
     **sans** `\$`)
   - `AUTH_SECRET`
   - `NEXT_PUBLIC_SITE_URL` (l'URL de votre déploiement, ex.
     `https://crocsdakar.vercel.app`)
   - `NEXT_PUBLIC_WHATSAPP_NUMBER`
5. Appliquer les migrations sur la base de production, en local :
   ```bash
   DATABASE_URL="<url-de-production>" npx prisma migrate deploy
   ```
6. Déployer (Vercel construit automatiquement avec `npm run build`, et
   `postinstall` lance `prisma generate`).
7. Ouvrir `https://votre-domaine.vercel.app/admin/login` et ajouter vos
   premiers produits (avec leurs vraies photos).

## Logo et photos produits

Le logo fourni n'a pas pu être récupéré automatiquement dans ce dépôt
(fichier image non transmis en tant que fichier). Un espace réservé se
trouve dans `public/images/logo-placeholder.svg` ; voir
`public/images/LISEZ-MOI.txt` pour les instructions de remplacement par le
vrai logo. Il en va de même pour les photos produits : le catalogue démarre
vide et se remplit entièrement depuis `/admin`.

## SEO

- `sitemap.xml` et `robots.txt` générés dynamiquement (`src/app/sitemap.ts`,
  `src/app/robots.ts`), incluent automatiquement chaque produit disponible.
- Métadonnées (title, description, Open Graph) par page, y compris par fiche
  produit.
- Données structurées JSON-LD : `ShoeStore` (organisation, coordonnées,
  réseaux sociaux) sur tout le site, `Product` sur chaque fiche produit.
- `/admin` est exclu de l'indexation (`robots: noindex`) et du sitemap.

Le site est techniquement prêt pour le référencement, mais aucun outil ne
peut garantir un classement ou une position précise sur Google.
