import { describe, expect, it } from "vitest";
import { itemWithBadLink, linkHost, listIsComplete, NO_DISLIKES, normalizeLink, wishItems, wishText } from "./format";

describe("listIsComplete", () => {
  it("exige ao menos um desejo e o que evitar", () => {
    expect(listIsComplete({ wishlist: "Livro", dislikes: "Perfume" })).toBe(true);
    expect(listIsComplete({ wishlist: "Livro", dislikes: NO_DISLIKES })).toBe(true);
    expect(listIsComplete({ wishlist: "", dislikes: "Perfume" })).toBe(false);
    expect(listIsComplete({ wishlist: "Livro", dislikes: "" })).toBe(false);
  });

  it("só espaços ou linhas vazias não contam", () => {
    expect(listIsComplete({ wishlist: " \r\n \n", dislikes: "Perfume" })).toBe(false);
    expect(listIsComplete({ wishlist: "Livro", dislikes: "   " })).toBe(false);
  });
});

describe("normalizeLink", () => {
  it("aceita links de loja, com ou sem https", () => {
    expect(normalizeLink("https://www.amazon.com.br/dp/1?ref=a b".split(" ")[0])).toBe("https://www.amazon.com.br/dp/1?ref=a");
    expect(normalizeLink("amazon.com.br/dp/1")).toBe("https://amazon.com.br/dp/1");
    expect(normalizeLink("Olha isso: https://amzn.to/abc.")).toBe("https://amzn.to/abc");
  });

  it("recusa o que não é site", () => {
    for (const bad of ["", "livro", "duas palavras", "javascript:alert(1)", "javascript:alert('a.b')", "data:text/html,<b>a.b</b>", "mailto:a@b.com", "https://eu:senha@loja.com", "https://", "https://a.com/" + "x".repeat(2000)])
      expect(normalizeLink(bad), bad).toBeNull();
  });
});

describe("wishItems", () => {
  it("lê listas antigas, sem link", () => {
    expect(wishItems("Livro\r\n\r\nMeia")).toEqual([
      { name: "Livro", link: null },
      { name: "Meia", link: null },
    ]);
  });

  it("ida e volta com link", () => {
    const items = [
      { name: "Harry Potter", link: "https://www.amazon.com.br/dp/1" },
      { name: "Meia", link: null },
    ];
    expect(wishItems(wishText(items))).toEqual(items);
    expect(linkHost(items[0].link!)).toBe("amazon.com.br");
  });

  it("separa o link colado junto com o nome", () => {
    expect(wishItems("Harry Potter: https://amzn.to/abc")).toEqual([{ name: "Harry Potter", link: "https://amzn.to/abc" }]);
    expect(wishItems("https://www.amazon.com.br/dp/1")).toEqual([{ name: "amazon.com.br", link: "https://www.amazon.com.br/dp/1" }]);
  });

  it("link inválido é apontado e nunca vira href", () => {
    const text = "Livro\tjavascript:alert(1)";
    expect(wishItems(text)[0].link).toBeNull();
    expect(itemWithBadLink(text)).toBe("Livro");
    expect(itemWithBadLink("Livro\tamzn.to/abc\nMeia")).toBeUndefined();
  });
});
