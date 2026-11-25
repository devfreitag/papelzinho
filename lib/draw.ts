import { randomInt } from "node:crypto";

function shuffle<T>(items: readonly T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Sorteia quem tira quem: embaralha e repete até ninguém tirar a si mesmo.
 * Retorna pares [quem dá, quem recebe]. Cada id aparece uma vez de cada lado.
 */
export function drawPairs(ids: readonly string[]): Array<[string, string]> {
  if (ids.length < 2) throw new Error("Precisa de pelo menos 2 participantes");
  if (new Set(ids).size !== ids.length) throw new Error("Ids duplicados");

  for (;;) {
    const receivers = shuffle(ids);
    if (receivers.every((r, i) => r !== ids[i])) {
      return ids.map((giver, i) => [giver, receivers[i]]);
    }
  }
}
