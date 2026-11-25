import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_TTL_MS, signSession, verifySession } from "./admin-token";

const COOKIE = "admin_session";

/** O admin só existe se ADMIN_PASSWORD estiver definida no servidor. */
export const adminPassword = () => process.env.ADMIN_PASSWORD || null;

export async function startSession() {
  const pw = adminPassword();
  if (!pw) throw new Error("ADMIN_PASSWORD não definida");
  (await cookies()).set(COOKIE, signSession(pw), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
}

export async function endSession() {
  (await cookies()).delete(COOKIE);
}

export async function isAdmin(): Promise<boolean> {
  // Lê o cookie antes de checar a senha: assim o Next trata a página como dinâmica
  // mesmo quando o build roda sem ADMIN_PASSWORD.
  const token = (await cookies()).get(COOKIE)?.value;
  const pw = adminPassword();
  return pw ? verifySession(token, pw) : false;
}

/** Use no começo de toda página e Server Action do admin. */
export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin");
}
