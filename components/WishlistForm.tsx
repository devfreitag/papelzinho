"use client";

import { useActionState, useState } from "react";
import { saveWishlist } from "@/app/actions";
import { NO_DISLIKES, normalizeLink, wishItems, wishText, type WishItem } from "@/lib/format";
import { SubmitButton } from "./SubmitButton";
import { ErrorNote, GiftIcon, XIcon } from "./ui";
import { btnAdd, btnPrimary, btnIcon, btnText, field, label } from "./styles";

export function WishlistForm({
  token,
  items: initialItems,
  dislikes: initialDislikes,
  submitLabel = "Salvar lista",
}: {
  token: string;
  items: WishItem[];
  dislikes: string;
  submitLabel?: string;
}) {
  const [state, action] = useActionState(saveWishlist.bind(null, token), undefined);
  // Um link por item; null = campo de link fechado.
  const [items, setItems] = useState(initialItems);
  const [draft, setDraft] = useState("");
  // Controlados: assim um erro ao salvar não apaga o que foi digitado.
  const [noDislikes, setNoDislikes] = useState(initialDislikes === NO_DISLIKES);
  const [dislikes, setDislikes] = useState(initialDislikes === NO_DISLIKES ? "" : initialDislikes);

  function addItem() {
    setItems([...items, ...wishItems(draft)]);
    setDraft("");
  }

  function setLink(index: number, link: string | null) {
    setItems((list) => list.map((it, i) => (i === index ? { ...it, link } : it)));
  }

  // O que foi digitado e não "incluído" ainda também entra ao salvar.
  const all = [...items, ...wishItems(draft)];

  return (
    <form action={action} className="flex flex-col gap-6">
      <input type="hidden" name="wishlist" value={wishText(all)} />

      <div className="flex flex-col gap-3">
        <div className={label}>Quero ganhar</div>
        {items.map((it, i) => {
          const badLink = !!it.link?.trim() && !normalizeLink(it.link);
          return (
            <div
              key={`${it.name}-${i}`}
              className="rounded-[4px] border-[3px] border-ink bg-white pl-3 pr-1 shadow-hard-sm"
            >
              <div className="flex min-h-[46px] items-center gap-3">
                <GiftIcon />
                <div className="min-w-0 flex-1 font-medium [overflow-wrap:anywhere]">{it.name}</div>
                <button
                  type="button"
                  onClick={() => setItems((list) => list.filter((_, j) => j !== i))}
                  aria-label={`Remover ${it.name}`}
                  className={btnIcon}
                >
                  <XIcon />
                </button>
              </div>
              {it.link === null ? (
                <button
                  type="button"
                  onClick={() => setLink(i, "")}
                  aria-label={`Adicionar link de ${it.name}`}
                  className={`${btnText} ml-8`}
                >
                  + Adicionar link
                </button>
              ) : (
                <div className="flex flex-col gap-1 pb-3 pr-2">
                  <input
                    autoFocus={it.link === ""}
                    value={it.link}
                    onChange={(e) => setLink(i, e.target.value)}
                    onBlur={(e) => setLink(i, normalizeLink(e.target.value) ?? e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        e.currentTarget.blur();
                      }
                    }}
                    inputMode="url"
                    autoCapitalize="none"
                    autoComplete="off"
                    spellCheck={false}
                    maxLength={2500}
                    placeholder="Cole o link da loja"
                    aria-label={`Link de ${it.name}`}
                    aria-invalid={badLink}
                    aria-describedby={`link-dica-${i}`}
                    className={field}
                  />
                  {/* Sempre presente, para o aviso não empurrar os botões na hora do clique. */}
                  <p id={`link-dica-${i}`} className={`text-sm ${badLink ? "font-bold text-red" : "text-body"}`}>
                    {badLink ? "! Este link não parece válido." : "Um link, do produto exato."}
                  </p>
                </div>
              )}
            </div>
          );
        })}
        <div className="flex gap-2">
          <label htmlFor="novo-item" className="sr-only">Novo item da lista</label>
          <input
            id="novo-item"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addItem();
              }
            }}
            maxLength={2500}
            placeholder="Adicionar item"
            className={field}
          />
          <button type="button" onClick={addItem} className={btnAdd}>Incluir</button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="dislikes" className={label}>Prefiro não ganhar</label>
        <input
          id="dislikes"
          value={dislikes}
          onChange={(e) => setDislikes(e.target.value)}
          disabled={noDislikes}
          maxLength={300}
          placeholder="Perfume, roupa de tamanho incerto"
          className={`${field} disabled:opacity-60`}
        />
        <input type="hidden" name="dislikes" value={noDislikes ? NO_DISLIKES : dislikes} />
        <label className="flex min-h-11 w-fit cursor-pointer items-center gap-3 font-medium">
          <input
            type="checkbox"
            checked={noDislikes}
            onChange={(e) => setNoDislikes(e.target.checked)}
            className="size-5 accent-ink"
          />
          Não tenho nada a evitar
        </label>
      </div>

      {state?.error && (
        <ErrorNote>{state.error}</ErrorNote>
      )}

      <SubmitButton className={btnPrimary}>{submitLabel}</SubmitButton>
    </form>
  );
}
