import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const key = (password: string) => createHash("sha256").update(`amigo-secreto-admin:${password}`).digest();
const mac = (exp: string, password: string) => createHmac("sha256", key(password)).update(exp).digest("base64url");

/** Cookie de sessão: "<expira em ms>.<assinatura>". Trocar a senha invalida todas as sessões. */
export function signSession(password: string, now = Date.now()): string {
  const exp = String(now + SESSION_TTL_MS);
  return `${exp}.${mac(exp, password)}`;
}

export function verifySession(token: string | undefined, password: string, now = Date.now()): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [exp, sig] = parts;
  if (!/^\d+$/.test(exp) || Number(exp) <= now) return false;
  const a = Buffer.from(sig);
  const b = Buffer.from(mac(exp, password));
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Comparação em tempo constante (compara os hashes, que têm tamanho fixo). */
export function passwordMatches(input: string, password: string): boolean {
  const a = createHash("sha256").update(input).digest();
  const b = createHash("sha256").update(password).digest();
  return timingSafeEqual(a, b);
}
