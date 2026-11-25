import { describe, expect, it } from "vitest";
import { drawPairs } from "./draw";

const makeIds = (n: number) => Array.from({ length: n }, (_, i) => `p${i}`);

describe("drawPairs", () => {
  for (const n of [3, 4, 50]) {
    it(`com ${n} pessoas: ninguém tira a si mesmo e todos são tirados uma vez`, () => {
      const ids = makeIds(n);
      for (let round = 0; round < 200; round++) {
        const pairs = drawPairs(ids);
        expect(pairs).toHaveLength(n);
        expect(pairs.map(([g]) => g).sort()).toEqual([...ids].sort());
        expect(pairs.map(([, r]) => r).sort()).toEqual([...ids].sort());
        for (const [giver, receiver] of pairs) expect(giver).not.toBe(receiver);
      }
    });
  }

  it("com 2 pessoas, uma tira a outra", () => {
    expect(drawPairs(["a", "b"]).sort()).toEqual([
      ["a", "b"],
      ["b", "a"],
    ]);
  });

  it("recusa menos de 2 ou ids duplicados", () => {
    expect(() => drawPairs(["a"])).toThrow();
    expect(() => drawPairs(["a", "a", "b"])).toThrow();
  });

  it("não é sempre o mesmo resultado", () => {
    const seen = new Set<string>();
    for (let i = 0; i < 100; i++) seen.add(JSON.stringify(drawPairs(makeIds(5))));
    expect(seen.size).toBeGreaterThan(1);
  });
});
