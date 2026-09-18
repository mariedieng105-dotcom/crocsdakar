import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

const SESSION_COOKIE = "cd_admin_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7; // 7 jours

function getSecretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET n'est pas défini dans les variables d'environnement.");
  }
  return new TextEncoder().encode(secret);
}

/** Variable d'environnement admin absente du serveur. */
export class AdminConfigMissingError extends Error {}

/**
 * ADMIN_PASSWORD_HASH est présent mais bcrypt ne sait pas le lire. Le cas
 * classique : le « $ » d'un hash bcrypt interprété par un shell au moment du
 * copier-coller, ce qui tronque la valeur. Les deux cas donnaient le même
 * message « configuration incomplète », impossible à distinguer côté client.
 */
export class AdminPasswordHashInvalidError extends Error {}

export async function verifyAdminCredentials(email: string, password: string): Promise<boolean> {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

  if (!adminEmail || !adminPasswordHash) {
    const missing = [
      !adminEmail ? "ADMIN_EMAIL" : null,
      !adminPasswordHash ? "ADMIN_PASSWORD_HASH" : null,
    ].filter(Boolean);
    throw new AdminConfigMissingError(`${missing.join(" et ")} manquant(s) côté serveur.`);
  }

  if (email.trim().toLowerCase() !== adminEmail.trim().toLowerCase()) {
    return false;
  }

  try {
    return await bcrypt.compare(password, adminPasswordHash);
  } catch (err) {
    throw new AdminPasswordHashInvalidError(
      `ADMIN_PASSWORD_HASH est présent mais illisible par bcrypt (${
        err instanceof Error ? err.message : "erreur inconnue"
      }).`
    );
  }
}

export async function createAdminSession(email: string) {
  const token = await new SignJWT({ email, role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getSecretKey());

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
}

export async function destroyAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getAdminSession(): Promise<{ email: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (payload.role !== "admin" || typeof payload.email !== "string") return null;
    return { email: payload.email };
  } catch {
    return null;
  }
}

export { SESSION_COOKIE };
