import { linkHost, type WishItem } from "@/lib/format";
import { btnSmall } from "./styles";
import { GiftIcon } from "./ui";

/** Itens da lista de desejos, cada um com o botão da loja quando há link. */
export function WishItems({ items }: { items: WishItem[] }) {
  return items.map((it, i) => (
    <div key={i} className="flex flex-wrap items-center gap-3 border-b-[3px] border-ink p-4 last:border-b-0">
      <GiftIcon />
      <span className="min-w-0 flex-1 font-medium [overflow-wrap:anywhere]">{it.name}</span>
      {it.link && (
        // noreferrer: o endereço desta página é secreto e não pode ir para a loja.
        <a
          href={it.link}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Ver ${it.name} em ${linkHost(it.link)} (abre em outra aba)`}
          className={`${btnSmall} max-w-full basis-full justify-center gap-1 sm:basis-auto`}
        >
          <span className="truncate">{linkHost(it.link)}</span>
          <span aria-hidden="true">↗</span>
        </a>
      )}
    </div>
  ));
}
