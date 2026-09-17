// Genere un hash bcrypt a partir d'un mot de passe en clair.
// Usage : node scripts/hash-password.js "MonMotDePasse"
const bcrypt = require("bcryptjs");

const password = process.argv[2];

if (!password) {
  console.error("Usage : node scripts/hash-password.js \"MonMotDePasse\"");
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 10);
// Next.js developpe les $ dans les fichiers .env (comme des variables shell : $2b devient "").
// Il faut donc echapper chaque $ par \$ UNIQUEMENT dans le fichier .env local.
const escapedForDotEnv = hash.replace(/\$/g, "\\$");

console.log("\nDans un fichier .env local (obligatoire d'echapper les $) :\n");
console.log(`ADMIN_PASSWORD_HASH="${escapedForDotEnv}"\n`);
console.log("Dans les variables d'environnement Vercel / hebergeur (ne PAS echapper les $) :\n");
console.log(`ADMIN_PASSWORD_HASH=${hash}\n`);
