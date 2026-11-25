/** "2026-12-24" -> "24/12". Meio-dia evita virar o dia por fuso. */
export function shortDate(iso: string): string {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

/** Campo de formulário: texto aparado e limitado. */
export const clean = (v: FormDataEntryValue | null, max = 500): string =>
  String(v ?? "").trim().slice(0, max);

export type WishItem = { name: string; link: string | null };

const URL_IN_TEXT = /(?:https?:\/\/|www\.)\S+/i;
const MAX_LINK = 2000;

/**
 * Link de loja utilizável (só http/https) ou null. Aceita sem "https://" e também o texto
 * que os apps compartilham ("Olha isso: https://…").
 */
export function normalizeLink(raw: string): string | null {
  const text = raw.trim();
  const found = text.match(URL_IN_TEXT)?.[0].replace(/[.,;!]+$/, "") ?? text;
  if (!found || /\s/.test(found)) return null;
  try {
    const url = new URL(/^https?:\/\//i.test(found) ? found : `https://${found}`);
    if (!url.hostname.includes(".") || url.username || url.password) return null;
    return url.href.length <= MAX_LINK ? url.href : null;
  } catch {
    return null;
  }
}

/** "https://www.amazon.com.br/dp/1" -> "amazon.com.br" */
export const linkHost = (link: string): string => new URL(link).hostname.replace(/^www\./, "");

/** Cada linha é um item: "nome" ou "nome<TAB>link". */
function rawItems(text: string): { name: string; link: string }[] {
  return text
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((line) => {
      const tab = line.indexOf("\t");
      if (tab >= 0) return { name: line.slice(0, tab).trim(), link: line.slice(tab + 1).trim() };
      // Link colado junto com o nome: separa os dois.
      const pasted = line.match(URL_IN_TEXT)?.[0];
      const link = pasted ? normalizeLink(pasted) : null;
      if (!pasted || !link) return { name: line, link: "" };
      return { name: line.replace(pasted, "").replace(/[\s:–-]+$/, "").trim() || linkHost(link), link };
    });
}

/** Itens da lista de desejos. Link inválido nunca sai daqui. */
export function wishItems(text: string): WishItem[] {
  return rawItems(text).map(({ name, link }) => ({ name, link: normalizeLink(link) }));
}

/** Nome do primeiro item cujo link não dá para usar. */
export function itemWithBadLink(text: string): string | undefined {
  return rawItems(text).find(({ link }) => link && !normalizeLink(link))?.name;
}

export function wishText(items: { name: string; link: string | null }[]): string {
  const flat = (s: string) => s.replace(/\s+/g, " ").trim();
  return items.map(({ name, link }) => (link?.trim() ? `${flat(name)}\t${flat(link)}` : flat(name))).join("\n");
}

/** Resposta de quem marca que não tem nada a evitar. */
export const NO_DISLIKES = "Nada em especial";

/** A pessoa já disse o que quer e o que não quer ganhar? (exigido antes de revelar) */
export function listIsComplete(p: { wishlist: string; dislikes: string }): boolean {
  return wishItems(p.wishlist).length > 0 && p.dislikes.trim() !== "";
}
