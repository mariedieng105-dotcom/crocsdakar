import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  verifyAdminCredentials,
  createAdminSession,
  AdminConfigMissingError,
  AdminPasswordHashInvalidError,
} from "@/lib/auth";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Email ou mot de passe manquant." }, { status: 400 });
  }

  const { email, password } = parsed.data;

  let valid: boolean;
  try {
    valid = await verifyAdminCredentials(email, password);
  } catch (err) {
    console.error(err);
    if (err instanceof AdminPasswordHashInvalidError) {
      return NextResponse.json(
        {
          error:
            "Le mot de passe administrateur enregistré sur le serveur est illisible. Regénérez ADMIN_PASSWORD_HASH et collez-le entre guillemets simples.",
        },
        { status: 500 }
      );
    }
    if (err instanceof AdminConfigMissingError) {
      return NextResponse.json(
        { error: `Configuration serveur incomplète : ${err.message}` },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "Erreur serveur pendant la connexion." },
      { status: 500 }
    );
  }

  if (!valid) {
    return NextResponse.json({ error: "Identifiants incorrects." }, { status: 401 });
  }

  await createAdminSession(email);
  return NextResponse.json({ ok: true });
}
