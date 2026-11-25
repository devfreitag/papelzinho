import { describe, expect, it } from "vitest";
import { passwordMatches, SESSION_TTL_MS, signSession, verifySession } from "./admin-token";

const PW = "senha-de-teste";

describe("sessão do admin", () => {
  it("aceita um token recém-assinado", () => {
    expect(verifySession(signSession(PW), PW)).toBe(true);
  });

  it("recusa token vazio, malformado ou adulterado", () => {
    const t = signSession(PW);
    const [exp, sig] = t.split(".");
    expect(verifySession(undefined, PW)).toBe(false);
    expect(verifySession("", PW)).toBe(false);
    expect(verifySession("lixo", PW)).toBe(false);
    expect(verifySession(`${exp}.${sig}.x`, PW)).toBe(false);
    expect(verifySession(`${Number(exp) + 1000}.${sig}`, PW)).toBe(false); // estendeu a validade
    expect(verifySession(`${exp}.${sig.slice(0, -2)}AA`, PW)).toBe(false);
  });

  it("expira depois do prazo", () => {
    const now = Date.now();
    const t = signSession(PW, now);
    expect(verifySession(t, PW, now + SESSION_TTL_MS - 1)).toBe(true);
    expect(verifySession(t, PW, now + SESSION_TTL_MS + 1)).toBe(false);
  });

  it("trocar a senha invalida as sessões antigas", () => {
    expect(verifySession(signSession(PW), "outra-senha")).toBe(false);
  });
});

describe("passwordMatches", () => {
  it("só aceita a senha exata", () => {
    expect(passwordMatches(PW, PW)).toBe(true);
    expect(passwordMatches("", PW)).toBe(false);
    expect(passwordMatches(`${PW} `, PW)).toBe(false);
    expect(passwordMatches("SENHA-DE-TESTE", PW)).toBe(false);
  });
});
