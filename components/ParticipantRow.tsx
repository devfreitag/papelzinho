import { listIsComplete, wishItems } from "@/lib/format";
import { OpenedChip } from "./ui";
import { chip } from "./styles";
import { WishItems } from "./WishItems";

/** Situação e conteúdo da lista de desejos. */
function ListDetails({ wishlist, dislikes }: { wishlist: string; dislikes: string }) {
  const items = wishItems(wishlist);
  const done = listIsComplete({ wishlist, dislikes });
  const hasDislikes = dislikes.trim() !== "";
  const started = items.length > 0 || hasDislikes;
  const missing = !started
    ? "Ainda não salvou nada."
    : items.length === 0
      ? "Falta dizer o que quer ganhar."
      : !hasDislikes
        ? "Falta dizer o que evitar."
        : null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className={`${chip} text-ink ${done ? "bg-green" : "bg-white"}`}>
          <span aria-hidden="true">{done ? "✓" : "○"}</span>
          {done ? "Lista preenchida" : started ? "Lista incompleta" : "Sem lista"}
        </span>
        {missing && <span className="text-sm text-body">{missing}</span>}
      </div>
      {started && (
        <div className="rounded-[4px] border-[3px] border-ink bg-paper">
          <WishItems items={items} />
          {hasDislikes && (
            <div className="p-4 [overflow-wrap:anywhere]">
              <strong>✕ Prefere não ganhar:</strong> {dislikes}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** Linha de participante: clicar abre a lista de desejos. */
export function ParticipantRow({
  person,
  showOpened = false,
  action,
  children,
}: {
  person: { name: string; wishlist: string; dislikes: string; opened_at: string | null };
  showOpened?: boolean;
  /** Botão à direita, fora da área clicável. */
  action?: React.ReactNode;
  /** Sempre visível, abaixo da linha. */
  children?: React.ReactNode;
}) {
  return (
    <li className="border-b-[3px] border-ink last:border-b-0">
      <div className="flex items-start">
        <details className="group min-w-0 flex-1">
          <summary className="flex min-h-[60px] cursor-pointer list-none items-center gap-3 px-3 py-2 hover:bg-yellow [&::-webkit-details-marker]:hidden">
            <span className="min-w-0 flex-1 font-medium [overflow-wrap:anywhere]">{person.name}</span>
            {showOpened && <OpenedChip opened={!!person.opened_at} />}
            <span aria-hidden="true" className="shrink-0 font-bold group-open:hidden">↓</span>
            <span aria-hidden="true" className="hidden shrink-0 font-bold group-open:inline">↑</span>
          </summary>
          <div className="px-3 pb-3 pt-1">
            <ListDetails wishlist={person.wishlist} dislikes={person.dislikes} />
          </div>
        </details>
        {action}
      </div>
      {children && <div className="px-3 pb-3">{children}</div>}
    </li>
  );
}
